"""
JWT Authentication Middleware for Django Channels WebSocket
"""
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
import graphql_jwt
from graphql_jwt.utils import jwt_decode

User = get_user_model()


@database_sync_to_async
def get_user_from_token(token):
    """
    Get user from JWT token
    """
    try:
        payload = jwt_decode(token)
        user = User.objects.get(id=payload['user_id'])
        return user
    except Exception:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware to authenticate WebSocket connections using JWT
    """
    async def __call__(self, scope, receive, send):
        # Get token from query string or headers
        headers = dict(scope['headers'])
        
        # Try to get token from query string first
        query_string = scope.get('query_string', b'').decode()
        token = None
        
        if 'token=' in query_string:
            # Extract token from query string
            for param in query_string.split('&'):
                if param.startswith('token='):
                    token = param.split('=')[1]
                    break
        
        # If not in query string, try headers
        if not token and b'authorization' in headers:
            auth_header = headers[b'authorization'].decode()
            if auth_header.startswith('JWT '):
                token = auth_header[4:]
        
        # Authenticate user
        if token:
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    """
    Convenience function to wrap AuthMiddlewareStack with JWT auth
    """
    return JWTAuthMiddleware(inner)
