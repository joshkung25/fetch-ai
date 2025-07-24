from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import requests
from typing import Optional

auth_scheme = HTTPBearer(auto_error=False)

AUTH0_DOMAIN = "dev-40bs278h7f447axk.us.auth0.com"

API_AUDIENCE = "https://api.fetchfileai.com"
ALGORITHMS = ["RS256"]


def verify_jwt(token: str):
    """
    Verify the JWT token. Return the payload if valid, otherwise raise an error.
    """
    if not token:
        raise HTTPException(status_code=401, detail="Token is required")

    if not AUTH0_DOMAIN:
        raise HTTPException(status_code=500, detail="AUTH0_DOMAIN not configured")

    jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"

    try:
        response = requests.get(jwks_url, timeout=10)
        response.raise_for_status()  # Raise an exception for bad status codes
        jwks = response.json()
    except (requests.RequestException, ValueError) as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch JWKS: {str(e)}")

    try:
        unverified_header = jwt.get_unverified_header(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token format")

    kid = unverified_header.get("kid")

    rsa_key = next((key for key in jwks["keys"] if key["kid"] == kid), None)
    if not rsa_key:
        raise HTTPException(status_code=401, detail="Invalid token header")

    try:
        # return the payload. a payload is a dictionary of the token
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=ALGORITHMS,
            audience=API_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/",
        )
        return payload
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Token verification error: {str(e)}"
        )


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(auth_scheme),
):
    """
    Get the current user id from the JWT token
    """
    if not credentials:
        return "guest"
    try:
        token = credentials.credentials
        payload = verify_jwt(token)  # verify the token of the user
        return payload["sub"]  # This is user id
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc
