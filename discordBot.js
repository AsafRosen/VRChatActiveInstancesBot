import Discord from "discord.js";

const client = new Discord.Client();
let channel = null;

const fixedMessages = {};

export async function init() {
  if (!process.env.DISCORD_CLIENT_TOKEN) {
    throw new Error("DISCORD_CLIENT_TOKEN is not set in the .env file");
  }

  await client.login(process.env.DISCORD_CLIENT_TOKEN);

  if (!process.env.DISCORD_ACTIVITY_STATUS_CHANNEL) {
    throw new Error("DISCORD_ACTIVITY_STATUS_CHANNEL is not set in the .env file");
  }

  channel = await client.channels.fetch(
    process.env.DISCORD_ACTIVITY_STATUS_CHANNEL
  );
}

export async function postMessage(content, fixedMessageId) {
  if (fixedMessages[fixedMessageId]) {
    const currentMessage = fixedMessages[fixedMessageId];
    const newMessage = await currentMessage.edit(content);
    fixedMessages[fixedMessageId] = newMessage;
  }
  else {
    const newMessage = await channel.send(content);
    fixedMessages[fixedMessageId] = newMessage;
  }
}

export async function clearAllBotMessages() {
  const allMessages = await channel.messages.fetch();
  const botMessages = allMessages.filter(m => m.author.id === client.user.id)

  for (const [_, message] of botMessages) {
    message.delete();
  }
}