import { config, engineReady } from "./config.mjs";
import { decryptEnv, deployments, encryptEnv, encryptForBuild, newId, now, projects } from "./db.mjs";
import { DockerError, demuxLogs, docker } from "./docker.mjs";
import { cancelRun, dispatchBuild, getRun, getRunSteps, headCommit } from "./github.mjs";
import { pushRoutes } from "./router.mjs";

const MANAGED_LABEL = "arch.platform.managed";
const KEEP_IMAGES = 3;
const BUILD_TIMEOUT_MS = 30 * 60 * 1000;
const HEALTH_TIMEOUT_MS = 90 * 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const log = (deploymentId, line) => deployments.appendLog(deploymentId, line);
const hostFor = (slug) => `${slug}.${config.appDomain}`;
const imageFor = (slug, deploymentId) => `arch-apps/${slug}:${deploymentId}`;
const containerFor = (slug, deploymentId) => `app-${slug}-${deploymentId.slice(0, 8)}`;

// ---------- validation ----------

export class InputError extends Error {}

const SLUG = /^[a-z][a-z0-9-]{1,30}[a-z0-9]$/;
const REPO = /^[A-Za-z0-9_.-]{1,100}\/[A-Za-z0-9_.-]{1,100}$/;
const BRANCH = /^[A-Za-z0-9._/-]{1,100}$/;
const ROOT = /^[A-Za-z0-9._/-]{0,200}$/;
const ENV_KEY = /^[A-Za-z_][A-Za-z0-9_]{0,127}$/;

const checkPath = (value, pattern, label) => {
  if (typeof value !== "string" || !pattern.test(value) || value.includes("..") || value.startsWith("/") || value.startsWith("-")) {
    throw new InputError(`Invalid ${label}`);
  }
  return value;
};

const numberIn = (value, min, max, label) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) throw new InputError(`${label} must be between ${min} and ${max}`);
  return number;
};

// env: { KEY: "value" } sets, { KEY: null } deletes, keys not mentioned are kept.
const mergeEnv = (current, changes = {}, { build = false } = {}) => {
  if (typeof changes !== "object" || Array.isArray(changes)) throw new InputError("Invalid environment variables");
  const next = { ...current };
  for (const [name, value] of Object.entries(changes)) {
    if (!ENV_KEY.test(name)) throw new InputError(`Invalid variable name: ${name.slice(0, 40)}`);
    if (!build && name === "PORT") throw new InputError("PORT is set from the project port");
    if (build && /^BUILDKIT_/i.test(name)) throw new InputError(`${name} is reserved for the build system`);
    if (value === null) delete next[name];
    else if (typeof value === "string" && value.length <= 8192) next[name] = value;
    else throw new InputError(`Invalid value for ${name}`);
  }
  if (Object.keys(next).length > 100) throw new InputError("Too many environment variables");
  if (build && JSON.stringify(next).length > 16384) throw new InputError("Build variables are limited to 16 KB in total");
  return next;
};

const reservedMemory = (excludeId) => projects.all()
  .filter((project) => project.id !== excludeId && project.status === "active")
  .reduce((sum, project) => sum + project.memory_mb, 0);

const checkBudget = (memoryMb, excludeId) => {
  const total = reservedMemory(excludeId) + memoryMb;
  if (total > config.memoryBudgetMb) {
    throw new InputError(`Memory budget exceeded: apps would reserve ${total} MiB of ${config.memoryBudgetMb} MiB`);
  }
};

// ---------- serialization ----------

const publicDeployment = (deployment, { withLog = false } = {}) => ({
  id: deployment.id,
  trigger: deployment.trigger,
  status: deployment.status,
  sourceDeploymentId: deployment.source_deployment_id,
  runUrl: deployment.run_url,
  steps: deployment.steps ? JSON.parse(deployment.steps) : [],
  commit: deployment.commit_sha,
  ref: deployment.ref,
  hasImage: Boolean(deployment.image),
  error: deployment.error,
  createdAt: deployment.created_at,
  finishedAt: deployment.finished_at,
  ...(withLog ? { log: deployment.log } : {}),
});

