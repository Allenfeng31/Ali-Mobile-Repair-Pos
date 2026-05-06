import os
import requests
from dotenv import load_dotenv

load_dotenv()
url = os.environ.get("VITE_SUPABASE_URL") + "/rest/v1/"
# Wait, we can't easily run raw SQL via the REST API without rpc.
