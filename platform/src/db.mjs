import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { config } from "./config.mjs";

mkdirSync(config.dataDir, { recursive: true });
const db = new DatabaseSync(`${config.dataDir}/platform.db`);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    repo TEXT NOT NULL,
    branch TEXT NOT NULL,
    root_dir TEXT NOT NULL DEFAULT '',
    port INTEGER NOT NULL,
    memory_mb INTEGER NOT NULL,
    cpus REAL NOT NULL,
    env_enc TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    live_deployment_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS deployments (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    trigger TEXT NOT NULL,
    status TEXT NOT NULL,
    source_deployment_id TEXT,
    run_id INTEGER,
    run_url TEXT,
    steps TEXT,
    commit_sha TEXT,
    image TEXT,
    container_name TEXT,
    error TEXT,
    log TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    finished_at TEXT
  );
  CREATE INDEX IF NOT EXISTS deployments_project ON deployments(project_id, created_at DESC);
`);

export const now = () => new Date().toISOString();
export const newId = () => randomBytes(8).toString("hex");

// Environment variables are encrypted at rest with AES-256-GCM.
const key = config.secretKey ? createHash("sha256").update(config.secretKey).digest() : null;

export const encryptEnv = (env) => {
  if (!key) throw new Error("PLATFORM_SECRET_KEY is not configured");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(env), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((part) => part.toString("base64")).join(".");
};

export const decryptEnv = (value) => {
  if (!value) return {};
  if (!key) throw new Error("PLATFORM_SECRET_KEY is not configured");
  const [iv, tag, data] = value.split(".").map((part) => Buffer.from(part, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return JSON.parse(Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8"));
};

const projectColumns = ["slug", "repo", "branch", "root_dir", "port", "memory_mb", "cpus", "env_enc", "status", "live_deployment_id"];
const deploymentColumns = ["status", "source_deployment_id", "run_id", "run_url", "steps", "commit_sha", "image", "container_name", "error", "finished_at"];

const updater = (table, allowed) => (id, fields) => {
  const keys = Object.keys(fields).filter((field) => allowed.includes(field));
  if (!keys.length) return;
  const extra = table === "projects" ? ", updated_at = ?" : "";
  const values = keys.map((field) => fields[field] ?? null);
  if (table === "projects") values.push(now());
  db.prepare(`UPDATE ${table} SET ${keys.map((field) => `${field} = ?`).join(", ")}${extra} WHERE id = ?`).run(...values, id);
};

export const projects = {
  all: () => db.prepare("SELECT * FROM projects ORDER BY created_at").all(),
  get: (id) => db.prepare("SELECT * FROM projects WHERE id = ?").get(id),
  bySlug: (slug) => db.prepare("SELECT * FROM projects WHERE slug = ?").get(slug),
  insert: (project) => {
    const stamp = now();
    db.prepare(`INSERT INTO projects (id, slug, repo, branch, root_dir, port, memory_mb, cpus, env_enc, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`)
      .run(project.id, project.slug, project.repo, project.branch, project.root_dir, project.port, project.memory_mb, project.cpus, project.env_enc, stamp, stamp);
  },
  update: updater("projects", projectColumns),
  remove: (id) => db.prepare("DELETE FROM projects WHERE id = ?").run(id),
};

export const deployments = {
  get: (id) => db.prepare("SELECT * FROM deployments WHERE id = ?").get(id),
  forProject: (projectId, limit = 15) => db.prepare("SELECT * FROM deployments WHERE project_id = ? ORDER BY created_at DESC LIMIT ?").all(projectId, limit),
  withImages: (projectId) => db.prepare("SELECT * FROM deployments WHERE project_id = ? AND image IS NOT NULL ORDER BY created_at DESC").all(projectId),
  active: () => db.prepare("SELECT * FROM deployments WHERE status IN ('queued', 'building', 'deploying')").all(),
  insert: (deployment) => {
    db.prepare("INSERT INTO deployments (id, project_id, trigger, status, source_deployment_id, image, commit_sha, created_at) VALUES (?, ?, ?, 'queued', ?, ?, ?, ?)")
      .run(deployment.id, deployment.project_id, deployment.trigger, deployment.source_deployment_id ?? null, deployment.image ?? null, deployment.commit_sha ?? null, now());
  },
  update: updater("deployments", deploymentColumns),
  appendLog: (id, line) => {
    db.prepare("UPDATE deployments SET log = substr(log || ?, -65536) WHERE id = ?").run(`${new Date().toISOString().slice(11, 19)}  ${line}\n`, id);
  },
};
