import { engineReady } from "./config.mjs";
import { docker } from "./docker.mjs";

const CACHE_MS = 8000;
const ROUTES_CACHE_MS = 5 * 60 * 1000;
let cached = null;
let inflight = null;
let cachedRoutes = null;

const isTailnetAddress = (ip) => {
  const [a, b] = String(ip).split(".").map(Number);
  return a === 100 && b >= 64 && b <= 127;
};

const cpuPercent = (stats) => {
  const cpuDelta = (stats.cpu_stats?.cpu_usage?.total_usage ?? 0) - (stats.precpu_stats?.cpu_usage?.total_usage ?? 0);
  const systemDelta = (stats.cpu_stats?.system_cpu_usage ?? 0) - (stats.precpu_stats?.system_cpu_usage ?? 0);
  const cpus = stats.cpu_stats?.online_cpus || 1;
  if (cpuDelta <= 0 || systemDelta <= 0) return 0;
  return Math.round((cpuDelta / systemDelta) * cpus * 1000) / 10;
};

const memoryBytes = (stats) => {
  const usage = stats.memory_stats?.usage;
  if (!Number.isFinite(usage)) return null;
  const cache = stats.memory_stats?.stats?.inactive_file ?? stats.memory_stats?.stats?.total_inactive_file ?? 0;
  return Math.max(0, usage - cache);
};

// cloudflared logs the remotely managed ingress whenever it changes. Only hostname
// and service target are kept; origin addresses are reduced to "host".
const readTunnelRoutes = async (containers) => {
  const connector = containers.find((item) => item.Image.startsWith("cloudflare/cloudflared"));
  if (!connector) return { source: "no-connector", connectorId: null, routes: [] };
  try {
    const text = (await docker.logs(connector.Id, "all")).toString("utf8");
    const matches = [...text.matchAll(/Updated to new configuration config="((?:[^"\\]|\\.)*)"/g)];
    if (!matches.length) return { source: "not-in-logs", connectorId: connector.Id, routes: [] };
    const config = JSON.parse(JSON.parse(`"${matches.at(-1)[1]}"`));
    const routes = (config.ingress || []).filter((rule) => rule.hostname).map((rule) => {
      const url = new URL(rule.service);
      const isContainer = !/^[\d.]+$|^\[|^localhost$/.test(url.hostname);
      return {
        hostname: rule.hostname,
        path: rule.path || null,
        protocol: url.protocol.replace(":", ""),
        target: isContainer ? { kind: "container", name: url.hostname, port: Number(url.port) || null } : { kind: "host", port: Number(url.port) || null },
      };
    });
    return { source: "cloudflared", connectorId: connector.Id, routes };
  } catch {
    return { source: "unreadable", connectorId: connector.Id, routes: [] };
  }
};

const tunnelRoutes = async (containers) => {
  if (cachedRoutes && Date.now() - cachedRoutes.at < ROUTES_CACHE_MS) return cachedRoutes.data;
  const data = await readTunnelRoutes(containers);
  cachedRoutes = { at: Date.now(), data };
  return data;
};

const describeMounts = (mounts = []) => {
  const flags = [];
  if (mounts.some((mount) => mount.Source === "/var/run/docker.sock" || mount.Source === "/run/docker.sock")) flags.push("docker-socket");
  if (mounts.some((mount) => mount.Type === "bind" && /^\/home\/[^/]+\/?$/.test(mount.Source))) flags.push("home-directory");
  if (mounts.some((mount) => mount.Type === "bind" && (mount.Source === "/proc" || mount.Source === "/sys"))) flags.push("host-kernel-readonly");
  return {
    flags,
    volumes: mounts.filter((mount) => mount.Type === "volume").length,
    binds: mounts.filter((mount) => mount.Type === "bind").length,
  };
};

