import axios from "axios";

axios.defaults.withCredentials = true;

let authenticated = false;

async function fetch(url, params) {
  const response = await axios.get(url, {
    auth: authenticated ? undefined : {
      username: process.env.VRCHAT_BOT_USERNAME,
      password: process.env.VRCHAT_BOT_PASSWORD,
    },
    params: {
      apiKey: "JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26",
      ...params,
    },
  });

  return response.data;
}

export async function getFriendsStatus() {
    return await fetch("https://vrchat.com/api/1/auth/user/friends");
}