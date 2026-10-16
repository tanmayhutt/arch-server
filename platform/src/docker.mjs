import { request } from "node:http";

// Talks to the Docker Engine API through the read-only socket proxy in production,
// or a local Unix socket during development (DOCKER_SOCKET).
const dockerHost = process.env.DOCKER_HOST || "tcp://docker-proxy:2375";
const socketPath = process.env.DOCKER_SOCKET || null;
const target = socketPath ? { socketPath } : (() => {
  const url = new URL(dockerHost.replace(/^tcp:/, "http:"));
  return { host: url.hostname, port: Number(url.port || 2375) };
})();

const call = (path, { timeoutMs = 5000, raw = false } = {}) => new Promise((resolve, reject) => {
  const req = request({ ...target, path, method: "GET", headers: { Host: "docker" } }, (res) => {
    const chunks = [];
    res.on("data", (chunk) => chunks.push(chunk));
    res.on("end", () => {
      const body = Buffer.concat(chunks);
      if (res.statusCode >= 400) {
        reject(new Error(`Docker API ${res.statusCode} for ${path.split("?")[0]}`));
        return;
      }
      try { resolve(raw ? body : JSON.parse(body.toString("utf8"))); } catch (error) { reject(error); }
    });
  });
  req.setTimeout(timeoutMs, () => req.destroy(new Error(`Docker API timeout for ${path.split("?")[0]}`)));
  req.on("error", reject);
  req.end();
});

export const docker = {
  info: () => call("/info"),
  version: () => call("/version"),
  containers: () => call("/containers/json?all=1"),
  inspect: (id) => call(`/containers/${encodeURIComponent(id)}/json`),
  // Without one-shot, Docker samples twice so CPU usage can be computed from the delta.
  stats: (id) => call(`/containers/${encodeURIComponent(id)}/stats?stream=false`, { timeoutMs: 6000 }),
  images: () => call("/images/json"),
  volumes: () => call("/volumes"),
  logs: (id, tail = 5000) => call(`/containers/${encodeURIComponent(id)}/logs?stdout=1&stderr=1&tail=${tail}`, { raw: true, timeoutMs: 10000 }),
};