export const describeProject = (project, { withHistory = true } = {}) => {
  const keysOf = (value) => { try { return Object.keys(decryptEnv(value)).sort(); } catch { return []; } };
  return {
    id: project.id,
    slug: project.slug,
    url: `https://${hostFor(project.slug)}`,
    repo: project.repo,
    branch: project.branch,
    rootDir: project.root_dir,
    port: project.port,
    memoryMb: project.memory_mb,
    cpus: project.cpus,
    envKeys: keysOf(project.env_enc),
    buildEnvKeys: keysOf(project.build_env_enc),
    autoDeploy: Boolean(project.auto_deploy),
    lastSeenCommit: project.last_seen_sha,
    status: project.status,
    liveDeploymentId: project.live_deployment_id,
    createdAt: project.created_at,
    deployments: withHistory ? deployments.forProject(project.id).map((item) => publicDeployment(item)) : undefined,
  };
};

export const getDeployment = (id) => {
  const deployment = deployments.get(id);
  return deployment ? publicDeployment(deployment, { withLog: true }) : null;
};

// ---------- routing ----------

const liveRoutes = () => projects.all()
  .filter((project) => project.status === "active" && project.live_deployment_id)
  .map((project) => {
    const deployment = deployments.get(project.live_deployment_id);
    return deployment?.container_name ? { host: hostFor(project.slug), dial: `${deployment.container_name}:${project.port}` } : null;
  })
  .filter(Boolean);

const syncRouter = (extra = []) => pushRoutes([...liveRoutes().filter((route) => !extra.some((item) => item.host === route.host)), ...extra]);

// ---------- per-project serialization ----------

const queues = new Map();
const exclusive = (projectId, task) => {
  const next = (queues.get(projectId) || Promise.resolve()).then(task, task);
  queues.set(projectId, next.catch(() => {}));
  return next;
};

// ---------- container helpers ----------

const removeManaged = async (name) => {
  try {
    const detail = await docker.inspect(name);
    if (detail.Config?.Labels?.[MANAGED_LABEL] !== "true") throw new Error(`Refusing to remove unmanaged container ${name}`);
    await docker.remove(name);
  } catch (error) {
    if (!(error instanceof DockerError && error.status === 404)) throw error;
  }
};

const waitHealthy = async (deploymentId, name, port) => {
  const deadline = Date.now() + HEALTH_TIMEOUT_MS;
  let lastProblem = "no response yet";
  while (Date.now() < deadline) {
    const detail = await docker.inspect(name);
    if (detail.State?.Status === "exited" || detail.State?.Status === "dead") {
      const tail = demuxLogs(await docker.logs(name, 40)).trim();
      throw new Error(`Container exited with code ${detail.State.ExitCode}${tail ? `\n${tail}` : ""}`);
    }
    try {
      const response = await fetch(`http://${name}:${port}/`, { redirect: "manual", signal: AbortSignal.timeout(3000) });
      if (response.status < 500) {
        log(deploymentId, `Health check passed: HTTP ${response.status} on port ${port}`);
        return;
      }
      lastProblem = `HTTP ${response.status}`;
    } catch (error) {
      lastProblem = error.cause?.code || error.name;
    }
    await sleep(2000);
  }
  throw new Error(`Health check timed out after ${HEALTH_TIMEOUT_MS / 1000}s (${lastProblem}). Is the app listening on port ${port}?`);
};

