const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const https = require('https');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cosmetics.html'));
})

app.use('/Cosmetics', express.static('Cosmetics'));
app.use('/assets', express.static('public/assets'));

const options = {
    cert: fs.readFileSync('./certs/cert.pem'),
    key: fs.readFileSync('./certs/privkey.pem')
};

app.get('/heroes/:hero', (req, res) => {
    const hero = req.params.hero.toLowerCase();
    const skinsFilePath = path.join(__dirname, 'CosmeticsJSON', 'Skins.json');
    const cosmeticsDir = path.join(__dirname, 'Cosmetics', 'Skins');
    const skinsData = JSON.parse(fs.readFileSync(skinsFilePath, 'utf8'));

    const heroKey = Object.keys(skinsData.Items).find(key => key.toLowerCase() === hero);
    if (!heroKey) {
        return res.status(404).send('Hero not found');
    }

    const skinsWithImages = skinsData.Items[heroKey].filter(skin => {
        const imagePath = path.join(cosmeticsDir, heroKey, `${skin.name}.jpg`);
        return fs.existsSync(imagePath);
    }).map(skin => {
        return {
            name: skin.name,
            code: skin.code,
            image: `https://cdn.owcatalog.de/cdn/cosmetics/${heroKey}/${skin.name}.jpg`
        };
    });

    const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${heroKey} Skins</title>
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
});

https.createServer(options, app).listen(3000, '0.0.0.0', () => {
    console.log('Server is running on https://owcatalog.de or https://localhost:3000');
})