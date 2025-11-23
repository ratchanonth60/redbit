from django.shortcuts import render
from django.conf import settings
from django.contrib.auth.decorators import login_required
from graphql_jwt.utils import jwt_payload, jwt_encode
import os

@login_required
def social_login_callback(request):
    """
    Callback view after successful social login.
    Generates JWT token and redirects to frontend.
    """
    user = request.user
    payload = jwt_payload(user)
    token = jwt_encode(payload)
    
    # Get frontend URL from environment variable
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:8081')
    
    context = {
        'token': token,
        'refresh_token': '',  # Add refresh token generation if needed
        'user': user,
        'frontend_url': frontend_url,
        'error': request.GET.get('error', ''),
        'error_description': request.GET.get('error_description', ''),
    }
    
    return render(request, 'social_callback.html', context)