const pruneImages = async (project) => {
  // Rollbacks reuse an earlier image tag, so retention is decided per image, not per deployment.
  const withImages = deployments.withImages(project.id);
  const keep = new Set();
  const live = withImages.find((deployment) => deployment.id === project.live_deployment_id);
  if (live) keep.add(live.image);
  for (const deployment of withImages) {
    if (keep.size >= KEEP_IMAGES) break;
    if (deployment.status !== "failed") keep.add(deployment.image);
  }
  for (const deployment of withImages) {
    if (keep.has(deployment.image)) continue;
    if (!withImages.some((other) => other.image === deployment.image && keep.has(other.image))) {
      try { await docker.removeImage(deployment.image); } catch { /* already gone or in use */ }
    }
    deployments.update(deployment.id, { image: null });
  }
};

// Starts a container from an image, waits for health, switches the route, then retires the
// previous container. The previous version keeps serving until the new one is healthy.
const release = async (projectId, deploymentId) => {
  const project = projects.get(projectId);
  const deployment = deployments.get(deploymentId);
  const name = containerFor(project.slug, deploymentId);
  deployments.update(deploymentId, { status: "deploying", container_name: name });
  log(deploymentId, `Starting ${name} with ${project.memory_mb} MiB and ${project.cpus} CPU`);

  const env = { ...decryptEnv(project.env_enc), PORT: String(project.port) };
  await removeManaged(name);
  await docker.create(name, {
    Image: deployment.image,
    Env: Object.entries(env).map(([key, value]) => `${key}=${value}`),
    Labels: { [MANAGED_LABEL]: "true", "arch.platform.project": project.slug, "arch.platform.deployment": deploymentId },
    HostConfig: {
      NetworkMode: config.appsNetwork,
      Dns: config.appDns,
      Memory: project.memory_mb * 1024 * 1024,
      MemorySwap: project.memory_mb * 1024 * 1024,
      NanoCpus: Math.round(project.cpus * 1e9),
      PidsLimit: 512,
      RestartPolicy: { Name: "unless-stopped" },
      SecurityOpt: ["no-new-privileges:true"],
      Privileged: false,
      LogConfig: { Type: "json-file", Config: { "max-size": "10m", "max-file": "3" } },
    },
  });

  try {
    await docker.start(name);
    await waitHealthy(deploymentId, name, project.port);
    await syncRouter([{ host: hostFor(project.slug), dial: `${name}:${project.port}` }]);
    log(deploymentId, `Routed ${hostFor(project.slug)} to ${name}`);
  } catch (error) {
    await removeManaged(name).catch(() => {});
    deployments.update(deploymentId, { container_name: null });
    throw error;
  }

  const previous = project.live_deployment_id && project.live_deployment_id !== deploymentId ? deployments.get(project.live_deployment_id) : null;
  projects.update(projectId, { live_deployment_id: deploymentId, status: "active" });
  deployments.update(deploymentId, { status: "live", finished_at: now() });
  if (previous) {
    if (previous.container_name) await removeManaged(previous.container_name).catch((error) => log(deploymentId, `Could not remove previous container: ${error.message}`));
    deployments.update(previous.id, { status: previous.status === "live" ? "superseded" : previous.status, container_name: null });
    log(deploymentId, "Previous version retired");
  }
  await pruneImages(projects.get(projectId));
  log(deploymentId, "Deployment is live");
};

const fail = (deploymentId, error) => {
  deployments.update(deploymentId, { status: "failed", error: error.message.split("\n")[0].slice(0, 300), finished_at: now() });
  log(deploymentId, `Failed: ${error.message}`);
};

