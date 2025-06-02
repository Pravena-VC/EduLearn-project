import jwt
import datetime
from django.conf import settings

def generate_access_token(user):
    """
    Generate an access token for the given user
    """
    expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
     
    payload = {
        'user_id': user.id,
        'username': user.username,
        'exp': expiry
    }
     
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token

def generate_refresh_token(user):
    """
    Generate a refresh token for the given user
    """
    expiry = datetime.datetime.utcnow() + datetime.timedelta(days=7)
    
    payload = {
        'user_id': user.id,
        'username': user.username,
        'exp': expiry,
        'token_type': 'refresh'
    }
    
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token

def verify_token(token):
    """
    Verify the token and return the payload if valid
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        print(f"Decoded payload: {payload}")
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None