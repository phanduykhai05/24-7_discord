const {
  Client,
  CustomStatus,
  RichPresence,
} = require("discord.js-selfbot-v13");
const fs = require("fs");
const yaml = require("js-yaml");
const dotenv = require("dotenv");
const config = yaml.load(fs.readFileSync("./config.yml", "utf8"));

dotenv.config();
const client = new Client();

/**
 * Create custom status
 */
const customStatus = new CustomStatus(client, {
  state: config.custom_status || "🔥 Watching tutorials",
  emoji: config.custom_emoji ? { name: config.custom_emoji } : undefined,
});

const isUrl = (value) => typeof value === "string" && /^https?:\/\//i.test(value);

/**
 * Resolve an image config value into a valid Rich Presence asset key.
 * - If it's a URL, convert it through Discord's external proxy (getExternal).
 * - Otherwise use it as-is (an Art Asset name uploaded to the Developer Portal).
 */
const resolveImage = async (value) => {
  if (!isUrl(value)) return value || null;
  const [external] = await RichPresence.getExternal(
    client,
    config.application_id,
    value
  );
  return external.external_asset_path;
};

/**
 * Build and apply the presence. Called on every `ready` (including
 * reconnects) and again periodically so a silent gateway drop can't leave
 * the presence stuck offline while the job keeps running.
 */
const applyPresence = async () => {
  const [largeImage, smallImage] = await Promise.all([
    resolveImage(config.largeImageKey),
    resolveImage(config.smallImageKey),
  ]);

  const rich = new RichPresence(client)
    .setApplicationId(config.application_id)
    .setType(config.type || 0) // 0 = Playing, 1 = Streaming, 2 = Listening, 3 = Watching
    .setName(config.name || "My Cool Presence")
    .setDetails(config.details || "No details set")
    .setState(config.state || "Available")
    .setAssetsLargeImage(largeImage)
    .setAssetsLargeText(config.largeImageText || "")
    .setAssetsSmallImage(smallImage)
    .setAssetsSmallText(config.smallImageText || "")
    .setURL(config.url || null)
    .setStartTimestamp(new Date());

  // Add buttons only if defined
  if (config.buttons && Array.isArray(config.buttons)) {
    rich.setButtons(config.buttons);
  }

  client.user.setPresence({
    activities: [customStatus.toJSON(), rich.toJSON()],
    status: "online", // online, idle, dnd, invisible
  });
};

/**
 * When the selfbot is ready and connected to Discord,
 * this function is executed. Fires again after every reconnect.
 */
client.on("ready", async () => {
  console.log(`✅ ${client.user.username} is ready!`);
  try {
    await applyPresence();
    console.log("✅ Rich Presence is now active!");
  } catch (err) {
    console.error("❌ Failed to set presence:", err.message);
  }
});

/**
 * Resilience: log gateway lifecycle so early stops are diagnosable, and
 * keep the process alive. discord.js-selfbot auto-reconnects on disconnect,
 * which re-fires `ready` and re-applies the presence above.
 */
client.on("shardDisconnect", (event) =>
  console.warn(`⚠️ Disconnected (code ${event && event.code}) — reconnecting…`)
);
client.on("shardReconnecting", () => console.warn("🔄 Reconnecting…"));
client.on("shardResume", () => console.log("✅ Session resumed."));
client.on("error", (err) => console.error("❌ Client error:", err.message));

// Periodically re-apply presence to survive silent drops (every 5 minutes).
const REFRESH_MS = 5 * 60 * 1000;
setInterval(async () => {
  if (!client.user) return;
  try {
    await applyPresence();
    console.log(`♻️ Presence refreshed at ${new Date().toISOString()}`);
  } catch (err) {
    console.error("❌ Refresh failed:", err.message);
  }
}, REFRESH_MS);

// Never let an unhandled error kill the process silently.
process.on("unhandledRejection", (reason) =>
  console.error("❌ Unhandled rejection:", reason && reason.message ? reason.message : reason)
);
process.on("uncaughtException", (err) =>
  console.error("❌ Uncaught exception:", err.message)
);

/**
 * Login using user token. Retry on failure instead of exiting.
 */
const login = () =>
  client.login(process.env.TOKEN).catch((err) => {
    console.error("❌ Login failed:", err && err.message ? err.message : err);
    console.error("   Retrying in 30s…");
    setTimeout(login, 30 * 1000);
  });

login();
