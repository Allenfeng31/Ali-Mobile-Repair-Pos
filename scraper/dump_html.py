import sys
import os
import json
from playwright.sync_api import sync_playwright

def dump_html():
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
                    if ss in ['strict', 'lax', 'none']:
                        cc['sameSite'] = ss.capitalize()
                    else:
                        cc['sameSite'] = 'Lax'
                    cleaned_cookies.append(cc)
                context.add_cookies(cleaned_cookies)
        
        page = context.new_page()
        print(f"Navigating to {url}...")
        page.goto(url, wait_until="networkidle", timeout=60000)
        
        print("Capturing HTML...")
        content = page.content()
        with open("/Users/allen/Documents/GitHub/Ali-Mobile-Repair-Pos/scraper/debug_html.txt", "w", encoding="utf-8") as f:
            f.write(content)
        
        browser.close()
        print("Done. Saved to /Users/allen/Documents/GitHub/Ali-Mobile-Repair-Pos/scraper/debug_html.txt")

if __name__ == "__main__":
    dump_html()
