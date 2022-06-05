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
    throw new Error(
      "DISCORD_ACTIVITY_STATUS_CHANNEL is not set in the .env file"
    );
  }

  channel = await client.channels.fetch(
    process.env.DISCORD_ACTIVITY_STATUS_CHANNEL
  );
}

export async function postMessage(content, fixedMessageId) {
  try {
    if (fixedMessages[fixedMessageId]) {
      const currentMessageID = fixedMessages[fixedMessageId];
      const currentMessage = await channel.messages.fetch(currentMessageID);
      const newMessage = await currentMessage.edit(content);
      fixedMessages[fixedMessageId] = newMessage.id;
    } else {
      const newMessage = await channel.send(content);
      fixedMessages[fixedMessageId] = newMessage.id;
    }
  } catch (error) {
    delete fixedMessages[fixedMessageId];
    console.error("Failed to post message: ", fixedMessageId, error);
  }
}

export async function clearAllBotMessages() {
  try {
    const allMessages = await channel.messages.fetch();
    const botMessages = allMessages.filter(
      (m) => m.author.id === client.user.id
    );

    for (const [_, message] of botMessages) {
      message.delete();
    }
  } catch (error) {
    console.error("Failed to clear all bot messages", error);
  }
}

export async function clearMessagesNotInIDs(fixedMessageIds) {
  const allMessages = await channel.messages.fetch();
  const botMessages = allMessages.filter((m) => m.author.id === client.user.id);

  for (const fixedMessageId of Object.keys(fixedMessages)) {
    if (!fixedMessageIds.includes(fixedMessageId)) {
      delete fixedMessages[fixedMessageId];
    }
  }

  for (const [_, message] of botMessages) {
    if (!Object.values(fixedMessages).includes(message.id)) {
      try {
        await message.delete();
      } catch (error) {
        console.error("Failed to delete message: ", messageId);
      }
    }
  }
}
