import { createServer } from "node:http";
import { assertSafeAuthMode, authenticate, authenticateGuest, authMode, guestsEnabled } from "./auth.mjs";
import { config, engineReady } from "./config.mjs";
import { deployments, projects } from "./db.mjs";
import {
  GUEST_LIMITS, InputError, cancelDeployment, createProject, deleteProject, deployProject, describeProject, getDeployment,
  projectLogs, reconcile, rollbackProject, startPolling, startProject, stopProject, updateProject,
} from "./engine.mjs";
import { publicRepos } from "./github.mjs";
import {
  approveRequest, createAccessRequest, guestSession, listAccess, publicOverview, redeemInvite, reissueInvite, rejectRequest, revokeGuest,
} from "./guests.mjs";
import { inventory } from "./inventory.mjs";

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 4000);
const MAX_BODY = 64 * 1024;
const ID = "([a-f0-9]{16})";

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

const ownerProject = (id) => {
  const record = projects.get(id);
  if (!record) throw new InputError("Project not found");
  return record;
};

// A guest may only touch projects they own. Anything else looks exactly like "not found".
const guestProject = (ctx, id) => {
  const record = projects.get(id);
  if (!record || record.guest_id !== ctx.guest.id) throw new InputError("Project not found");
  return record;
};

const guestDeployment = (ctx, id) => {
  const deployment = deployments.get(id);
  if (!deployment) throw new InputError("Deployment not found");
  guestProject(ctx, deployment.project_id);
  return deployment;
};

const deploymentPayload = (id) => {
  const deployment = getDeployment(id);
  if (!deployment) throw new InputError("Deployment not found");
  return { deployment };
};

const projectRoutes = (prefix, scope, owns) => [
  ["GET", `${prefix}/projects/${ID}`, (ctx) => ({ project: describeProject(owns(ctx, ctx.params[0])) })],
  ["PATCH", `${prefix}/projects/${ID}`, async (ctx) => { owns(ctx, ctx.params[0]); return { project: updateProject(ctx.params[0], await ctx.body(), { guest: ctx.guest }) }; }],
  ["DELETE", `${prefix}/projects/${ID}`, async (ctx) => { owns(ctx, ctx.params[0]); await deleteProject(ctx.params[0]); return { deleted: true }; }],
  ["POST", `${prefix}/projects/${ID}/deploy`, async (ctx) => { owns(ctx, ctx.params[0]); return { deploymentId: await deployProject(ctx.params[0]) }; }],
  ["POST", `${prefix}/projects/${ID}/rollback`, async (ctx) => { owns(ctx, ctx.params[0]); return { deploymentId: rollbackProject(ctx.params[0], String((await ctx.body()).deploymentId || "")) }; }],
  ["POST", `${prefix}/projects/${ID}/stop`, async (ctx) => { owns(ctx, ctx.params[0]); await stopProject(ctx.params[0]); return { stopped: true }; }],
  ["POST", `${prefix}/projects/${ID}/start`, (ctx) => { owns(ctx, ctx.params[0]); return { deploymentId: startProject(ctx.params[0]) }; }],
  ["GET", `${prefix}/projects/${ID}/logs`, (ctx) => { owns(ctx, ctx.params[0]); return projectLogs(ctx.params[0], ctx.query.get("tail")); }],
].map(([method, path, handler]) => [scope, method, path, handler]);

