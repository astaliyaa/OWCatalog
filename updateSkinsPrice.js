const fs = require('fs');
const path = require('path');

// Read the data from cosmetics.txt
const filePath = path.join(__dirname, 'cosmetics.txt');
const data = fs.readFileSync(filePath, 'utf8');

// Function to sanitize file names and object keys
const sanitizeString = (name) => {
    if (!name) return '';
    return name
        .replace(/[\/:*?"<>|\s]/g, '_')
        .replace(/[ä]/g, 'a')
        .replace(/[ö]/g, 'o')
        .replace(/[ü]/g, 'u')
        .replace(/[ß]/g, 'ss')
        .replace(/[ú]/g, 'u');
};

// Split the data into lines
const lines = data.split('\n');

let currentCategory = '';
const skinsData = { Items: {} };

lines.forEach(line => {
    if (line.trim() === '') return; // Skip empty lines

    // Check if the line is a category
    if (!line.includes(',')) {
        currentCategory = sanitizeString(line.replace(':', '').trim()).toLowerCase();
        return;
    }

    // Only process data for the "skins" category
    if (currentCategory !== 'skins') return;

    // Extract the code, heroCosmetic and price
    const parts = line.split(',').map(item => item.trim());
    if (parts.length < 3) return;

    const [code, heroCosmetic, price] = parts;
    if (!heroCosmetic.includes(' - ')) return;

    const [hero, cosmeticName] = heroCosmetic.split(' - ').map(item => item.trim());
    // Remove all commas from the price string before parsing
    const priceValue = parseInt(price.replace(' Coins', '').replace(/,/g, '').replace(' ', '').trim(), 10) || 0;

    // Sanitize hero and cosmetic name
    const sanitizedHero = sanitizeString(hero);
    const sanitizedCosmeticName = sanitizeString(cosmeticName);

    // Initialize the hero array if it doesn't exist
    if (!skinsData.Items[sanitizedHero]) {
        skinsData.Items[sanitizedHero] = [];
    }

    // Add the cosmetic data to the hero array
    skinsData.Items[sanitizedHero].push({
        name: sanitizedCosmeticName,
        code: code,
        price: priceValue
    });
});

// Write the formatted skins data to skins.json
const outputFilePath = path.join(__dirname, 'skins.json');
fs.writeFileSync(outputFilePath, JSON.stringify(skinsData, null, 4));
console.log(`Data for skins has been written to ${outputFilePath}`);