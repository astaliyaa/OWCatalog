const path = require('path');
const fs = require('fs');
const axios = require('axios');
const https = require('https');

const skinsFilePath = path.join(__dirname, 'skins.json');

(async () => {
    try {
        const skinsData = JSON.parse(fs.readFileSync(skinsFilePath, 'utf8'));
        const cdnMapUrl = 'https://cdn.owcatalog.de/cdn/cosmetics/skins/map';
        
        // Fetch the cosmetics map with SSL disabled
        const response = await axios.get(cdnMapUrl, {
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });
        const cdnMap = response.data;
        
        function filterSkinsWithMap(skinsData, cdnMap) {
            for (const hero in skinsData.Items) {
                // Find folder in CDN map matching the hero name
                const heroFolder = cdnMap.find(item => item.name.toLowerCase() === hero.toLowerCase() && item.type === 'folder');
                if (heroFolder) {
                    skinsData.Items[hero] = skinsData.Items[hero].filter(skin =>
                        heroFolder.items.some(file => file.name === `${skin.name}.jpg`)
                    );
                } else {
                    console.warn(`Hero folder not found in CDN map for ${hero}`);
                    skinsData.Items[hero] = [];
                }
            }
            return skinsData;
        }
        
        const updatedSkinsData = filterSkinsWithMap(skinsData, cdnMap);
        fs.writeFileSync(skinsFilePath, JSON.stringify(updatedSkinsData, null, 4), 'utf8');
        console.log('Skins data updated using CDN map and filtered entries without existing images.');
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();