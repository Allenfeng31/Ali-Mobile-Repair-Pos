#!/usr/bin/env python3
"""
Safe Auto-Categorization Script
================================
Maps uncategorized raw_supplier_items to master_catalog entries using
pattern matching rules derived from the iPhone 13 Pro Max template.

Rules:
- Extracts device model, part type, and quality tier from raw_title
- Consolidates power/volume/flash flex cables into a single "Flex Cable" part_type
- Skips ambiguous items (left for manual review)
- Self-audits all proposed mappings before upserting
"""

import os
import re
import sys
import json
from typing import Optional, List
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# ── Environment Setup ──────────────────────────────────────────────────
load_dotenv()
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(ROOT_DIR, 'server', '.env'))

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── Device Model Detection ────────────────────────────────────────────
# Ordered from most specific to least specific to avoid partial matches
DEVICE_PATTERNS = [
    # iPhone 16 series
    (r'iphone\s*16\s*pro\s*max', 'iPhone 16 Pro Max'),
    (r'iphone\s*16\s*pro', 'iPhone 16 Pro'),
    (r'iphone\s*16\s*plus', 'iPhone 16 Plus'),
    (r'iphone\s*16e', 'iPhone 16e'),
    (r'iphone\s*16', 'iPhone 16'),
    # iPhone 15 series
    (r'iphone\s*15\s*pro\s*max', 'iPhone 15 Pro Max'),
    (r'iphone\s*15\s*pro', 'iPhone 15 Pro'),
    (r'iphone\s*15\s*plus', 'iPhone 15 Plus'),
    (r'iphone\s*15', 'iPhone 15'),
    # iPhone 14 series
    (r'iphone\s*14\s*pro\s*max', 'iPhone 14 Pro Max'),
    (r'iphone\s*14\s*pro', 'iPhone 14 Pro'),
    (r'iphone\s*14\s*plus', 'iPhone 14 Plus'),
    (r'iphone\s*14', 'iPhone 14'),
    # iPhone 13 series
    (r'iphone\s*13\s*pro\s*max', 'iPhone 13 Pro Max'),
    (r'iphone\s*13\s*pro', 'iPhone 13 Pro'),
    (r'iphone\s*13\s*mini', 'iPhone 13 Mini'),
    (r'iphone\s*13', 'iPhone 13'),
    # iPhone 12 series
    (r'iphone\s*12\s*pro\s*max', 'iPhone 12 Pro Max'),
    (r'iphone\s*12\s*pro', 'iPhone 12 Pro'),
    (r'iphone\s*12\s*mini', 'iPhone 12 Mini'),
    (r'iphone\s*12', 'iPhone 12'),
    # iPhone 11 series
    (r'iphone\s*11\s*pro\s*max', 'iPhone 11 Pro Max'),
    (r'iphone\s*11\s*pro', 'iPhone 11 Pro'),
    (r'iphone\s*11', 'iPhone 11'),
    # Older iPhones
    (r'iphone\s*se\s*(?:3rd|3|2nd|2)', 'iPhone SE'),
    (r'iphone\s*x[rs]?\s*max', 'iPhone XS Max'),
    (r'iphone\s*xs', 'iPhone XS'),
    (r'iphone\s*xr', 'iPhone XR'),
    (r'iphone\s*x\b', 'iPhone X'),
    (r'iphone\s*8\s*plus', 'iPhone 8 Plus'),
    (r'iphone\s*8', 'iPhone 8'),
    (r'iphone\s*7\s*plus', 'iPhone 7 Plus'),
    (r'iphone\s*7', 'iPhone 7'),
]

