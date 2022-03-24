import dotenv from "dotenv";
import * as discordBot from "./discordBot.js";
import * as statusUpdaterJob from "./statusUpdaterJob.js";
import * as acceptFriendRequestsJob from "./acceptFriendRequestsJob.js";
import * as vrcBot from "./vrcBot.js";
import * as webserver from "./webserver.js";

dotenv.config();

let jobInterval;

async function init() {
  try {
    webserver.init();

    await discordBot.init();
    await discordBot.clearAllBotMessages();

    await vrcBot.signIn();
    await acceptFriendRequestsJob.run();
    await statusUpdaterJob.run();

    jobInterval = setInterval(async () => {
      try {
        await vrcBot.signIn();
        await acceptFriendRequestsJob.run();
        await statusUpdaterJob.run();
      }
      catch (ex) {
        console.error('Error running updates', ex);
      }
    }, 60000);

  } catch (ex) {
    console.error("Error while initializing!", ex);
  }
}

init();
