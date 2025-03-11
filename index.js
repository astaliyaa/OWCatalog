const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cosmetics.html'));
})

app.use('/Cosmetics', express.static('Cosmetics'));
app.use('/assets', express.static('public/assets'));

const options = {
    cert: fs.readFileSync('./certs/cert.pem'),
    key: fs.readFileSync('./certs/privkey.pem')
};

app.get('/heroes/:hero', async (req, res) => {
    const hero = req.params.hero.toLowerCase();
    const skinsFilePath = path.join(__dirname, 'CosmeticsJSON', 'Skins.json');
    const cdnMapUrl = 'https://cdn.owcatalog.de/cdn/cosmetics/skins/map';

    try {
        const skinsData = JSON.parse(fs.readFileSync(skinsFilePath, 'utf8'));
        const heroKey = Object.keys(skinsData.Items).find(key => key.toLowerCase() === hero);
        if (!heroKey) {
            console.error(`Hero not found: ${hero}`);
            return res.status(404).send('Hero not found');
        } else {
            console.log(heroKey);
        }

        // Fetch the CDN mapping JSON with SSL verification disabled
        const response = await axios.get(cdnMapUrl, {
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });
        const cdnMap = response.data;

        // Find the hero folder in the CDN map
        const heroFolder = cdnMap.find(item => item.name.toLowerCase() === heroKey.toLowerCase() && item.type === 'folder');
        if (!heroFolder) {
            console.error(`Hero folder not found in CDN map: ${heroKey}`);
            return res.status(404).send('Hero folder not found in CDN');
        }

        const skinsWithImages = skinsData.Items[heroKey].filter(skin => {
            return heroFolder.items.some(file => file.name === `${skin.name}.jpg`);
        }).map(skin => {
            return {
                name: skin.name,
                code: skin.code,
                price: skin.price,
                image: `https://cdn.owcatalog.de/cdn/cosmetics/Skins/${heroKey}/${skin.name}.jpg`
            };
        });

        const html = `
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OWCatalog | ${heroKey} Skins</title>
            <link rel="icon" type="image/x-icon" href="https://cdn.owcatalog.de/cdn/assets/ui/favicon.ico">
            <link rel="stylesheet" href="https://cdn.owcatalog.de/cdn/assets/css/style.css">
        </head>

        <body>
            <div class="navbar">
                <div class="logo">
                    <img src="https://cdn.owcatalog.de/cdn/assets/ui/owcatalog-logo.png">
                </div>
                <div class="nav-links">
                    <a href="#">
                        <img src="https://cdn.owcatalog.de/cdn/assets/ui/home.png"> <span>Home</span>
                    </a>
                    <a class="nav-links-selected" href="#">
                        <img src="https://cdn.owcatalog.de/cdn/assets/ui/cosmetics.png"> <span>Cosmetics</span>
                    </a>
                    <a href="#">
                        <img src="https://cdn.owcatalog.de/cdn/assets/ui/bundles.png"> <span>Bundles</span>
                    </a>
                </div>
            </div>
            <div class="content">
                <div class="grid-container">
                    ${skinsWithImages.map(skin =>
                    `<div class="grid-item">
                        <a target="_blank" href="https://us.checkout.battle.net/shop/en/checkout/buy/${skin.code}">
                            <div class="price-tag">
                                <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 100 100"
                                    viewBox="0 0 100 100">
                                    <script xmlns="" id="eppiocemhmnlbhjplcgkofciiegomcon" />
                                    <script xmlns="" />
                                    <script xmlns="" />
                                    <g fill="#ffc907">
                                        <path
                                            d="m66 24.2 5 8.7h13.1l-11.6-20.1c-.5-.9-1.6-1.5-2.6-1.5h-39.8l6.6 11.4h26.6c1.1 0 2.1.6 2.7 1.5z" />
                                        <path
                                            d="m63.3 77.3h-26.6l-6.5 11.4h39.7c1.1 0 2.1-.6 2.6-1.5l11.6-20.1h-13.1l-5 8.7c-.6.9-1.6 1.5-2.7 1.5z" />
                                        <path
                                            d="m18.8 48.2 13-22.6-6.6-11.4-19.7 34.3c-.5.9-.5 2.1 0 3.1l19.8 34.3 6.6-11.4-13-22.6c-.8-1.2-.8-2.6-.1-3.7z" />
                                        <path
                                            d="m92.3 47.1h-45.7c-.3 0-.6-.3-.5-.6l2.1-8c.1-.2.3-.4.5-.4h45.7c.3 0 .6.3.5.6l-2.1 8c-.1.3-.3.4-.5.4z" />
                                        <path
                                            d="m92.3 61.9h-45.7c-.3 0-.6-.3-.5-.6l2.1-8c.1-.2.3-.4.5-.4h45.7c.3 0 .6.3.5.6l-2.1 8c-.1.2-.3.4-.5.4z" />
                                    </g>
                                </svg>
                                <span>${skin.price}</span>
                            </div>
                            <img src="${skin.image}" alt="${skin.name}">
                        </a>
                    </div>`
                    ).join('')}
                </div>
            </div>
        </body>

        </html>
        `;

        res.send(html);
    } catch (error) {
        console.error(`Error processing request for hero: ${hero}`, error);
        res.status(500).send('Internal Server Error');
    }
});

https.createServer(options, app).listen(3000, '0.0.0.0', () => {
    console.log('Server is running on https://owcatalog.de or https://localhost:3000');
});