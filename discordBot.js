import Discord from "discord.js";

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILD_MESSAGES] });
let channel = null;

export async function init() {
  if (!process.env.DISCORD_CLIENT_TOKEN) {
    throw new Error("DISCORD_CLIENT_TOKEN is not set in the .env file");
  }

  client.on("ready", () => console.log("Login Ready Event"));
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

export async function postMessage(content) {
  try {
    const existingMessage = await getMessageByTitle(content.embeds[0].title);
    if (existingMessage) {
      await existingMessage.edit(content);
    } else {
      await channel.send(content);
    }
  } catch (error) {
    console.error("Failed to post message: ", content.embeds[0].title, error);
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

export async function clearMessagesNotInTitles(titles) {
  const allMessages = await channel.messages.fetch();
  const botMessages = allMessages.filter((m) => m.author.id === client.user.id);

  for (const [_, message] of botMessages) {
    const currentMessageTitle = message.embeds[0]?.title;

    if (!currentMessageTitle || titles.includes(currentMessageTitle)) {
      continue;
    }

    try {
      await message.delete();
    } catch (error) {
      console.error("Failed to delete message: ", messageId);
    }
  }
}

async function getMessageByTitle(title) {
  try {
    const allMessages = await channel.messages.fetch();
    const botMessages = allMessages.filter(
      (m) => m.author.id === client.user.id
    );

    return botMessages.find((m) => m.embeds[0]?.title === title);
  } catch (error) {
    console.error("Failed to get message by Title", title, error);
  }
}
