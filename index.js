import dotenv from 'dotenv';
import Discord from "discord.js";

dotenv.config();
const client = new Discord.Client();

async function init() {
    try {
      if (!process.env.DISCORD_CLIENT_TOKEN) {
        throw new Error("DISCORD_CLIENT_TOKEN is not set in the .env file");
      }

      await client.login(process.env.DISCORD_CLIENT_TOKEN);

      const channel = await client.channels.fetch(
        process.env.DISCORD_ACTIVITY_STATUS_CHANNEL
      );

      channel.send("test");
    } catch (ex) {
      console.error("Error while initializing!", ex);
    }
}

init();