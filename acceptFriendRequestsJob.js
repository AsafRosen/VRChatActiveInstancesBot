import * as vrcBot from "./vrcBot.js";

export async function run() {
  console.info(`[${new Date().toISOString()}] Running friend requests job`);
  let notifications = await vrcBot.getNotifications();
  notifications = notifications.filter(
    (notification) => notification.type === "friendRequest"
  );

  notifications.map((notification) => {
    console.info(`[${new Date().toISOString()}] New friend request from ${notification.senderUsername}`);
  });

  await Promise.all(
    notifications.map((notification) =>
      vrcBot.acceptFriendRequestNotification(notification.id)
    )
  );
}
