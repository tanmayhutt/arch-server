import { createRemoteJWKSet, jwtVerify } from "jose";

// Every console request must carry a Cloudflare Access token for the owner.
// Missing configuration fails closed instead of exposing the API.
const teamDomain = process.env.CF_ACCESS_TEAM_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "") || "";
const audience = process.env.CF_ACCESS_AUD || "";
const ownerEmail = process.env.PLATFORM_OWNER_EMAIL?.toLowerCase() || "";
const devInsecure = process.env.PLATFORM_AUTH_MODE === "dev-insecure";

const jwks = teamDomain ? createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`)) : null;

export const authMode = devInsecure ? "dev-insecure" : jwks && audience && ownerEmail ? "cloudflare-access" : "unconfigured";

export const assertSafeAuthMode = (listenHost) => {
  if (devInsecure && listenHost !== "127.0.0.1") {
    throw new Error("PLATFORM_AUTH_MODE=dev-insecure is only allowed when HOST=127.0.0.1");
  }
};

export const authenticate = async (request) => {
  if (authMode === "dev-insecure") return { ok: true, email: "local-development" };
  if (authMode === "unconfigured") return { ok: false, status: 503, code: "access_not_configured" };

  const token = request.headers["cf-access-jwt-assertion"];
  if (typeof token !== "string" || !token) return { ok: false, status: 401, code: "access_required" };

  try {
    const { payload } = await jwtVerify(token, jwks, { issuer: `https://${teamDomain}`, audience });
    const email = typeof payload.email === "string" ? payload.email.toLowerCase() : "";
    if (email !== ownerEmail) return { ok: false, status: 403, code: "not_owner" };
    return { ok: true, email };
  } catch {
    return { ok: false, status: 401, code: "access_invalid" };
  }
};
