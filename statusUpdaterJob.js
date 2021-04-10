import * as vrcBot from "./vrcBot.js";
import * as discordBot from "./discordBot.js";
import groupBy from "group-by";

function arrayEquals(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

async function postInstanceDetails(instance, users) {
  let world, instanceDetails;

  world = await vrcBot.getWorldDetails(instance.split(":")[0]);
  instanceDetails = await vrcBot.getInstanceDetails(instance);

  await discordBot.postMessage(
    {
      embed: {
        title: `${world.name} ${instanceDetails.name}`,
        description: `[Link to instance](https://vrchat.com/home/launch?worldId=${
          world.id
        }&instanceId=${encodeURIComponent(instanceDetails.instanceId)})`,
        timestamp: new Date().toISOString(),
        fields: [
          {
            name: "Currently Online",
            value: `${users.length} friends, ${instanceDetails.occupants} players`,
          },
        ],
        image: {
          url: world.imageUrl,
        },
      },
    },
    instance
  );
}

async function postOnlineFriends(onlineFriends) {
  await discordBot.postMessage(
    {
      embed: {
        timestamp: new Date().toISOString(),
        fields: [
          {
            name: "Currently Online",
            value: `${onlineFriends.length} friends`,
          },
        ],
      },
    },
    "online"
  );
}

export async function run() {
  try {
    const friendStatuses = await vrcBot.getOnlineFriends();
    const onlineFriends = friendStatuses
      .filter((status) => status != null)
      .filter((status) => status.location !== "offline");

    postOnlineFriends(onlineFriends);

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

    if (
      !arrayEquals(
        Object.keys(friendsByInstance).concat("online"),
        Object.keys(discordBot.getFixedMessages())
      )
    ) {
      console.info(
        `[${new Date().toISOString()}] Active Instances Changed: [${Object.keys(
          friendsByInstance
        ).join(", ")}]`
      );
    }

    for (const [instance, users] of Object.entries(friendsByInstance)) {
      postInstanceDetails(instance, users);
    }

    await discordBot.clearMessagesNotInIDs(Object.keys(friendsByInstance).concat(['online']));
  } catch (error) {
    console.error("Update job failed", error);
  }
}
