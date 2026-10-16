import { createServer } from "node:http";
import { assertSafeAuthMode, authenticate, authMode } from "./auth.mjs";
import { config, engineReady } from "./config.mjs";
import { projects } from "./db.mjs";
import {
  InputError, cancelDeployment, createProject, deleteProject, deployProject, describeProject, getDeployment,
  projectLogs, reconcile, rollbackProject, startProject, stopProject, updateProject,
} from "./engine.mjs";
import { publicRepos } from "./github.mjs";
import { inventory } from "./inventory.mjs";

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 4000);
const MAX_BODY = 64 * 1024;

assertSafeAuthMode(host);

const send = (response, status, body) => {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(body));
};

const readJson = (request) => new Promise((resolve, reject) => {
  let size = 0;
  const chunks = [];
  request.on("data", (chunk) => {
    size += chunk.length;
    if (size <= MAX_BODY) chunks.push(chunk);
  });
  request.on("end", () => {
    if (size > MAX_BODY) return reject(new InputError("Request body too large"));
    if (!chunks.length) return resolve({});
    try {
      const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      resolve(value && typeof value === "object" && !Array.isArray(value) ? value : {});
    } catch {
      reject(new InputError("Invalid JSON"));
    }
  });
  request.on("error", reject);
});

// State-changing requests must be same-origin JSON. Cloudflare's session cookie is SameSite=Lax,
// and this check blocks any cross-site form or script that could otherwise ride on it.
const sameOriginJson = (request) => {
  const origin = request.headers.origin;
  const allowed = authMode === "dev-insecure" ? /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "") : origin === config.consoleOrigin;
  return allowed && (request.headers["content-type"] || "").startsWith("application/json");
};

const project = (id) => {
  const record = projects.get(id);
  if (!record) throw new InputError("Project not found");
  return record;
};

const routes = [
  ["GET", /^\/api\/platform\/session$/, (ctx) => ({ email: ctx.auth.email, authMode, engine: engineReady() })],
  ["GET", /^\/api\/platform\/inventory$/, () => inventory()],
  ["GET", /^\/api\/platform\/repos$/, async () => ({ repos: await publicRepos() })],
  ["GET", /^\/api\/platform\/projects$/, () => ({ engine: engineReady(), appDomain: config.appDomain, projects: projects.all().map((item) => describeProject(item)) })],
  ["POST", /^\/api\/platform\/projects$/, async (ctx) => createProject(await ctx.body())],
  ["GET", /^\/api\/platform\/projects\/([a-f0-9]{16})$/, (ctx) => ({ project: describeProject(project(ctx.params[0])) })],
  ["PATCH", /^\/api\/platform\/projects\/([a-f0-9]{16})$/, async (ctx) => ({ project: updateProject(ctx.params[0], await ctx.body()) })],
  ["DELETE", /^\/api\/platform\/projects\/([a-f0-9]{16})$/, async (ctx) => { await deleteProject(ctx.params[0]); return { deleted: true }; }],
  ["POST", /^\/api\/platform\/projects\/([a-f0-9]{16})\/deploy$/, (ctx) => ({ deploymentId: deployProject(ctx.params[0]) })],
  ["POST", /^\/api\/platform\/projects\/([a-f0-9]{16})\/rollback$/, async (ctx) => ({ deploymentId: rollbackProject(ctx.params[0], String((await ctx.body()).deploymentId || "")) })],
  ["POST", /^\/api\/platform\/projects\/([a-f0-9]{16})\/stop$/, async (ctx) => { await stopProject(ctx.params[0]); return { stopped: true }; }],
  ["POST", /^\/api\/platform\/projects\/([a-f0-9]{16})\/start$/, (ctx) => ({ deploymentId: startProject(ctx.params[0]) })],
  ["GET", /^\/api\/platform\/projects\/([a-f0-9]{16})\/logs$/, (ctx) => projectLogs(ctx.params[0], ctx.query.get("tail"))],
  ["GET", /^\/api\/platform\/deployments\/([a-f0-9]{16})$/, (ctx) => {
    const deployment = getDeployment(ctx.params[0]);
    if (!deployment) throw new InputError("Deployment not found");
    return { deployment };
  }],
  ["POST", /^\/api\/platform\/deployments\/([a-f0-9]{16})\/cancel$/, (ctx) => { cancelDeployment(ctx.params[0]); return { cancelled: true }; }],
];

createServer(async (request, response) => {
  const url = new URL(request.url || "/", "http://platform");
  const path = url.pathname;

  // Container health check. Nginx only forwards /api/platform/, so this is not public.
  if (path === "/healthz") return send(response, 200, { status: "ok", authMode });

  // Authenticate before routing so unknown or oddly encoded paths that slip past
  // Cloudflare's path matching still require a valid owner token.
  const auth = await authenticate(request);
  if (!auth.ok) return send(response, auth.status, { status: auth.code });

  const matches = routes.filter(([, pattern]) => pattern.test(path));
  if (!matches.length) return send(response, 404, { status: "not_found" });
  const route = matches.find(([method]) => method === request.method);
  if (!route) return send(response, 405, { status: "method_not_allowed" });
  if (request.method !== "GET" && !sameOriginJson(request)) return send(response, 403, { status: "cross_origin_rejected" });

  const ctx = { auth, params: path.match(route[1]).slice(1), query: url.searchParams, body: () => readJson(request) };
  try {
    const result = await route[2](ctx);
    // Payloads with their own status field are nested, so this envelope status is never overwritten.
    send(response, 200, { ...result, status: "ok" });
  } catch (error) {
    if (error instanceof InputError) return send(response, 400, { status: "invalid", message: error.message });
    console.error(`${request.method} ${path}: ${error.message}`);
    send(response, 502, { status: "upstream_error", message: error.message.split("\n")[0].slice(0, 200) });
  }
}).listen(port, host, () => {
  console.log(`platform listening on ${host}:${port} (auth: ${authMode}, engine: ${engineReady() ? "ready" : "disabled"})`);
  if (engineReady()) reconcile();
});
