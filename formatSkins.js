const fs = require('fs');
const path = require('path');

// Read the data from skins.txt
const filePath = path.join(__dirname, 'skins.txt');
const data = fs.readFileSync(filePath, 'utf8');

// Split the data into lines and remove the first line (header)
const lines = data.split('\n').slice(1);

// Initialize an empty object to store the formatted data
const skins = { Skins: {} };

// Process each line
lines.forEach(line => {
    if (line.trim() === '') return; // Skip empty lines

    // Extract the code, hero and skin name, and price
    const [code, heroSkin, price] = line.split(',').map(item => item.trim());
    const [hero, skinName] = heroSkin.split(' - ').map(item => item.trim());
    const priceValue = parseInt(price.replace(' Coins', '').replace(' ', '').replace(',', ''));

    // Initialize the hero array if it doesn't exist
    if (!skins.Skins[hero]) {
        skins.Skins[hero] = [];
    }

    // Add the skin data to the hero array
    skins.Skins[hero].push({
        name: skinName,
        code: code,
        price: priceValue
    });
});

// Write the formatted data to a JSON file
const outputFilePath = path.join(__dirname, 'skins.json');
fs.writeFileSync(outputFilePath, JSON.stringify(skins, null, 4));

console.log('Data has been formatted and written to skins.json');