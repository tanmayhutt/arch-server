import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ArrowUpRight, CircleStop, ExternalLink, GitBranch, History, Play, Plus, RotateCcw, ScrollText, Settings2, Trash2, X } from "lucide-react";
import { activeStatuses, formatAgo, request } from "./api";

// The same interface serves the owner (/api/platform) and approved guests (/api/guest).
// The server enforces every guest restriction; the mode only adjusts what the form offers.
const ApiContext = createContext({ base: "/api/platform", mode: "owner" });
const useApi = () => {
  const { base } = useContext(ApiContext);
  return useCallback((path, options) => request(`${base}${path}`, options), [base]);
};
const useMode = () => useContext(ApiContext).mode;

const statusCopy = {
  queued: "Queued", building: "Building", deploying: "Deploying", live: "Live", failed: "Failed",
  superseded: "Previous", stopped: "Stopped", cancelled: "Cancelled",
};

const parseEnv = (text) => {
  const env = {};
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index < 1) throw new Error(`Expected KEY=VALUE: ${line.slice(0, 40)}`);
    const key = line.slice(0, index).trim().replace(/^export\s+/, "");
    let value = line.slice(index + 1).trim();
    if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1);
    env[key] = value;
  }
  return env;
};

const Sheet = ({ title, onClose, children, wide = false }) => {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog ref={ref} className={`console-sheet${wide ? " is-wide" : ""}`} onCancel={(event) => { event.preventDefault(); onClose(); }} aria-label={title}>
      <div className="console-sheet-head">
        <h2>{title}</h2>
        <button type="button" className="console-icon-button" onClick={onClose} aria-label="Close"><X size={16} /></button>
      </div>
      <div className="console-sheet-body">{children}</div>
    </dialog>
  );
};

const Field = ({ label, hint, children }) => (
  <label className="console-field">
    <span>{label}</span>
    {children}
    {hint && <small>{hint}</small>}
  </label>
);

const FormError = ({ message }) => message ? <p className="console-form-error" role="alert">{message}</p> : null;

const Toggle = ({ label, hint, checked, onChange }) => (
  <label className="console-toggle">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    <span><strong>{label}</strong>{hint && <small>{hint}</small>}</span>
  </label>
);

// Stored variable names with remove toggles. Values are never sent back to the browser.
const KeyList = ({ label, keys, removed, onToggle }) => (
  <div className="console-field">
    <span>{label}</span>
    {keys.length ? (
      <ul className="console-env-keys">
        {keys.map((key) => (
          <li key={key} className={removed.has(key) ? "is-removed" : ""}>
            <code>{key}</code>
            <button type="button" className="console-link-button" onClick={() => onToggle(key)}>{removed.has(key) ? "Keep" : "Remove"}</button>
          </li>
        ))}
      </ul>
    ) : <small>None yet.</small>}
  </div>
);

const toggleIn = (setter) => (key) => setter((current) => {
  const next = new Set(current);
  if (next.has(key)) next.delete(key); else next.add(key);
  return next;
});

