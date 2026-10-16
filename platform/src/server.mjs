import { createServer } from "node:http";
import { assertSafeAuthMode, authenticate, authMode } from "./auth.mjs";
import { inventory } from "./inventory.mjs";

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 4000);

assertSafeAuthMode(host);

const send = (response, status, body) => {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(body));
};

const routes = {
  "/api/platform/session": async (auth) => ({ status: "ok", email: auth.email, authMode }),
  "/api/platform/inventory": async () => inventory(),
};

createServer(async (request, response) => {
  const path = request.url?.split("?")[0] || "/";

  // Container health check. Nginx only forwards /api/platform/, so this is not public.
  if (path === "/healthz") return send(response, 200, { status: "ok", authMode });

  const handler = routes[path];
  if (!handler) return send(response, 404, { status: "not_found" });
  if (request.method !== "GET") return send(response, 405, { status: "method_not_allowed" });

  const auth = await authenticate(request);
  if (!auth.ok) return send(response, auth.status, { status: auth.code });

  try {
    send(response, 200, await handler(auth));
  } catch (error) {
    console.error(`${path}: ${error.message}`);
    send(response, 502, { status: "docker_unavailable" });
  }
}).listen(port, host, () => {
  console.log(`platform listening on ${host}:${port} (auth: ${authMode})`);
});
