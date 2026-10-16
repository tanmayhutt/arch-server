# platform

A personal, single-owner deployment platform for the arch-server: push a repository, get it built and running on its own subdomain, with logs, environment variables, rollbacks, and databases. It runs on the physical machine and is operated from the deploy console at `arch-server.tanmaytiwari.me/console`.

## Status

| Phase | Scope | State |
|---|---|---|
| 1. Inventory | Read-only console: every Compose project and container, resource usage, health, restarts, reachability, tunnel routes | Built |
| 2. Engine | Caddy app router, `*.tanmaytiwari.me` wildcard, deploy an image to a subdomain, env vars, health-gated swap, rollback, logs | Planned |
| 3. GitHub | GitHub App, push-to-deploy, shared builder workflow, GHCR images | Planned |
| 4. Data | Postgres, Redis, Mongo, volumes, nightly backups, workers, cron | Planned |
| 5. Polish | Branch previews, custom domains, metrics history, failure alerts | Planned |

## Architecture

```text
Browser ──> Cloudflare Access (owner + MFA) ──> tunnel ──> arch-server-docs (Nginx)
                                                              ├─ /console        React chunk, noindex
                                                              └─ /api/platform/  ──> platform (Node)
                                                                                       │ internal network
                                                                                       └─> docker-proxy ──> docker.sock (ro)
```

- **Two independent locks.** Cloudflare Access protects `/console` and `/api/platform`. The platform service also verifies the `Cf-Access-Jwt-Assertion` token signature, issuer, audience, and owner email on every request. Missing configuration returns `503 access_not_configured`; the API never falls open.
- **Least-privilege Docker access.** The platform never mounts the Docker socket. It reaches `tecnativa/docker-socket-proxy` on an internal-only network. Phase 1 allows GET requests for containers, images, networks, volumes, and info; POST, DELETE, secrets, and exec return 403. Phase 2 will enable only the write endpoints the engine needs.
- **The public site cannot be taken down by the console.** Nginx resolves the platform upstream per request, so a stopped platform container yields a console error, not a failed site.
- **Tunnel routes** are read from the `cloudflared` connector's own configuration log, cached for five minutes. Host-service origins are reduced to `host:<port>`.

## Planned build path (phases 2-3)

1. A push reaches the platform webhook (`/api/platform/hooks/github`, Access bypass, HMAC-verified).
2. The platform dispatches one shared GitHub Actions builder workflow. It checks out the repository, builds with its Dockerfile or Railpack, and pushes to GHCR. Builds never run on the i3.
3. The platform pulls the image, starts it on the `apps` network with memory and CPU limits, waits for its health check, switches the Caddy route, then stops the previous container. The previous image is retained for rollback.
4. `*.tanmaytiwari.me` points at the tunnel, and the tunnel sends it to Caddy. Preview hostnames stay one level deep (`app-git-branch.tanmaytiwari.me`) so Cloudflare's universal certificate covers them.

## One-time setup for the console

1. Cloudflare Zero Trust, Access, Applications, add a self-hosted application:
   - Domain `arch-server.tanmaytiwari.me`, paths `console` and `api/platform`.
   - Policy: allow only the owner email, require MFA, short session.
2. Copy the application's AUD tag and the team domain (`<team>.cloudflareaccess.com`).
3. GitHub repository, Settings, Secrets and variables, Actions, Variables: set `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, and `PLATFORM_OWNER_EMAIL`.
4. Push. The deploy workflow writes them to the server's private `.env`.

## Local development

The console can be developed against the real server without exposing anything:

```bash
# Forward the server's Docker API to a local port over Tailscale SSH.
ssh -fN -L 127.0.0.1:23750:/var/run/docker.sock <user>@<server>

cd platform && npm ci
DOCKER_HOST=tcp://127.0.0.1:23750 HOST=127.0.0.1 PLATFORM_AUTH_MODE=dev-insecure npm start

cd website && npm run dev   # /console, proxied to port 4000
```

`PLATFORM_AUTH_MODE=dev-insecure` refuses to start unless `HOST=127.0.0.1`. The platform code only issues GET requests, but the forwarded socket itself is full Docker access, so close the tunnel when finished.

## Capacity guidance

Lenovo IdeaPad 3, i3-10110U (4 threads), 7.5 GiB RAM, Wi-Fi uplink. Every app must declare a memory limit. Expect roughly 8-15 small apps. This is a single machine on home power and internet; it is not a substitute for multi-region hosting for anything that must stay up.
