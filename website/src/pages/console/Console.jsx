import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, ArrowUpRight, Boxes, Cpu, Globe2, HardDrive, LockKeyhole, MemoryStick, Network, RefreshCw, Server, ShieldCheck } from "lucide-react";
import AccessPanel from "./AccessPanel";
import Projects from "./Projects";
import "./console.css";

const REFRESH_MS = 15000;

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes)) return "–";
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GiB`;
  return `${Math.round(bytes / 1024 ** 2)} MiB`;
};

const formatSince = (iso) => {
  if (!iso) return "–";
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const days = Math.floor(seconds / 86400);
  if (days >= 14) return `${Math.floor(days / 7)}w ${days % 7}d`;
  if (days) return `${days}d ${Math.floor((seconds % 86400) / 3600)}h`;
  const hours = Math.floor(seconds / 3600);
  return hours ? `${hours}h ${Math.floor((seconds % 3600) / 60)}m` : `${Math.max(1, Math.floor(seconds / 60))}m`;
};

const errorCopy = {
  access_required: ["Sign-in required", "Open this page through Cloudflare Access to continue. Reloading will start the sign-in flow."],
  access_invalid: ["Session not accepted", "The Cloudflare Access session could not be verified. Reload to sign in again."],
  not_owner: ["Not the owner identity", "This identity passed Cloudflare Access but is not the configured owner of the console."],
  access_not_configured: ["Console is locked", "The API refuses all requests until CF_ACCESS_TEAM_DOMAIN, CF_ACCESS_AUD, and PLATFORM_OWNER_EMAIL are configured on the server."],
  docker_unavailable: ["Docker is not answering", "The console API is running, but the read-only Docker proxy did not respond."],
  network: ["Console API unreachable", "The platform service did not respond. The public site is unaffected."],
};

const exposureChip = (item) => {
  switch (item.kind) {
    case "public": return { tone: "public", label: item.hostname, href: `https://${item.hostname}` };
    case "tailnet": return { tone: "private", label: `Tailnet :${item.port}` };
    case "loopback": return { tone: "quiet", label: `Loopback :${item.port}` };
    case "all-interfaces": return { tone: "warn", label: `All interfaces :${item.port}` };
    case "host-network": return { tone: "warn", label: "Host network" };
    case "tunnel-connector": return { tone: "public", label: "Outbound tunnel connector" };
    default: return { tone: "quiet", label: "Internal only" };
  }
};

const flagCopy = {
  "docker-socket": "Docker socket",
  "home-directory": "Home directory mounted",
  "host-kernel-readonly": "Host /proc and /sys, read-only",
};

const stateTone = (service) => {
  if (service.state !== "running") return "down";
  if (service.health === "unhealthy") return "down";
  if (service.health === "starting" || service.restartCount > 0) return "warn";
  return "up";
};

const MemoryBar = ({ used, limit, hostTotal }) => {
  const ceiling = limit || hostTotal;
  const ratio = used != null && ceiling ? Math.min(1, used / ceiling) : 0;
  return (
    <div className="console-memory">
      <span>{formatBytes(used)}<small> / {limit ? formatBytes(limit) : "no limit"}</small></span>
      <div className={`console-bar${ratio > 0.85 ? " is-high" : ""}`} aria-hidden="true"><span style={{ transform: `scaleX(${ratio})` }} /></div>
    </div>
  );
};

