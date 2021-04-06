import dotenv from "dotenv";
import * as discordBot from "./discordBot.js";
import * as statusUpdaterJob from './statusUpdaterJob.js';
import * as acceptFriendRequestsJob from './acceptFriendRequestsJob.js';
import * as vrcBot from './vrcBot.js';

dotenv.config();

let jobInterval;

async function init() {
  try {
    await discordBot.init();
    await discordBot.clearAllBotMessages();

    await vrcBot.signIn();
    await acceptFriendRequestsJob.run();
    await statusUpdaterJob.run();
    
    jobInterval = setInterval(async () => {
        
        await vrcBot.signIn();
        await acceptFriendRequestsJob.run();
        await statusUpdaterJob.run();
        
    }, 60000);

  } catch (ex) {
    console.error("Error while initializing!", ex);
  }
}

init();
