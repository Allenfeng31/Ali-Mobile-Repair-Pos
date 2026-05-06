import os
import json
import time
from playwright.sync_api import sync_playwright

COOKIES_FILE = "cookies.json"

def get_cookies():
    cookies = []
    if os.path.exists(COOKIES_FILE):
        try:
            with open(COOKIES_FILE, 'r') as f:
                cookies_raw = json.load(f)
                allowed_keys = {'name', 'value', 'url', 'domain', 'path', 'expires', 'httpOnly', 'secure', 'sameSite'}
                for c in cookies_raw:
                    clean_c = {k: v for k, v in c.items() if k in allowed_keys}
                    if 'expirationDate' in c:
                        clean_c['expires'] = int(c['expirationDate'])
                    if 'domain' not in c and 'url' not in c:
                        clean_c['url'] = "https://www.thepartshome.com.au"
                    ss = c.get('sameSite', '').lower()
                    if ss == 'unspecified' or not ss:
                        clean_c['sameSite'] = 'Lax'
                    else:
                        clean_c['sameSite'] = ss.capitalize()
                    cookies.append(clean_c)
        except Exception as e:
            print(f"Failed to load cookies: {e}")
    return cookies

def diagnostic_product():
    # Example product with potential variants
    url = "https://www.thepartshome.com.au/iphone-13-pro-max-lcd-screen-replacement-assembly-with-touch-and-frame-aftermarket-high-quality-oled-tph-soft.html"
    cookies = get_cookies()
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
        )
        if cookies:
            context.add_cookies(cookies)
            
        page = context.new_page()
        print(f"Navigating to {url}...")
        page.goto(url, wait_until="load", timeout=60000)
        
        # Wait for price elements
        try:
            page.wait_for_selector(".product-info-main .price", timeout=20000)
            print("Price elements found on product page.")
        except:
            print("Warning: Price elements not found on product page.")
            
        # Check for dropdowns or swatches
        options = page.query_selector_all(".product-custom-option, .swatch-option, select.super-attribute-select")
        print(f"Found {len(options)} product options.")
        
        for i, opt in enumerate(options):
            print(f"Option {i}: {opt.get_attribute('name')} / {opt.get_attribute('class')}")
            
        content = page.content()
        with open("product_detail_diagnostic.html", "w") as f:
            f.write(content)
        print("Saved HTML to product_detail_diagnostic.html")
        
        page.screenshot(path="product_detail_diagnostic.png", full_page=True)
        print("Saved screenshot to product_detail_diagnostic.png")
        
        browser.close()

if __name__ == "__main__":
    diagnostic_product()
