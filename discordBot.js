import Discord from "discord.js";

const client = new Discord.Client();
let channel = null;

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

export async function postMessage(content) {
  return await channel.send(content);
}
