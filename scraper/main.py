import os
import sys
import time
import json
import re
from datetime import datetime
from dotenv import load_dotenv
from scrapling.engines.toolbelt.custom import Response
from playwright.sync_api import sync_playwright
from supabase import create_client, Client

# Load env variables
load_dotenv()

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Cookie management file
COOKIES_FILE = "cookies.json"

def get_cookies():
    """
    Loads and cleans cookies for Playwright.
    """
    cookies = []
    if os.path.exists(COOKIES_FILE):
        print(f"Loading cached cookies from {COOKIES_FILE}...")
        try:
            with open(COOKIES_FILE, 'r') as f:
                cookies_raw = json.load(f)
                allowed_keys = {'name', 'value', 'url', 'domain', 'path', 'expires', 'httpOnly', 'secure', 'sameSite'}
                for c in cookies_raw:
                    clean_c = {k: v for k, v in c.items() if k in allowed_keys}
                    if 'expirationDate' in c:
                        clean_c['expires'] = int(c['expirationDate'])
                    
                    # Ensure domain is set exactly as in the source JSON
                    if 'domain' in c:
                        clean_c['domain'] = c['domain']
                    else:
                        clean_c['url'] = "https://www.thepartshome.com.au"
                    
                    ss = c.get('sameSite', '').lower()
                    if ss == 'unspecified' or not ss:
                        clean_c['sameSite'] = 'Lax'
                    else:
                        # Map to Playwright expected values: 'Strict', 'Lax', 'None'
                        clean_c['sameSite'] = ss.capitalize()
                    
                    cookies.append(clean_c)
        except Exception as e:
            print(f"Failed to load cookies: {e}")
    return cookies

def scrape_tph_category(url: str, cookies=None):
    """
    Uses direct Playwright for multi-page scraping with cookies.
    Constructs pagination URLs directly for maximum reliability.
    """
    print(f"Scraping category: {url}")
    
    items_scraped = []
    
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
        )
        
        if cookies:
            print(f"Injecting {len(cookies)} cookies...")
            context.add_cookies(cookies)
            
        page = context.new_page()
        
        page_num = 1
        has_more_items = True

        while has_more_items and page_num <= 15:
            # Construct pagination URL
            sep = "&" if "?" in url else "?"
            paginated_url = f"{url}{sep}p={page_num}"
            print(f"Scraping page {page_num}: {paginated_url}")
            
            page.goto(paginated_url, wait_until="load", timeout=60000)
            
            # Wait for products to render
            try:
                page.wait_for_selector(".product-item", timeout=15000)
                # Scroll to trigger any lazy loading logic
                page.evaluate("window.scrollTo(0, document.body.scrollHeight/2)")
                time.sleep(1)
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                time.sleep(2)
            except:
                print(f"No items found on page {page_num} or timed out. Saving screenshot for debug...")
                page.screenshot(path="debug_page.png")
                break
                
            content = page.content()
            response = Response(
                url=paginated_url, 
                text=content, 
                body=content.encode('utf-8'),
                status=200,
                reason='OK',
                cookies={},
                headers={},
                request_headers={}
            )
            # Fallback selectors for robustness
            item_nodes = response.css("ol.products.list.items.product-items .product-item")
            if not item_nodes:
                item_nodes = response.css(".product-item")
            
            if not item_nodes:
                print(f"No item nodes parsed on page {page_num}. Ending.")
                break

            print(f"Found {len(item_nodes)} items on page {page_num}.")
            
            for item in item_nodes:
                try:
                    link_node = item.css_first(".product-item-link")
                    raw_url = link_node.attrib.get("href", "") if link_node else ""
                    raw_title = link_node.text.strip() if link_node else ""
                    
                    price_box = item.css_first(".price-box")
                    price_float = 0.0
                    
                    if price_box:
                        price_wrapper = price_box.css_first("[data-price-type='basePrice']")
                        is_incl_gst = False
                        if not price_wrapper:
                            price_wrapper = price_box.css_first("[data-price-type='finalPrice']")
                            is_incl_gst = True
                        
                        if not price_wrapper:
                            price_wrapper = price_box.css_first(".price")
                            is_incl_gst = False

                        if price_wrapper:
                            price_amount_attr = price_wrapper.attrib.get("data-price-amount")
                            if price_amount_attr:
                                price_float = float(price_amount_attr)
                            else:
                                price_text = price_wrapper.text.strip()
                                # Handle "Login for price" text
                                if any(kw in price_text.lower() for kw in ["login", "check price", "unavailable"]):
                                    price_float = 0.0
                                else:
                                    try:
                                        price_float = float(price_text.replace("AU$", "").replace("$", "").replace(",", "").strip())
                                    except:
                                        price_float = 0.0

                            if is_incl_gst and price_float > 0:
                                price_float = round(price_float / 1.1, 2)
                    
                    # If price is 0, we still scrape the item so it shows up in "Uncategorized" as manual review
                    stock_node = item.css_first(".stock")
                    stock_status = "In Stock" if stock_node and "available" in stock_node.attrib.get("class", "").lower() else "Out of Stock"

                    items_scraped.append({
                        "raw_url": raw_url,
                        "raw_title": raw_title,
                        "current_price": price_float,
                        "stock_status": stock_status
                    })
                except Exception as e:
                    print(f"Error parsing item: {e}")

            # If we got fewer than 10 items, it's likely the last page
            if len(item_nodes) < 10:
                print("Likely last page reached.")
                has_more_items = False
            else:
                page_num += 1

        browser.close()
    
    return items_scraped

