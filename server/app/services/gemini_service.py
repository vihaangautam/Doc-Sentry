import os
import io
import json
import google.generativeai as genai
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY or API_KEY == "YOUR_API_KEY_HERE":
    print("CRITICAL WARNING: Valid GEMINI_API_KEY not found. Please set it in .env")
else:
    genai.configure(api_key=API_KEY)

# Ensure you use a valid model name. 'gemini-1.5-flash' is the current standard for speed/cost.
MODEL_NAME = "gemini-2.5-flash" 

def extract_investment_details(file_content: bytes, mime_type: str):
    """
    Extracts investment details with specific focus on Indian Policy minutiae (Payment Frequency & Tax).
    """
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        
        prompt = """
        You are a Ruthless Financial Auditor. Analyze this Indian Insurance/Investment policy document.
        
        Extract the following fields in strict JSON format:
        {
            "policy_name": "Name of the plan",
            "premium_amount": Number (Installment premium amount, excluding GST if possible),
            "payment_frequency": "Annual", "Monthly", "Quarterly", or "Half-Yearly" (CRITICAL: Extract accurately),
            "policy_term_years": Number (Premium Paying Term or Policy Term),
            "maturity_years": Number (Years until maturity payout),
            "sum_assured": Number,
            "maturity_benefit_illustration": Number (The projected maturity value. If 4% and 8% are shown, pick the 8% value. If guaranteed, use that.),
            "red_flags": ["List specific negative terms like 'Mortality charges', 'Surrender penalty', 'Allocation charges', '5-year lock-in'"],
            "opportunities": ["List tax benefits (80C, 10(10D)) or liquidity options like 'Loan against policy'"]
        }
        
        CRITICAL INSTRUCTIONS:
        1. If "Monthly" payment is mentioned, ensure "payment_frequency" is "Monthly".
        2. Look for "Surrender Value" tables. If surrender charges are high in first 3 years, flag it in red_flags.
        3. Convert 'Lakhs'/Cr to actual numbers (e.g., 5 Lakh -> 500000).
        4. Return null for missing numeric fields.
        """
        
        response = model.generate_content([
            {'mime_type': mime_type, 'data': file_content},
            prompt
        ])
        
        text = response.text
        if text.startswith("```json"): text = text[7:]
        if text.endswith("```"): text = text[:-3]
        
        return json.loads(text)
        
    except Exception as e:
        print(f"Investment Extraction Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Extraction Failed: {str(e)}")

def extract_loan_details(file_content: bytes, mime_type: str):
    """
    Extracts Loan details focusing on Indian RBI guidelines, Interest Regime (MCLR/RLLR), and hidden fees.
    """
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        prompt = """
        You are a Ruthless Financial Auditor checking an Indian Loan Agreement / Sanction Letter.
        
        Extract the following fields in strict JSON format:
        {
            "bank_name": "Name of Bank/Lender",
            "loan_amount": Number (Sanctioned Amount),
            "interest_rate_quoted": Number (Annual % e.g. 8.5),
            "tenure_months": Number (Total months. If years given, multiply by 12),
            "processing_fees": Number (Absolute value. If % given, calculate it based on loan amount),
            "insurance_bundled": Number (Look for 'Credit Protect', 'Suraksha', 'Insurance Premium'),
            "other_charges": Number (Sum of Login fees, Admin fees, Legal fees, CERSAI fees),
            "emi_amount": Number (if stated),
            "loan_type": "Home Loan", "Car Loan", "Personal Loan",
            "red_flags": ["List risks like 'Section 138 (Criminal Liability)', 'Variable interest reset clause', 'Cheque bounce penalty', 'Foreclosure charges'"],
            "optimization_tips": ["List advice like 'Switch to Repo Linked Rate (RLLR) if MCLR detected', 'Negotiate processing fee', 'Opt out of insurance'"]
        }
        
        CRITICAL INSTRUCTIONS:
        1. Identify the Interest Regime: If text mentions "MCLR" or "Base Rate", add "Old/Opaque Interest Regime" to red_flags.
        2. Search for "Section 138" or "Criminal Action" regarding repayment checks. If found, flag it.
        3. Identify if Insurance is "Mandatory" or "Voluntary". If Mandatory, flag it.
        4. Return strictly valid JSON.
        """
        response = model.generate_content([{'mime_type': mime_type, 'data': file_content}, prompt])
        text = response.text
        if text.startswith("```json"): text = text[7:]
        if text.endswith("```"): text = text[:-3]
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Loan Extraction Failed: {str(e)}")


def extract_salary_details(file_content: bytes, mime_type: str):
    """
    Extracts Salary details, estimating missing statutory components if needed.
    """
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        prompt = """
        You are a Ruthless Financial Auditor checking Job Offer Letters / CTC Breakdowns in India.
        
        Extract the following fields in strict JSON format:
        {
            "company_name": "Name of Company",
            "ctc_annual": Number (Total Cost to Company),
            "basic_salary_monthly": Number,
            "hra_monthly": Number,
            "special_allowance_monthly": Number,
            "total_gross_monthly": Number (Sum of fixed monthly cash components),
            "pf_employee_monthly": Number (Employee's contribution to EPF),
            "pf_employer_annual": Number (Employer's contribution to EPF),
            "professional_tax_monthly": Number (Estimate ~200 if not explicitly stated but location is Indian metro),
            "gratuity_annual": Number,
            "insurance_benefit_annual": Number (Health/Life insurance part of CTC),
            "variable_performance_bonus_annual": Number,
            "other_deductions_monthly": Number (Includes Food coupons, Transport deductions, etc),
            "red_flags": ["List clauses like '25% salary withheld', 'Bond period > 1 year', 'Notice period > 60 days', 'Non-compete clauses'"],
            "negotiation_tips": ["List levers like 'Ask for Joining Bonus', 'Request Relocation allowance', 'Trade Variable for Higher Base'"]
        }
        
        CRITICAL INSTRUCTIONS:
        1. Parse the document OCR text carefully.
        2. "total_gross_monthly" is the most important field. Sum up Basic + HRA + Special/Other Allowances.
        3. If "Employee PF" is missing but "Basic" is present, the Frontend will calculate it, but if you see it explicitly, extract it.
        4. Look specifically for "Bond" or "Recovery" clauses regarding training costs. Flag them.
        5. Return strict JSON.
        """
        response = model.generate_content([{'mime_type': mime_type, 'data': file_content}, prompt])
        text = response.text
        if text.startswith("```json"): text = text[7:]
        if text.endswith("```"): text = text[:-3]
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Salary Extraction Failed: {str(e)}")

async def analyze_document(audit_type: str, content: bytes, filename: str):
    mime_type = "application/pdf" if filename.lower().endswith(".pdf") else "image/png"
    
    if audit_type == "salary":
        data = extract_salary_details(content, mime_type)
    elif audit_type == "loan":
        data = extract_loan_details(content, mime_type)
    elif audit_type == "investment":
        data = extract_investment_details(content, mime_type)
    else:
        raise HTTPException(status_code=400, detail="Invalid audit type")
        
    return {"status": "success", "data": data}