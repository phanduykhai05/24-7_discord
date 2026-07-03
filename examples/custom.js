const { CustomStatus } = require("discord.js-selfbot-v13");

const customStatus = new CustomStatus(client, {
  state: "Coding a selfbot 💻",
  emoji: { name: "💻" }
});

client.user.setPresence({
  activities: [customStatus.toJSON()],
  status: "online"
});
