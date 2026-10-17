import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Boxes, Cpu, Globe2, LockKeyhole, Send } from "lucide-react";
import "./apps.css";

const since = (iso) => {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return days >= 1 ? `live ${days}d` : "live today";
};

export const RequestAccess = () => {
  const [form, setForm] = useState({ name: "", email: "", repo: "", message: "", website: "" });
  const [state, setState] = useState({ phase: "idle", error: "" });
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setState({ phase: "sending", error: "" });
    try {
      const response = await fetch("/api/public/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.status !== "ok") throw new Error(data.message || "The request could not be sent. Try again later.");
      setState({ phase: "sent", error: "" });
    } catch (error) {
      setState({ phase: "idle", error: error.message });
    }
  };

  if (state.phase === "sent") {
    return (
      <div className="apps-request-done" role="status">
        <h3>Request sent</h3>
        <p>Thanks, {form.name.split(" ")[0]}. If the request is approved, you will receive an invite code from Tanmay directly. Then sign in at <Link to="/guest">/guest</Link> with {form.email} and enter the code.</p>
      </div>
    );
  }

  return (
    <form className="apps-request-form" onSubmit={submit} noValidate={false}>
      <div className="apps-form-row">
        <label><span>Name</span><input required minLength={2} maxLength={80} value={form.name} onChange={update("name")} autoComplete="name" /></label>
        <label><span>Email</span><input required type="email" maxLength={254} value={form.email} onChange={update("email")} autoComplete="email" /></label>
      </div>
      <label><span>Public GitHub repository <small>(optional)</small></span><input value={form.repo} onChange={update("repo")} placeholder="owner/name" maxLength={201} spellCheck="false" /></label>
      <label><span>What would you like to run? <small>(optional)</small></span><textarea rows={3} maxLength={1000} value={form.message} onChange={update("message")} /></label>
      {/* Honeypot: hidden from people and assistive technology, filled only by bots. */}
      <label className="apps-honeypot" aria-hidden="true"><span>Website</span><input tabIndex={-1} autoComplete="off" value={form.website} onChange={update("website")} /></label>
      {state.error && <p className="apps-form-error" role="alert">{state.error}</p>}
      <div className="apps-form-footer">
        <p><LockKeyhole size={12} /> Your name and email are used only to review this request and reach you. Decided requests are deleted after 30 days.</p>
        <button type="submit" disabled={state.phase === "sending"}><Send size={14} />{state.phase === "sending" ? "Sending" : "Request access"}</button>
      </div>
    </form>
  );
};

const Apps = () => {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/public/overview", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((body) => { if (alive) setData(body); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);

  return (
    <div className="site-page apps-page">
      <header className="page-header page-width">
        <div className="eyebrow">self-hosted apps</div>
        <div className="page-header-grid">
          <h1>What this laptop<br />is serving right now.</h1>
          <p>Projects are built in GitHub Actions, shipped to this machine over Tailscale, and served through Cloudflare. This page shows public apps only; private tools stay private.</p>
        </div>
      </header>

      <section className="page-width apps-section" aria-labelledby="apps-running">
        <div className="apps-counts" aria-live="polite">
          <div><Boxes size={15} /><span>Running containers</span><strong>{data ? data.counts.running : "–"}</strong></div>
          <div><Globe2 size={15} /><span>Deployed apps</span><strong>{data ? data.apps.length : "–"}</strong></div>
          <div><LockKeyhole size={15} /><span>Platform and private services</span><strong>{data ? data.counts.platformAndPrivate : "–"}</strong></div>
          <div><Cpu size={15} /><span>Machine</span><strong className="apps-machine">{data ? `${data.host.cpus} threads · ${data.host.memoryGiB} GiB` : "–"}</strong></div>
        </div>

        <h2 id="apps-running" className="apps-heading">Running apps</h2>
        {failed && <p className="apps-empty">The app list is unavailable right now. The <Link to="/status">live status</Link> page may still respond.</p>}
        {data && (
          <ul className="apps-list">
            {data.sites.map((site) => (
              <li key={site.url}>
                <div><strong>{site.name}</strong><small>Project site</small></div>
                <a href={site.url} target="_blank" rel="noreferrer">Open<ArrowUpRight size={13} /></a>
              </li>
            ))}
            {data.apps.map((app) => (
              <li key={app.url}>
                <div>
                  <strong>{app.name}</strong>
                  <small>{app.kind === "guest" ? "Guest app" : app.repo}{app.commit ? ` · ${app.commit}` : ""}{app.liveSince ? ` · ${since(app.liveSince)}` : ""}</small>
                </div>
                <a href={app.url} target="_blank" rel="noreferrer">Open<ArrowUpRight size={13} /></a>
              </li>
            ))}
            {!data.apps.length && <li className="apps-list-empty">No deployed apps yet. New ones appear here as soon as they go live.</li>}
          </ul>
        )}
      </section>

      <section id="request-access" className="page-width apps-section apps-request" aria-labelledby="request-title">
        <div className="apps-request-copy">
          <span className="section-index">DEPLOY HERE</span>
          <h2 id="request-title">Want to run a project on this machine?</h2>
          <p>Access is by approval only. Send a request; if Tanmay approves it, you receive a one-time invite code. Approved guests can run up to two small apps from public repositories, isolated from the rest of the server.</p>
          <p className="apps-already">Already have a code? <Link to="/guest">Sign in as a guest</Link>.</p>
        </div>
        <RequestAccess />
      </section>
    </div>
  );
};

export default Apps;
