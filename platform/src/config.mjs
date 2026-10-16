// Runtime configuration. Everything sensitive arrives through the server's private .env.
const list = (value) => (value || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);

export const config = {
  appDomain: process.env.APP_DOMAIN || "tanmaytiwari.me",
  consoleOrigin: process.env.PLATFORM_ORIGIN || "https://arch-server.tanmaytiwari.me",
  dataDir: process.env.PLATFORM_DATA_DIR || "/data",
  secretKey: process.env.PLATFORM_SECRET_KEY || "",
  // Shared only with the private builder repository, to encrypt build variables in transit.
  buildKey: process.env.PLATFORM_BUILD_KEY || "",
  // How often each auto-deploy project's branch is checked for new commits.
  pollIntervalMs: Number(process.env.PLATFORM_POLL_SECONDS || 45) * 1000,
  github: {
    token: process.env.PLATFORM_GITHUB_TOKEN || "",
    builderRepo: process.env.PLATFORM_BUILDER_REPO || "tanmayhutt/arch-builder",
    builderWorkflow: process.env.PLATFORM_BUILDER_WORKFLOW || "build-app.yml",
    builderRef: process.env.PLATFORM_BUILDER_REF || "main",
    owner: process.env.PLATFORM_GITHUB_OWNER || "tanmayhutt",
  },
  router: {
    // The admin API is bound to this fixed address on the internal router-admin network only.
    adminUrl: process.env.ROUTER_ADMIN_URL || "http://10.217.83.2:2019",
    listen: ":8080",
  },
  appsNetwork: process.env.APPS_NETWORK || "arch-apps",
  // App containers resolve through public DNS; the host firewall blocks LAN resolvers.
  appDns: ["1.1.1.1", "1.0.0.1"],
  // Total memory all deployed apps may reserve, leaving room for the host and existing stacks.
  memoryBudgetMb: Number(process.env.APPS_MEMORY_BUDGET_MB || 3072),
  // Existing hostnames and names that must never become app subdomains.
  reservedSlugs: new Set(["arch-server", "ssh", "www", "mail", "api", "console", "admin", "deploy", ...list(process.env.RESERVED_SLUGS)]),
};

export const engineReady = () => Boolean(config.secretKey && config.github.token);
