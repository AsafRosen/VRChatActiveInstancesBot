import * as vrcBot from "./vrcBot.js";
import * as discordBot from "./discordBot.js";
import groupBy from "group-by";


const STATUS_TO_EMOJI = {
  'join me': '🔵',
  'active': '🟢',
  'ask me': '🟠',
  'busy': '🔴',
};

function arrayEquals(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function renderUserList(users) {
  if (!users || users.length === 0) {
    return "No one";
  }

  const userList = users
    .map(
      (user) => `${STATUS_TO_EMOJI[user.status] ?? '❔'} [${user.displayName}](https://vrchat.com/home/user/${user.id})`
    )
    .join("\n");

  if (userList.length < 1024) {
    return userList;
  }

  return users.map((user) => `${STATUS_TO_EMOJI[user.status] ?? '❔'} ${user.displayName}`).join("\n");
}

async function postInstanceDetails(instance, users) {
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

async function postOnlineFriends(onlineFriends) {
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
        ["online"].concat(Object.keys(friendsByInstance)),
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

    await discordBot.clearMessagesNotInIDs(
      Object.keys(friendsByInstance).concat(["online"])
    );
  } catch (error) {
    console.error("Update job failed", error);
  }
}
