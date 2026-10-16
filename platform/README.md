# platform

A personal, single-owner deployment platform for the arch-server: push a repository, get it built and running on its own subdomain, with logs, environment variables, rollbacks, and databases. It runs on the physical machine and is operated from the deploy console at `arch-server.tanmaytiwari.me/console`.

## Status

| Phase | Scope | State |
|---|---|---|
| 1. Inventory | Read-only console: every Compose project and container, resource usage, health, restarts, reachability, tunnel routes | Built |
| 2. Engine | One-click deploy from the console: GitHub Actions builds, Caddy app router, `*.tanmaytiwari.me`, encrypted env vars, health-gated swap, rollback, stop/start, runtime logs | Built |
| 3. Automation | Push-to-deploy webhooks, branch previews, build-time variables | Planned |
| 4. Data | Postgres, Redis, Mongo, volumes, nightly backups, workers, cron | Planned |
| 5. Polish | Custom domains, metrics history, failure alerts | Planned |

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

## How a deploy works

1. The console calls `POST /api/platform/projects/:id/deploy`. Same-origin JSON is required for every write, on top of the Access token.
2. The platform dispatches `.github/workflows/build-app.yml` with a validated repository, ref, root directory, and image tag. The workflow builds with the repository Dockerfile, or with Railpack (pinned `v0.40.1`) when there is none, using the GitHub Actions cache.
3. The workflow joins the tailnet as `tag:ci` and streams `docker save | gzip` over SSH into `docker load` on the server. No registry or pull token is involved.
4. The platform starts `app-<slug>-<id>` on the `arch-apps` network with memory, CPU, and PID limits, `no-new-privileges`, and rotated logs. It waits up to 90 seconds for any HTTP response below 500 on the project port.
5. Only then is the Caddy route switched and the previous container removed. A failed deploy never touches the live version. The last three good images are kept for rollback.

`*.tanmaytiwari.me` reaches Caddy through a wildcard tunnel route. Specific tunnel hostnames such as `arch-server` and `ssh` take precedence. Preview hostnames must stay one level deep for Cloudflare's universal certificate.

## Security boundaries

- The Docker proxy now allows POST so the engine can create containers. The platform only stops or removes containers labelled `arch.platform.managed=true`, and builds every container spec server-side: no privileged mode, host networking, binds, or devices. Exec, secrets, swarm, and plugins remain blocked.
- Caddy's admin API has no authentication, so it binds only to `10.217.83.2` on the internal `router-admin` network. Apps cannot reach it.
- Apps run on `10.217.84.0/24` with outbound internet. A host firewall rule blocking that subnet from host-only services (Samba, SSH, tailnet-bound tools) is a recommended follow-up.
- Environment variables are AES-256-GCM encrypted in SQLite with `PLATFORM_SECRET_KEY` and are never returned to the browser.
- Apps reserve at most `APPS_MEMORY_BUDGET_MB` (3072 by default) in total.

## One-time setup for the console

1. Cloudflare Zero Trust, Access, Applications, add a self-hosted application:
   - Domain `arch-server.tanmaytiwari.me`, paths `console` and `api/platform`.
   - Policy: allow only the owner email, require MFA, short session.
2. Copy the application's AUD tag and the team domain (`<team>.cloudflareaccess.com`).
3. GitHub repository, Settings, Secrets and variables, Actions, Variables: set `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, and `PLATFORM_OWNER_EMAIL`.
4. Secrets for the engine:
   - `PLATFORM_SECRET_KEY`: random, for example `openssl rand -hex 32`.
   - `PLATFORM_GITHUB_TOKEN`: fine-grained token, only this repository, Actions read and write.
   - `BUILDER_REPO_TOKEN` (optional): fine-grained token, Contents read-only, for private source repositories.
5. Cloudflare tunnel public hostname `*.tanmaytiwari.me` to `http://arch-server-router:8080`.
6. Run the deploy workflow. It writes the values to the server's private `.env`.

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