const routes = [
  // Public, read-only, plus a rate-limited access request.
  ["public", "GET", "/api/public/overview", () => publicOverview()],
  ["public", "POST", "/api/public/requests", async (ctx) => createAccessRequest(await ctx.body(), ctx.clientAddress)],

  // Guests: verified email, approved and activated with an invite code.
  ["guest-session", "GET", "/api/guest/session", (ctx) => {
    const session = guestSession(ctx.email);
    return { state: session.state, email: session.email, engine: engineReady(), appDomain: config.appDomain, limits: GUEST_LIMITS };
  }],
  ["guest-session", "POST", "/api/guest/redeem", async (ctx) => redeemInvite(ctx.email, (await ctx.body()).code)],
  ["guest", "GET", "/api/guest/projects", (ctx) => ({ engine: engineReady(), appDomain: config.appDomain, limits: GUEST_LIMITS, projects: projects.forGuest(ctx.guest.id).map((item) => describeProject(item)) })],
  ["guest", "POST", "/api/guest/projects", async (ctx) => createProject(await ctx.body(), { guest: ctx.guest })],
  ["guest", "GET", `/api/guest/deployments/${ID}`, (ctx) => { guestDeployment(ctx, ctx.params[0]); return deploymentPayload(ctx.params[0]); }],
  ["guest", "POST", `/api/guest/deployments/${ID}/cancel`, (ctx) => { guestDeployment(ctx, ctx.params[0]); cancelDeployment(ctx.params[0]); return { cancelled: true }; }],
  ...projectRoutes("/api/guest", "guest", guestProject),

  // Owner.
  ["owner", "GET", "/api/platform/session", (ctx) => ({ email: ctx.email, authMode, engine: engineReady(), guests: guestsEnabled })],
  ["owner", "GET", "/api/platform/inventory", () => inventory()],
  ["owner", "GET", "/api/platform/repos", async () => ({ repos: await publicRepos() })],
  ["owner", "GET", "/api/platform/projects", () => ({ engine: engineReady(), appDomain: config.appDomain, projects: projects.all().map((item) => describeProject(item)) })],
  ["owner", "POST", "/api/platform/projects", async (ctx) => createProject(await ctx.body())],
  ["owner", "GET", `/api/platform/deployments/${ID}`, (ctx) => deploymentPayload(ctx.params[0])],
  ["owner", "POST", `/api/platform/deployments/${ID}/cancel`, (ctx) => { cancelDeployment(ctx.params[0]); return { cancelled: true }; }],
  ...projectRoutes("/api/platform", "owner", (ctx, id) => ownerProject(id)),
  ["owner", "GET", "/api/platform/access", () => ({ guestsEnabled, ...listAccess() })],
  ["owner", "POST", `/api/platform/access/requests/${ID}/approve`, (ctx) => approveRequest(ctx.params[0])],
  ["owner", "POST", `/api/platform/access/requests/${ID}/reject`, (ctx) => { rejectRequest(ctx.params[0]); return { rejected: true }; }],
  ["owner", "POST", `/api/platform/access/guests/${ID}/reissue`, (ctx) => reissueInvite(ctx.params[0])],
  ["owner", "POST", `/api/platform/access/guests/${ID}/revoke`, async (ctx) => { await revokeGuest(ctx.params[0], { deleteApps: Boolean((await ctx.body()).deleteApps) }); return { revoked: true }; }],
].map(([scope, method, path, handler]) => [scope, method, new RegExp(`^${path}$`), handler]);

const areaFor = (path) => {
  if (path.startsWith("/api/public/")) return "public";
  if (path.startsWith("/api/guest/")) return "guest";
  return "owner";
};

createServer(async (request, response) => {
  const url = new URL(request.url || "/", "http://platform");
  const path = url.pathname;

  // Container health check. Nginx only forwards /api/* prefixes, so this is not public.
  if (path === "/healthz") return send(response, 200, { status: "ok", authMode });

  // Authenticate before routing so unknown or oddly encoded paths that slip past
  // Cloudflare's path matching still require a valid token for their area.
  const area = areaFor(path);
  const ctx = { query: url.searchParams, body: () => readJson(request), clientAddress: String(request.headers["cf-connecting-ip"] || "") };
  if (area === "owner") {
    const auth = await authenticate(request);
    if (!auth.ok) return send(response, auth.status, { status: auth.code });
    ctx.email = auth.email;
  } else if (area === "guest") {
    const auth = await authenticateGuest(request);
    if (!auth.ok) return send(response, auth.status, { status: auth.code });
    ctx.email = auth.email;
    const session = guestSession(auth.email);
    ctx.guest = session.state === "active" ? session.guest : null;
  }

  const matches = routes.filter(([scope, , pattern]) => pattern.test(path) && (scope === area || (area === "guest" && scope === "guest-session")));
  if (!matches.length) return send(response, 404, { status: "not_found" });
  const route = matches.find(([, method]) => method === request.method);
  if (!route) return send(response, 405, { status: "method_not_allowed" });
  if (route[0] === "guest" && !ctx.guest) return send(response, 403, { status: "guest_not_active" });
  if (request.method !== "GET" && !sameOriginJson(request)) return send(response, 403, { status: "cross_origin_rejected" });

  ctx.params = path.match(route[2]).slice(1);
  try {
    const result = await route[3](ctx);
    // Payloads with their own status field are nested, so this envelope status is never overwritten.
    send(response, 200, { ...result, status: "ok" });
  } catch (error) {
    if (error instanceof InputError) return send(response, 400, { status: "invalid", message: error.message });
    console.error(`${request.method} ${path}: ${error.message}`);
    send(response, 502, { status: "upstream_error", message: area === "public" ? "Temporarily unavailable" : error.message.split("\n")[0].slice(0, 200) });
  }
}).listen(port, host, () => {
  console.log(`platform listening on ${host}:${port} (auth: ${authMode}, guests: ${guestsEnabled ? "enabled" : "disabled"}, engine: ${engineReady() ? "ready" : "disabled"})`);
  if (engineReady()) reconcile().then(startPolling);
});
