import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Boxes, Cpu, Globe2, LockKeyhole, Play, Server, X } from "lucide-react";
import { RequestAccess } from "../Apps";

// Visitors can start a deploy, but it only ever becomes a request: the owner approves the person,
// sends an invite code, and still approves each deploy from the guest portal.
const PermissionDialog = ({ onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog ref={ref} className="console-sheet is-wide" onCancel={(event) => { event.preventDefault(); onClose(); }} aria-label="Ask permission to deploy">
      <div className="console-sheet-head">
        <h2>Deploying here needs the owner's permission</h2>
        <button type="button" className="console-icon-button" onClick={onClose} aria-label="Close"><X size={16} /></button>
      </div>
      <div className="console-sheet-body console-form">
        <ol className="console-steps-plain">
          <li><strong>Ask.</strong> Send the request below with your email and what you want to run.</li>
          <li><strong>Get approved.</strong> If Tanmay approves, you receive a one-time invite code from him directly.</li>
          <li><strong>Deploy.</strong> Sign in at <Link to="/guest" onClick={onClose}>/guest</Link> with that email, enter the code, and deploy. Each deploy is approved and scanned for malware before it runs.</li>
        </ol>
        <RequestAccess />
      </div>
    </dialog>
  );
};

// What /console shows to anyone who is not signed in as the owner: the same safe overview as the
// public Apps page. Every control and all private data stay behind the owner's Access login.
const PublicConsole = () => {
  const [asking, setAsking] = useState(false);
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
    <div className="console-shell">
      <a className="skip-link" href="#console-main">Skip to content</a>
      <header className="console-topbar">
        <div className="console-brand">
          <span className="brand-icon"><Server size={16} strokeWidth={1.7} /></span>
          <div><strong>arch-server</strong><small>DEPLOY CONSOLE</small></div>
        </div>
        <div className="console-topbar-actions">
          {/* A full navigation, so Cloudflare Access can run its login on the protected path. */}
          <a href="/console/owner" className="console-button"><LockKeyhole size={13} />Owner sign in</a>
          <Link to="/" className="console-back" aria-label="Back to the public site"><ArrowLeft size={13} /><span>Public site</span></Link>
        </div>
      </header>

      <main id="console-main" className="console-main">
        <section className="console-intro" aria-labelledby="console-title">
          <span className="section-index">READ-ONLY VIEW</span>
          <h1 id="console-title">What this server is running</h1>
          <p>This is the public view of the deploy console. Deploying, settings, and private services are available only to the owner.</p>
        </section>

        <section className="console-panel" aria-labelledby="public-deploy-title">
          <div className="console-panel-heading">
            <Play size={16} />
            <div><span>DEPLOY ENGINE · PERMISSION REQUIRED</span><h2 id="public-deploy-title">Projects</h2></div>
            <button type="button" className="console-button is-primary" onClick={() => setAsking(true)}><Play size={14} />Deploy a project</button>
          </div>
          <p className="console-empty">Anyone can ask to deploy here. Nothing runs without the owner's permission: you request access, receive an invite code if approved, and every deploy is approved and malware-scanned. <Link className="console-link" to="/guest">Already have a code?</Link></p>
        </section>

        {failed && <p className="console-form-error" role="alert">The overview is unavailable right now. Try again shortly.</p>}

        {data && (
          <>
            <section className="console-overview" aria-label="Overview">
              <div><Boxes size={15} /><span>Running</span><strong>{data.counts.running}</strong><small>containers on the machine</small></div>
              <div><Globe2 size={15} /><span>Deployed apps</span><strong>{data.apps.length}</strong><small>public, each on its own subdomain</small></div>
              <div><LockKeyhole size={15} /><span>Private</span><strong>{data.counts.platformAndPrivate}</strong><small>platform and private services</small></div>
              <div><Cpu size={15} /><span>Machine</span><strong className="console-machine">{data.host.cpus} threads</strong><small>{data.host.memoryGiB} GiB memory · {data.host.os}</small></div>
            </section>

            <section className="console-panel" aria-labelledby="public-apps-title">
              <div className="console-panel-heading">
                <Globe2 size={16} />
                <div><span>PUBLIC</span><h2 id="public-apps-title">Running apps</h2></div>
              </div>
              <ul className="console-routes">
                {data.sites.map((site) => (
                  <li key={site.url}>
                    <a href={site.url} target="_blank" rel="noreferrer">{site.name}</a>
                    <span className="console-route-arrow" aria-hidden="true" />
                    <code>project site</code>
                    <small>Open <ArrowUpRight size={11} /></small>
                  </li>
                ))}
                {data.apps.map((app) => (
                  <li key={app.url}>
                    <a href={app.url} target="_blank" rel="noreferrer">{app.name}</a>
                    <span className="console-route-arrow" aria-hidden="true" />
                    <code>{app.kind === "guest" ? "guest app" : app.repo || "app"}{app.commit ? ` · ${app.commit}` : ""}</code>
                    <small>{app.kind === "guest" ? "Guest" : "Owner"}</small>
                  </li>
                ))}
              </ul>
              {!data.apps.length && <p className="console-empty">No deployed apps yet.</p>}
            </section>

          </>
        )}
      </main>
      {asking && <PermissionDialog onClose={() => setAsking(false)} />}
    </div>
  );
};

export default PublicConsole;
