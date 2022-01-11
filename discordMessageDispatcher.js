import * as discordBot from "./discordBot.js";
import * as vrcBot from "./vrcBot.js";

const STATUS_TO_EMOJI = {
    'join me': '🔵',
    'active': '🟢',
    'ask me': '🟠',
    'busy': '🔴',
  };

function renderUserList(users) {
    if (!users || users.length === 0) {
      return "No one";
    }
  
    const userList = users
      .map(
        (user) => `${STATUS_TO_EMOJI[user.status] || '❔'} [${user.displayName}](https://vrchat.com/home/user/${user.id})`
      )
      .join("\n");
  
    if (userList.length < 1024) {
      return userList;
    }
  
    return users.map((user) => `${STATUS_TO_EMOJI[user.status] || '❔'} ${user.displayName}`).join("\n");
  }
  
  export async function postInstanceDetails(instance, users) {
    if (instance.length === 0) {
      console.warn("Instance with empty string, ignoring");
      return;
    }

    let world, instanceDetails;
  
    world = await vrcBot.getWorldDetails(instance.split(":")[0]);
    instanceDetails = await vrcBot.getInstanceDetails(instance);
  
    await discordBot.postMessage(
      {
        embed: {
          title: `${world.name} ${instanceDetails.name}`,
          url: `https://vrchat.com/home/launch?worldId=${
            world.id
          }&instanceId=${encodeURIComponent(instanceDetails.instanceId)}`,
          description: `Online: ${users.length} friends, ${instanceDetails.n_users} players`,
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: "Who is in here?",
              value: renderUserList(users),
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
  
  export async function postOnlineFriends(onlineFriends) {
    await discordBot.postMessage(
      {
        embed: {
          title: "Online People",
          description: `${onlineFriends.length} friends`,
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: "Who's online?",
              value: renderUserList(onlineFriends),
            },
          ],
        },
      },
      "online"
    );
  }