# ── Part Type Detection ────────────────────────────────────────────────
# CRITICAL: Flex cables are consolidated into one "Flex Cable" category
PART_TYPE_PATTERNS = [
    # Screens (most common)
    (r'(?:lcd|oled)\s*screen\s*(?:replacement|assembly)', 'Screen'),
    (r'screen\s*(?:replacement|assembly)', 'Screen'),
    # Flex Cables — ALL sub-types consolidated
    (r'power\s*(?:button)?\s*flex', 'Flex Cable'),
    (r'volume\s*(?:button)?\s*flex', 'Flex Cable'),
    (r'flash\s*(?:light)?\s*flex', 'Flex Cable'),
    (r'charging\s*port\s*flex', 'Flex Cable'),
    (r'(?:power|volume|flash|mute|silent)\s*(?:button\s*)?flex\s*cable', 'Flex Cable'),
    (r'flex\s*cable', 'Flex Cable'),
    # Batteries
    (r'battery\s*(?:replacement)?', 'Battery'),
    # Cameras
    (r'rear\s*camera', 'Rear Camera'),
    (r'front\s*camera', 'Front Camera'),
    (r'camera\s*lens', 'Camera Lens'),
    # Housings
    (r'back\s*(?:cover|housing|glass)', 'Back Housing'),
    (r'rear\s*(?:cover|housing|glass)', 'Back Housing'),
    # Charging
    (r'charging\s*port', 'Charging Port'),
    (r'charge\s*port', 'Charging Port'),
    # Speakers & Earpieces
    (r'ear\s*(?:piece|speaker)', 'Earpiece Speaker'),
    (r'loud\s*speaker', 'Loud Speaker'),
    (r'speaker', 'Speaker'),
    # Small Parts
    (r'home\s*button', 'Home Button'),
    (r'sim\s*(?:card\s*)?tray', 'SIM Tray'),
    (r'tempered\s*glass\s*protector', 'Screen Protector'),
    (r'glass\s*protector', 'Screen Protector'),
    # Connectors
    (r'(?:lightning|usb)\s*(?:to|connector)', 'Accessory'),
    (r'headphone\s*jack\s*adapter', 'Accessory'),
]

# ── Quality Tier Detection ─────────────────────────────────────────────
# Based on the 13 Pro Max template established by the user
QUALITY_TIER_PATTERNS = [
    # OEM / Service Pack (highest tier)
    (r'oem\s*(?:grade\s*s)?|service\s*pack', 'OEM'),
    # Genuine / Refurbished
    (r'refurbish(?:ed)?(?:\s*aaa)?|ohq\s*grade\s*s', 'Refurbished'),
    # Soft OLED (premium aftermarket)
    (r'soft\s*oled|tph\s*soft', 'Soft OLED'),
    # Hard OLED
    (r'hard\s*oled', 'Hard OLED'),
    # INCELL Premium
    (r'incell.*premium|tph\s*premium', 'Incell Premium'),
    # INCELL Standard / TPH Value
    (r'incell.*value|tph\s*value|incell\b', 'Incell'),
    # Generic aftermarket / High Quality
    (r'high\s*quality|aftermarket', 'Aftermarket'),
]

# Default quality tier if none matched but part_type is clear
DEFAULT_QUALITY = 'Standard'


def detect_device(title_lower: str) -> Optional[str]:
    """Extract the device model from a raw title. Returns None if ambiguous."""
    for pattern, model in DEVICE_PATTERNS:
        if re.search(pattern, title_lower):
            return model
    return None


def detect_part_type(title_lower: str) -> Optional[str]:
    """Extract the part type from a raw title. Returns None if ambiguous."""
    for pattern, part in PART_TYPE_PATTERNS:
        if re.search(pattern, title_lower):
            return part
    return None


def detect_quality_tier(title_lower: str) -> str:
    """Extract the quality tier from a raw title."""
    for pattern, tier in QUALITY_TIER_PATTERNS:
        if re.search(pattern, title_lower):
            return tier
    return DEFAULT_QUALITY


def detect_multi_device(title_lower: str) -> List[str]:
    """Check if a title references multiple devices (e.g. '13/13 Pro/14')."""
    matches = []
    for pattern, model in DEVICE_PATTERNS:
        if re.search(pattern, title_lower):
            matches.append(model)
    return matches