const NewProject = ({ appDomain, onCreated, onClose }) => {
  const api = useApi();
  const mode = useMode();
  const [repos, setRepos] = useState([]);
  const [form, setForm] = useState({ repo: "", branch: "main", slug: "", port: "3000", memoryMb: mode === "guest" ? "128" : "256", rootDir: "", env: "", buildEnv: "", autoDeploy: true });
  const hostname = form.slug ? `${mode === "guest" ? `${form.slug.replace(/-guest$/, "")}-guest` : form.slug}.${appDomain}` : "";
  const [state, setState] = useState({ busy: false, error: "" });
  const slugTouched = useRef(false);

  useEffect(() => { if (mode === "owner") api("/repos").then((data) => setRepos(data.repos)).catch(() => {}); }, [api, mode]);

  const update = (key, value) => setForm((current) => {
    const next = { ...current, [key]: value };
    if (key === "repo") {
      const match = repos.find((repo) => repo.fullName.toLowerCase() === value.toLowerCase());
      if (match) next.branch = match.defaultBranch;
      if (!slugTouched.current) next.slug = (value.split("/")[1] || "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, "").slice(0, 32);
    }
    return next;
  });

  const submit = async (event) => {
    event.preventDefault();
    setState({ busy: true, error: "" });
    try {
      const data = await api("/projects", {
        method: "POST",
        body: { repo: form.repo.trim(), branch: form.branch.trim(), slug: form.slug.trim(), port: Number(form.port), memoryMb: Number(form.memoryMb), rootDir: form.rootDir.trim(), env: parseEnv(form.env), buildEnv: parseEnv(form.buildEnv), autoDeploy: form.autoDeploy },
      });
      onCreated(data.deploymentId);
    } catch (error) {
      setState({ busy: false, error: error.message });
    }
  };

  return (
    <Sheet title="New project" onClose={onClose}>
      <form className="console-form" onSubmit={submit}>
        <Field label="GitHub repository" hint={mode === "guest" ? "owner/name of a public GitHub repository." : "owner/name. Public repositories are suggested; private ones work when the builder token can read them."}>
          <input required list="console-repos" value={form.repo} onChange={(event) => update("repo", event.target.value)} placeholder="tanmayhutt/my-app" autoComplete="off" spellCheck="false" />
          <datalist id="console-repos">{repos.map((repo) => <option key={repo.fullName} value={repo.fullName}>{repo.language || ""}</option>)}</datalist>
        </Field>
        <div className="console-form-row">
          <Field label="Branch"><input required value={form.branch} onChange={(event) => update("branch", event.target.value)} spellCheck="false" /></Field>
          <Field label="Root directory" hint="Leave empty for the repository root."><input value={form.rootDir} onChange={(event) => update("rootDir", event.target.value)} placeholder="apps/web" spellCheck="false" /></Field>
        </div>
        <Field label="Subdomain" hint={hostname ? `https://${hostname}` : "Lowercase letters, numbers, and hyphens."}>
          <input required value={form.slug} onChange={(event) => { slugTouched.current = true; update("slug", event.target.value.toLowerCase()); }} pattern="[a-z][a-z0-9\-]{1,30}[a-z0-9]" spellCheck="false" />
        </Field>
        <div className="console-form-row">
          <Field label="Port" hint="The app must listen on this port. PORT is set for you."><input required type="number" min="1" max="65535" value={form.port} onChange={(event) => update("port", event.target.value)} /></Field>
          <Field label="Memory (MiB)" hint={mode === "guest" ? "Hard limit, up to 256." : "Hard limit. 256 suits most small apps."}><input required type="number" min="64" max={mode === "guest" ? 256 : 2048} step="32" value={form.memoryMb} onChange={(event) => update("memoryMb", event.target.value)} /></Field>
        </div>
        <Field label="Runtime variables" hint="Available while the app runs. One KEY=VALUE per line. Stored encrypted and never shown again.">
          <textarea rows={3} value={form.env} onChange={(event) => update("env", event.target.value)} placeholder={"DATABASE_URL=...\nAPI_KEY=..."} spellCheck="false" />
        </Field>
        <Field label="Build variables" hint="Available only while building, for values like VITE_API_URL or NEXT_PUBLIC_*. Anything a frontend reads at build time ends up in its public files.">
          <textarea rows={2} value={form.buildEnv} onChange={(event) => update("buildEnv", event.target.value)} placeholder="VITE_API_URL=https://api.example.com" spellCheck="false" />
        </Field>
        <Toggle label="Deploy on push" hint="Checks the branch every 45 seconds and deploys new commits." checked={form.autoDeploy} onChange={(value) => update("autoDeploy", value)} />
        <FormError message={state.error} />
        <div className="console-form-actions">
          <button type="button" className="console-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="console-button is-primary" disabled={state.busy}><Play size={14} />{state.busy ? "Starting" : "Deploy"}</button>
        </div>
      </form>
    </Sheet>
  );
};

const ProjectSettings = ({ project, onSaved, onClose }) => {
  const api = useApi();
  const mode = useMode();
  const [form, setForm] = useState({ branch: project.branch, rootDir: project.rootDir, port: String(project.port), memoryMb: String(project.memoryMb), cpus: String(project.cpus), env: "", buildEnv: "", autoDeploy: project.autoDeploy });
  const [removed, setRemoved] = useState(new Set());
  const [removedBuild, setRemovedBuild] = useState(new Set());
  const [state, setState] = useState({ busy: false, error: "", saved: false });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setState({ busy: true, error: "", saved: false });
    try {
      const env = parseEnv(form.env);
      for (const key of removed) env[key] = null;
      const buildEnv = parseEnv(form.buildEnv);
      for (const key of removedBuild) buildEnv[key] = null;
      await api(`/projects/${project.id}`, {
        method: "PATCH",
        body: { branch: form.branch, rootDir: form.rootDir, port: Number(form.port), memoryMb: Number(form.memoryMb), cpus: Number(form.cpus), env, buildEnv, autoDeploy: form.autoDeploy },
      });
      setState({ busy: false, error: "", saved: true });
      setForm((current) => ({ ...current, env: "", buildEnv: "" }));
      setRemoved(new Set());
      setRemovedBuild(new Set());
      onSaved();
    } catch (error) {
      setState({ busy: false, error: error.message, saved: false });
    }
  };

  return (
    <Sheet title={`${project.slug} settings`} onClose={onClose}>
      <form className="console-form" onSubmit={submit}>
        <div className="console-form-row">
          <Field label="Branch"><input required value={form.branch} onChange={(event) => update("branch", event.target.value)} spellCheck="false" /></Field>
          <Field label="Root directory"><input value={form.rootDir} onChange={(event) => update("rootDir", event.target.value)} spellCheck="false" /></Field>
        </div>
        <div className="console-form-row is-three">
          <Field label="Port"><input type="number" min="1" max="65535" value={form.port} onChange={(event) => update("port", event.target.value)} /></Field>
          <Field label="Memory (MiB)"><input type="number" min="64" max={mode === "guest" ? 256 : 2048} step="32" value={form.memoryMb} onChange={(event) => update("memoryMb", event.target.value)} /></Field>
          <Field label="CPU"><input type="number" min="0.1" max={mode === "guest" ? 0.5 : 2} step="0.1" value={form.cpus} onChange={(event) => update("cpus", event.target.value)} /></Field>
        </div>
        <Toggle label="Deploy on push" hint="Checks the branch every 45 seconds and deploys new commits." checked={form.autoDeploy} onChange={(value) => update("autoDeploy", value)} />
        <KeyList label="Runtime variables" keys={project.envKeys} removed={removed} onToggle={toggleIn(setRemoved)} />
        <Field label="Add or replace runtime variables" hint="KEY=VALUE per line. A key that already exists is overwritten.">
          <textarea rows={2} value={form.env} onChange={(event) => update("env", event.target.value)} spellCheck="false" />
        </Field>
        <KeyList label="Build variables" keys={project.buildEnvKeys} removed={removedBuild} onToggle={toggleIn(setRemovedBuild)} />
        <Field label="Add or replace build variables" hint="Used only during the build. Values a frontend reads at build time become public.">
          <textarea rows={2} value={form.buildEnv} onChange={(event) => update("buildEnv", event.target.value)} spellCheck="false" />
        </Field>
        <FormError message={state.error} />
        {state.saved && <p className="console-form-note" role="status">Saved. Redeploy for the changes to take effect.</p>}
        <div className="console-form-actions">
          <button type="button" className="console-button" onClick={onClose}>Close</button>
          <button type="submit" className="console-button is-primary" disabled={state.busy}>{state.busy ? "Saving" : "Save"}</button>
        </div>
      </form>
    </Sheet>
  );
};

