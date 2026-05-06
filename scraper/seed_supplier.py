import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

URL = os.environ.get("VITE_SUPABASE_URL")
KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(URL, KEY)

def seed():
    supplier_name = "The Parts Home"
    res = supabase.table("suppliers").select("id").eq("name", supplier_name).execute()
    
    if not res.data:
        print(f"Seeding supplier: {supplier_name}")
        supabase.table("suppliers").insert({
            "name": supplier_name,
            "website": "https://www.thepartshome.com.au",
            "active": True
        }).execute()
        print("Done.")
    else:
        print(f"Supplier {supplier_name} already exists.")

if __name__ == "__main__":
    seed()
