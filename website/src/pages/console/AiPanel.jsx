import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Bot, Power } from "lucide-react";
import { api } from "./api";

const formatMiB = (bytes) => `${Math.round((bytes || 0) / 1024 / 1024)} MiB`;
const minutesUntil = (iso) => Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60000));

// On/off switch for the private chat page (Open WebUI plus the model) on the server. Off means
// zero memory; on costs a few hundred MiB plus the model while it is loaded.
const AiPanel = () => {
  const [ai, setAi] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setAi((await api("/ai")).ai);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = window.setInterval(() => { if (document.visibilityState === "visible") load(); }, 20000);
    return () => window.clearInterval(interval);
  }, [load]);

  const toggle = async () => {
    setBusy(true);
    setError("");
    try {
      setAi((await api(ai.running ? "/ai/stop" : "/ai/start", { method: "POST", body: {} })).ai);
    } catch (toggleError) {
      setError(toggleError.message);
    } finally {
      setBusy(false);
    }
  };

  if (ai && !ai.available) return null;

  return (
    <section className="console-panel" aria-labelledby="ai-title">
      <div className="console-panel-heading">
        <Bot size={16} />
        <div><span>PRIVATE AI · TAILSCALE ONLY</span><h2 id="ai-title">Chat on this machine</h2></div>
        {ai && (
          <button type="button" className={`console-button${ai.running ? "" : " is-primary"}`} onClick={toggle} disabled={busy}>
            <Power size={14} />{busy ? "Working" : ai.running ? "Turn off" : "Turn on"}
          </button>
        )}
      </div>
      {error && <p className="console-form-error" role="alert">{error}</p>}
      {ai?.running ? (
        <p className="console-empty">
          <span className="console-status is-live">On</span>{" "}
          Using {formatMiB(ai.memoryBytes)}{ai.modelLoaded ? ", model loaded" : ", model unloaded"}. Turns itself off in about {minutesUntil(ai.autoOffAt)} min without chats.
          {ai.chatUrl && <> Open it at <a className="console-link" href={ai.chatUrl} target="_blank" rel="noreferrer">{ai.chatUrl.replace(/^https?:\/\//, "")}<ArrowUpRight size={12} /></a> from any device on your Tailscale.</>}
        </p>
      ) : ai ? (
        <p className="console-empty"><span className="console-status is-stopped">Off</span> Nothing is running and no memory is used. Turn it on to chat; it is ready in about 20 seconds.</p>
      ) : null}
    </section>
  );
};

export default AiPanel;
