import { createRemoteJWKSet, jwtVerify } from "jose";

// Every console request must carry a Cloudflare Access token for the owner. Guest routes use a
// separate Access application with its own audience, so a guest token can never satisfy an owner
// route. Missing configuration fails closed instead of exposing the API.
const teamDomain = process.env.CF_ACCESS_TEAM_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "") || "";
const ownerAudience = process.env.CF_ACCESS_AUD || "";
const guestAudience = process.env.CF_ACCESS_GUEST_AUD || "";
const ownerEmail = process.env.PLATFORM_OWNER_EMAIL?.toLowerCase() || "";
const devInsecure = process.env.PLATFORM_AUTH_MODE === "dev-insecure";

const jwks = teamDomain ? createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`)) : null;

export const authMode = devInsecure ? "dev-insecure" : jwks && ownerAudience && ownerEmail ? "cloudflare-access" : "unconfigured";
export const guestsEnabled = devInsecure || Boolean(jwks && guestAudience);

export const assertSafeAuthMode = (listenHost) => {
  if (devInsecure && listenHost !== "127.0.0.1") {
    throw new Error("PLATFORM_AUTH_MODE=dev-insecure is only allowed when HOST=127.0.0.1");
  }
};

const verifiedEmail = async (request, audience) => {
  const token = request.headers["cf-access-jwt-assertion"];
  if (typeof token !== "string" || !token) return { ok: false, status: 401, code: "access_required" };
  try {
    const { payload } = await jwtVerify(token, jwks, { issuer: `https://${teamDomain}`, audience });
    const email = typeof payload.email === "string" ? payload.email.toLowerCase() : "";
    if (!email) return { ok: false, status: 401, code: "access_invalid" };
    return { ok: true, email };
  } catch {
    return { ok: false, status: 401, code: "access_invalid" };
  }
};

export const authenticate = async (request) => {
  if (authMode === "dev-insecure") return { ok: true, email: "local-development" };
  if (authMode === "unconfigured") return { ok: false, status: 503, code: "access_not_configured" };
  const result = await verifiedEmail(request, ownerAudience);
  if (!result.ok) return result;
  return result.email === ownerEmail ? result : { ok: false, status: 403, code: "not_owner" };
};

// Proves who the guest is. Whether that email may do anything is decided by the guest records.
export const authenticateGuest = async (request) => {
  if (devInsecure) {
    const email = String(request.headers["x-dev-guest-email"] || "").toLowerCase();
    return email ? { ok: true, email } : { ok: false, status: 401, code: "access_required" };
  }
  if (!guestsEnabled) return { ok: false, status: 503, code: "guests_not_configured" };
  return verifiedEmail(request, guestAudience);
};
