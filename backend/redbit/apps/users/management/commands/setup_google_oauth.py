from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
import os


class Command(BaseCommand):
    help = 'Setup Google OAuth SocialApp'

    def handle(self, *args, **options):
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
        
        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Google OAuth SocialApp {'created' if created else 'updated'} successfully!"
            )
        )
        self.stdout.write(f"   Client ID: {google_app.client_id}")
        self.stdout.write(f"   Site: {site.domain}")
