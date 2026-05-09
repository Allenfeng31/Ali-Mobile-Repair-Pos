import os
import sys
import time
import json
import re
import argparse
import random
import warnings
import logging
from datetime import datetime
from dotenv import load_dotenv
from scrapling.engines.toolbelt.custom import Response
from playwright.sync_api import sync_playwright
from supabase import create_client, Client

# Configure Background Logging
LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scraper_background.log')
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    force=True
)

# Load env variables
load_dotenv()

# We look for server/.env if run from the project root
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(ROOT_DIR, 'server', '.env'))

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.error("VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
COOKIES_FILE = os.path.join(os.path.dirname(__file__), "cookies.json")

def get_cookies():
    """Load and clean cookies from cookies.json for Playwright injection.
    Returns a list of cookie dicts, or an empty list on failure."""
    if not os.path.exists(COOKIES_FILE):
        logging.critical("CRITICAL: cookies.json not found or invalid. Scraper will fail to see wholesale prices.")
        return []

    try:
        with open(COOKIES_FILE, 'r') as f:
            cookies_raw = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        logging.critical(f"CRITICAL: cookies.json not found or invalid. Scraper will fail to see wholesale prices. Error: {e}")
        return []

    if not isinstance(cookies_raw, list) or len(cookies_raw) == 0:
        logging.critical("CRITICAL: cookies.json not found or invalid. Scraper will fail to see wholesale prices.")
        return []

    cookies = []
    allowed_keys = {'name', 'value', 'url', 'domain', 'path', 'expires', 'httpOnly', 'secure', 'sameSite'}
    for c in cookies_raw:
        clean_c = {k: v for k, v in c.items() if k in allowed_keys}
        # Playwright uses 'expires' (epoch seconds), browser extensions export 'expirationDate'
        if 'expirationDate' in c:
            clean_c['expires'] = int(c['expirationDate'])
        # Playwright requires either 'domain' or 'url' on each cookie
        if 'domain' in c:
            clean_c['domain'] = c['domain']
        else:
            clean_c['url'] = "https://www.thepartshome.com.au"
        # Normalize sameSite to Playwright's expected casing
        ss = c.get('sameSite', '').lower()
        clean_c['sameSite'] = ss.capitalize() if ss and ss != 'unspecified' else 'Lax'
        cookies.append(clean_c)

    logging.info(f"Loaded {len(cookies)} cookies from cookies.json")
    return cookies

def scrape_tph_category(url: str, cookies=None):
    logging.info(f"Starting scrape: {url}")
    items_scraped = []
    debug_dir = os.path.dirname(os.path.abspath(__file__))
    
    if not cookies:
        logging.critical("CRITICAL: No cookies provided to scraper. Aborting — wholesale prices won't be visible.")
        return items_scraped

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36")
        context.add_cookies(cookies)
        logging.info(f"Injected {len(cookies)} cookies into browser context.")
        page = context.new_page()
        
        page_num = 1
        has_more_items = True
        while has_more_items and page_num <= 20:
            sep = "&" if "?" in url else "?"
            paginated_url = f"{url}{sep}p={page_num}"
            logging.info(f"Fetching page {page_num}: {paginated_url}")
            
            try:
                # 1. Strict Timeout to Prevent Hanging
                page.goto(paginated_url, wait_until="load", timeout=30000)
                
                # 2. Visual Debugging: Screenshot the first page
                if page_num == 1:
                    screenshot_path = os.path.join(debug_dir, "scraper_debug_page1.png")
                    page.screenshot(path=screenshot_path, full_page=True)
                    logging.info(f"Screenshot saved to {screenshot_path}")

                    # 2b. Authentication Check: Detect unauthenticated state
                    logging.info("Checking authentication state...")
                    try:
                        page_text = page.inner_text("body", timeout=10000)
                        if "login to check" in page_text.lower() or "login to see" in page_text.lower():
                            logging.critical("AUTH FAILURE: Page shows 'Login to check stock and price'. Cookies are expired or invalid. Aborting scrape.")
                            html_path = os.path.join(debug_dir, "debug_html.txt")
                            with open(html_path, "w", encoding="utf-8") as f:
                                f.write(page.content())
                            browser.close()
                            return items_scraped
                        logging.info("Authentication verified (wholesale prices visible).")
                    except Exception as ae:
                        logging.warning(f"Auth check timed out or failed: {str(ae)}. Continuing anyway...")

                logging.info(f"Waiting for .product-item on page {page_num}...")
                page.wait_for_selector(".product-item", timeout=15000)
                
                logging.info("Scrolling to bottom to trigger lazy loading...")
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                time.sleep(2)
                
                logging.info("Capturing page content...")
            except Exception as e:
                logging.error(f"Timeout or Error during page preparation (page {page_num}): {str(e)}")
                # 3. DOM Dump for Zero Items
                if page_num == 1:
                    html_path = os.path.join(debug_dir, "debug_html.txt")
                    with open(html_path, "w", encoding="utf-8") as f:
                        f.write(page.content())
                    logging.info(f"DOM dump saved to {html_path}")
                break
                
            content = page.content()
            logging.info("Content captured. Parsing with Scrapling...")
            response = Response(url=paginated_url, text=content, body=content.encode('utf-8'), status=200)
            
            # Updated Selectors based on debug_html.txt analysis
            item_nodes = response.css("li.product-item")
            
            if not item_nodes:
                logging.warning(f"No item nodes (li.product-item) found on page {page_num}.")
                # Fallback check for any item info
                item_nodes = response.css(".product-item-info")
                if not item_nodes:
                    logging.error(f"ABORTING: No items found on page {page_num} after all waits.")
                    break

            logging.info(f"Found {len(item_nodes)} item nodes on page {page_num}.")

            page_items_count = 0
            for idx, item in enumerate(item_nodes):
                try:
                    # 1. Improved Title & Link Extraction
                    link_node = item.css_first("a.product-item-link")
                    if not link_node:
                        link_node = item.css_first(".product-item-name a")
                        
                    raw_url = link_node.attrib.get("href", "") if link_node else ""
                    raw_title = link_node.text.strip() if link_node else ""
                    
                    if not raw_title or not raw_url:
                        logging.warning(f"  Item {idx}: Skipped — missing title or URL")
                        continue

                    # 2. Robust Price Extraction (Prioritize Excl. GST)
                    price_float = 0.0
                    price_source = "none"
                    
                    # Try data attributes first (most reliable)
                    price_wrapper = item.css_first(".price-excluding-tax") or item.css_first("[data-price-type='basePrice']")
                    if price_wrapper:
                        price_source = "excl-tax"
                    else:
                        price_wrapper = item.css_first(".price-including-tax") or item.css_first("[data-price-type='finalPrice']")
                        if price_wrapper:
                            price_source = "incl-tax"
                    
                    if price_wrapper:
                        # Check data-price-amount attribute
                        amount_node = price_wrapper.css_first("[data-price-amount]") or price_wrapper
                        amount_attr = amount_node.attrib.get("data-price-amount")
                        if amount_attr:
                            try:
                                # Aggressive sanitize: strip everything except digits and decimal
                                sanitized = re.sub(r'[^\d.]', '', str(amount_attr))
                                if sanitized:
                                    price_float = float(sanitized)
                                    price_source += "/attr"
                            except Exception as pe:
                                logging.warning(f"  Item {idx}: data-price-amount parse error: {pe} (raw='{amount_attr}')")
                        
                        # Fallback to text parsing if amount_attr failed or was 0
                        if price_float == 0.0:
                            price_text_node = price_wrapper.css_first(".price")
                            if not price_text_node:
                                price_text_node = price_wrapper
                            try:
                                raw_price_text = price_text_node.text.strip()
                                # Aggressive sanitize: strip ALL non-numeric except decimal
                                sanitized = re.sub(r'[^\d.]', '', raw_price_text)
                                if sanitized:
                                    price_float = float(sanitized)
                                    price_source += "/text"
                            except Exception as pe:
                                logging.warning(f"  Item {idx}: text price parse error: {pe} (raw='{raw_price_text}')")
                    
                    # 3. Stock Status
                    stock_status = "In Stock"
                    stock_node = item.css_first(".stock.unavailable")
                    if stock_node or price_float == 0.0:
                        stock_status = "Out of Stock"

                    items_scraped.append({
                        "raw_url": raw_url,
                        "raw_title": raw_title,
                        "current_price": price_float,
                        "stock_status": stock_status
                    })
                    page_items_count += 1

                    # Debug: Log first 3 items per page for visibility
                    if page_items_count <= 3:
                        logging.info(f"  SAMPLE [{page_items_count}]: '{raw_title[:60]}...' | ${price_float:.2f} ({price_source}) | {stock_status}")

                except Exception as e:
                    logging.error(f"  Item {idx}: EXTRACTION ERROR: {str(e)}")

            logging.info(f"Extracted {page_items_count} valid items from page {page_num} DOM. (Total so far: {len(items_scraped)})")

            if len(item_nodes) < 10:
                has_more_items = False
            else:
                page_num += 1

        browser.close()
    logging.info(f"Scrape complete for {url}. Total items extracted: {len(items_scraped)}")
    return items_scraped

def upsert_to_supabase(supplier_name: str, items: list):
    if not items:
        logging.warning("upsert_to_supabase called with 0 items. Nothing to do.")
        return []
    
    logging.info(f"Attempting to upsert {len(items)} records to Supabase...")
    logging.info(f"  SUPABASE_URL: {'SET (' + SUPABASE_URL[:30] + '...)' if SUPABASE_URL else 'NOT SET!'}")
    logging.info(f"  SUPABASE_KEY: {'SET (' + SUPABASE_KEY[:8] + '...)' if SUPABASE_KEY else 'NOT SET!'}")
    
    # Resolve supplier ID
    try:
        sup_res = supabase.table("suppliers").select("id").eq("name", supplier_name).execute()
    except Exception as e:
        logging.error(f"SUPABASE QUERY FAILED (suppliers lookup): {str(e)}")
        return []
    
    if not sup_res.data:
        logging.error(f"SUPPLIER NOT FOUND: No supplier with name '{supplier_name}' in the database. Cannot upsert.")
        return []
    
    supplier_id = sup_res.data[0]['id']
    logging.info(f"  Resolved supplier '{supplier_name}' -> ID: {supplier_id}")
    upserted_records = []
    errors = 0

    for i, item in enumerate(items):
        try:
            payload = {
                "supplier_id": supplier_id,
                "raw_url": item["raw_url"],
                "raw_title": item["raw_title"],
                "current_price": item["current_price"],
                "stock_status": item["stock_status"],
                "last_scraped_at": datetime.utcnow().isoformat()
            }
            
            existing = supabase.table("raw_supplier_items").select("id, current_price").eq("supplier_id", supplier_id).or_(f"raw_url.eq.{item['raw_url']},raw_title.eq.{item['raw_title']}").limit(1).execute()

            raw_item_id = None
            price_changed = False
            if existing.data:
                raw_item_id = existing.data[0]["id"]
                if float(existing.data[0]["current_price"]) != float(item["current_price"]):
                    price_changed = True
                supabase.table("raw_supplier_items").update(payload).eq("id", raw_item_id).execute()
            else:
                res = supabase.table("raw_supplier_items").insert(payload).execute()
                if res.data:
                    raw_item_id = res.data[0]["id"]
                    price_changed = True

            if raw_item_id:
                upserted_records.append({"raw_item_id": raw_item_id, "raw_title": item["raw_title"]})
                if price_changed:
                    supabase.table("price_history").insert({"raw_item_id": raw_item_id, "price": item["current_price"]}).execute()
        except Exception as e:
            errors += 1
            logging.error(f"SUPABASE UPSERT FAILED on item {i} ('{item.get('raw_title', '?')[:50]}'): {str(e)}")
            
    logging.info(f"Upsert complete: {len(upserted_records)} succeeded, {errors} failed out of {len(items)} total.")
    return upserted_records

def normalize_title(title: str):
    t = title.lower()
    t = re.sub(r'(apple|iphone\s+\d+(?:\s+(?:pro\s+max|pro|mini|plus))?|ipad\s+(?:pro|air|mini)?(?:\s+\d+(?:st|nd|rd|th)\s+gen)?|se\s+\d+|x[rs]?)', '', t)
    colors = ["space grey", "silver", "gold", "midnight", "starlight", "blue", "red", "pink", "green", "purple", "black", "white"]
    for color in colors:
        t = t.replace(f" {color}", "").replace(f"-{color}", "")
    t = re.split(r'\s+[-/]\s+', t)[0]
    t = t.replace("|", "").replace("[", "").replace("]", "")
    return re.sub(r'\s+', ' ', t).strip()

def map_items_to_catalog(upserted_items: list):
    if not upserted_items: return
    mapped_count = 0
    knowledge_base = {}
    historical_data = supabase.table("raw_supplier_items").select("raw_title, item_mapping(master_catalog_id)").execute()
    if historical_data.data:
        for row in historical_data.data:
            if row.get('item_mapping'):
                mappings = row['item_mapping']
                m_id = mappings[0].get('master_catalog_id') if isinstance(mappings, list) and mappings else mappings.get('master_catalog_id') if isinstance(mappings, dict) else None
                if m_id:
                    knowledge_base[normalize_title(row['raw_title'])] = m_id

    for item in upserted_items:
        master_id = knowledge_base.get(normalize_title(item['raw_title']))
        if master_id:
            map_res = supabase.table("item_mapping").select("raw_item_id").eq("raw_item_id", item['raw_item_id']).execute()
            if not map_res.data:
                supabase.table("item_mapping").insert({"raw_item_id": item['raw_item_id'], "master_catalog_id": master_id}).execute()
                mapped_count += 1
    logging.info(f"Auto-mapped {mapped_count} items based on history.")

def main():
    logging.info("="*60)
    logging.info("Starting background catalog sync...")
    logging.info(f"  Python: {sys.version}")
    logging.info(f"  CWD: {os.getcwd()}")
    logging.info(f"  SUPABASE_URL: {'SET' if SUPABASE_URL else 'NOT SET!'}")
    logging.info(f"  SUPABASE_KEY: {'SET' if SUPABASE_KEY else 'NOT SET!'}")
    logging.info("="*60)
    
    cookies = get_cookies()
    
    if not cookies:
        logging.critical("ABORTING SYNC: Could not load cookies. Fix cookies.json and retry.")
        return
    
    supplier_name = "The Parts Home"
    
    categories = [
        {"name": "iPhone 13", "url": "https://www.thepartshome.com.au/apple/iphone-parts/iphone-13-2021.html"},
        {"name": "iPhone 13 mini", "url": "https://www.thepartshome.com.au/apple/iphone-parts/iphone-13-mini-2021.html"},
        {"name": "iPhone 13 Pro", "url": "https://www.thepartshome.com.au/apple/iphone-parts/iphone-13-pro-2021.html"},
        {"name": "iPhone 13 Pro Max", "url": "https://www.thepartshome.com.au/apple/iphone-parts/iphone-13-pro-max-2021.html"},
        {"name": "iPhone 14", "url": "https://www.thepartshome.com.au/apple/iphone-parts/iphone-14-2022.html"},
        {"name": "iPhone 14 Plus", "url": "https://www.thepartshome.com.au/apple/iphone-parts/iphone-14-plus-2022.html"},
        {"name": "iPhone 14 Pro", "url": "https://www.thepartshome.com.au/apple/iphone-parts/iphone-14-pro-2022.html"},
        {"name": "iPhone 14 Pro Max", "url": "https://www.thepartshome.com.au/apple/iphone-parts/iphone-14-pro-max-2022.html"},
        {"name": "MacBooks", "url": "https://www.thepartshome.com.au/apple/macbook-parts.html"}
    ]

    for cat in categories:
        data = scrape_tph_category(cat['url'], cookies=cookies)
        if data:
            records = upsert_to_supabase(supplier_name, data)
            map_items_to_catalog(records)
            logging.info(f"Successfully synced {cat['name']}")
        
        time.sleep(random.randint(5, 10))
    
    logging.info("Background sync completed successfully.")

if __name__ == "__main__":
    main()
