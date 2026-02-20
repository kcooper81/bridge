const puppeteer = require("puppeteer");
const path = require("path");

// White logo mark on dark rounded background
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 320.9" fill="none">
  <circle cx="157.7" cy="167.7" r="23.2" fill="#ffffff"/>
  <circle cx="279.7" cy="167.7" r="23.2" fill="#ffffff"/>
  <path fill="#ffffff" d="M351.4,68.2c-21.3-10.5-52.4-13.8-77.1-23.6-33-13-46.9-25.1-55.8-25.1s-16.8,8.2-49.1,21.6c-25.9,10.8-49.8,16.2-68,21.1C51.1,72.3,13.2,116.6,13.2,169.8v17.8c0,60.6,49.1,109.7,109.7,109.7h221.8s-12.9-51.6-56.3-51.6h-150c-38.5,0-69.8-31.8-69.8-71.1v-.5c0-39.3,31.2-71.1,69.8-71.1h150.2c38.5,0,69.8,31.8,69.8,71.1v.5c0,1.5,0,2.9-.1,4.3-.9,16-1.4,84.7-1.5,107.8,37.2-17.6,62.9-55.3,62.9-99.1v-17.8c0-46-28.3-85.4-68.5-101.7Z"/>
</svg>`;

function iconHTML(size) {
  // Dark rounded box fills the full icon, logo inside with padding
  const radius = Math.round(size * 0.22); // ~22% corner radius
  const padding = Math.round(size * 0.15);
  const logoSize = size - padding * 2;
  return `<!DOCTYPE html>
<html>
<head><style>
  * { margin: 0; padding: 0; }
  body {
    width: ${size}px;
    height: ${size}px;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .icon-bg {
    width: ${size}px;
    height: ${size}px;
    background: #1a1d2e;
    border-radius: ${radius}px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  svg { width: ${logoSize}px; height: auto; }
</style></head>
<body><div class="icon-bg">${LOGO_SVG}</div></body>
</html>`;
}

async function main() {
  console.log("Generating extension icons (white logo on dark rounded box)...\n");

  const browser = await puppeteer.launch({ headless: "new" });
  const sizes = [16, 32, 48, 128];

  for (const size of sizes) {
    const page = await browser.newPage();
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    await page.setContent(iconHTML(size), { waitUntil: "load" });
    const outputPath = path.join(__dirname, "..", "public", "icons", `icon-${size}.png`);
    await page.screenshot({ path: outputPath, type: "png", omitBackground: true });
    await page.close();
    console.log(`✓ icon-${size}.png`);
  }

  // Store icon at 128px
  const page = await browser.newPage();
  await page.setViewport({ width: 128, height: 128, deviceScaleFactor: 1 });
  await page.setContent(iconHTML(128), { waitUntil: "load" });
  await page.screenshot({
    path: path.join(__dirname, "store-icon-128.png"),
    type: "png",
    omitBackground: true,
  });
  await page.close();
  console.log("✓ store-icon-128.png");

  await browser.close();
  console.log("\nDone! Icons saved to extension/public/icons/");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
