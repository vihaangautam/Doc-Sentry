import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
# PRIORITIZE Service Role Key for Backend to bypass RLS
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

supabase: Client = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"DEBUG: Supabase client initialized with key length: {len(SUPABASE_KEY)}")
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
        
        print(f"DEBUG: Attempting to save audit for user {user_id}...")
        response = supabase.table("audits").insert(data).execute()
        print(f"DEBUG: Save successful. Response: {response}")
        return response
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to save audit to Supabase. Reason: {e}")
        # Hint: If using Anon Key, RLS might block this.
        return None
