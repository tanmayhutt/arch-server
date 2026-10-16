import { config } from "./config.mjs";

// Builds the complete Caddy configuration from the live routes and replaces it atomically.
// TLS terminates at Cloudflare, so the router only speaks HTTP inside the Docker network.
const buildConfig = (routes) => ({
  admin: { listen: new URL(config.router.adminUrl).host, origins: [new URL(config.router.adminUrl).host] },
  apps: {
    http: {
      servers: {
        apps: {
          listen: [config.router.listen],
          automatic_https: { disable: true },
          routes: [
            ...routes.map((route) => ({
              match: [{ host: [route.host] }],
              handle: [{ handler: "reverse_proxy", upstreams: [{ dial: route.dial }] }],
              terminal: true,
            })),
            {
              handle: [{
                handler: "static_response",
                status_code: 404,
                headers: { "Content-Type": ["text/plain; charset=utf-8"] },
                body: "No app is deployed at this address.\n",
              }],
            },
          ],
        },
      },
    },
  },
});

export const pushRoutes = async (routes) => {
  const response = await fetch(`${config.router.adminUrl}/load`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildConfig(routes)),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Router rejected configuration (${response.status}): ${(await response.text()).slice(0, 200)}`);
};
