import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, KeyRound, LockKeyhole, Server } from "lucide-react";
import Projects from "./Projects";
import { request } from "./api";
import "./console.css";

const GuestPortal = () => {
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useLayoutEffect(() => {
    document.title = "Guest deploys | arch-server";
    document.head.querySelector('meta[name="robots"]')?.setAttribute("content", "noindex, nofollow");
  }, []);

  const load = useCallback(async () => {
    try {
      setSession(await request("/api/guest/session"));
      setError("");
    } catch (loadError) {
      setError(loadError.code === "access_required" ? "Your sign-in expired. Reload the page to sign in again." : loadError.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const redeem = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await request("/api/guest/redeem", { method: "POST", body: { code } });
      setCode("");
      await load();
    } catch (redeemError) {
      setError(redeemError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="console-shell">
      <a className="skip-link" href="#guest-main">Skip to content</a>
      <header className="console-topbar">
        <div className="console-brand">
          <span className="brand-icon"><Server size={16} strokeWidth={1.7} /></span>
          <div><strong>arch-server</strong><small>GUEST DEPLOYS</small></div>
        </div>
        <div className="console-topbar-actions">
          {session?.email && <span className="console-identity"><LockKeyhole size={12} /> {session.email}</span>}
          <Link to="/apps" className="console-back" aria-label="Back to the public apps page"><ArrowLeft size={13} /><span>Apps</span></Link>
        </div>
      </header>

      <main id="guest-main" className="console-main">
        <section className="console-intro" aria-labelledby="guest-title">
          <span className="section-index">GUEST ACCESS</span>
          <h1 id="guest-title">Deploy on this machine</h1>
          <p>Approved guests can run up to two small apps from public GitHub repositories. Every app is isolated, resource-limited, and served at a name ending in -guest.</p>
        </section>

        {error && <p className="console-form-error" role="alert">{error}</p>}

        {session?.state === "not_approved" && (
          <section className="console-panel console-gate">
            <h2>Not approved yet</h2>
            <p>You are signed in as {session.email}, but this email has no access. Ask for access on the <Link className="console-link" to="/apps#request-access">Apps page</Link>. The owner reviews every request.</p>
          </section>
        )}

        {session?.state === "invite_expired" && (
          <section className="console-panel console-gate">
            <h2>Invite no longer valid</h2>
            <p>Your invite code expired or was entered incorrectly too many times. Ask the owner for a new code.</p>
          </section>
        )}

        {session?.state === "needs_code" && (
          <section className="console-panel console-gate" aria-labelledby="code-title">
            <KeyRound size={18} />
            <h2 id="code-title">Enter your invite code</h2>
            <p>Your request was approved. Enter the code the owner sent you. It only works for {session.email}.</p>
            <form className="console-form console-code-form" onSubmit={redeem}>
              <label className="console-field">
                <span>Invite code</span>
                <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="XXXX-XXXX-XXXX-XXXX" autoComplete="one-time-code" spellCheck="false" required maxLength={24} />
              </label>
              <div className="console-form-actions"><button type="submit" className="console-button is-primary" disabled={busy}>{busy ? "Checking" : "Activate access"}</button></div>
            </form>
          </section>
        )}

        {session?.state === "active" && <Projects base="/api/guest" mode="guest" />}
      </main>
    </div>
  );
};

export default GuestPortal;
