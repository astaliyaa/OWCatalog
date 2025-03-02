const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
axios.defaults.withCredentials = true;

async function fetchHTML(url) {
    try {
        const response = await axios.get(url, {
            maxRedirects: 5, // Follow up to 5 redirects
            headers: {
                'Cookie': 'JSESSIONID=06d0e726-8d44-45b9-98c1-5493d17f80f6; _st=1740431075051; bnetVisitorId=b8f75f3e-8b96-4feb-a36f-d16eb75a2f9f; loc=en-us; OptanonConsent=isGpcEnabled=0&datestamp=Sat+Mar+01+2025+16%3A22%3A29+GMT%2B0100+(Central+European+Standard+Time)&version=202402.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=1dd514fc-17f9-4665-b71e-d147aacc9d33&interactionCount=1&isAnonUser=1&landingPath=NotLandingPage&groups=1%3A1%2C2%3A1%2C3%3A1%2C4%3A1%2C8%3A0&AwaitingReconsent=false&geolocation=DE%3BRP; OptanonAlertBoxClosed=2025-02-21T21:01:42.743Z; web.id=EU-2df1adb3-a803-475a-bca1-d0a781d3b766; optimizelyEndUserId=oeu1740431079796r0.14265230916159333; optimizelySession=0; LPVID=BiYWY0ZmQzOWMxZTA0NTM2; opt=1; tools-login.key=2dc8c3e42eda9f8be3f6af244d6999c2; BA-tassadar-login.key=9cbcfd6990e62936135e1dc33c975e9f; login.key=9cbcfd6990e62936135e1dc33c975e9f',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
                'Host': 'us.checkout.battle.net',
                'Priority': 'u=0, i',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0'
            },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching the HTML:', error);
        return null;
    }
}

async function downloadImage(imageUrl, outputPath) {
    const writer = fs.createWriteStream(outputPath);
    const response = await axios({
        url: imageUrl,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function fetchAndSaveImage(url, imageOutputPath) {
    const html = await fetchHTML(url);
    if (html) {
        const $ = cheerio.load(html);
        const imageUrl = $('img').filter((i, img) => $(img).attr('src').startsWith('//catalog.blzstatic.com')).attr('src');
        
        if (imageUrl) {
            const correctedImageUrl = 'https:' + imageUrl.slice(2);
            await downloadImage(correctedImageUrl, imageOutputPath);
            console.log(`Image saved to ${imageOutputPath}`);
        } else {
            console.log('No image found with the specified URL pattern.');
        }
    }
}

async function processSkins() {
    const skinsFilePath = path.join(__dirname, 'CosmeticsJSON', 'Sprays.json');
    const skinsData = JSON.parse(fs.readFileSync(skinsFilePath, 'utf8'));

    for (const hero in skinsData.Items) {
        const heroSkins = skinsData.Items[hero];
        for (const skin of heroSkins) {
            const url = `https://us.checkout.battle.net/shop/en/checkout/buy/${skin.code}`;
            const imageOutputPath = path.join(__dirname, 'Cosmetics', 'Sprays', hero, `${skin.name}.jpg`);

            // Ensure the hero directory exists
            fs.mkdirSync(path.dirname(imageOutputPath), { recursive: true });

            await fetchAndSaveImage(url, imageOutputPath);
        }
    }
}

processSkins();