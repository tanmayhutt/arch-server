import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, KeyRound, UserCheck, UserX, X } from "lucide-react";
import { api, formatAgo } from "./api";

// Shows a freshly issued invite code exactly once. It is not stored anywhere readable.
const InviteCode = ({ invite, onClose }) => {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(invite.code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <dialog ref={ref} className="console-sheet" onCancel={(event) => { event.preventDefault(); onClose(); }} aria-label="Invite code">
      <div className="console-sheet-head">
        <h2>Invite code for {invite.email}</h2>
        <button type="button" className="console-icon-button" onClick={onClose} aria-label="Close"><X size={16} /></button>
      </div>
      <div className="console-sheet-body console-form">
        <p className="console-sheet-copy">Send this code to {invite.email} yourself. It works only for that email, only once, and expires {new Date(invite.expiresAt).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}. It will not be shown again.</p>
        <div className="console-invite-code">
          <code>{invite.code}</code>
          <button type="button" className="console-button" onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy"}</button>
        </div>
        <p className="console-sheet-copy">They sign in at <strong>arch-server.tanmaytiwari.me/guest</strong> with that email, then enter the code.</p>
        <div className="console-form-actions"><button type="button" className="console-button is-primary" onClick={onClose}>Done</button></div>
      </div>
    </dialog>
  );
};

const AccessPanel = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [invite, setInvite] = useState(null);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    try {
      setData(await api("/access"));
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = window.setInterval(() => { if (document.visibilityState === "visible") load(); }, 30000);
    return () => window.clearInterval(interval);
  }, [load]);

  const act = async (key, path, body = {}, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(key);
    try {
      const result = await api(path, { method: "POST", body });
      if (result.code) setInvite(result);
      await load();
    } catch (actError) {
      setError(actError.message);
    } finally {
      setBusy("");
    }
  };

  const pending = data?.requests.filter((request) => request.status === "pending") ?? [];
  const decided = data?.requests.filter((request) => request.status !== "pending").slice(0, 5) ?? [];

  return (
    <section className="console-panel" aria-labelledby="access-title">
      <div className="console-panel-heading">
        <KeyRound size={16} />
        <div><span>GUEST ACCESS · APPROVAL AND INVITE CODE REQUIRED</span><h2 id="access-title">Access requests</h2></div>
        {pending.length > 0 && <small className="console-panel-count">{pending.length} pending</small>}
      </div>
      {error && <p className="console-form-error" role="alert">{error}</p>}
      {data && !data.guestsEnabled && <p className="console-empty">Guest sign-in is not configured yet. Requests can still arrive, but approved people cannot sign in until the guest Access application exists.</p>}

      {data && !pending.length && <p className="console-empty">No pending requests. People can ask for access from the public Apps page.</p>}
      {pending.length > 0 && (
        <ul className="console-requests">
          {pending.map((request) => (
            <li key={request.id}>
              <div>
                <strong>{request.name}</strong> <span className="console-muted">{request.email}</span>
                <p className="console-project-meta">
                  {request.repo && <code>{request.repo}</code>}
                  <span>{formatAgo(request.createdAt)}</span>
                </p>
                {request.message && <p className="console-request-message">{request.message}</p>}
              </div>
              <div className="console-project-actions">
                <button type="button" className="console-button is-primary" disabled={busy === request.id} onClick={() => act(request.id, `/access/requests/${request.id}/approve`)}><UserCheck size={13} />Approve</button>
                <button type="button" className="console-button" disabled={busy === request.id} onClick={() => act(request.id, `/access/requests/${request.id}/reject`)}><UserX size={13} />Reject</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {data?.guests.length > 0 && (
        <>
          <h3 className="console-subheading">Guests</h3>
          <ul className="console-requests">
            {data.guests.map((guest) => (
              <li key={guest.id}>
                <div>
                  <strong>{guest.name || guest.email}</strong> <span className="console-muted">{guest.email}</span>
                  <p className="console-project-meta">
                    <span className={`console-status is-${guest.status === "active" ? "live" : guest.status === "revoked" ? "failed" : "queued"}`}>{guest.status}</span>
                    {guest.status === "invited" && guest.inviteExpiresAt && <span>code expires {new Date(guest.inviteExpiresAt).toLocaleDateString([], { day: "numeric", month: "short" })}</span>}
                    <span>{guest.projects.length} project(s){guest.projects.length ? `: ${guest.projects.map((project) => project.slug).join(", ")}` : ""}</span>
                  </p>
                </div>
                <div className="console-project-actions">
                  <button type="button" className="console-button" disabled={busy === guest.id} onClick={() => act(guest.id, `/access/guests/${guest.id}/reissue`, {}, guest.status === "active" ? `Issue a new code for ${guest.email}? They will need it to sign in again.` : undefined)}>New code</button>
                  {guest.status !== "revoked" && <button type="button" className="console-button" disabled={busy === guest.id} onClick={() => act(guest.id, `/access/guests/${guest.id}/revoke`, {}, `Revoke ${guest.email}? Their apps go offline immediately.`)}>Revoke</button>}
                  {guest.projects.length > 0 && <button type="button" className="console-button is-danger" disabled={busy === guest.id} onClick={() => act(guest.id, `/access/guests/${guest.id}/revoke`, { deleteApps: true }, `Revoke ${guest.email} and permanently delete their apps?`)}>Revoke and delete apps</button>}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {decided.length > 0 && (
        <p className="console-muted console-decided">Recently decided: {decided.map((request) => `${request.email} (${request.status})`).join(", ")}. Decided requests are removed after 30 days.</p>
      )}

      {invite && <InviteCode invite={invite} onClose={() => setInvite(null)} />}
    </section>
  );
};

export default AccessPanel;
