import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def seed_grades():
    initial_grades = [
        "Soft OLED",
        "Hard OLED",
        "In-cell LCD",
        "Original",
        "Refurbished",
        "Service Pack",
        "Standard",
        "Premium",
        "OHQ",
        "Value"
    ]
    
    print("Seeding initial quality tier suggestions...")
    for grade in initial_grades:
        try:
            supabase.table("quality_tiers_suggestions").upsert({"name": grade}, on_conflict="name").execute()
            print(f"Upserted: {grade}")
        except Exception as e:
            print(f"Error seeding {grade}: {e}")

if __name__ == "__main__":
    seed_grades()
