import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.environ.get("VITE_SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_ROLE_KEY"))

res = supabase.table("master_catalog").select("*").execute()
print("MASTER CATALOG:", res.data)

res2 = supabase.table("item_mapping").select("*").execute()
print("ITEM MAPPING:", res2.data)
