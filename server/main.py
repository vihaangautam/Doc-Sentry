from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from app.auth import verify_token
from app.services.gemini_service import analyze_document
from app.db import save_audit

load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import chat

# PROTECTED ROUTES
# app.include_router(analyzer.router, ...) # Replaced by direct implementation below
app.include_router(chat.router, prefix="/api/chat", tags=["chat"], dependencies=[Depends(verify_token)])

@app.post("/api/analyze/{audit_type}", dependencies=[Depends(verify_token)])
async def analyze_audit(
    audit_type: str,
    file: UploadFile = File(...),
    user: dict = Depends(verify_token)
):
    valid_types = ["salary", "loan", "investment"]
    if audit_type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid audit type")

    try:
        # 1. Read File
        content = await file.read()
        
        # 2. Analyze with Gemini
        analysis_result = await analyze_document(audit_type, content, file.filename)
        
        # 3. Save to Supabase
        if analysis_result and "data" in analysis_result:
             await save_audit(
                user_id=user['id'], # Extracted from JWT
                filename=file.filename,
                audit_type=audit_type,
                analysis_data=analysis_result['data']
            )

        return analysis_result

    except Exception as e:
        print(f"Error processing upload: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "DocSentry Backend is Running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