const DeploymentView = ({ deploymentId, onClose, onChanged }) => {
  const api = useApi();
  const [deployment, setDeployment] = useState(null);
  const [error, setError] = useState("");
  const logRef = useRef(null);

  useEffect(() => {
    let alive = true;
    let timer;
    const load = async () => {
      try {
        const { deployment: data } = await api(`/deployments/${deploymentId}`);
        if (!alive) return;
        setDeployment(data);
        if (activeStatuses.has(data.status)) timer = window.setTimeout(load, 3000);
        else onChanged();
      } catch (loadError) {
        if (alive) setError(loadError.message);
      }
    };
    load();
    return () => { alive = false; window.clearTimeout(timer); };
  }, [api, deploymentId, onChanged]);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [deployment?.log]);

  const cancel = async () => {
    try { await api(`/deployments/${deploymentId}/cancel`, { method: "POST", body: {} }); } catch (cancelError) { setError(cancelError.message); }
  };

  return (
    <Sheet title={`Deployment ${deploymentId.slice(0, 8)}`} onClose={onClose} wide>
      {error && <FormError message={error} />}
      {!deployment ? <p className="console-empty">Loading deployment.</p> : (
        <>
          <div className="console-deploy-head">
            <span className={`console-status is-${deployment.status}`}>{statusCopy[deployment.status] || deployment.status}</span>
            {deployment.commit && <code>{deployment.commit.slice(0, 7)}</code>}
            {deployment.runUrl && <a href={deployment.runUrl} target="_blank" rel="noreferrer" className="console-link">Build run <ArrowUpRight size={12} /></a>}
            {["queued", "building"].includes(deployment.status) && <button type="button" className="console-button" onClick={cancel}>Cancel</button>}
          </div>
          {deployment.steps.length > 0 && (
            <ol className="console-steps">
              {deployment.steps.map((step) => (
                <li key={step.name} className={`is-${step.conclusion || step.status}`}><span aria-hidden="true" />{step.name}<small>{step.conclusion || step.status.replace("_", " ")}</small></li>
              ))}
            </ol>
          )}
          {deployment.error && <p className="console-form-error">{deployment.error}</p>}
          <pre ref={logRef} className="console-log" tabIndex={0} aria-label="Deployment log">{deployment.log || "Waiting for the first log line."}</pre>
        </>
      )}
    </Sheet>
  );
};

