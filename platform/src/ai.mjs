import { DockerError, docker } from "./docker.mjs";

// On/off switch for the private chat interface. The console may start and stop only containers
// labelled arch.platform.toggle=ai, and the chat page turns itself off after 30 idle minutes.
const WEBUI = "ai-webui";
const OLLAMA = "ai-ollama";
const IDLE_MS = 30 * 60 * 1000;
// Ollama holds the model in memory for two minutes after each message; above this it is in use.
const MODEL_LOADED_BYTES = 400 * 1024 * 1024;

let lastActiveAt = 0;

const toggleable = async (name) => {
  try {
    const detail = await docker.inspect(name);
    return detail.Config?.Labels?.["arch.platform.toggle"] === "ai" ? detail : null;
  } catch (error) {
    if (error instanceof DockerError && error.status === 404) return null;
    throw error;
  }
};

const memoryOf = async (name) => {
  try {
    const stats = await docker.stats(name);
    const usage = stats.memory_stats?.usage ?? 0;
    return Math.max(0, usage - (stats.memory_stats?.stats?.inactive_file ?? 0));
  } catch {
    return 0;
  }
};

export const aiStatus = async () => {
  const webui = await toggleable(WEBUI);
  if (!webui) return { available: false };
  const running = Boolean(webui.State?.Running);
  const chatUrl = (webui.Config?.Env || []).find((entry) => entry.startsWith("WEBUI_URL="))?.slice(10) || null;
  if (!running) return { available: true, running: false, chatUrl };
  const [webuiMemory, modelMemory] = await Promise.all([memoryOf(WEBUI), memoryOf(OLLAMA)]);
  const modelLoaded = modelMemory > MODEL_LOADED_BYTES;
  if (modelLoaded) lastActiveAt = Date.now();
  const startedAt = new Date(webui.State.StartedAt).getTime();
  const activeAt = Math.max(lastActiveAt, startedAt);
  return {
    available: true,
    running: true,
    chatUrl,
    startedAt: webui.State.StartedAt,
    modelLoaded,
    memoryBytes: webuiMemory + modelMemory,
    autoOffAt: new Date(activeAt + IDLE_MS).toISOString(),
  };
};

export const startAi = async () => {
  if (!(await toggleable(WEBUI))) throw new Error("The private AI stack is not installed");
  await docker.start(WEBUI).catch((error) => { if (!(error instanceof DockerError && error.status === 304)) throw error; });
  lastActiveAt = Date.now();
};

export const stopAi = async () => {
  if (!(await toggleable(WEBUI))) throw new Error("The private AI stack is not installed");
  await docker.stop(WEBUI, 15).catch((error) => { if (!(error instanceof DockerError && error.status === 304)) throw error; });
};

export const startAiIdleWatch = () => {
  setInterval(async () => {
    try {
      const status = await aiStatus();
      if (status.running && Date.now() > new Date(status.autoOffAt).getTime()) {
        await stopAi();
        console.log("private AI chat turned off after 30 idle minutes");
      }
    } catch { /* the AI stack is optional */ }
  }, 60 * 1000);
};
