import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def cleanup():
    print("Cleaning up database tables...")
    
    # Order matters due to foreign keys
    # item_mapping -> raw_supplier_items
    # item_mapping -> master_catalog
    
    try:
        print("Deleting item_mapping...")
        # item_mapping uses raw_item_id as PK
        supabase.table("item_mapping").delete().neq("raw_item_id", "00000000-0000-0000-0000-000000000000").execute()
        
        print("Deleting price_history...")
        supabase.table("price_history").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

        print("Deleting raw_supplier_items...")
        supabase.table("raw_supplier_items").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        
        print("Deleting master_catalog...")
        supabase.table("master_catalog").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        
        print("Database cleanup complete.")
    except Exception as e:
        print(f"Error during cleanup: {e}")

if __name__ == "__main__":
    cleanup()
