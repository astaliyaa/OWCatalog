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

// Create the output directory if it doesn't exist
const outputDir = path.join(__dirname, 'CosmeticsJSON');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Split the data into lines
const lines = data.split('\n');

let currentCategory = '';
const cosmetics = {};

lines.forEach(line => {
    if (line.trim() === '') return; // Skip empty lines
    
    // Check if the line is a category
    if (!line.includes(',')) {
        currentCategory = sanitizeString(line.replace(':', '').trim());
        cosmetics[currentCategory] = { Items: {} };
        return;
    }
    
    // Extract the code, hero and cosmetic name, and price
    const parts = line.split(',').map(item => item.trim());
    if (parts.length < 3) return; // Skip malformed lines
    
    const [code, heroCosmetic, price] = parts;
    if (!heroCosmetic.includes(' - ')) return; // Skip malformed entries
    
    const [hero, cosmeticName] = heroCosmetic.split(' - ').map(item => item.trim());
    const priceValue = parseInt(price.replace(' Coins', '').replace(' ', '').replace(',', '')) || 0;
    
    // Sanitize hero and cosmetic name
    const sanitizedHero = sanitizeString(hero);
    const sanitizedCosmeticName = sanitizeString(cosmeticName);
    
    // Initialize the hero array if it doesn't exist
    if (!cosmetics[currentCategory].Items[sanitizedHero]) {
        cosmetics[currentCategory].Items[sanitizedHero] = [];
    }
    
    // Add the cosmetic data to the hero array
    cosmetics[currentCategory].Items[sanitizedHero].push({
        name: sanitizedCosmeticName,
        code: code,
        price: priceValue
    });
});

// Write the formatted data to separate JSON files for each category
Object.keys(cosmetics).forEach(category => {
    const outputFilePath = path.join(outputDir, `${category}.json`);
    fs.writeFileSync(outputFilePath, JSON.stringify(cosmetics[category], null, 4));
    console.log(`Data for ${category} has been written to ${outputDir}/${category}.json`);
});