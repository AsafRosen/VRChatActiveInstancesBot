import dotenv from "dotenv";
import * as discordBot from "./discordBot.js";
import * as statusUpdaterJob from './statusUpdaterJob.js'

dotenv.config();

async function init() {
  try {
    await discordBot.init();

    statusUpdaterJob.run();
    

  } catch (ex) {
    console.error("Error while initializing!", ex);
  }
}

init();