const collect = async () => {
  const [info, version, containers, images, volumes] = await Promise.all([
    docker.info(), docker.version(), docker.containers(), docker.images(), docker.volumes(),
  ]);
  const tunnel = await tunnelRoutes(containers);

  const services = await Promise.all(containers.map(async (summary) => {
    const running = summary.State === "running";
    const [detail, stats] = await Promise.all([
      docker.inspect(summary.Id),
      running ? docker.stats(summary.Id).catch(() => null) : null,
    ]);
    const name = summary.Names[0]?.replace(/^\//, "") || summary.Id.slice(0, 12);
    const labels = summary.Labels || {};
    const networkMode = detail.HostConfig?.NetworkMode || "default";

    const exposure = [];
    for (const route of tunnel.routes) {
      if (route.target.kind === "container" && route.target.name === name) exposure.push({ kind: "public", hostname: route.hostname });
    }
    const seen = new Set();
    for (const port of summary.Ports || []) {
      if (!port.PublicPort) continue;
      const key = `${port.PublicPort}/${port.Type}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (isTailnetAddress(port.IP)) exposure.push({ kind: "tailnet", port: port.PublicPort });
      else if (port.IP === "127.0.0.1" || port.IP === "::1") exposure.push({ kind: "loopback", port: port.PublicPort });
      else exposure.push({ kind: "all-interfaces", port: port.PublicPort });
    }
    if (networkMode === "host") exposure.push({ kind: "host-network" });
    if (summary.Id === tunnel.connectorId) exposure.push({ kind: "tunnel-connector" });
    if (!exposure.length) exposure.push({ kind: "internal" });

    return {
      id: summary.Id.slice(0, 12),
      name,
      project: labels["com.docker.compose.project"] || (labels["arch.platform.managed"] === "true" ? "deployed-apps" : null),
      service: labels["com.docker.compose.service"] || name,
      workingDir: labels["com.docker.compose.project.working_dir"]?.replace(/^\/home\/[^/]+/, "~") || null,
      image: summary.Image,
      state: summary.State,
      status: summary.Status,
      health: detail.State?.Health?.Status || null,
      createdAt: new Date(summary.Created * 1000).toISOString(),
      startedAt: running ? detail.State?.StartedAt : null,
      restartCount: detail.RestartCount ?? 0,
      restartPolicy: detail.HostConfig?.RestartPolicy?.Name || "no",
      limits: {
        memoryBytes: detail.HostConfig?.Memory || null,
        cpus: detail.HostConfig?.NanoCpus ? detail.HostConfig.NanoCpus / 1e9 : null,
      },
      usage: stats ? { cpuPercent: cpuPercent(stats), memoryBytes: memoryBytes(stats) } : null,
      readOnly: Boolean(detail.HostConfig?.ReadonlyRootfs),
      exposure,
      mounts: describeMounts(detail.Mounts),
    };
  }));

  const projects = new Map();
  for (const service of services.sort((a, b) => a.service.localeCompare(b.service))) {
    const key = service.project || "standalone";
    if (!projects.has(key)) projects.set(key, { name: key, workingDir: service.workingDir, services: [] });
    projects.get(key).services.push(service);
  }

  return {
    status: "ok",
    collectedAt: new Date().toISOString(),
    capabilities: { deploy: engineReady(), dockerAccess: engineReady() ? "managed-write" : "read-only" },
    host: {
      name: info.Name,
      os: info.OperatingSystem,
      kernel: info.KernelVersion,
      docker: version.Version,
      cpus: info.NCPU,
      memoryBytes: info.MemTotal,
      containers: { total: info.Containers, running: info.ContainersRunning, stopped: info.ContainersStopped },
      images: { count: images.length, sizeBytes: images.reduce((sum, image) => sum + (image.Size || 0), 0) },
      volumes: volumes.Volumes?.length ?? 0,
    },
    routes: {
      source: tunnel.source,
      public: tunnel.routes.map((route) => ({
        hostname: route.hostname,
        protocol: route.protocol,
        target: route.target.kind === "container" ? `${route.target.name}${route.target.port ? `:${route.target.port}` : ""}` : `host${route.target.port ? `:${route.target.port}` : ""}`,
        targetKind: route.target.kind,
      })),
    },
    projects: [...projects.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };
};

export const inventory = async () => {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.data;
  inflight ??= collect().then((data) => {
    cached = { at: Date.now(), data };
    return data;
  }).finally(() => { inflight = null; });
  return inflight;
};