const build = async (projectId, deploymentId) => {
  const project = projects.get(projectId);
  const image = imageFor(project.slug, deploymentId);
  const ref = deployments.get(deploymentId).ref || project.branch;
  const buildVars = decryptEnv(project.build_env_enc);
  const buildEnv = Object.keys(buildVars).length ? encryptForBuild(buildVars, deploymentId) : "";
  deployments.update(deploymentId, { status: "building" });
  log(deploymentId, `Building ${project.repo}@${/^[a-f0-9]{40}$/.test(ref) ? ref.slice(0, 7) : ref}${project.root_dir ? ` (${project.root_dir})` : ""} in GitHub Actions${buildEnv ? ` with ${Object.keys(buildVars).length} build variable(s)` : ""}`);

  const { runId, runUrl } = await dispatchBuild({ deploymentId, repo: project.repo, ref, rootDir: project.root_dir, image, buildEnv });
  deployments.update(deploymentId, { run_id: runId, run_url: runUrl });
  log(deploymentId, `Build run ${runId} started`);

  const deadline = Date.now() + BUILD_TIMEOUT_MS;
  let run;
  while (Date.now() < deadline) {
    await sleep(5000);
    if (deployments.get(deploymentId).status === "cancelled") {
      await cancelRun(runId);
      throw new Error("Cancelled");
    }
    run = await getRun(runId);
    try { deployments.update(deploymentId, { steps: JSON.stringify(await getRunSteps(runId)) }); } catch { /* steps are best effort */ }
    if (run.status === "completed") break;
  }
  if (run?.status !== "completed") {
    await cancelRun(runId);
    throw new Error("Build timed out");
  }
  if (run.conclusion !== "success") throw new Error(`Build ${run.conclusion}. Open the build run for details.`);

  const imageDetail = await docker.inspectImage(image).catch(() => null);
  if (!imageDetail) throw new Error("Build finished but the image did not reach the server");
  deployments.update(deploymentId, { image, commit_sha: imageDetail.Config?.Labels?.["arch.platform.commit"] || null });
  log(deploymentId, `Image received (${Math.round(imageDetail.Size / 1024 / 1024)} MiB)`);
};

// ---------- public operations ----------

const requireEngine = () => {
  if (!engineReady()) throw new InputError("Deploy engine is not configured on the server");
};

const startDeployment = (projectId, trigger, { sourceDeploymentId, needsBuild, ref }) => {
  const project = projects.get(projectId);
  if (!project) throw new InputError("Project not found");
  const source = sourceDeploymentId ? deployments.get(sourceDeploymentId) : null;
  const id = newId();
  deployments.insert({ id, project_id: projectId, trigger, source_deployment_id: sourceDeploymentId, image: source?.image, commit_sha: source?.commit_sha });
  if (ref) deployments.update(id, { ref });
  exclusive(projectId, async () => {
    if (deployments.get(id).status === "cancelled") return;
    try {
      if (needsBuild) await build(projectId, id);
      else log(id, `Reusing image from deployment ${sourceDeploymentId.slice(0, 8)}`);
      await release(projectId, id);
    } catch (error) {
      if (deployments.get(id).status !== "cancelled") fail(id, error);
    }
  });
  return id;
};

// Builds deploy an exact commit, so a push during the build cannot change what ships.
const resolveHead = async (project) => {
  try {
    const sha = await headCommit(project.repo, project.branch);
    projects.update(project.id, { last_seen_sha: sha });
    return sha;
  } catch {
    return project.branch;
  }
};

const requireBuildKey = (buildEnvEnc) => {
  if (Object.keys(decryptEnv(buildEnvEnc)).length && !config.buildKey) throw new InputError("Build variables need PLATFORM_BUILD_KEY on the server");
};

