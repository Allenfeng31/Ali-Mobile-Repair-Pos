const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.new_context({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36'
  });
  
  // Load cookies if exist
  if (fs.existsSync('cookies.json')) {
    const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
    // Clean cookies for playwright
    const cleanCookies = cookies.map(c => ({
        name: c.name,
        value: c.value,
        domain: c.domain || 'www.thepartshome.com.au',
        path: c.path || '/',
        expires: c.expirationDate || undefined,
        httpOnly: c.httpOnly || false,
        secure: c.secure || false,
        sameSite: (c.sameSite || 'Lax').charAt(0).toUpperCase() + (c.sameSite || 'Lax').slice(1).toLowerCase()
    }));
    await context.addCookies(cleanCookies);
  }

  const page = await context.newPage();
  const url = 'https://www.thepartshome.com.au/apple/iphone-parts/iphone-13-pro-max-2021.html';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  
  // Wait for prices
  await page.waitForSelector('.product-item .price', { timeout: 30000 }).catch(() => console.log('Timeout waiting for prices'));
  
  const content = await page.content();
  fs.writeFileSync('iphone13promax_debug.html', content);
  console.log('Saved HTML to iphone13promax_debug.html');
  
  await page.screenshot({ path: 'iphone13promax_debug.png', fullPage: true });
  console.log('Saved screenshot to iphone13promax_debug.png');

  await browser.close();
})();