const LogsView = ({ project, onClose }) => {
  const api = useApi();
  const [state, setState] = useState({ logs: "", container: null, error: "", busy: true });
  const logRef = useRef(null);
  const load = useCallback(async () => {
    setState((current) => ({ ...current, busy: true }));
    try {
      const data = await api(`/projects/${project.id}/logs?tail=400`);
      setState({ logs: data.logs, container: data.container, error: "", busy: false });
    } catch (error) {
      setState((current) => ({ ...current, error: error.message, busy: false }));
    }
  }, [api, project.id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [state.logs]);
  return (
    <Sheet title={`${project.slug} runtime logs`} onClose={onClose} wide>
      <div className="console-deploy-head">
        {state.container ? <code>{state.container}</code> : <span className="console-muted">No running container</span>}
        <button type="button" className="console-button" onClick={load} disabled={state.busy}>{state.busy ? "Loading" : "Refresh"}</button>
      </div>
      <FormError message={state.error} />
      <pre ref={logRef} className="console-log" tabIndex={0} aria-label="Runtime log">{state.logs || "No output yet."}</pre>
    </Sheet>
  );
};

const DeleteProject = ({ project, onDeleted, onClose }) => {
  const api = useApi();
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState({ busy: false, error: "" });
  const submit = async (event) => {
    event.preventDefault();
    setState({ busy: true, error: "" });
    try {
      await api(`/projects/${project.id}`, { method: "DELETE", body: {} });
      onDeleted();
    } catch (error) {
      setState({ busy: false, error: error.message });
    }
  };
  return (
    <Sheet title={`Delete ${project.slug}`} onClose={onClose}>
      <form className="console-form" onSubmit={submit}>
        <p className="console-sheet-copy">This stops the app, removes its route, containers, images, and stored variables. The GitHub repository is not touched.</p>
        <Field label={`Type ${project.slug} to confirm`}><input value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="off" spellCheck="false" /></Field>
        <FormError message={state.error} />
        <div className="console-form-actions">
          <button type="button" className="console-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="console-button is-danger" disabled={confirm !== project.slug || state.busy}><Trash2 size={14} />{state.busy ? "Deleting" : "Delete project"}</button>
        </div>
      </form>
    </Sheet>
  );
};

const projectState = (project) => {
  const latest = project.deployments[0];
  if (latest && activeStatuses.has(latest.status)) return latest.status;
  if (project.status === "stopped") return "stopped";
  if (project.liveDeploymentId) return "live";
  return latest?.status === "failed" ? "failed" : "queued";
};

const ProjectCard = ({ project, open, run }) => {
  const [showHistory, setShowHistory] = useState(false);
  const state = projectState(project);
  const live = project.deployments.find((item) => item.id === project.liveDeploymentId);
  const busy = activeStatuses.has(state);
  return (
    <li className="console-project">
      <div className="console-project-main">
        <div className="console-project-title">
          <span className={`console-status is-${state}`}>{statusCopy[state]}</span>
          <h3>{project.slug}</h3>
          {state === "live" && <a className="console-link" href={project.url} target="_blank" rel="noreferrer">{project.url.replace("https://", "")}<ExternalLink size={12} /></a>}
        </div>
        <p className="console-project-meta">
          <span><GitBranch size={12} /> {project.repo} · {project.branch}{project.rootDir ? ` · ${project.rootDir}` : ""}</span>
          {live?.commit && <code>{live.commit.slice(0, 7)}</code>}
          {project.deployments[0] && <span>{formatAgo(project.deployments[0].createdAt)}</span>}
          <span>{project.memoryMb} MiB · {project.cpus} CPU · port {project.port}</span>
          <span>{project.autoDeploy ? "Deploys on push" : "Manual deploys"}</span>
          {project.guestEmail && <span className="console-guest-tag">Guest: {project.guestEmail}</span>}
        </p>
      </div>
      <div className="console-project-actions">
        <button type="button" className="console-button is-primary" onClick={() => run(`/projects/${project.id}/deploy`)} disabled={busy}><Play size={13} />{busy ? "Working" : "Deploy"}</button>
        {busy && project.deployments[0] && <button type="button" className="console-button" onClick={() => open({ type: "deployment", id: project.deployments[0].id })}>View progress</button>}
        {state === "stopped"
          ? <button type="button" className="console-button" onClick={() => run(`/projects/${project.id}/start`)}><Play size={13} />Start</button>
          : project.liveDeploymentId && <button type="button" className="console-button" onClick={() => run(`/projects/${project.id}/stop`)} disabled={busy}><CircleStop size={13} />Stop</button>}
        <button type="button" className="console-icon-button" onClick={() => open({ type: "logs", project })} aria-label="Runtime logs" title="Runtime logs"><ScrollText size={15} /></button>
        <button type="button" className="console-icon-button" onClick={() => setShowHistory((value) => !value)} aria-expanded={showHistory} aria-label="Deployment history" title="Deployment history"><History size={15} /></button>
        <button type="button" className="console-icon-button" onClick={() => open({ type: "settings", project })} aria-label="Settings" title="Settings"><Settings2 size={15} /></button>
        <button type="button" className="console-icon-button is-danger" onClick={() => open({ type: "delete", project })} aria-label="Delete project" title="Delete project"><Trash2 size={15} /></button>
      </div>
      {showHistory && (
        <ul className="console-history">
          {project.deployments.map((deployment) => (
            <li key={deployment.id}>
              <span className={`console-status is-${deployment.status}`}>{statusCopy[deployment.status] || deployment.status}</span>
              <button type="button" className="console-link-button" onClick={() => open({ type: "deployment", id: deployment.id })}>{deployment.id.slice(0, 8)}</button>
              <span className="console-muted">{deployment.trigger}</span>
              {deployment.commit && <code>{deployment.commit.slice(0, 7)}</code>}
              <span className="console-muted">{formatAgo(deployment.createdAt)}</span>
              {deployment.hasImage && deployment.id !== project.liveDeploymentId && !activeStatuses.has(deployment.status) && deployment.status !== "failed" && (
                <button type="button" className="console-button is-small" onClick={() => run(`/projects/${project.id}/rollback`, { deploymentId: deployment.id })} disabled={busy}><RotateCcw size={12} />Roll back</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

const ProjectsPanel = () => {
  const api = useApi();
  const mode = useMode();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    try {
      setData(await api("/projects"));
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    }
  }, [api]);

  const anyActive = data?.projects.some((project) => activeStatuses.has(project.deployments[0]?.status));
  useEffect(() => {
    load();
    const interval = window.setInterval(() => { if (document.visibilityState === "visible") load(); }, anyActive ? 4000 : 20000);
    return () => window.clearInterval(interval);
  }, [load, anyActive]);

  const run = async (path, body = {}) => {
    try {
      const result = await api(path, { method: "POST", body });
      if (result.deploymentId) setModal({ type: "deployment", id: result.deploymentId });
      load();
    } catch (runError) {
      setError(runError.message);
    }
  };

  const close = () => setModal(null);

  return (
    <section className="console-panel" aria-labelledby="projects-title">
      <div className="console-panel-heading">
        <Play size={16} />
        <div><span>{mode === "guest" ? `GUEST · UP TO ${data?.limits?.projects ?? 2} PROJECTS, ${data?.limits?.memoryMb ?? 256} MiB EACH` : "DEPLOY ENGINE · GITHUB ACTIONS BUILDS"}</span><h2 id="projects-title">{mode === "guest" ? "Your projects" : "Projects"}</h2></div>
        {data?.engine && <button type="button" className="console-button is-primary" onClick={() => setModal({ type: "new" })}><Plus size={14} />New project</button>}
      </div>
      {error && <p className="console-form-error" role="alert">{error}</p>}
      {data && !data.engine && (
        <p className="console-empty">The deploy engine is installed but locked. It starts once PLATFORM_SECRET_KEY and PLATFORM_GITHUB_TOKEN are configured on the server.</p>
      )}
      {data?.engine && !data.projects.length && (
        <div className="console-empty-state">
          <p>{mode === "guest" ? "No projects yet. Pick a public GitHub repository and it will be built in GitHub Actions, loaded onto this machine, and served at a name ending in -guest." : "No projects yet. Pick a GitHub repository and it will be built in GitHub Actions, loaded onto this machine, and served at its own subdomain."}</p>
          <button type="button" className="console-button is-primary" onClick={() => setModal({ type: "new" })}><Plus size={14} />Deploy a repository</button>
        </div>
      )}
      {data?.projects.length > 0 && (
        <ul className="console-projects">{data.projects.map((project) => <ProjectCard key={project.id} project={project} open={setModal} run={run} />)}</ul>
      )}

      {modal?.type === "new" && <NewProject appDomain={data.appDomain} onClose={close} onCreated={(id) => { load(); setModal({ type: "deployment", id }); }} />}
      {modal?.type === "deployment" && <DeploymentView deploymentId={modal.id} onClose={close} onChanged={load} />}
      {modal?.type === "logs" && <LogsView project={modal.project} onClose={close} />}
      {modal?.type === "settings" && <ProjectSettings project={modal.project} onClose={close} onSaved={load} />}
      {modal?.type === "delete" && <DeleteProject project={modal.project} onClose={close} onDeleted={() => { close(); load(); }} />}
    </section>
  );
};

const Projects = ({ base = "/api/platform", mode = "owner" }) => (
  <ApiContext.Provider value={{ base, mode }}>
    <ProjectsPanel />
  </ApiContext.Provider>
);

export default Projects;
