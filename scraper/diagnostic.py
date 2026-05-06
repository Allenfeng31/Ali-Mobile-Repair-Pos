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

def diagnostic():
    url = "https://www.thepartshome.com.au/apple/iphone-parts/iphone-13-pro-max-2021.html"
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
        
        # Scroll to trigger lazy loading
        page.evaluate("window.scrollTo(0, document.body.scrollHeight/2)")
        time.sleep(2)
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)
        
        # Wait for price elements
        try:
            page.wait_for_selector(".product-item .price", timeout=20000)
            print("Price elements found.")
        except:
            print("Warning: Price elements not found.")
            
        content = page.content()
        with open("iphone13promax_diagnostic.html", "w") as f:
            f.write(content)
        print("Saved HTML to iphone13promax_diagnostic.html")
        
        page.screenshot(path="iphone13promax_diagnostic.png", full_page=True)
        print("Saved screenshot to iphone13promax_diagnostic.png")
        
        # Check specifically for a product with "As low as" or variants
        items = page.query_selector_all(".item.product.product-item")
        print(f"Found {len(items)} items.")
        
        for i, item in enumerate(items[:5]): # Check first 5
            title_node = item.query_selector(".product-item-link")
            title = title_node.inner_text() if title_node else "No Title"
            price_box = item.query_selector(".price-box")
            price_html = price_box.inner_html() if price_box else "No Price Box"
            print(f"Item {i}: {title}")
            print(f"Price HTML: {price_html}")
            print("-" * 20)
            
        browser.close()

if __name__ == "__main__":
    diagnostic()
