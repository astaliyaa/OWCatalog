const fs = require('fs');
const path = require('path');

const txtFilePath = path.join(__dirname, 'ilide.info-overwatch-codes-database-pr_3aea3be2003073f1661a836fca3f5a25.txt');
const jsonFilePath = path.join(__dirname, 'CosmeticsJSON', 'Skins.json');
const newJsonFilePath = path.join(__dirname, 'CosmeticsJSON', 'NewSkins.json');

const heroNames = [
    "Ashe", "Bastion", "Cassidy", "Echo", "Genji", "Hanzo", "Junkrat", "Mei", "Pharah", "Reaper", "Sojourn", 
    "Soldier: 76", "Sombra", "Symmetra", "Torbjörn", "Tracer", "Venture", "Widowmaker", "D.Va", "Doomfist", 
    "Hazard", "Junker Queen", "Mauga", "Orisa", "Ramattra", "Reinhardt", "Roadhog", "Sigma", "Winston", 
    "Wrecking Ball", "Zarya", "Ana", "Baptiste", "Brigitte", "Illari", "Kiriko", "Lifeweaver", "Lucio", 
    "Mercy", "Moira", "Zenyatta"
];

function parseTxtFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return data.split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .map(line => {
            // Split by '|' and trim each field
            const fields = line.split('|').map(f => f.trim());
            if (fields.length < 2) return null;
            // First field is the code
            const code = fields[0];
            // Second field: remove "Nam =" prefix if present
            let name = fields[1];
            if (name.startsWith("Nam")) {
                const parts = name.split('=');
                if(parts.length >= 2) {
                    name = parts[1].trim();
                }
            }
            return { code, name };
        })
        .filter(item => item && item.code && item.name);
}

function parseJsonFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf-8');
    try {
        return JSON.parse(data);
    } catch(e) {
        return { Items: {} };
    }
}

function checkNewCodes(txtItems, jsonItems) {
    const existingCodes = new Set();
    if(jsonItems.Items) {
        for (const hero in jsonItems.Items) {
            jsonItems.Items[hero].forEach(item => existingCodes.add(item.code));
        }
    }
    return txtItems.filter(item => !existingCodes.has(item.code));
}

function categorizeItemsByHero(items) {
    const categorizedItems = { Items: {} };
    items.forEach(item => {
        const hero = heroNames.find(hero => item.name.includes(hero));
        if (hero) {
            if (!categorizedItems.Items[hero]) categorizedItems.Items[hero] = [];
            categorizedItems.Items[hero].push({ code: item.code, name: item.name });
        }
    });
    return categorizedItems;
}

function main() {
    const txtItems = parseTxtFile(txtFilePath);
    const jsonItems = parseJsonFile(jsonFilePath);
    const newItems = checkNewCodes(txtItems, jsonItems);

    if (newItems.length > 0) {
        const categorizedNewItems = categorizeItemsByHero(newItems);
        fs.writeFileSync(newJsonFilePath, JSON.stringify(categorizedNewItems, null, 2), 'utf-8');
        console.log('New items found and saved to NewSkins.json');
    } else {
        console.log('No new items found.');
    }
}

main();
