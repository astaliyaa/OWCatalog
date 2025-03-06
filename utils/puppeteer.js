const puppeteer = require('puppeteer');
const { exec } = require('child_process');

async function launchChrome() {
    const command = '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9222';
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }

        console.log(`stdout: ${stdout}`);
    });
}
async function getAccessToken() {
    try {
        await new Promise(resolve => setTimeout(resolve, 6000));
        const browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222', // Use 127.0.0.1 instead of localhost
            defaultViewport: null
        });

        const pages = await browser.pages();
        console.log(`Opened pages: ${pages.length}`);

        const page = await browser.newPage();
        await page.goto('https://eu.shop.battle.net');
        
        await new Promise(resolve => setTimeout(resolve, 15000)); // Wait for 6 seconds to allow the site to load

        const cookies = await page.cookies();
        const accessTokenCookie = cookies.find(cookie => cookie.name === 'access_token');
        
        return accessTokenCookie.value;
        await browser.close();
    } catch (error) {
        console.error("Error connecting to Chrome:", error);
    }
}

module.exports = { getAccessToken, launchChrome };