def upsert_to_supabase(supplier_name: str, items: list):
    """
    Upserts raw items to Supabase and logs price history if changed.
    Returns a list of dicts containing raw_item_id and raw_title for mapping.
    """
    if not items:
        return []

    # 1. Get or create supplier
    sup_res = supabase.table("suppliers").select("id").eq("name", supplier_name).execute()
    if not sup_res.data:
        print(f"Supplier {supplier_name} not found in DB. Please insert it first.")
        return []
    supplier_id = sup_res.data[0]['id']

    upserted_records = []

    for item in items:
        payload = {
            "supplier_id": supplier_id,
            "raw_url": item["raw_url"],
            "raw_title": item["raw_title"],
            "current_price": item["current_price"],
            "stock_status": item["stock_status"],
            "last_scraped_at": datetime.utcnow().isoformat()
        }

        # Robust Deduplication Check: Check by URL OR by Title for the same supplier
        existing = supabase.table("raw_supplier_items")\
            .select("id, current_price")\
            .eq("supplier_id", supplier_id)\
            .or_(f"raw_url.eq.{item['raw_url']},raw_title.eq.{item['raw_title']}")\
            .limit(1)\
            .execute()

        raw_item_id = None
        price_changed = False

        if existing.data:
            raw_item_id = existing.data[0]["id"]
            old_price = existing.data[0]["current_price"]
            if float(old_price) != float(item["current_price"]):
                price_changed = True
            
            supabase.table("raw_supplier_items").update(payload).eq("id", raw_item_id).execute()
        else:
            res = supabase.table("raw_supplier_items").insert(payload).execute()
            if res.data:
                raw_item_id = res.data[0]["id"]
                price_changed = True

        if raw_item_id:
            upserted_records.append({
                "raw_item_id": raw_item_id,
                "raw_title": item["raw_title"]
            })

        if price_changed and raw_item_id:
            supabase.table("price_history").insert({
                "raw_item_id": raw_item_id,
                "price": item["current_price"]
            }).execute()
            print(f"Recorded price change for {item['raw_title']}: ${item['current_price']}")
            
    return upserted_records

