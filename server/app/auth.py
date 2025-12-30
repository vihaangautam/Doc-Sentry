import os
import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Verifies the Supabase JWT Token sent by the Frontend.
    """
    token = credentials.credentials
    try:
        if not SUPABASE_JWT_SECRET:
            print("CRITICAL ERROR: SUPABASE_JWT_SECRET is not set in environment variables!")
            raise HTTPException(status_code=500, detail="Server misconfiguration: Missing JWT Secret")

        # Decode the token using the secret
        # Audience = 'authenticated' is customizable in Supabase but defaults to this
        payload = jwt.decode(
            token, 
            SUPABASE_JWT_SECRET, 
            algorithms=["HS256"], 
            audience="authenticated"
        )
        # print("Token verified successfully for user:", payload.get("sub"))
        return payload
    except jwt.ExpiredSignatureError:
        print("Error: Token expired")
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        print(f"Error: Invalid token: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=401, detail="Could not validate credentials")
