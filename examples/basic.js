client.user.setPresence({
  status: "dnd", // online, idle, dnd, invisible
});

client.user.setActivity("with code", {
  type: "PLAYING", // Can also be STREAMING, LISTENING, WATCHING, COMPETING
});

client.user.setActivity("the community", {
  type: "WATCHING",
});

client.user.setActivity("lofi beats", {
  type: "LISTENING",
});

client.user.setActivity("My Live Stream", {
  type: "STREAMING",
  url: "https://twitch.tv/some_channel", // Needs to be a valid streaming URL
});

