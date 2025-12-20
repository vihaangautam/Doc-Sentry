import os
import io
import json
import google.generativeai as genai
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    # This might happen during build/setup, so we warn but don't crash modules import
    print("WARNING: GEMINI_API_KEY not found in environment variables.")
else:
    genai.configure(api_key=API_KEY)

# Use the latest stable model or the one requested (Flash)
MODEL_NAME = "gemini-2.5-flash" 

def extract_investment_details(file_content: bytes, mime_type: str):
    """
    Uploads file to Gemini (or sends bytes) and extracts investment details.
    """
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        
        prompt = """
        You are a Ruthless Financial Auditor. Your job is to extract specific financial data from this insurance/investment document to calculate the REAL return (XIRR).
        
        Extract the following fields in strict JSON format:
        {
            "policy_name": "Name of the plan",
            "premium_amount": Number (annualized amount preferably, or clear indication),
            "payment_frequency": "Annual", "Monthly", etc.,
            "policy_term_years": Number (how long they pay),
            "maturity_years": Number (when do they get money back),
            "sum_assured": Number,
            "maturity_benefit_illustration": Number (if a specific example is given, usually at 4% or 8%, pick the higher 8% illustration value for the 'optimistic' scam check, or the guaranteed amount),
            "guaranteed_additions": "Text description of any guaranteed returns",
            "red_flags": ["List of textual red flags like 'Variable rate', 'Non-guaranteed', 'deductions']"
        }
        
        If a value is not found, use null. Convert 1 Lakh to 100000. Do not do the math yourself, just extract the numbers found in the text/tables.
        """
        
        # Gemini Python SDK supports passing dictionary with 'mime_type' and 'data' for bytes
        response = model.generate_content([
            {'mime_type': mime_type, 'data': file_content},
            prompt
        ])
        
        # Cleanup response to get just the JSON
        text = response.text
        # Remove markdown code blocks if present
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        
        return json.loads(text)
        
    except Exception as e:
        print(f"Gemini Extraction Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Extraction Failed: {str(e)}")

def extract_loan_details(file_content: bytes, mime_type: str):
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        prompt = """
        You are a Ruthless Financial Auditor checks Loan Sanction Letters.
        
        Extract the following fields in strict JSON format:
        {
            "bank_name": "Name of Bank/Lender",
            "loan_amount": Number (Sanctioned Amount),
            "interest_rate_quoted": Number (Annual % e.g. 8.5),
            "tenure_months": Number (Total months),
            "processing_fees": Number (Total fees incl GST),
            "insurance_bundled": Number (amount deducted for insurance/protection),
            "other_charges": Number (admin fees, login fees etc),
            "emi_amount": Number (if stated),
            "loan_type": "Home Loan", "Car Loan", "Personal Loan",
             "red_flags": ["Floating rate reset clause", "Prepayment penalty > 0", "Bundled insurance sold as mandatory"]
        }
        
        If specific fee amounts are not clear but a % is given (e.g. 1% of loan), calculate it.
        """
        response = model.generate_content([{'mime_type': mime_type, 'data': file_content}, prompt])
        text = response.text
        if text.startswith("```json"): text = text[7:]
        if text.endswith("```"): text = text[:-3]
        return json.loads(text)
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Extraction Failed: {str(e)}")


def extract_salary_details(file_content: bytes, mime_type: str):
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        prompt = """
        You are a Ruthless Financial Auditor checks Job Offer Letters / CTC Breakdowns.
        
        Extract the following fields in strict JSON format:
        {
            "company_name": "Name of Company",
            "ctc_annual": Number (Total Cost to Company),
            "basic_salary_monthly": Number,
            "hra_monthly": Number,
            "special_allowance_monthly": Number,
            "total_gross_monthly": Number (Sum of cash components),
            "pf_employee_monthly": Number (Deducted from salary),
            "pf_employer_annual": Number (Part of CTC not in hand),
            "professional_tax_monthly": Number,
            "gratuity_annual": Number (Part of CTC usually),
            "insurance_benefit_annual": Number (Health insurance cost in CTC),
            "variable_performance_bonus_annual": Number,
            "other_deductions_monthly": Number,
             "red_flags": ["Notice period > 60 days", "Bond agreement", "Variable pay > 20% of CTC"]
        }
        
        If monthly amounts are not given but annual are, divide by 12. If specific components aren't found, use 0.
        """
        response = model.generate_content([{'mime_type': mime_type, 'data': file_content}, prompt])
        text = response.text
        if text.startswith("```json"): text = text[7:]
        if text.endswith("```"): text = text[:-3]
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Extraction Failed: {str(e)}")

