from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.gemini_service import extract_investment_details

router = APIRouter()

@router.post("/investment")
async def analyze_investment(file: UploadFile = File(...)):
    if not file.content_type.startswith("application/pdf") and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload PDF or Image.")
    
    content = await file.read()
    
    # Extract data using Gemini
    try:
        data = extract_investment_details(content, file.content_type)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.services.gemini_service import extract_loan_details

@router.post("/loan")
async def analyze_loan(file: UploadFile = File(...)):
    if not file.content_type.startswith("application/pdf") and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type.")
    
    content = await file.read()
    try:
        data = extract_loan_details(content, file.content_type)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.services.gemini_service import extract_salary_details

@router.post("/salary")
async def analyze_salary(file: UploadFile = File(...)):
    if not file.content_type.startswith("application/pdf") and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type.")
    
    content = await file.read()
    try:
        data = extract_salary_details(content, file.content_type)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
