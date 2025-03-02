const axios = require("axios");

const CLIENT_ID = "aa769474b26943d5838df82c4c5c60f9"; // Replace with your client_id
const CLIENT_SECRET = "cRS4d7jITGOFZFUBvI2T205gpO95NcJE"; // Replace with your client_secret
const TOKEN_URL = "https://oauth.battle.net/token";

async function getAccessToken() {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  try {
    const response = await axios.post(
      TOKEN_URL,
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("Access Token:", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error.response?.data || error.message);
  }
}

getAccessToken();