def normalize_title(title: str):
    """
    Advanced Normalization for Cross-Model Learning.
    Strips brands, models, and colors to extract the core 'Part Identity'.
    Example: 'iPhone 13 Pro Max Flash Light Flex Cable' -> 'flash light flex cable'
    """
    t = title.lower()
    
    # 1. Strip Model/Brand Identifiers
    # Matches: Apple, iPhone 13 Pro Max, iPhone 13 mini, iPhone 13, etc.
    t = re.sub(r'(apple|iphone\s+\d+(?:\s+(?:pro\s+max|pro|mini|plus))?|ipad\s+(?:pro|air|mini)?(?:\s+\d+(?:st|nd|rd|th)\s+gen)?|se\s+\d+|x[rs]?)', '', t)
    
    # 2. Strip Colors/Variants
    colors = [
        "space grey", "space gray", "silver", "gold", "rose gold", "midnight", "starlight", 
        "blue", "red", "pink", "green", "purple", "sierra blue", "alpine green", "deep purple",
        "graphite", "pacific blue", "black", "white", "yellow", "coral", "starlight"
    ]
    for color in colors:
        t = t.replace(f" {color}", "").replace(f"-{color}", "")
    
    # 3. Clean up common delimiters and whitespace
    t = re.split(r'\s+[-/]\s+', t)[0]
    t = t.replace("|", "").replace("[", "").replace("]", "")
    t = re.sub(r'\s+', ' ', t).strip()
    
    return t

def auto_categorize_item(raw_title: str):
    """
    Parses the raw title to extract Brand, Model, Part Type, and Quality Tier.
    Dynamic NLP-style parsing based on keyword patterns.
    """
    title_clean = raw_title.replace("|", " ").replace("[", " [").replace("]", "] ")
    title_lower = title_clean.lower()
    
    brand = "Apple" # Default for now as requested
    device_model = "Unknown"
    part_type = "Unknown"
    quality_tier = "Standard"
    
    # 1. Extract Device Model
    # iPhone Pattern
    iphone_match = re.search(r'iphone\s+(\d+(?:\s+(?:pro\s+max|pro|mini|plus))?|se\s+\d+|x[rs]?)', title_lower)
    if iphone_match:
        words = iphone_match.group(0).split()
        words[0] = "iPhone"
        for i in range(1, len(words)):
            if words[i] in ["pro", "max", "mini", "plus", "se"]:
                words[i] = words[i].capitalize()
            elif words[i].lower() == "xr": words[i] = "XR"
            elif words[i].lower() == "xs": words[i] = "XS"
        device_model = " ".join(words)
        
    # iPad Pattern
    ipad_match = re.search(r'ipad\s+(?:pro|air|mini)?(?:\s+\d+(?:st|nd|rd|th)\s+gen)?', title_lower)
    if ipad_match:
        device_model = ipad_match.group(0).title()

    # 2. Extract Part Type (Hardcoded Priority)
    part_type_map = {
        "screen": "Screen Replacement",
        "lcd": "Screen Replacement",
        "oled": "Screen Replacement",
        "display": "Screen Replacement",
        "tempered glass": "Tempered Glass",
        "glass protector": "Tempered Glass",
        "back rear battery cover": "Back Glass / Housing",
        "housing": "Back Glass / Housing",
        "back glass": "Back Glass / Housing",
        "back cover": "Back Glass / Housing",
        "internal li-ion battery": "Battery",
        "battery": "Battery",
        "charging": "Charging Port",
        "charge port": "Charging Port",
        "front camera": "Front Camera",
        "rear camera": "Back Camera",
        "back camera": "Back Camera",
        "earpiece": "Earpiece Speaker",
        "loudspeaker": "Loudspeaker",
        "vibrator": "Taptic Engine",
        "power flex": "Power/Volume Flex",
        "volume flex": "Power/Volume Flex"
    }
    
    for kw, pt in part_type_map.items():
        if kw in title_lower:
            part_type = pt
            break

    # 3. Extract Quality / Grade
    # Priority 1: Brackets []
    brackets_match = re.findall(r'\[([^\]]+)\]', title_clean)
    if brackets_match:
        # Filter for quality-related keywords
        quality_keywords = ["soft", "hard", "incell", "oled", "premium", "value", "ohq", "original", "refurbished", "service pack", "ti", "oem"]
        found_quality = []
        for b_content in brackets_match:
            b_lower = b_content.lower()
            if any(qk in b_lower for qk in quality_keywords):
                found_quality.append(b_content.strip())
        
        if found_quality:
            quality_tier = " | ".join(found_quality)
    
    # Priority 2: Inline keywords if no brackets or generic brackets
    if quality_tier == "Standard":
        if "soft oled" in title_lower: quality_tier = "Soft OLED"
        elif "hard oled" in title_lower: quality_tier = "Hard OLED"
        elif "incell" in title_lower: quality_tier = "In-cell LCD"
        elif "original" in title_lower: quality_tier = "Original / OEM"

    # If we couldn't find a model or part type, return None to keep it Uncategorized
    if device_model == "Unknown" or part_type == "Unknown":
        return None 
        
    return {
        "brand": brand,
        "device_model": device_model,
        "part_type": part_type,
        "quality_tier": quality_tier
    }

