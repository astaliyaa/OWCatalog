const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { JSDOM } = require('jsdom');

// Read the HTML file
const htmlFilePath = path.join(__dirname, 'test.html');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

// Parse the HTML content
const dom = new JSDOM(htmlContent);
const document = dom.window.document;

// Extract image URLs and hero names
const heroCards = document.querySelectorAll('blz-hero-card');
const heroData = [];

heroCards.forEach(card => {
    const heroName = card.getAttribute('hero-name');
    const imageUrl = card.querySelector('blz-image').getAttribute('src');
    heroData.push({ heroName, imageUrl });
});

// Function to download and save images
const downloadImage = async (url, filepath) => {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filepath))
            .on('finish', () => resolve())
            .on('error', e => reject(e));
    });
};

// Create the NewIcons directory if it doesn't exist
const newIconsDir = path.join(__dirname, 'NewIcons');
if (!fs.existsSync(newIconsDir)) {
    fs.mkdirSync(newIconsDir);
}

// Save images with corresponding hero names
const saveImages = async () => {
    for (const { heroName, imageUrl } of heroData) {
        const imagePath = path.join(newIconsDir, `Icon-${heroName}.png`);
        await downloadImage(imageUrl, imagePath);
        console.log(`Saved Icon-${heroName}.png`);
    }
};

saveImages().catch(console.error);