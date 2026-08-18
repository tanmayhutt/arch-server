import { useCallback, useEffect, useState } from "react";
import { BatteryCharging, Box, Check, Clock3, Database, Gauge, HardDrive, LockKeyhole, Network, RefreshCw, ShieldAlert, Thermometer } from "lucide-react";

const privateSignals = [
  [Thermometer, "CPU temperature"], [Gauge, "Memory usage"],
  [HardDrive, "Disk and SSD health"], [BatteryCharging, "Battery state"],
  [Box, "Container health"], [Network, "Tunnel status"],
  [ShieldAlert, "Failed SSH logins"], [Database, "Backup result"],
];

const ServerStatus = () => {
  const [check, setCheck] = useState({ state: "checking", latency: null, at: null });
  const runCheck = useCallback(async () => {
    setCheck((current) => ({ ...current, state: "checking" }));
    const startedAt = performance.now();
    try {
      const response = await fetch(`/healthz?time=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Origin did not return a healthy response");
      const result = await response.json();
      if (result.status !== "ok") throw new Error("Origin did not report ready");
      setCheck({ state: "ready", latency: Math.max(1, Math.round(performance.now() - startedAt)), at: new Date() });
    } catch {
      setCheck({ state: "unavailable", latency: null, at: new Date() });
    }
  }, []);

  useEffect(() => { runCheck(); }, [runCheck]);
  const stateCopy = { checking: "Checking the origin", ready: "Origin responded", unavailable: "Check unavailable" }[check.state];

  return (
    <section className="section-block page-width status-section" aria-labelledby="status-title">
      <div className="status-intro">
        <span className="section-index">STATUS, WITHOUT OVERSHARING</span>
        <h2 id="status-title">A small public check. The useful details stay private.</h2>
        <p>This page can safely confirm that the web origin answered. Machine temperatures, storage health, login failures, and backup results are operational data, so those belong behind my private access layer.</p>
      </div>
      <div className="status-surface">
        <div className="public-check" aria-live="polite">
          <div className="public-check-heading">
            <div className={`status-mark status-mark-${check.state}`} aria-hidden="true">{check.state === "ready" ? <Check size={17} /> : <Clock3 size={17} />}</div>
            <div><span>PUBLIC ORIGIN CHECK</span><h3>{stateCopy}</h3></div>
          </div>
          <dl>
            <div><dt>Route checked</dt><dd>Cloudflare → tunnel → Nginx</dd></div>
            <div><dt>Round trip</dt><dd>{check.latency ? `${check.latency} ms from this browser` : "Not available"}</dd></div>
            <div><dt>Last checked</dt><dd>{check.at ? check.at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "In progress"}</dd></div>
          </dl>
          <button type="button" onClick={runCheck} disabled={check.state === "checking"}><RefreshCw size={14} /> Check again</button>
          <p className="check-caveat">This proves the website path answered. It does not claim that every service on the laptop is healthy.</p>
        </div>
        <div className="private-signals">
          <div className="private-signals-heading"><LockKeyhole size={18} /><div><span>PRIVATE OPERATIONS VIEW</span><h3>Signals worth collecting next</h3></div></div>
          <ul>{privateSignals.map(([Icon, label]) => <li key={label}><Icon size={15} /><span>{label}</span><small>PRIVATE</small></li>)}</ul>
          <p>These are not live yet. When monitoring is added, the detailed values will sit behind Cloudflare Access instead of being published here.</p>
        </div>
      </div>
    </section>
  );
};

export default ServerStatus;