const ServiceRow = ({ service, hostMemory }) => {
  const tone = stateTone(service);
  return (
    <li className="console-service">
      <div className="console-service-name">
        <span className={`console-dot console-dot-${tone}`} aria-hidden="true" />
        <div>
          <strong>{service.service}</strong>
          <small title={service.image}>{service.image}</small>
        </div>
      </div>
      <dl className="console-service-stats">
        <div><dt>State</dt><dd>{service.state === "running" ? `Up ${formatSince(service.startedAt)}` : service.status}{service.health ? <small> · {service.health}</small> : null}</dd></div>
        <div><dt>CPU</dt><dd>{service.usage ? `${service.usage.cpuPercent}%` : "–"}{service.limits.cpus ? <small> / {service.limits.cpus} core</small> : null}</dd></div>
        <div className="console-stat-memory"><dt>Memory</dt><dd><MemoryBar used={service.usage?.memoryBytes} limit={service.limits.memoryBytes} hostTotal={hostMemory} /></dd></div>
      </dl>
      <div className="console-service-meta">
        <ul className="console-chips" aria-label="Reachability">
          {service.exposure.map((item) => {
            const chip = exposureChip(item);
            return (
              <li key={`${item.kind}-${item.hostname || item.port || ""}`} className={`console-chip console-chip-${chip.tone}`}>
                {chip.href ? <a href={chip.href} target="_blank" rel="noreferrer">{chip.label}<ArrowUpRight size={11} /></a> : chip.label}
              </li>
            );
          })}
        </ul>
        {(service.mounts.flags.length > 0 || service.restartCount > 0 || service.readOnly) && (
          <ul className="console-notes">
            {service.readOnly && <li><ShieldCheck size={12} /> Read-only filesystem</li>}
            {service.restartCount > 0 && <li className="is-warn"><AlertTriangle size={12} /> {service.restartCount} restart{service.restartCount === 1 ? "" : "s"}</li>}
            {service.mounts.flags.map((flag) => <li key={flag} className={flag === "host-kernel-readonly" ? "" : "is-warn"}><LockKeyhole size={12} /> {flagCopy[flag] || flag}</li>)}
          </ul>
        )}
      </div>
    </li>
  );
};

