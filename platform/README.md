# platform

A personal, single-owner deployment platform for the arch-server: push a repository, get it built and running on its own subdomain, with logs, environment variables, rollbacks, and databases. It runs on the physical machine and is operated from the deploy console at `arch-server.tanmaytiwari.me/console`.

## Status

| Phase | Scope | State |
|---|---|---|
| 1. Inventory | Read-only console: every Compose project and container, resource usage, health, restarts, reachability, tunnel routes | Built |
| 2. Engine | One-click deploy from the console: GitHub Actions builds, Caddy app router, `*.tanmaytiwari.me`, encrypted env vars, health-gated swap, rollback, stop/start, runtime logs | Built |
| 3. Automation and hardening | Deploy on push (polling), encrypted build variables, private builder repo, restricted image-load key, app firewall | Built |
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

1. A deploy starts from the console, or from the push poller when a project's branch gets a new commit. The platform resolves the branch to an exact commit, so a later push cannot change what ships.
2. The platform dispatches the builder workflow in the private `tanmayhutt/arch-builder` repository with a validated repository, commit, root directory, image tag, and encrypted build variables.
3. The workflow builds with the repository Dockerfile, or with Railpack (pinned `v0.40.1`) when there is none, using the GitHub Actions cache.
4. It joins the tailnet as `tag:ci` and streams `docker save | gzip` over SSH with the restricted builder key. The key's forced command validates the archive before `docker load`.
5. The platform starts `app-<slug>-<id>` on `arch-apps` with memory, CPU, and PID limits, `no-new-privileges`, public DNS, and rotated logs, then waits up to 90 seconds for any HTTP response below 500.
6. Only then is the Caddy route switched and the previous container removed. A failed deploy never touches the live version. The last three good images are kept for rollback.

Measured on 2026-10-17: a push was detected after 35 seconds and was live 4 minutes after the push for a cached Node build.

## Security boundaries

- **Console:** Cloudflare Access (owner email) plus independent JWT verification on every request; writes also require same-origin JSON. Encoded slashes are rejected by Nginx.
- **No inbound webhooks:** deploy on push polls GitHub with conditional requests, so nothing bypasses Access.
- **Private builder:** build logs, inputs, and caches live in the private `arch-builder` repository. The public `arch-server` repository runs only the site deployment.
- **Restricted builder key:** `restrict,from="100.64.0.0/10",command="/usr/local/bin/arch-image-load"`. No shell, PTY, or forwarding, tailnet sources only. The loader accepts one gzipped archive whose manifest, repositories file, and OCI index all name exactly the requested `arch-apps/<slug>:<deployment-id>` tag, so a compromised build cannot replace an image used by the server's own services. The builder pins the server host key. The private key exists only as a GitHub secret.
- **Build variables:** encrypted with `PLATFORM_BUILD_KEY` (AES-256-GCM, bound to the deployment id), masked in logs, passed to Railpack builds as BuildKit secrets that stay out of image layers, and to Dockerfile builds as secrets plus single-line build arguments. The cache hash is an HMAC.
- **Runtime variables:** AES-256-GCM in SQLite with `PLATFORM_SECRET_KEY`; values are never returned to the browser.
- **Docker:** POST is allowed through the socket proxy, but the platform only stops or removes containers labelled `arch.platform.managed=true` and builds every container spec itself. Exec, secrets, swarm, and plugins stay blocked.
- **Router admin:** bound to `10.217.83.2` on the internal `router-admin` network only.
- **App firewall:** `arch-apps-firewall.service` confines `10.217.84.0/24` to the internet and its own network. Verified blocked: host SSH and Samba, tailnet tools, the LAN router, other Docker networks, the router admin API, and link-local metadata.

## Host setup

`platform/host/install.sh` (run once with sudo) copies the firewall script and the image loader to root-owned paths and enables the firewall unit, which re-applies after every Docker start. Rerun it after changing either script.

## Builder sync

`platform/builder/build-app.yml` is the canonical builder workflow. After changing it, copy it to `.github/workflows/build-app.yml` in `tanmayhutt/arch-builder`.

## One-time setup for the console

1. Cloudflare Zero Trust, Access, Applications, add a self-hosted application:
   - Domain `arch-server.tanmaytiwari.me`, paths `console` and `api/platform`.
   - Policy: allow only the owner email, require MFA, short session.
2. Copy the application's AUD tag and the team domain (`<team>.cloudflareaccess.com`).
3. GitHub repository, Settings, Secrets and variables, Actions, Variables: set `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, and `PLATFORM_OWNER_EMAIL`.
4. Secrets for the engine (`arch-server`): `PLATFORM_SECRET_KEY`, `PLATFORM_BUILD_KEY`, and `PLATFORM_GITHUB_TOKEN` (fine-grained, `arch-builder` only, Actions read and write; add Contents read-only on private source repositories for deploy on push).
   Secrets for the builder (`arch-builder`): `TS_OAUTH_CLIENT_ID`, `TS_AUDIENCE` (a trust credential for subject `repo:tanmayhutt@89214022/arch-builder@1422741456:ref:refs/heads/main`, auth keys write, `tag:ci` only), `SERVER_IP`, `SERVER_USER`, `SERVER_HOST_KEY`, `BUILDER_SSH_KEY`, `PLATFORM_BUILD_KEY`, and optionally `BUILDER_REPO_TOKEN` for private source repositories.
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
