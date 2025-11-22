import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "redbit.settings.local")
django.setup()

from django.contrib.auth import get_user_model
from apps.communities.models import Community
from django.utils.text import slugify

User = get_user_model()

def seed_communities():
    # Ensure we have a user to be the owner
    user = User.objects.first()
    if not user:
        print("No users found. Creating a default admin user...")
        user = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')

    communities = [
        {
            "name": "general",
            "description": "General discussion for everyone."
        },
        {
            "name": "coding",
            "description": "Talk about programming, code, and tech."
        },
        {
            "name": "news",
            "description": "Latest news from around the world."
        },
        {
            "name": "reactnative",
            "description": "Everything React Native and Expo."
        },
        {
            "name": "django",
            "description": "The web framework for perfectionists with deadlines."
        }
    ]

    for data in communities:
        name = data["name"]
        slug = slugify(name)
        if not Community.objects.filter(slug=slug).exists():
            Community.objects.create(
                name=name,
                slug=slug,
                description=data["description"],
                owner=user
            )
            print(f"Created community: r/{name}")
        else:
            print(f"Community already exists: r/{name}")

if __name__ == "__main__":
    seed_communities()
