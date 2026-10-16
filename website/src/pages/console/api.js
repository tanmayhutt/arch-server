export class ApiError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
  }
}

// Cloudflare Access answers an expired session with a redirect to its login page.
// Manual redirect handling surfaces that as a sign-in prompt instead of a network error.
export const api = async (path, { method = "GET", body } = {}) => {
  let response;
  try {
    response = await fetch(`/api/platform${path}`, {
      method,
      cache: "no-store",
      credentials: "same-origin",
      redirect: "manual",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("network");
  }
  if (response.type === "opaqueredirect") throw new ApiError("access_required");
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.status !== "ok") throw new ApiError(data.status || "network", data.message);
  return data;
};

export const formatAgo = (iso) => {
  if (!iso) return "";
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export const activeStatuses = new Set(["queued", "building", "deploying"]);
