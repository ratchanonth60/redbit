#!/usr/bin/env python
"""
Script to create Google OAuth SocialApp in database
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'redbit.settings.local')
django.setup()

from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp

# Get or create the default site
site = Site.objects.get_current()

# Create or update Google SocialApp
google_app, created = SocialApp.objects.get_or_create(
    provider='google',
    defaults={
        'name': 'Google OAuth',
        'client_id': os.environ.get('GOOGLE_OAUTH_CLIENT_ID', 'dummy-client-id'),
        'secret': os.environ.get('GOOGLE_OAUTH_CLIENT_SECRET', 'dummy-secret'),
    }
)

if not created:
    google_app.client_id = os.environ.get('GOOGLE_OAUTH_CLIENT_ID', 'dummy-client-id')
    google_app.secret = os.environ.get('GOOGLE_OAUTH_CLIENT_SECRET', 'dummy-secret')
    google_app.save()

# Add site to the app
google_app.sites.add(site)

print(f"✅ Google OAuth SocialApp {'created' if created else 'updated'} successfully!")
print(f"   Client ID: {google_app.client_id}")
print(f"   Site: {site.domain}")
