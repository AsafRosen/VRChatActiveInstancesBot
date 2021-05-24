import * as vrcBot from "./vrcBot.js";
import * as discordBot from "./discordBot.js";
import * as discordMessageDispatcher from "./discordMessageDispatcher.js";
import groupBy from "group-by";

export async function run() {
  try {
    const friendStatuses = await vrcBot.getOnlineFriends();
    const onlineFriends = friendStatuses
      .filter((status) => status != null)
      .filter((status) => status.location !== "offline")
      .filter((status) => status.location !== "");

    discordMessageDispatcher.postOnlineFriends(onlineFriends);

    const joinableFriends = onlineFriends.filter(
      (status) => status.location !== "private"
    );

    let friendsByInstance = groupBy(
      joinableFriends,
      (status) => status.location
    );

    friendsByInstance = Object.keys(friendsByInstance).reduce(
      (agg, instance) => {
        if (friendsByInstance[instance].length > 1) {
          agg[instance] = friendsByInstance[instance];
        }
        return agg;
      },
      {}
    );

    for (const [instance, users] of Object.entries(friendsByInstance)) {
      discordMessageDispatcher.postInstanceDetails(instance, users);
    }

    await discordBot.clearMessagesNotInIDs(
      Object.keys(friendsByInstance).concat(["online"])
    );
  } catch (error) {
    console.error("Update job failed", error.message);
  }
}
