import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") # This should be a Service Role key or valid key to write

supabase: Client = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")

async def save_audit(user_id: str, filename: str, audit_type: str, analysis_data: dict):
    if not supabase:
        print("Supabase client not initialized. Skipping save.")
        return None
    
    try:
        data = {
            "user_id": user_id,
            "filename": filename,
            "audit_type": audit_type,
            "status": "completed",
            "analysis_json": analysis_data
        }
        
        response = supabase.table("audits").insert(data).execute()
        return response
    except Exception as e:
        print(f"Error saving audit to Supabase: {e}")
        return None
