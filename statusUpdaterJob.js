import * as vrcBot from "./vrcBot.js";
import * as discordBot from "./discordBot.js";
import groupBy from "group-by";

function arrayEquals(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export async function run() {
  try {
    const friendStatuses = await vrcBot.getOnlineFriends();
    const onlineFriends = friendStatuses
      .filter((status) => status != null)
      .filter((status) => status.location !== "offline");

    let friendsByInstance = groupBy(onlineFriends, (status) => status.location);

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
        Object.keys(friendsByInstance),
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
      let world, instanceDetails;
      if (instance === "private") {
        world = {
          name: "Private World",
          thumbnailImageUrl:
            "https://assets.vrchat.com/www/images/default_private_image.png",
        };
        instanceDetails = { name: "", instanceType: "private" };
      } else {
        world = await vrcBot.getWorldDetails(instance.split(":")[0]);
        instanceDetails = await vrcBot.getInstanceDetails(instance);
      }

      await discordBot.postMessage(
        {
          embed: {
            title: `${world.name} ${instanceDetails.name}`,
            description:
              instance === "private"
                ? null
                : `[Link to instance](https://vrchat.com/home/launch?worldId=${
                    world.id
                  }&instanceId=${encodeURIComponent(
                    instanceDetails.instanceId
                  )})`,
            timestamp: new Date().toISOString(),
            fields: [
              {
                name: "Currently Online",
                value: `${users.length} people`,
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


    await discordBot.clearMessagesNotInIDs(Object.keys(friendsByInstance));
  } catch (error) {
    console.error("Update job failed", error);
  }
}