export const createProject = async (input) => {
  requireEngine();
  const slug = checkPath(String(input.slug || "").toLowerCase(), SLUG, "subdomain");
  if (config.reservedSlugs.has(slug)) throw new InputError("That subdomain is reserved");
  if (projects.bySlug(slug)) throw new InputError("That subdomain is already used");
  const memoryMb = numberIn(input.memoryMb ?? 256, 64, 2048, "Memory");
  checkBudget(memoryMb);
  const project = {
    id: newId(),
    slug,
    repo: checkPath(String(input.repo || "").trim(), REPO, "repository (use owner/name)"),
    branch: checkPath(String(input.branch || "main").trim(), BRANCH, "branch"),
    root_dir: checkPath(String(input.rootDir || "").trim().replace(/\/+$/, ""), ROOT, "root directory"),
    port: numberIn(input.port ?? 3000, 1, 65535, "Port"),
    memory_mb: memoryMb,
    cpus: numberIn(input.cpus ?? 0.5, 0.1, 2, "CPU"),
    env_enc: encryptEnv(mergeEnv({}, input.env)),
    build_env_enc: encryptEnv(mergeEnv({}, input.buildEnv, { build: true })),
    auto_deploy: input.autoDeploy === false ? 0 : 1,
  };
  requireBuildKey(project.build_env_enc);
  projects.insert(project);
  const ref = await resolveHead(projects.get(project.id));
  const deploymentId = startDeployment(project.id, "create", { needsBuild: true, ref });
  return { project: describeProject(projects.get(project.id)), deploymentId };
};

export const updateProject = (id, input) => {
  requireEngine();
  const project = projects.get(id);
  if (!project) throw new InputError("Project not found");
  const fields = {};
  if (input.branch !== undefined) fields.branch = checkPath(String(input.branch).trim(), BRANCH, "branch");
  if (input.autoDeploy !== undefined) fields.auto_deploy = input.autoDeploy ? 1 : 0;
  if (input.buildEnv !== undefined) {
    fields.build_env_enc = encryptEnv(mergeEnv(decryptEnv(project.build_env_enc), input.buildEnv, { build: true }));
    requireBuildKey(fields.build_env_enc);
  }
  // A branch change takes effect on the next deploy, not as a surprise automatic one.
  if (fields.branch && fields.branch !== project.branch) fields.last_seen_sha = null;
  if (input.rootDir !== undefined) fields.root_dir = checkPath(String(input.rootDir).trim().replace(/\/+$/, ""), ROOT, "root directory");
  if (input.port !== undefined) fields.port = numberIn(input.port, 1, 65535, "Port");
  if (input.cpus !== undefined) fields.cpus = numberIn(input.cpus, 0.1, 2, "CPU");
  if (input.memoryMb !== undefined) {
    fields.memory_mb = numberIn(input.memoryMb, 64, 2048, "Memory");
    checkBudget(fields.memory_mb, id);
  }
  if (input.env !== undefined) fields.env_enc = encryptEnv(mergeEnv(decryptEnv(project.env_enc), input.env));
  projects.update(id, fields);
  return describeProject(projects.get(id));
};

export const deployProject = async (id) => {
  requireEngine();
  const project = projects.get(id);
  if (!project) throw new InputError("Project not found");
  requireBuildKey(project.build_env_enc);
  return startDeployment(id, "manual", { needsBuild: true, ref: await resolveHead(project) });
};

export const rollbackProject = (id, deploymentId) => {
  requireEngine();
  const target = deployments.get(deploymentId);
  if (!target || target.project_id !== id || !target.image) throw new InputError("That deployment has no image to roll back to");
  return startDeployment(id, "rollback", { sourceDeploymentId: deploymentId });
};

export const cancelDeployment = (deploymentId) => {
  const deployment = deployments.get(deploymentId);
  if (!deployment || !["queued", "building"].includes(deployment.status)) throw new InputError("Only queued or building deployments can be cancelled");
  deployments.update(deploymentId, { status: "cancelled", finished_at: now() });
  log(deploymentId, "Cancelled by owner");
  if (deployment.run_id) cancelRun(deployment.run_id);
};

export const stopProject = (id) => exclusive(id, async () => {
  const project = projects.get(id);
  if (!project) throw new InputError("Project not found");
  projects.update(id, { status: "stopped" });
  await syncRouter();
  const live = project.live_deployment_id ? deployments.get(project.live_deployment_id) : null;
  if (live?.container_name) {
    await removeManaged(live.container_name);
    deployments.update(live.id, { container_name: null, status: "stopped" });
  }
});

