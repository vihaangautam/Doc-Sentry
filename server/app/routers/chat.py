from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

MODEL_NAME = "gemini-2.5-flash"

class ChatRequest(BaseModel):
    document_context: Dict[str, Any] # The extracted JSON
    history: List[Dict[str, str]] # List of {"role": "user"|"model", "parts": "text"}
    question: str

@router.post("/ask")
async def ask_advisor(request: ChatRequest):
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        
        # Construct system context from the extracted data
        system_context = f"""
        You are a helpful and cynical financial advisor. The user is asking about a financial document you just analyzed.
        Here is the extracted data from the document:
        {request.document_context}
        
        Answer the user's question based on this data. Be concise, honest, and warn them if something looks bad.
        
        CRITICAL INSTRUCTION FOR EMAILS:
        If the user asks to draft, write, specificy, or edit an email/letter:
        1. Start immediately with "Subject:".
        2. Do NOT add conversational filler like "Here is the email" or "Sure".
        3. Ensure the response is ready to copy-paste.
        """
        
        chat = model.start_chat(history=[])
        
        # Prime the chat with context (as a system instruction equivalent or first turn)
        # Gemini Python SDK 'history' format is: [{'role': 'user', 'parts': '...'}, {'role': 'model', 'parts': '...'}]
        
        # We'll send the context as the first user message, "Here is the doc context:", followed by a model ack "Understood."
        # Then append the actual history.
        
        history_to_send = [
            {'role': 'user', 'parts': [system_context]},
            {'role': 'model', 'parts': ["I have analyzed the document. What would you like to know?"]}
        ]
        
        # Append user's chat history
        # Ensure role is 'user' or 'model'
        for msg in request.history:
            history_to_send.append({
                'role': 'user' if msg['role'] == 'user' else 'model', 
                'parts': [msg['parts']]
            })
        
        # Send the new question
        response = model.generate_content([*history_to_send, {'role': 'user', 'parts': [request.question]}])
        
        return {"answer": response.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