def map_items_to_catalog(upserted_items: list):
    """
    Takes a list of {'raw_item_id': id, 'raw_title': title} and auto-maps them.
    STRICT LEARNING MODE: Only maps if we have a historical manual mapping for a similar title.
    """
    if not upserted_items: return
    
    print(f"Attempting to auto-map {len(upserted_items)} items using Strict Historical Learning...")
    mapped_count = 0
    
    # Pre-fetch all existing mappings to build a local "Knowledge Base"
    # This is much faster than querying for every single item.
    knowledge_base = {} # normalized_title -> master_catalog_id
    
    print("Building local knowledge base from historical mappings...")
    historical_data = supabase.table("raw_supplier_items")\
        .select("raw_title, item_mapping(master_catalog_id)")\
        .execute()
    
    for row in historical_data.data:
        if row.get('item_mapping') and row['item_mapping']:
            # Handle case where item_mapping is a list or a dict
            mappings = row['item_mapping']
            if isinstance(mappings, list) and mappings:
                m_id = mappings[0].get('master_catalog_id')
            elif isinstance(mappings, dict):
                m_id = mappings.get('master_catalog_id')
            else:
                m_id = None
                
            if m_id:
                norm = normalize_title(row['raw_title'])
                knowledge_base[norm] = m_id

    for item in upserted_items:
        norm_title = normalize_title(item['raw_title'])
        master_id = knowledge_base.get(norm_title)
        
        if master_id:
            # Check if this specific item already has a mapping
            map_res = supabase.table("item_mapping").select("raw_item_id").eq("raw_item_id", item['raw_item_id']).execute()
            
            if not map_res.data:
                supabase.table("item_mapping").insert({
                    "raw_item_id": item['raw_item_id'],
                    "master_catalog_id": master_id
                }).execute()
                mapped_count += 1
                # print(f"Learned mapping for '{item['raw_title']}' -> MasterID: {master_id}")
        # else:
        #     print(f"No historical mapping found for '{item['raw_title']}'. Leaving unmapped.")
    
    print(f"Strict Learning complete. Auto-mapped {mapped_count} items based on manual history.")

def main():
    print("Initializing Scraper...")
    cookies = get_cookies()
    
    supplier_name = "The Parts Home"
    # Target iPhone 13 Series Categories (Corrected URLs with year suffixes)
    categories = [
        {"name": "iPhone 13", "url": "https://www.thepartshome.com.au/apple/iphone-parts/iphone-13-2021.html"},
        {"name": "iPhone 13 mini", "url": "https://www.thepartshome.com.au/apple/iphone-parts/iphone-13-mini-2021.html"},
        {"name": "iPhone 13 Pro", "url": "https://www.thepartshome.com.au/apple/iphone-parts/iphone-13-pro-2021.html"}
    ]
    
    for cat in categories:
        print(f"\n--- Starting mass scrape for: {cat['name']} ---")
        
        # We delegate the full pagination to scrape_tph_category
        # No need for the while loop here anymore
        all_scraped_data = scrape_tph_category(cat['url'], cookies=cookies)
        
        print(f"Total items scraped for {cat['name']}: {len(all_scraped_data)}")
        
        if all_scraped_data:
            print(f"Upserting and Mapping {cat['name']} data...")
            upserted_records = upsert_to_supabase(supplier_name, all_scraped_data)
            map_items_to_catalog(upserted_records)
        else:
            print(f"No data to upsert for {cat['name']}. Please check debug_page.png if items were expected.")
    
    print("\n--- All Mass Scrape Jobs Completed ---")

if __name__ == "__main__":
    main()
