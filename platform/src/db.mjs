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

// Additive migrations for databases created by earlier versions.
const addColumn = (table, column, definition) => {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name);
  if (!columns.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
};
addColumn("projects", "build_env_enc", "TEXT");
addColumn("projects", "auto_deploy", "INTEGER NOT NULL DEFAULT 1");
addColumn("projects", "last_seen_sha", "TEXT");
addColumn("deployments", "ref", "TEXT");
addColumn("projects", "guest_id", "TEXT");
addColumn("projects", "source_type", "TEXT NOT NULL DEFAULT 'github'");
addColumn("projects", "upload_ref", "TEXT");
addColumn("projects", "trusted", "INTEGER NOT NULL DEFAULT 0");
addColumn("deployments", "port", "INTEGER");
addColumn("deployments", "scan", "TEXT");

db.exec(`
  CREATE TABLE IF NOT EXISTS access_requests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    repo TEXT,
    message TEXT,
    source_hash TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    decided_at TEXT
  );
  CREATE TABLE IF NOT EXISTS guests (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    status TEXT NOT NULL,
    invite_hash TEXT,
    invite_expires_at TEXT,
    invite_attempts INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    activated_at TEXT
  );
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

// Build variables travel to the builder encrypted with a separate key and bound to one
// deployment id, so a captured ciphertext cannot be replayed into another build.
export const encryptForBuild = (env, deploymentId) => {
  if (!config.buildKey) throw new Error("PLATFORM_BUILD_KEY is not configured");
  const transitKey = createHash("sha256").update(config.buildKey).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", transitKey, iv);
  cipher.setAAD(Buffer.from(deploymentId));
  const data = Buffer.concat([cipher.update(JSON.stringify(env), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((part) => part.toString("base64")).join(".");
};

const projectColumns = ["guest_id", "source_type", "upload_ref", "trusted", "slug", "repo", "branch", "root_dir", "port", "memory_mb", "cpus", "env_enc", "build_env_enc", "auto_deploy", "last_seen_sha", "status", "live_deployment_id"];
const deploymentColumns = ["port", "scan", "status", "source_deployment_id", "run_id", "run_url", "steps", "commit_sha", "ref", "image", "container_name", "error", "finished_at"];

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
    db.prepare(`INSERT INTO projects (id, guest_id, source_type, upload_ref, slug, repo, branch, root_dir, port, memory_mb, cpus, env_enc, build_env_enc, auto_deploy, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`)
      .run(project.id, project.guest_id ?? null, project.source_type || "github", project.upload_ref ?? null, project.slug, project.repo, project.branch, project.root_dir, project.port, project.memory_mb, project.cpus, project.env_enc, project.build_env_enc, project.auto_deploy, stamp, stamp);
  },
  update: updater("projects", projectColumns),
  remove: (id) => db.prepare("DELETE FROM projects WHERE id = ?").run(id),
  forGuest: (guestId) => db.prepare("SELECT * FROM projects WHERE guest_id = ? ORDER BY created_at").all(guestId),
};

export const deployments = {
  get: (id) => db.prepare("SELECT * FROM deployments WHERE id = ?").get(id),
  forProject: (projectId, limit = 15) => db.prepare("SELECT * FROM deployments WHERE project_id = ? ORDER BY created_at DESC LIMIT ?").all(projectId, limit),
  withImages: (projectId) => db.prepare("SELECT * FROM deployments WHERE project_id = ? AND image IS NOT NULL ORDER BY created_at DESC").all(projectId),
  active: () => db.prepare("SELECT * FROM deployments WHERE status IN ('queued', 'building', 'deploying')").all(),
  queuedPush: (projectId) => db.prepare("SELECT * FROM deployments WHERE project_id = ? AND status IN ('queued', 'awaiting_approval') AND trigger = 'push'").all(projectId),
  awaiting: () => db.prepare("SELECT * FROM deployments WHERE status = 'awaiting_approval' ORDER BY created_at").all(),
  insert: (deployment) => {
    db.prepare("INSERT INTO deployments (id, project_id, trigger, status, source_deployment_id, image, commit_sha, port, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(deployment.id, deployment.project_id, deployment.trigger, deployment.status || "queued", deployment.source_deployment_id ?? null, deployment.image ?? null, deployment.commit_sha ?? null, deployment.port ?? null, now());
  },
  update: updater("deployments", deploymentColumns),
  appendLog: (id, line) => {
    db.prepare("UPDATE deployments SET log = substr(log || ?, -65536) WHERE id = ?").run(`${new Date().toISOString().slice(11, 19)}  ${line}\n`, id);
  },
};

export const accessRequests = {
  all: () => db.prepare("SELECT * FROM access_requests ORDER BY created_at DESC LIMIT 200").all(),
  get: (id) => db.prepare("SELECT * FROM access_requests WHERE id = ?").get(id),
  pendingCount: () => db.prepare("SELECT COUNT(*) AS n FROM access_requests WHERE status = 'pending'").get().n,
  pendingForEmail: (email) => db.prepare("SELECT * FROM access_requests WHERE email = ? AND status = 'pending'").get(email),
  insert: (request) => db.prepare("INSERT INTO access_requests (id, name, email, repo, message, source_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(request.id, request.name, request.email, request.repo, request.message, request.source_hash, now()),
  decide: (id, status) => db.prepare("UPDATE access_requests SET status = ?, decided_at = ? WHERE id = ?").run(status, now(), id),
  // Decided requests are kept for 30 days, then removed; approved people live on in guests.
  purge: () => db.prepare("DELETE FROM access_requests WHERE status != 'pending' AND decided_at < ?").run(new Date(Date.now() - 30 * 86400000).toISOString()),
};

export const guests = {
  all: () => db.prepare("SELECT * FROM guests ORDER BY created_at DESC").all(),
  get: (id) => db.prepare("SELECT * FROM guests WHERE id = ?").get(id),
  byEmail: (email) => db.prepare("SELECT * FROM guests WHERE email = ?").get(email),
  upsertInvite: (guest) => db.prepare(`INSERT INTO guests (id, email, name, status, invite_hash, invite_expires_at, invite_attempts, created_at)
      VALUES (?, ?, ?, 'invited', ?, ?, 0, ?)
      ON CONFLICT(email) DO UPDATE SET name = excluded.name, status = 'invited', invite_hash = excluded.invite_hash,
        invite_expires_at = excluded.invite_expires_at, invite_attempts = 0`)
    .run(guest.id, guest.email, guest.name, guest.invite_hash, guest.invite_expires_at, now()),
  failedAttempt: (id) => db.prepare("UPDATE guests SET invite_attempts = invite_attempts + 1 WHERE id = ?").run(id),
  activate: (id) => db.prepare("UPDATE guests SET status = 'active', invite_hash = NULL, invite_expires_at = NULL, invite_attempts = 0, activated_at = ? WHERE id = ?").run(now(), id),
  revoke: (id) => db.prepare("UPDATE guests SET status = 'revoked', invite_hash = NULL, invite_expires_at = NULL WHERE id = ?").run(id),
};
