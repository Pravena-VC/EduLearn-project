from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
import jwt
from jwt.exceptions import PyJWTError
from django.conf import settings
from channels.middleware import BaseMiddleware
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

@database_sync_to_async
def get_user_from_token(token):
    """
    Try to authenticate the token and return a user object if valid.
    """
    try:
        # Decode the token (this would be where you verify against your secret key)
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
        
        if user_id:
            try:
                return User.objects.get(id=user_id)
            except User.DoesNotExist:
                return None
        return None
    except PyJWTError:
        return None

class JwtAuthMiddleware(BaseMiddleware):
    """
    Custom middleware that allows for JWT authentication in WebSocket connections.
    
    This middleware processes JWT tokens from the query string but falls back
    to allowing unauthenticated connections if no valid token is provided.
    
    IMPORTANT: This middleware explicitly ALLOWS anonymous connections for WebSockets.
    """
    
    async def __call__(self, scope, receive, send):
        # For WebSocket connections, allow anonymous access by default
        if scope["type"] == "websocket":
            # Set anonymous user by default
            scope["user"] = AnonymousUser()
            
            # Try to get token from query string if provided, but don't require it
            try:
                query_params = parse_qs(scope["query_string"].decode())
                token = None
                
                # First check 'token' param
                if b'token' in query_params:
                    token = query_params[b'token'][0].decode()
                # Then check 'access_token' param as a fallback
                elif b'access_token' in query_params:
                    token = query_params[b'access_token'][0].decode()
                    
                if token:
                    # Try to authenticate with the token
                    user = await get_user_from_token(token)
                    if user:
                        scope["user"] = user
            except Exception as e:
                logger.error(f"Error in JWT auth middleware: {str(e)}")
                # Continue as anonymous if there's any error
                pass
        
        # Continue processing even with anonymous user
        return await super().__call__(scope, receive, send)

def JwtAuthMiddlewareStack(inner):
    """
    Convenience function to wrap with JWT auth and then Django auth.
    """
    from channels.auth import AuthMiddlewareStack
    return JwtAuthMiddleware(AuthMiddlewareStack(inner))
