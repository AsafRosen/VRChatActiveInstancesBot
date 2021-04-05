import * as vrcBot from "./vrcBot.js";
import * as discordBot from "./discordBot.js";
import groupBy from "group-by";

export async function run() {
  await vrcBot.signIn();
  const friendStatuses = await vrcBot.getOnlineFriends();
  const friendsByInstance = groupBy(
    friendStatuses.filter((status) => status.location !== "offline"),
    (status) => status.location
  );

  for (const [instance, users] of Object.entries(friendsByInstance)) {
    
    let world,instanceDetails;
    if (instance === "private") {
        world =  {name: "Private World", thumbnailImageUrl: "https://assets.vrchat.com/www/images/default_private_image.png"};
        instanceDetails = {name: '', instanceType: 'private'};
    } else {
        world = await vrcBot.getWorldDetails(instance.split(":")[0]);
        instanceDetails = await vrcBot.getInstanceDetails(instance);
    }

    discordBot.postMessage({
      embed: {
        title: `${world.name} ${instanceDetails.name}`,
        description: instance === 'private' ? null : `[Link to instance](https://vrchat.com/home/launch?worldId=${world.id}&instanceId=${instanceDetails.instanceId})`,
        timestamp: new Date().toISOString(),
        fields: [
          {
            name: "Currently Online",
            value: users.map(user => user.displayName).join("\n"),
          },
        ],
        thumbnail: {
            "url": world.thumbnailImageUrl
          },
      },
    });
  }
}