const Console = () => {
  const [state, setState] = useState({ phase: "loading", data: null, error: null, at: null });
  const [session, setSession] = useState(null);
  const mountedRef = useRef(true);

  useLayoutEffect(() => {
    document.title = "Console | arch-server";
    document.head.querySelector('meta[name="robots"]')?.setAttribute("content", "noindex, nofollow");
  }, []);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, phase: current.data ? "refreshing" : "loading" }));
    try {
      // Cloudflare Access answers an expired session with a redirect to its login page.
      // Manual redirect handling surfaces that as a sign-in prompt instead of a network error.
      const response = await fetch("/api/platform/inventory", { cache: "no-store", credentials: "same-origin", redirect: "manual" });
      if (!mountedRef.current) return;
      if (response.type === "opaqueredirect") {
        setState((current) => ({ ...current, phase: "error", error: "access_required", at: new Date() }));
        return;
      }
      const body = await response.json().catch(() => ({}));
      if (!mountedRef.current) return;
      if (!response.ok || body.status !== "ok") {
        setState((current) => ({ ...current, phase: "error", error: body.status || "network", at: new Date() }));
        return;
      }
      setState({ phase: "ready", data: body, error: null, at: new Date() });
    } catch {
      if (mountedRef.current) setState((current) => ({ ...current, phase: "error", error: "network", at: new Date() }));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    fetch("/api/platform/session", { cache: "no-store", redirect: "manual" }).then((response) => response.ok ? response.json() : null).then((body) => { if (mountedRef.current) setSession(body); }).catch(() => {});
    const interval = window.setInterval(() => { if (document.visibilityState === "visible") load(); }, REFRESH_MS);
    return () => { mountedRef.current = false; window.clearInterval(interval); };
  }, [load]);

  const { data } = state;
  const services = data?.projects.flatMap((project) => project.services) ?? [];
  const usedMemory = services.reduce((sum, service) => sum + (service.usage?.memoryBytes || 0), 0);
  const committedMemory = services.reduce((sum, service) => sum + (service.limits.memoryBytes || 0), 0);
  const unlimited = services.filter((service) => !service.limits.memoryBytes).length;
  const hostMemory = data?.host.memoryBytes;
  const busy = state.phase === "loading" || state.phase === "refreshing";
  const [errorTitle, errorBody] = errorCopy[state.error] || errorCopy.network;

  return (
    <div className="console-shell">
      <a className="skip-link" href="#console-main">Skip to content</a>
      <header className="console-topbar">
        <div className="console-brand">
          <span className="brand-icon"><Server size={16} strokeWidth={1.7} /></span>
          <div><strong>arch-server</strong><small>DEPLOY CONSOLE</small></div>
        </div>
        <div className="console-topbar-actions">
          {session?.email && <span className="console-identity"><LockKeyhole size={12} /> {session.email}</span>}
          <button type="button" className="live-refresh" onClick={load} disabled={busy} aria-label="Refresh server inventory">
            <RefreshCw size={14} className={busy ? "is-spinning" : ""} />
            {busy ? "Reading" : "Refresh"}
          </button>
          <Link to="/" className="console-back" aria-label="Back to the public site"><ArrowLeft size={13} /><span>Public site</span></Link>
        </div>
      </header>

      <main id="console-main" className="console-main">
        <section className="console-intro" aria-labelledby="console-title">
          <span className="section-index">SERVER INVENTORY</span>
          <h1 id="console-title">{data ? `Everything running on ${data.host.name}` : "Everything running on the server"}</h1>
          <p>
            {data
              ? `${data.host.os} · kernel ${data.host.kernel} · Docker ${data.host.docker} · ${data.host.cpus} threads · ${formatBytes(hostMemory)} memory`
              : "Reading containers, resource usage, and routes from the machine."}
          </p>
          {state.at && <p className="console-updated" aria-live="polite">Updated {state.at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}{state.phase === "error" && data ? " · last refresh failed" : ""}</p>}
        </section>

        {state.phase === "error" && !data && (
          <section className="console-panel console-error" role="alert">
            <AlertTriangle size={18} />
            <div><h2>{errorTitle}</h2><p>{errorBody}</p><button type="button" className="live-refresh" onClick={() => (state.error?.startsWith("access") ? window.location.reload() : load())}>Try again</button></div>
          </section>
        )}

        {state.phase === "loading" && !data && <div className="console-panel console-skeleton" aria-hidden="true" />}

        {data && (
          <>
            <section className="console-overview" aria-label="Overview">
              <div><Boxes size={15} /><span>Stacks</span><strong>{data.projects.length}</strong><small>{services.length} containers</small></div>
              <div><Cpu size={15} /><span>Running</span><strong>{data.host.containers.running}<small> / {data.host.containers.total}</small></strong><small>{data.host.containers.stopped} stopped</small></div>
              <div><MemoryStick size={15} /><span>Container memory</span><strong>{formatBytes(usedMemory)}</strong><small>{formatBytes(committedMemory)} reserved by limits{unlimited ? `, ${unlimited} unlimited` : ""}</small></div>
              <div><HardDrive size={15} /><span>Images</span><strong>{data.host.images.count}</strong><small>{formatBytes(data.host.images.sizeBytes)} on disk</small></div>
            </section>

            <Projects />

            <AccessPanel />

            <section className="console-panel" aria-labelledby="routes-title">
              <div className="console-panel-heading">
                <Globe2 size={16} />
                <div><span>CLOUDFLARE TUNNEL</span><h2 id="routes-title">Public routes</h2></div>
              </div>
              {data.routes.public.length ? (
                <ul className="console-routes">
                  {data.routes.public.map((route) => (
                    <li key={route.hostname}>
                      <a href={route.protocol.startsWith("http") ? `https://${route.hostname}` : undefined} target="_blank" rel="noreferrer">{route.hostname}</a>
                      <span className="console-route-arrow" aria-hidden="true" />
                      <code>{route.protocol}://{route.target}</code>
                      <small>{route.targetKind === "host" ? "Host service" : "Container"}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="console-empty">Routes could not be read from the tunnel connector ({data.routes.source}).</p>
              )}
            </section>

            {data.projects.map((project) => (
              <section key={project.name} className="console-panel" aria-labelledby={`project-${project.name}`}>
                <div className="console-panel-heading">
                  <Network size={16} />
                  <div>
                    <span>{project.name === "standalone" ? "NO COMPOSE PROJECT" : "COMPOSE PROJECT"}{project.workingDir ? ` · ${project.workingDir}` : ""}</span>
                    <h2 id={`project-${project.name}`}>{project.name}</h2>
                  </div>
                  <small className="console-panel-count">{project.services.filter((service) => service.state === "running").length} / {project.services.length} running</small>
                </div>
                <ul className="console-services">
                  {project.services.map((service) => <ServiceRow key={service.id} service={service} hostMemory={hostMemory} />)}
                </ul>
              </section>
            ))}

          </>
        )}
      </main>
    </div>
  );
};

export default Console;
