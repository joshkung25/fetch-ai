from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import requests
from typing import Optional

auth_scheme = HTTPBearer(auto_error=False)

AUTH0_DOMAIN = "dev-0123456789012345.us.auth0.com"
API_AUDIENCE = "https://api.fetchfileai.com"
ALGORITHMS = ["RS256"]


def verify_jwt(token: str):
    """
    Verify the JWT token. Return the payload if valid, otherwise raise an error.
    """
    jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    jwks = requests.get(jwks_url, timeout=10).json()
    unverified_header = jwt.get_unverified_header(token)
    rsa_key = next(
        (key for key in jwks["keys"] if key["kid"] == unverified_header["kid"]), None
    )
    if not rsa_key:
        raise HTTPException(status_code=401, detail="Invalid token header")
    # return the payload. a payload is a dictionary of the token
    return jwt.decode(
        token,
        rsa_key,
        algorithms=ALGORITHMS,
        audience=API_AUDIENCE,
        issuer=f"https://{AUTH0_DOMAIN}/",
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