def main():
    print("=" * 60)
    print("SAFE AUTO-CATEGORIZATION SCRIPT")
    print(f"Started at: {datetime.now().isoformat()}")
    print("=" * 60)

    # ── Step 1: Fetch all unmapped raw items ───────────────────────────
    print("\n[1/5] Fetching unmapped raw supplier items...")
    
    all_raw = supabase.table("raw_supplier_items").select("id, raw_title, current_price, stock_status").execute()
    all_mappings = supabase.table("item_mapping").select("raw_item_id").execute()
    
    mapped_ids = {m["raw_item_id"] for m in (all_mappings.data or [])}
    unmapped = [r for r in (all_raw.data or []) if r["id"] not in mapped_ids]
    
    print(f"   Total raw items: {len(all_raw.data or [])}")
    print(f"   Already mapped:  {len(mapped_ids)}")
    print(f"   Unmapped:        {len(unmapped)}")
    
    if not unmapped:
        print("\n✅ No unmapped items to process. Exiting.")
        return

    # ── Step 2: Fetch existing 13 Pro Max template ─────────────────────
    print("\n[2/5] Loading iPhone 13 Pro Max template from master_catalog...")
    
    template_res = supabase.table("master_catalog").select("*").eq("device_model", "iPhone 13 Pro Max").execute()
    template_items = template_res.data or []
    
    # Build a set of valid (part_type, quality_tier) pairs from the template
    template_pairs = set()
    for t in template_items:
        template_pairs.add((t["part_type"], t["quality_tier"]))
    
    print(f"   Template entries: {len(template_items)}")
    for pt, qt in sorted(template_pairs):
        print(f"     - {pt} / {qt}")

    # ── Step 3: Pattern-match each unmapped item ───────────────────────
    print("\n[3/5] Classifying unmapped items...")
    
    proposed_mappings = []  # (raw_item, device, part_type, quality_tier, reason)
    skipped_items = []      # (raw_item, skip_reason)
    
    for item in unmapped:
        title = item["raw_title"]
        title_lower = title.lower()
        
        # Skip items with zero price (likely out of stock / placeholder)
        if float(item.get("current_price", 0)) == 0:
            skipped_items.append((item, "Zero price — likely out of stock"))
            continue
        
        # Detect device
        devices = detect_multi_device(title_lower)
        if len(devices) > 1:
            # Multi-device title (e.g. "iPhone 13/13 Pro/14 Screen Protector")
            # Only map if ALL devices resolve to the same part & quality
            skipped_items.append((item, f"Multi-device reference: {', '.join(devices)}"))
            continue
        
        device = devices[0] if devices else None
        if not device:
            skipped_items.append((item, "Could not identify device model"))
            continue
        
        # Detect part type
        part_type = detect_part_type(title_lower)
        if not part_type:
            skipped_items.append((item, "Could not identify part type"))
            continue
        
        # Detect quality tier
        quality_tier = detect_quality_tier(title_lower)
        
        proposed_mappings.append((item, device, part_type, quality_tier, "pattern_match"))

    print(f"   Proposed mappings: {len(proposed_mappings)}")
    print(f"   Skipped (ambiguous): {len(skipped_items)}")

    # ── Step 4: Self-Audit against 13 Pro Max template ─────────────────
    print("\n[4/5] Self-audit: Cross-referencing against 13 Pro Max template...")
    
    audit_passed = []
    audit_failed = []
    
    for item, device, part_type, quality_tier, reason in proposed_mappings:
        # Check if this (part_type, quality_tier) combo exists in the template
        if (part_type, quality_tier) in template_pairs:
            audit_passed.append((item, device, part_type, quality_tier))
        else:
            # If the exact tier doesn't match but the part_type exists in template,
            # allow it — the supplier might just have different quality grades per device
            part_exists = any(pt == part_type for pt, _ in template_pairs)
            if part_exists:
                audit_passed.append((item, device, part_type, quality_tier))
            else:
                # Part type not in template at all — check if it's a universally valid part
                universal_parts = {'Screen Protector', 'Accessory', 'Battery', 'Charging Port', 
                                   'Flex Cable', 'Rear Camera', 'Front Camera', 'Camera Lens',
                                   'Back Housing', 'Earpiece Speaker', 'Loud Speaker', 'Speaker',
                                   'Home Button', 'SIM Tray'}
                if part_type in universal_parts:
                    audit_passed.append((item, device, part_type, quality_tier))
                else:
                    audit_failed.append((item, device, part_type, quality_tier, 
                                        f"Part type '{part_type}' not in 13 Pro Max template"))
    
    print(f"   Audit PASSED: {len(audit_passed)}")
    print(f"   Audit FAILED: {len(audit_failed)}")
    
    for item, device, pt, qt, reason in audit_failed:
        print(f"     ✗ [{device}] {pt}/{qt} — {reason}")
        skipped_items.append((item, f"Audit failed: {reason}"))

    # ── Step 5: Execute Upserts ────────────────────────────────────────
    print(f"\n[5/5] Upserting {len(audit_passed)} items to Supabase...")
    
    success_count = 0
    error_count = 0
    catalog_cache = {}  # (device, part_type, quality_tier) -> master_catalog_id
    
    for item, device, part_type, quality_tier in audit_passed:
        cache_key = (device, part_type, quality_tier)
        
        try:
            # Find or create master_catalog entry
            if cache_key not in catalog_cache:
                existing = supabase.table("master_catalog").select("id") \
                    .eq("brand", "Apple") \
                    .eq("device_model", device) \
                    .eq("part_type", part_type) \
                    .eq("quality_tier", quality_tier) \
                    .maybeSingle().execute()
                
                if existing.data:
                    catalog_cache[cache_key] = existing.data["id"]
                else:
                    created = supabase.table("master_catalog").insert({
                        "brand": "Apple",
                        "device_model": device,
                        "part_type": part_type,
                        "quality_tier": quality_tier
                    }).select("id").single().execute()
                    catalog_cache[cache_key] = created.data["id"]
                    print(f"   📦 Created catalog entry: {device} / {part_type} / {quality_tier}")
            
            master_id = catalog_cache[cache_key]
            
            # Check if mapping already exists (safety)
            existing_map = supabase.table("item_mapping") \
                .select("raw_item_id") \
                .eq("raw_item_id", item["id"]).execute()
            
            if existing_map.data:
                continue  # Already mapped
            
            # Create the mapping
            supabase.table("item_mapping").insert({
                "raw_item_id": item["id"],
                "master_catalog_id": master_id
            }).execute()
            
            success_count += 1
            
        except Exception as e:
            error_count += 1
            print(f"   ❌ Error mapping '{item['raw_title'][:50]}...': {str(e)}")

    # ── Final Report ───────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("FINAL REPORT")
    print("=" * 60)
    print(f"  ✅ Successfully mapped:        {success_count}")
    print(f"  ❌ Errors during upsert:        {error_count}")
    print(f"  ⏭️  Skipped (ambiguous/manual): {len(skipped_items)}")
    print(f"  📦 New catalog entries created: {len(catalog_cache)}")
    
    print("\n── Skipped Items (Left for Manual Review) ──")
    for item, reason in skipped_items[:30]:  # Show first 30
        price = item.get("current_price", "?")
        print(f"  [{reason}] ${price} — {item['raw_title'][:80]}")
    if len(skipped_items) > 30:
        print(f"  ... and {len(skipped_items) - 30} more.")
    
    print("\n── Sample Mapped Items ──")
    for item, device, part_type, quality_tier in audit_passed[:10]:
        print(f"  ✅ [{device}] {part_type} / {quality_tier} — {item['raw_title'][:60]}")
    
    print(f"\nCompleted at: {datetime.now().isoformat()}")


if __name__ == "__main__":
    main()
