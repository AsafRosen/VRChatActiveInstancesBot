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
    const currentMessageID = fixedMessages[fixedMessageId];
    const currentMessage = await channel.messages.fetch(currentMessageID);
    const newMessage = await currentMessage.edit(content);
    fixedMessages[fixedMessageId] = newMessage.id;
  }
  else {
    const newMessage = await channel.send(content);
    fixedMessages[fixedMessageId] = newMessage.id;
  }
}

export async function clearAllBotMessages() {
  const allMessages = await channel.messages.fetch();
  const botMessages = allMessages.filter(m => m.author.id === client.user.id)

  for (const [_, message] of botMessages) {
    message.delete();
  }
}

export async function clearMessagesNotInIDs(fixedMessageIds) {
  const messagesToRemove = Object.keys(fixedMessages).filter(fixedMessage => !fixedMessageIds.includes(fixedMessage));

  for (const messageToRemoveId of messagesToRemove) {
    const messageId = fixedMessages[messageToRemoveId];
    try {
      const message = await channel.messages.fetch(messageId);
      await message.delete();
    }
    catch (error) {
      console.error('Failed to delete message: ', messageId);
    }

    delete fixedMessages[messageToRemoveId];
  }
}