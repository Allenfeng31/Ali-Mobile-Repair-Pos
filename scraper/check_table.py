import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_table():
    try:
        # Try a simple select
        res = supabase.table("quality_tiers_suggestions").select("count").limit(1).execute()
        print("Table 'quality_tiers_suggestions' exists.")
    except Exception as e:
        print(f"Table does not exist or error: {e}")

if __name__ == "__main__":
    check_table()
