const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { getAccessToken, launchChrome } = require('./puppeteer');

const url = "https://eu.shop.battle.net/api/itemshop/pages/blt01ee8af4f4da5e5f?userId=1115090890&locale=en-US";

async function getShop() {
  try {
    await launchChrome();
    let access_token = '';
    access_token = await getAccessToken();
    console.log(access_token);
    const headers = {
      "accept": "application/json, text/plain, */*",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-us",
      "cookie": `access_token=${access_token}`,
      "priority": "u=1, i",
      "referer": "https://eu.shop.battle.net/en-us/family/overwatch",
      "sec-ch-ua": `"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"`,
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": `"Windows"`,
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
      "x-debug-session-id": "",
      "x-modified-accept-language": "en-us",
      "x-original-accept-language": "",
      "x-requested-with": "BnetAngularFrontend"
    };

    const response = await axios.get(url, { headers });
    console.log("Request successful:");
    const shopFolder = path.join(__dirname, 'Shop');
    const filePath = path.join(shopFolder, `${response.data.id}.json`);

    if (!fs.existsSync(shopFolder)) {
      fs.mkdirSync(shopFolder);
    }

    fs.writeFile(filePath, JSON.stringify(response.data, null, 2), (err) => {
      if (err) {
        console.error("Error writing file:", err);
      } else {
        console.log("Response saved to", filePath);
      }
    });
  } catch (error) {
    console.error("Request failed:", error.response ? error.response.status : error.message);
  }
}

getShop();