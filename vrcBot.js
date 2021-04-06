import cloudscraper from "cloudscraper";

let authenticated = false;

async function fetch(url, params) {
  try {
    const response = await cloudscraper.get(url, {
      auth: authenticated ? undefined : {
        username: process.env.VRCHAT_BOT_USERNAME,
        password: process.env.VRCHAT_BOT_PASSWORD,
      },
      qs: {
        apiKey: "JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26",
        ...params,
      },
    });

    if (!authenticated) {
        authenticated = true;
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error during VRChat API call: ' + url, error);
    throw error;
  }
}

export async function signIn() {
   return await fetch("https://api.vrchat.cloud/api/1/auth/user");

}

export async function getOnlineFriends() {
  return await fetch("https://api.vrchat.cloud/api/1/auth/user/friends", {offline: false});
}

export async function getInstanceDetails(id) {
    return await fetch("https://api.vrchat.cloud/api/1/instances/" + id);
}

export async function getWorldDetails(id) {
    return await fetch("https://api.vrchat.cloud/api/1/worlds/" + id);
}
