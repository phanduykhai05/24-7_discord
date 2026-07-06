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
 * When the selfbot is ready and connected to Discord,
 * this function is executed.
 */
client.on("ready", async () => {
  console.log(`✅ ${client.user.username} is ready!`);
  try {
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
    console.log("✅ Rich Presence is now active!");
  } catch (err) {
    console.error("❌ Failed to set presence:", err.message);
  }
});

/**
 * Login using user token.
 */
client
  .login(process.env.TOKEN)
  .catch(() =>
    console.error("❌ Invalid or missing token. Check your .env file.")
  );
