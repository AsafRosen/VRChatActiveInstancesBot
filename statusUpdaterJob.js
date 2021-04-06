import * as vrcBot from "./vrcBot.js";
import * as discordBot from "./discordBot.js";
import groupBy from "group-by";

export async function run() {
  try {
    console.info("Running status updater job");
    await vrcBot.signIn();
    const friendStatuses = await vrcBot.getOnlineFriends();
    const onlineFriends = friendStatuses
      .filter((status) => status != null)
      .filter((status) => status.location !== "offline");

    let friendsByInstance = groupBy(
      onlineFriends,
      (status) => status.location
    );

    friendsByInstance = friendsByInstance.filter(friendsInInstance => friendsInInstance.length > 1);

    console.info(
      `[${new Date().toISOString()}] Found ${Object.keys(friendsByInstance).length} active instances among ${
        onlineFriends.length
      } active friends`
    );

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
                : `[Link to instance](https://vrchat.com/home/launch?worldId=${world.id}&instanceId=${instanceDetails.instanceId})`,
            timestamp: new Date().toISOString(),
            fields: [
              {
                name: "Currently Online",
                value: users.map((user) => user.displayName).join("\n"),
              },
            ],
            thumbnail: {
              url: world.thumbnailImageUrl,
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
