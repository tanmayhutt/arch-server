import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import { statfs } from "node:fs/promises";

const procRoot = process.env.PROC_ROOT || "/host/proc";
const sysRoot = process.env.SYS_ROOT || "/host/sys";
const storageRoot = process.env.STORAGE_ROOT || "/host/storage";
const port = Number(process.env.PORT || 3000);

let previousCpu = null;

const readText = async (path) => (await readFile(path, "utf8")).trim();

const cpuSnapshot = async () => {
  const line = (await readText(`${procRoot}/stat`)).split("\n")[0].trim().split(/\s+/).slice(1).map(Number);
  const idle = line[3] + (line[4] || 0);
  return { idle, total: line.reduce((sum, value) => sum + value, 0) };
};

const cpuPercent = async () => {
  const current = await cpuSnapshot();
  if (!previousCpu) {
    previousCpu = current;
    await new Promise((resolve) => setTimeout(resolve, 120));
    return cpuPercent();
  }
  const totalDelta = current.total - previousCpu.total;
  const idleDelta = current.idle - previousCpu.idle;
  previousCpu = current;
  return totalDelta > 0 ? Math.round((1 - idleDelta / totalDelta) * 100) : null;
};

const memoryPercent = async () => {
  const entries = Object.fromEntries((await readText(`${procRoot}/meminfo`)).split("\n").map((line) => {
    const [key, value] = line.split(":");
    return [key, Number.parseInt(value, 10)];
  }));
  return Math.round(((entries.MemTotal - entries.MemAvailable) / entries.MemTotal) * 100);
};

const diskPercent = async () => {
  const disk = await statfs(storageRoot);
  return Math.round((1 - Number(disk.bavail) / Number(disk.blocks)) * 100);
};

const temperature = async () => {
  try {
    const zones = await readdir(`${sysRoot}/class/thermal`, { withFileTypes: true });
    const values = await Promise.all(zones.filter((entry) => entry.isDirectory() && entry.name.startsWith("thermal_zone")).map(async (entry) => {
      try { return Number(await readText(`${sysRoot}/class/thermal/${entry.name}/temp`)) / 1000; } catch { return null; }
    }));
    const plausible = values.filter((value) => value >= 10 && value <= 110);
    return plausible.length ? Math.round(Math.max(...plausible)) : null;
  } catch { return null; }
};

const battery = async () => {
  try {
    const supplies = await readdir(`${sysRoot}/class/power_supply`, { withFileTypes: true });
    const entry = supplies.find((item) => item.isDirectory() && item.name.startsWith("BAT"));
    if (!entry) return { percent: null, state: null };
    const base = `${sysRoot}/class/power_supply/${entry.name}`;
    return { percent: Number(await readText(`${base}/capacity`)), state: await readText(`${base}/status`) };
  } catch { return { percent: null, state: null }; }
};

const collect = async () => {
  const [cpu, memory, disk, uptimeText, temp, batteryState] = await Promise.all([
    cpuPercent(), memoryPercent(), diskPercent(), readText(`${procRoot}/uptime`), temperature(), battery(),
  ]);
  return {
    status: "ok",
    collectedAt: new Date().toISOString(),
    metrics: {
      cpuPercent: cpu,
      memoryPercent: memory,
      diskPercent: disk,
      uptimeSeconds: Math.floor(Number.parseFloat(uptimeText)),
      temperatureC: temp,
      batteryPercent: batteryState.percent,
      batteryState: batteryState.state,
    },
    services: { website: "online", telemetry: "online" },
    deployment: process.env.DEPLOY_COMMIT?.slice(0, 7) || null,
  };
};

createServer(async (request, response) => {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (request.method !== "GET" || request.url?.split("?")[0] !== "/status") {
    response.writeHead(404).end(JSON.stringify({ status: "not_found" }));
    return;
  }
  try {
    response.writeHead(200).end(JSON.stringify(await collect()));
  } catch {
    response.writeHead(503).end(JSON.stringify({ status: "unavailable" }));
  }
}).listen(port, "0.0.0.0");
