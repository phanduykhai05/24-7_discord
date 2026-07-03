const prefix = "!";

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix)) return;
  if (message.author.id !== client.user.id) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    message.channel.send("Pong!");
  }
});
