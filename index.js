import dotenv from "dotenv";
import * as discordBot from "./discordBot.js";
import * as statusUpdaterJob from './statusUpdaterJob.js'

dotenv.config();

let updaterJobInterval;

async function init() {
  try {
    await discordBot.init();
    await discordBot.clearAllBotMessages();

    await statusUpdaterJob.run();
    
    updaterJobInterval = setInterval(async () => {
        await statusUpdaterJob.run();
    }, 60000)

  } catch (ex) {
    console.error("Error while initializing!", ex);
  }
}

init();
