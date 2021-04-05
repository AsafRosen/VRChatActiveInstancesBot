import dotenv from "dotenv";
import * as discordBot from "./discordBot.js";
import * as vrcBot from "./vrcBot.js";

dotenv.config();

async function init() {
  try {
    await discordBot.init();

    const friendsStatus = await vrcBot.getFriendsStatus();
    console.log(friendsStatus);

    discordBot.postMessage({
      embed: {
        title: "World Name",
        description: "`Instance ID` [Join Here](http://google.com)",
        color: 3278000,
        timestamp: "2021-04-05T11:54:53.350Z",
        fields: [
          {
            name: "Currently Online",
            value: "Person\nPerson\nPerson\nPerson",
          },
          {
            name: "Raw JSON",
            value: "```" + JSON.stringify(friendsStatus) + "```",
          },
        ],
      },
    });
  } catch (ex) {
    console.error("Error while initializing!", ex);
  }
}

init();
