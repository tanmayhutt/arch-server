import { useCallback, useEffect, useRef, useState } from "react";
import { BatteryCharging, Check, Clock3, Cpu, Gauge, HardDrive, LockKeyhole, RefreshCw, Server, Thermometer } from "lucide-react";

const formatUptime = (seconds) => {
  if (!Number.isFinite(seconds)) return "Unavailable";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return days ? `${days}d ${hours}h` : `${hours}h ${Math.floor((seconds % 3600) / 60)}m`;
};

const MetricTrace = ({ label, value, unit, values, tone }) => {
  const points = values.length > 1
    ? values.map((item, index) => `${(index / (values.length - 1)) * 100},${42 - (Math.min(100, Math.max(0, item)) / 100) * 36}`).join(" ")
    : "0,36 100,36";
  return <div className={`metric-trace metric-trace-${tone}`}><div><span>{label}</span><strong>{value}{unit}</strong></div><svg viewBox="0 0 100 44" preserveAspectRatio="none" aria-hidden="true"><line x1="0" x2="100" y1="42" y2="42" /><polyline points={points} /></svg></div>;
};

const ServerStatus = ({ compact = false }) => {
  const [check, setCheck] = useState({ state: "checking", latency: null, at: null, data: null });
  const [history, setHistory] = useState({ cpu: [], memory: [], disk: [] });
  const mountedRef = useRef(true);
  const runCheck = useCallback(async () => {
    setCheck((current) => ({ ...current, state: "checking" }));
    const startedAt = performance.now();
    try {
      const response = await fetch(`/api/status?time=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Telemetry unavailable");
      const data = await response.json();
      if (data.status !== "ok") throw new Error("Telemetry not ready");
      if (!mountedRef.current) return;
      setCheck({ state: "ready", latency: Math.max(1, Math.round(performance.now() - startedAt)), at: new Date(), data });
      setHistory((current) => ({
        cpu: [...current.cpu, data.metrics?.cpuPercent ?? 0].slice(-18),
        memory: [...current.memory, data.metrics?.memoryPercent ?? 0].slice(-18),
        disk: [...current.disk, data.metrics?.diskPercent ?? 0].slice(-18),
      }));
    } catch {
      if (mountedRef.current) setCheck({ state: "unavailable", latency: null, at: new Date(), data: null });
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    runCheck();
    const interval = window.setInterval(() => { if (document.visibilityState === "visible") runCheck(); }, 30000);
    return () => { mountedRef.current = false; window.clearInterval(interval); };
  }, [runCheck]);
  const metrics = check.data?.metrics;
  const stateCopy = { checking: "Reading the server", ready: "Live snapshot received", unavailable: "Snapshot unavailable" }[check.state];
  const liveSignals = [
    [Cpu, "CPU", metrics?.cpuPercent == null ? "Unavailable" : `${metrics.cpuPercent}%`],
    [Gauge, "Memory", metrics?.memoryPercent == null ? "Unavailable" : `${metrics.memoryPercent}%`],
    [HardDrive, "Storage", metrics?.diskPercent == null ? "Unavailable" : `${metrics.diskPercent}%`],
    [Clock3, "Machine uptime", formatUptime(metrics?.uptimeSeconds)],
    [Thermometer, "Temperature", metrics?.temperatureC == null ? "Not reported" : `${metrics.temperatureC} °C`],
    [BatteryCharging, "Battery", metrics?.batteryPercent == null ? "Not reported" : `${metrics.batteryPercent}%${metrics.batteryState ? ` · ${metrics.batteryState}` : ""}`],
    [Server, "Deployment", check.data?.deployment || "Unavailable"],
    [Check, "Services", check.data?.services?.telemetry === "online" ? "Website + telemetry online" : "Partial"],
  ];

  return (
    <section className={`section-block page-width status-section${compact ? " status-section-compact" : ""}`} aria-labelledby={compact ? "home-status-title" : "status-title"}>
      <div className="status-intro">
        <span className="section-index">A SMALL LIVE WINDOW</span>
        <h2 id={compact ? "home-status-title" : "status-title"}>The laptop reports in, without publishing its private life.</h2>
        <p>A tiny read-only service samples the host, rounds the useful numbers, and passes them through Nginx and the Cloudflare tunnel. This is real data from the server, not decorative telemetry.</p>
      </div>
      <div className="status-surface">
        <div className="public-check" aria-live="polite">
          <div className="public-check-heading">
            <div className={`status-mark status-mark-${check.state}`} aria-hidden="true">{check.state === "ready" ? <Check size={17} /> : <Clock3 size={17} />}</div>
            <div><span>PUBLIC DELIVERY CHECK</span><h3>{stateCopy}</h3></div>
          </div>
          <dl>
            <div><dt>Route checked</dt><dd>Browser → Cloudflare → tunnel → Nginx → telemetry</dd></div>
            <div><dt>Round trip</dt><dd>{check.latency ? `${check.latency} ms from this browser` : "Not available"}</dd></div>
            <div><dt>Last checked</dt><dd>{check.at ? check.at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "In progress"}</dd></div>
          </dl>
          <button type="button" onClick={runCheck} disabled={check.state === "checking"}><RefreshCw size={14} /> Refresh snapshot</button>
        </div>
        <div className="live-signals">
          <div className="live-signals-heading">
            <Server size={18} />
            <div><span>COARSE HOST TELEMETRY</span><h3>What the machine is doing now</h3></div>
            <button type="button" className="live-refresh" onClick={runCheck} disabled={check.state === "checking"} aria-label="Refresh live machine telemetry">
              <RefreshCw size={14} className={check.state === "checking" ? "is-spinning" : ""} />
              {check.state === "checking" ? "Refreshing" : "Refresh"}
            </button>
          </div>
          <ul>{liveSignals.map(([Icon, label, value]) => <li key={label}><Icon size={15} /><span>{label}</span><strong>{value}</strong></li>)}</ul>
          <div className="status-traces" aria-label="Resource history collected during this browser visit">
            <MetricTrace label="CPU / this visit" value={metrics?.cpuPercent ?? "–"} unit={metrics?.cpuPercent == null ? "" : "%"} values={history.cpu} tone="public" />
            <MetricTrace label="Memory / this visit" value={metrics?.memoryPercent ?? "–"} unit={metrics?.memoryPercent == null ? "" : "%"} values={history.memory} tone="private" />
            <MetricTrace label="Disk / this visit" value={metrics?.diskPercent ?? "–"} unit={metrics?.diskPercent == null ? "" : "%"} values={history.disk} tone="deploy" />
          </div>
          <p><LockKeyhole size={13} /> Intentionally private: processes, IP addresses, usernames, SSH events, SMART details, storage paths, and backup logs.</p>
        </div>
      </div>
    </section>
  );
};

export default ServerStatus;
