import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.environ.get("VITE_SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_ROLE_KEY"))

try:
    res = supabase.table("master_catalog").select("""
        brand,
        device_model,
        part_type,
        quality_tier,
        item_mapping (
            raw_supplier_items (
                current_price,
                stock_status,
                suppliers (
                    name
                )
            )
        )
    """).execute()
    print("MAPPED QUERY:", res.data)
except Exception as e:
    print("MAPPED QUERY ERROR:", e)

try:
    res2 = supabase.table("raw_supplier_items").select("""
        id,
        raw_title,
        current_price,
        stock_status,
        suppliers ( name ),
        item_mapping ( master_catalog_id )
    """).execute()
    print("RAW QUERY:", res2.data)
except Exception as e:
    print("RAW QUERY ERROR:", e)

