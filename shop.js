const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { getAccessToken, launchChrome } = require('./utils/puppeteer');

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
    const bundlesFilePath = path.join(shopFolder, 'Bundles.json');

    if (!fs.existsSync(shopFolder)) {
      fs.mkdirSync(shopFolder);
    }

    let bundlesData = { items: [] };
    if (fs.existsSync(bundlesFilePath)) {
      const bundlesFileContent = fs.readFileSync(bundlesFilePath, 'utf8');
      bundlesData = JSON.parse(bundlesFileContent);
    }

    const featuredCollection = response.data.mtxCollections.find(collection => collection.title === 'Featured');
    if (featuredCollection) {
      const formattedData = featuredCollection.items.map(item => ({
        id: item.slug,
        title: item.title,
        description: item.description,
        image: item.image.url,
        price: item.price.raw,
        currency: item.price.currency,
        pid: Object.keys(item.ecommerceAnalytics.products)[0],
        productIds: item.productIds
      }));

      formattedData.forEach(newItem => {
        const exists = bundlesData.items.some(existingItem => existingItem.id === newItem.id && existingItem.pid === newItem.pid);
        if (!exists) {
          bundlesData.items.push(newItem);
        }
      });

      fs.writeFileSync(bundlesFilePath, JSON.stringify(bundlesData, null, 2), 'utf8');
      console.log("Response saved to", bundlesFilePath);
    } else {
      console.log("No 'Featured' collection found.");
    }

  } catch (error) {
    console.error("Request failed:", error.response ? error.response.status : error.message);
  }
}

getShop();