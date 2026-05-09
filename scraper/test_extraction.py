import sys
import os
import json
from playwright.sync_api import sync_playwright
from scrapling import Response

def test_extraction():
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
        print(f"Fetching {url}...")
        page.goto(url, wait_until="networkidle", timeout=60000)
        
        content = page.content()
        response = Response(url=url, text=content, body=content.encode('utf-8'), status=200)
        
        item_nodes = response.css("li.product-item")
        print(f"Found {len(item_nodes)} items.")
        
        for i, item in enumerate(item_nodes[:5]):
            link_node = item.css_first("a.product-item-link")
            title = link_node.text.strip() if link_node else "N/A"
            
            price_float = 0.0
            price_wrapper = item.css_first(".price-excluding-tax") or item.css_first("[data-price-type='basePrice']")
            if not price_wrapper:
                price_wrapper = item.css_first(".price-including-tax") or item.css_first("[data-price-type='finalPrice']")
            
            if price_wrapper:
                amount_node = price_wrapper.css_first("[data-price-amount]") or price_wrapper
                amount_attr = amount_node.attrib.get("data-price-amount")
                if amount_attr:
                    try: price_float = float(amount_attr)
                    except: pass
                
                if price_float == 0.0:
                    price_text = price_wrapper.css_first(".price")
                    if not price_text: price_text = price_wrapper
                    try:
                        clean_text = price_text.text.strip().replace("AU$", "").replace("$", "").replace(",", "").strip()
                        if clean_text: price_float = float(clean_text)
                    except: pass
            
            print(f"Item {i+1}: {title} | Price: {price_float}")
            
        browser.close()

if __name__ == "__main__":
    test_extraction()
