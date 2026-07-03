client.on("messageCreate", (message) => {
  if (message.author.id !== client.user.id) return; // Skip others
  console.log(`[${message.guild?.name}] ${message.channel.name}: ${message.content}`);
});
