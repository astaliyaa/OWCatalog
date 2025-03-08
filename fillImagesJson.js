const path = require('path');
const fs = require('fs');

const skinsFilePath = path.join(__dirname, 'CosmeticsJSON', 'Name_Cards.json');
const cosmeticsDir = path.join(__dirname, 'Cosmetics', 'Name_Cards');

const skinsData = JSON.parse(fs.readFileSync(skinsFilePath, 'utf8'));

function filterSkinsWithImages(skinsData) {
    for (const hero in skinsData.Items) {
        skinsData.Items[hero] = skinsData.Items[hero].filter(skin => {
            const imagePath = path.join(cosmeticsDir, hero, `${skin.name}.jpg`);
            if (fs.existsSync(imagePath)) {
                skin.image = `http://v21159.1blu.de:3000/Cosmetics/Name_Cards/${hero}/${skin.name}.jpg`;
                return true;
            }
            return false;
        });
    }
    return skinsData;
}

const updatedSkinsData = filterSkinsWithImages(skinsData);

fs.writeFileSync(skinsFilePath, JSON.stringify(updatedSkinsData, null, 4), 'utf8');
console.log('Skins data updated with image fields and filtered entries without images.');