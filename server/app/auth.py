import os
import jwt
from jwt import PyJWKClient
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
SUPABASE_URL = os.getenv("SUPABASE_URL")

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Verifies the Supabase JWT Token. Supports both HS256 (Secret) and ES256/RS256 (JWKS).
    """
    token = credentials.credentials
    
    try:
        # 1. Check the algorithm in the header
        header = jwt.get_unverified_header(token)
        alg = header.get('alg')
        
        # 2. Select verification method based on algorithm
        if alg == 'HS256':
            if not SUPABASE_JWT_SECRET:
                print("CRITICAL: HS256 token received but SUPABASE_JWT_SECRET is missing.")
                raise Exception("Server configuration error: Missing JWT Secret")
                
            return jwt.decode(
                token, 
                SUPABASE_JWT_SECRET, 
                algorithms=["HS256"], 
                audience="authenticated"
            )
            
        elif alg in ['RS256', 'ES256']:
            if not SUPABASE_URL:
                 print(f"CRITICAL: {alg} token received but SUPABASE_URL is missing in server env.")
                 raise Exception("Server configuration error: Missing SUPABASE_URL")
            
            # Fetch Public Key from Supabase JWKS
            jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
            jwks_client = PyJWKClient(jwks_url)
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            
            return jwt.decode(
                token,
                signing_key.key,
                algorithms=[alg],
                audience="authenticated"
            )
        else:
            raise Exception(f"Unsupported algorithm: {alg}")

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except Exception as e:
        print(f"Auth Verification Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
