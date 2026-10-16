import { config } from "./config.mjs";

const api = async (path, { method = "GET", body, auth = true } = {}) => {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "arch-server-platform",
  };
  if (auth) headers.Authorization = `Bearer ${config.github.token}`;
  if (body) headers["Content-Type"] = "application/json";
  const response = await fetch(`https://api.github.com${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(`GitHub ${response.status}: ${detail.message || "request failed"}`);
  }
  return response.status === 204 ? null : response.json();
};

const builder = () => `/repos/${config.github.builderRepo}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Starts the shared builder workflow. Newer API versions return the run id directly;
// otherwise the run is found by its unique run-name.
export const dispatchBuild = async ({ deploymentId, repo, ref, rootDir, image }) => {
  const result = await api(`${builder()}/actions/workflows/${config.github.builderWorkflow}/dispatches`, {
    method: "POST",
    body: {
      ref: config.github.builderRef,
      inputs: { deployment_id: deploymentId, repository: repo, ref, root_dir: rootDir, image },
      return_run_details: true,
    },
  });
  if (result?.workflow_run_id) return { runId: result.workflow_run_id, runUrl: result.html_url };

  for (let attempt = 0; attempt < 10; attempt += 1) {
    await sleep(3000);
    const runs = await api(`${builder()}/actions/workflows/${config.github.builderWorkflow}/runs?event=workflow_dispatch&per_page=20`);
    const run = runs.workflow_runs?.find((item) => item.display_title === `build ${deploymentId}`);
    if (run) return { runId: run.id, runUrl: run.html_url };
  }
  throw new Error("Build was dispatched but its run could not be found");
};

export const getRun = (runId) => api(`${builder()}/actions/runs/${runId}`);

export const getRunSteps = async (runId) => {
  const { jobs = [] } = await api(`${builder()}/actions/runs/${runId}/jobs`);
  return jobs.flatMap((job) => (job.steps || [])
    .filter((step) => !/^(Set up job|Complete job|Post )/.test(step.name))
    .map((step) => ({ name: step.name, status: step.status, conclusion: step.conclusion })));
};

export const cancelRun = (runId) => api(`${builder()}/actions/runs/${runId}/cancel`, { method: "POST" }).catch(() => null);

// Public repositories for the repository picker. Private repositories can still be typed in.
let repoCache = null;
export const publicRepos = async () => {
  if (repoCache && Date.now() - repoCache.at < 5 * 60 * 1000) return repoCache.data;
  const repos = await api(`/users/${config.github.owner}/repos?per_page=100&sort=pushed`, { auth: false });
  const data = repos.filter((repo) => !repo.archived).map((repo) => ({
    fullName: repo.full_name, defaultBranch: repo.default_branch, language: repo.language, pushedAt: repo.pushed_at,
  }));
  repoCache = { at: Date.now(), data };
  return data;
};
