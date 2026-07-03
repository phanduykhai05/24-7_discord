const { RichPresence } = require("discord.js-selfbot-v13");

const activity = new RichPresence(client)
  .setName("Custom Game")
  .setDetails("Working on a cool project")
  .setState("In development")
  .setApplicationId("123456789012345678") // Fake app ID
  .setAssetsLargeImage("mp:external/xyz123") // Replace with your actual image asset or use `mp:` for external
  .setAssetsLargeText("Main Menu")
  .setAssetsSmallImage("mp:external/abc456")
  .setAssetsSmallText("Active")
  .setStartTimestamp(Date.now())
  .setButtons(
    { name: "Visit Site", url: "https://pwsdata.vn" },
    { name: "GitHub", url: "https://github.com/phanduykhai05" }
  );

client.user.setPresence({
  activities: [activity.toJSON()],
  status: "online"
});
