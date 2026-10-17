import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { config } from "./config.mjs";
import { accessRequests, deployments, guests, newId, now, projects } from "./db.mjs";
import { InputError, deleteProject, stopProject } from "./engine.mjs";
import { inventory } from "./inventory.mjs";

const INVITE_DAYS = 7;
const MAX_ATTEMPTS = 5;
const MAX_PENDING = 50;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;
const REPO = /^[A-Za-z0-9_.-]{1,100}\/[A-Za-z0-9_.-]{1,100}$/;

const keyed = (purpose, value) => createHmac("sha256", config.secretKey).update(`${purpose}:${value}`).digest();
const text = (value, max) => String(value ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max);

// ---------- public access requests ----------

// In-memory limiter keyed by a hash of the Cloudflare-reported client address. The origin is
// reachable only through the tunnel, so CF-Connecting-IP is set by Cloudflare, not the client.
const recent = new Map();
const allow = (source, limit, windowMs) => {
  const cutoff = Date.now() - windowMs;
  const hits = (recent.get(source) || []).filter((time) => time > cutoff);
  if (hits.length >= limit) return false;
  hits.push(Date.now());
  recent.set(source, hits);
  return true;
};

export const createAccessRequest = (input, clientAddress) => {
  // Honeypot field: humans never see or fill it.
  if (input.website) return { received: true };
  const source = keyed("source", clientAddress || "unknown").toString("hex").slice(0, 32);
  if (!allow(source, 3, 60 * 60 * 1000)) throw new InputError("Too many requests from this network. Try again later.");
  if (accessRequests.pendingCount() >= MAX_PENDING) throw new InputError("The request queue is full. Try again later.");

  const name = text(input.name, 80);
  const email = text(input.email, 254).toLowerCase();
  const repo = text(input.repo, 201);
  const message = text(input.message, 1000);
  if (name.length < 2) throw new InputError("Please enter your name");
  if (!EMAIL.test(email)) throw new InputError("Please enter a valid email address");
  if (repo && !REPO.test(repo)) throw new InputError("Repository must look like owner/name");
  if (accessRequests.pendingForEmail(email)) return { received: true };
  if (guests.byEmail(email)?.status === "active") return { received: true };

  accessRequests.insert({ id: newId(), name, email, repo: repo || null, message: message || null, source_hash: source });
  return { received: true };
};

// ---------- owner decisions ----------

const publicRequest = (request) => ({
  id: request.id, name: request.name, email: request.email, repo: request.repo, message: request.message,
  status: request.status, createdAt: request.created_at, decidedAt: request.decided_at,
});

const publicGuest = (guest) => ({
  id: guest.id, email: guest.email, name: guest.name, status: guest.status,
  inviteExpiresAt: guest.invite_expires_at, createdAt: guest.created_at, activatedAt: guest.activated_at,
  projects: projects.forGuest(guest.id).map((project) => ({ id: project.id, slug: project.slug, status: project.status })),
});

export const listAccess = () => {
  accessRequests.purge();
  return { requests: accessRequests.all().map(publicRequest), guests: guests.all().map(publicGuest) };
};

// 16 characters from an unambiguous alphabet (about 80 bits), shown to the owner exactly once.
const newInviteCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const raw = Array.from({ length: 16 }, () => alphabet[randomInt(alphabet.length)]).join("");
  return raw.match(/.{4}/g).join("-");
};

const issueInvite = (email, name) => {
  const code = newInviteCode();
  guests.upsertInvite({
    id: guests.byEmail(email)?.id || newId(),
    email,
    name,
    invite_hash: keyed(`invite:${email}`, code).toString("hex"),
    invite_expires_at: new Date(Date.now() + INVITE_DAYS * 86400000).toISOString(),
  });
  return { code, expiresAt: guests.byEmail(email).invite_expires_at };
};

