const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testRecord() {
  const videoDir = path.join(process.cwd(), 'videos');
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: videoDir,
      size: { width: 1280, height: 720 },
    },
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  await context.close();
  await browser.close();

  const files = fs.readdirSync(videoDir);
  console.log('Video files generated:', files);
}

testRecord().catch(console.error);
