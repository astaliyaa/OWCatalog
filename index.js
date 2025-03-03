const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'heroes.html'));
})

app.use('/Cosmetics', express.static('Cosmetics'));
app.use('/assets', express.static('public/assets'));

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
      image: `http://localhost:3000/Cosmetics/Skins/${heroKey}/${skin.name}.jpg`
    };
  });

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${heroKey} Skins</title>
      <link rel="stylesheet" href="http://localhost:3000/assets/css/style.css">
  </head>
  <body>
      <div class="grid-container">
          ${skinsWithImages.map(skin => `
              <div class="grid-item"><a target="_blank" href="https://us.checkout.battle.net/shop/en/checkout/buy/${skin.code}"><img src="${skin.image}" alt="${skin.name}"></a></div>
          `).join('')}
      </div>
  </body>
  </html>
  `;

  res.send(html);
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});