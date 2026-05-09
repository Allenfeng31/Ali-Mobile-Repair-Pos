import sys
import os
import json
import logging
from playwright.sync_api import sync_playwright
from scrapling import Response

# Set up logging to file
LOG_FILE = "/Users/allen/Documents/GitHub/Ali-Mobile-Repair-Pos/scraper/test_verify.log"
logging.basicConfig(filename=LOG_FILE, level=logging.INFO, force=True)

def test_verify():
    url = "https://www.thepartshome.com.au/apple/iphone-parts/iphone-13-2021.html"
    cookies_path = "/Users/allen/Documents/GitHub/Ali-Mobile-Repair-Pos/scraper/cookies.json"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36")
        
        if os.path.exists(cookies_path):
            with open(cookies_path, 'r') as f:
                cookies = json.load(f)
                cleaned_cookies = []
                for c in cookies:
                    cc = {k: v for k, v in c.items() if k in {'name', 'value', 'url', 'domain', 'path', 'expires', 'httpOnly', 'secure', 'sameSite'}}
                    if 'expirationDate' in c: cc['expires'] = int(c['expirationDate'])
                    if 'domain' in c: cc['domain'] = c['domain']
                    else: cc['url'] = "https://www.thepartshome.com.au"
                    ss = c.get('sameSite', '').lower()
                    if ss in ['strict', 'lax', 'none']: cc['sameSite'] = ss.capitalize()
                    else: cc['sameSite'] = 'Lax'
                    cleaned_cookies.append(cc)
                context.add_cookies(cleaned_cookies)
        
        page = context.new_page()
        logging.info(f"Navigating to {url}")
        page.goto(url, wait_until="networkidle", timeout=60000)
        
        content = page.content()
        response = Response(url=url, text=content, body=content.encode('utf-8'), status=200)
        
        item_nodes = response.css("li.product-item")
        logging.info(f"Found {len(item_nodes)} items.")
        
        # Write result to a marker file
        with open("/Users/allen/Documents/GitHub/Ali-Mobile-Repair-Pos/scraper/verify_marker.txt", "w") as f:
            f.write(f"Items found: {len(item_nodes)}")
            
        browser.close()

if __name__ == "__main__":
    test_verify()