export const approveRequest = (id) => {
  const request = accessRequests.get(id);
  if (!request || request.status !== "pending") throw new InputError("Request not found or already decided");
  const invite = issueInvite(request.email, request.name);
  accessRequests.decide(id, "approved");
  return { email: request.email, ...invite };
};

export const rejectRequest = (id) => {
  const request = accessRequests.get(id);
  if (!request || request.status !== "pending") throw new InputError("Request not found or already decided");
  accessRequests.decide(id, "rejected");
};

export const reissueInvite = (guestId) => {
  const guest = guests.get(guestId);
  if (!guest) throw new InputError("Guest not found");
  return { email: guest.email, ...issueInvite(guest.email, guest.name) };
};

// Revoking takes the guest's apps offline immediately; deleting also removes them.
export const revokeGuest = async (guestId, { deleteApps = false } = {}) => {
  const guest = guests.get(guestId);
  if (!guest) throw new InputError("Guest not found");
  guests.revoke(guestId);
  for (const project of projects.forGuest(guestId)) {
    if (deleteApps) await deleteProject(project.id);
    else if (project.status === "active") await stopProject(project.id);
  }
};

// ---------- guest sign-in ----------

export const guestSession = (email) => {
  const guest = guests.byEmail(email);
  if (!guest || guest.status === "revoked") return { state: "not_approved", email };
  if (guest.status === "invited") {
    const expired = !guest.invite_expires_at || new Date(guest.invite_expires_at) < new Date() || guest.invite_attempts >= MAX_ATTEMPTS;
    return { state: expired ? "invite_expired" : "needs_code", email };
  }
  return { state: "active", email, guest };
};

export const redeemInvite = (email, code) => {
  const guest = guests.byEmail(email);
  const session = guestSession(email);
  if (session.state !== "needs_code") throw new InputError(session.state === "active" ? "Already activated" : "No valid invite for this email");
  const supplied = keyed(`invite:${email}`, text(code, 40).toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/(.{4})(?=.)/g, "$1-"));
  const expected = Buffer.from(guest.invite_hash, "hex");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    guests.failedAttempt(guest.id);
    const left = MAX_ATTEMPTS - guest.invite_attempts - 1;
    throw new InputError(left > 0 ? `That code is not valid. ${left} attempt(s) left.` : "Too many wrong codes. Ask the owner for a new invite.");
  }
  guests.activate(guest.id);
  return { state: "active" };
};

// ---------- public overview ----------

// Only what the public site already discloses: public apps and coarse counts. No container
// names of private tools, paths, ports, mounts, hostnames, or the SSH route.
let overviewCache = null;
export const publicOverview = async () => {
  if (overviewCache && Date.now() - overviewCache.at < 15000) return overviewCache.data;
  const data = await inventory();
  const services = data.projects.flatMap((project) => project.services);
  const apps = projects.all()
    .filter((project) => project.status === "active" && project.live_deployment_id)
    .map((project) => {
      const live = deployments.get(project.live_deployment_id);
      return {
        name: project.slug,
        url: `https://${project.slug}.${config.appDomain}`,
        kind: project.guest_id ? "guest" : "owner",
        repo: project.guest_id ? null : project.repo,
        commit: live?.commit_sha?.slice(0, 7) || null,
        liveSince: live?.finished_at || null,
      };
    });
  const sites = data.routes.public
    .filter((route) => route.targetKind === "container" && route.protocol.startsWith("http") && !route.hostname.includes("*"))
    .map((route) => ({ name: route.hostname, url: `https://${route.hostname}` }));
  const running = services.filter((service) => service.state === "running").length;
  const appContainers = services.filter((service) => service.project === "deployed-apps").length;
  const result = {
    collectedAt: now(),
    host: { os: data.host.os, cpus: data.host.cpus, memoryGiB: Math.round(data.host.memoryBytes / 1024 ** 3 * 10) / 10 },
    apps,
    sites,
    counts: { running, apps: appContainers, platformAndPrivate: Math.max(0, running - appContainers) },
  };
  overviewCache = { at: Date.now(), data: result };
  return result;
};
