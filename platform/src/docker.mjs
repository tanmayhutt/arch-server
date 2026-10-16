import { request } from "node:http";

// Talks to the Docker Engine API through the socket proxy in production,
// or a local TCP forward / Unix socket during development.
const dockerHost = process.env.DOCKER_HOST || "tcp://docker-proxy:2375";
const socketPath = process.env.DOCKER_SOCKET || null;
const target = socketPath ? { socketPath } : (() => {
  const url = new URL(dockerHost.replace(/^tcp:/, "http:"));
  return { host: url.hostname, port: Number(url.port || 2375) };
})();

export class DockerError extends Error {
  constructor(status, path, message) {
    super(message || `Docker API ${status} for ${path}`);
    this.status = status;
  }
}

const call = (method, path, { body, timeoutMs = 5000, raw = false } = {}) => new Promise((resolve, reject) => {
  const payload = body === undefined ? null : Buffer.from(JSON.stringify(body));
  const headers = { Host: "docker" };
  if (payload) Object.assign(headers, { "Content-Type": "application/json", "Content-Length": payload.length });
  const req = request({ ...target, path, method, headers }, (res) => {
    const chunks = [];
    res.on("data", (chunk) => chunks.push(chunk));
    res.on("end", () => {
      const data = Buffer.concat(chunks);
      const cleanPath = path.split("?")[0];
      if (res.statusCode >= 400) {
        let message;
        try { message = JSON.parse(data.toString("utf8")).message; } catch { /* not JSON */ }
        reject(new DockerError(res.statusCode, cleanPath, message && `Docker: ${message}`));
        return;
      }
      if (raw) return resolve(data);
      if (!data.length) return resolve(null);
      try { resolve(JSON.parse(data.toString("utf8"))); } catch (error) { reject(error); }
    });
  });
  req.setTimeout(timeoutMs, () => req.destroy(new Error(`Docker API timeout for ${path.split("?")[0]}`)));
  req.on("error", reject);
  if (payload) req.write(payload);
  req.end();
});

// Non-TTY container logs are multiplexed: an 8-byte header precedes each frame.
export const demuxLogs = (buffer) => {
  const parts = [];
  let offset = 0;
  while (offset + 8 <= buffer.length && buffer[offset] <= 2 && buffer.readUInt32BE(offset + 4) <= buffer.length - offset - 8) {
    const size = buffer.readUInt32BE(offset + 4);
    parts.push(buffer.subarray(offset + 8, offset + 8 + size));
    offset += 8 + size;
  }
  return offset === buffer.length ? Buffer.concat(parts).toString("utf8") : buffer.toString("utf8");
};

const id = (value) => encodeURIComponent(value);

export const docker = {
  info: () => call("GET", "/info"),
  version: () => call("GET", "/version"),
  containers: (filters) => call("GET", `/containers/json?all=1${filters ? `&filters=${id(JSON.stringify(filters))}` : ""}`),
  inspect: (name) => call("GET", `/containers/${id(name)}/json`),
  // Without one-shot, Docker samples twice so CPU usage can be computed from the delta.
  stats: (name) => call("GET", `/containers/${id(name)}/stats?stream=false`, { timeoutMs: 6000 }),
  images: (filters) => call("GET", `/images/json${filters ? `?filters=${id(JSON.stringify(filters))}` : ""}`),
  inspectImage: (name) => call("GET", `/images/${id(name)}/json`),
  removeImage: (name) => call("DELETE", `/images/${id(name)}?noprune=0`),
  volumes: () => call("GET", "/volumes"),
  logs: (name, tail = 5000) => call("GET", `/containers/${id(name)}/logs?stdout=1&stderr=1&timestamps=0&tail=${tail}`, { raw: true, timeoutMs: 10000 }),
  create: (name, spec) => call("POST", `/containers/create?name=${id(name)}`, { body: spec, timeoutMs: 15000 }),
  start: (name) => call("POST", `/containers/${id(name)}/start`, { timeoutMs: 30000 }),
  stop: (name, seconds = 10) => call("POST", `/containers/${id(name)}/stop?t=${seconds}`, { timeoutMs: (seconds + 10) * 1000 }),
  remove: (name) => call("DELETE", `/containers/${id(name)}?force=1&v=1`, { timeoutMs: 20000 }),
};
