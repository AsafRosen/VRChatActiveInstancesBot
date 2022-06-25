import dotenv from "dotenv";
import * as discordBot from "./discordBot.js";
import * as statusUpdaterJob from "./statusUpdaterJob.js";
import * as acceptFriendRequestsJob from "./acceptFriendRequestsJob.js";
import * as vrcBot from "./vrcBot.js";

dotenv.config();

async function init() {
  try {
    console.info("Starting Bot");
    await discordBot.init();
    console.info("Discord Bot API initialized");

    await runBot();

    setInterval(async () => {
      await runBot();
    }, 120000);
  } catch (ex) {
    console.error("Error while running job!", ex);
  }
}

async function runBot() {
  try {
    await vrcBot.signIn();
    console.info("VRChat API initialized");
    await acceptFriendRequestsJob.run();
    console.info("Accepted Friend Requests");
    await statusUpdaterJob.run();
    console.info("Finished Status Update");
  } catch (ex) {
    console.error("Error while running job!", ex);
  }
}

init().then(() =>{});
