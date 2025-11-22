import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "redbit.settings.local")
django.setup()

from graphql_api.users.mutations import SocialAuth
from django.contrib.auth import get_user_model

User = get_user_model()

print("Testing SocialAuth mutation...")
try:
    # Test with new user
    email = "test_social_new@example.com"
    if User.objects.filter(email=email).exists():
        User.objects.get(email=email).delete()
        
    result = SocialAuth.mutate(None, None, provider="Google", email=email)
    if result.success:
        print(f"SUCCESS: Created user {result.user.username} with token")
    else:
        print(f"FAILED: {result.errors}")

    # Test with existing user
    result = SocialAuth.mutate(None, None, provider="Google", email=email)
    if result.success:
        print(f"SUCCESS: Logged in user {result.user.username} with token")
    else:
        print(f"FAILED: {result.errors}")

except Exception as e:
    print(f"EXCEPTION: {e}")
