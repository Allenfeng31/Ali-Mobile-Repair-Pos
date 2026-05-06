import os
import requests
from dotenv import load_dotenv

load_dotenv()
url = os.environ.get("VITE_SUPABASE_URL") + "/rest/v1/master_catalog?select=*"
headers = {
    "apikey": os.environ.get("VITE_SUPABASE_ANON_KEY"),
    "Authorization": "Bearer " + os.environ.get("VITE_SUPABASE_ANON_KEY")
}

r = requests.get(url, headers=headers)
print("ANON REQUEST STATUS:", r.status_code)
print("ANON REQUEST BODY:", r.text)