export const startProject = (id) => {
  requireEngine();
  const project = projects.get(id);
  if (!project) throw new InputError("Project not found");
  const latest = deployments.withImages(id).find((item) => item.status !== "failed");
  if (!latest) return startDeployment(id, "start", { needsBuild: true, ref: project.last_seen_sha || project.branch });
  checkBudget(project.memory_mb, id);
  return startDeployment(id, "start", { sourceDeploymentId: latest.id });
};

export const deleteProject = (id) => exclusive(id, async () => {
  const project = projects.get(id);
  if (!project) throw new InputError("Project not found");
  projects.update(id, { status: "stopped" });
  await syncRouter();
  const containers = await docker.containers({ label: [`arch.platform.project=${project.slug}`, `${MANAGED_LABEL}=true`] });
  for (const container of containers) await removeManaged(container.Id);
  for (const deployment of deployments.withImages(id)) {
    try { await docker.removeImage(deployment.image); } catch { /* already removed */ }
  }
  projects.remove(id);
});

export const projectLogs = async (id, tail = 300) => {
  const project = projects.get(id);
  if (!project) throw new InputError("Project not found");
  const live = project.live_deployment_id ? deployments.get(project.live_deployment_id) : null;
  if (!live?.container_name) return { container: null, logs: "" };
  const lines = Math.min(Math.max(Number(tail) || 300, 10), 2000);
  return { container: live.container_name, logs: demuxLogs(await docker.logs(live.container_name, lines)) };
};

// On startup, anything mid-flight was interrupted, and the router must match the database.
export const reconcile = async () => {
  for (const deployment of deployments.active()) {
    if (deployment.container_name && deployment.status === "deploying") await removeManaged(deployment.container_name).catch(() => {});
    fail(deployment.id, new Error("Interrupted by a platform restart"));
  }
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      await syncRouter();
      console.log(`router synced with ${liveRoutes().length} route(s)`);
      return;
    } catch (error) {
      if (attempt === 30) console.error(`router sync failed: ${error.message}`);
      await sleep(3000);
    }
  }
};

// ---------- deploy on push ----------

// Polling instead of webhooks keeps every console path behind Cloudflare Access: nothing
// on the server has to accept unauthenticated requests from GitHub.
let polling = false;
let pausedUntil = 0;
const pollErrors = new Map();

const pollOnce = async () => {
  if (!engineReady() || Date.now() < pausedUntil) return;
  for (const project of projects.all()) {
    if (project.status !== "active" || !project.auto_deploy) continue;
    try {
      const sha = await headCommit(project.repo, project.branch);
      pollErrors.delete(project.id);
      if (sha === project.last_seen_sha) continue;
      projects.update(project.id, { last_seen_sha: sha });
      // The first observation after a branch change only records a baseline.
      if (!project.last_seen_sha) continue;
      for (const queued of deployments.queuedPush(project.id)) {
        deployments.update(queued.id, { status: "cancelled", finished_at: now() });
        log(queued.id, "Superseded by a newer push");
      }
      const id = startDeployment(project.id, "push", { needsBuild: true, ref: sha });
      log(id, `New commit ${sha.slice(0, 7)} on ${project.branch}`);
    } catch (error) {
      if (/GitHub (403|429)/.test(error.message)) {
        pausedUntil = Date.now() + 10 * 60 * 1000;
        console.error(`polling paused for 10 minutes: ${error.message}`);
        return;
      }
      const last = pollErrors.get(project.id) || 0;
      if (Date.now() - last > 60 * 60 * 1000) console.error(`polling ${project.slug}: ${error.message}`);
      pollErrors.set(project.id, Date.now());
    }
  }
};

export const startPolling = () => {
  setInterval(() => {
    if (polling) return;
    polling = true;
    pollOnce().finally(() => { polling = false; });
  }, config.pollIntervalMs);
};
