import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "redbit.settings.local")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print("Existing users:")
for u in User.objects.all():
    print(f"- {u.username} (email: {u.email}, active: {u.is_active})")

try:
    u = User.objects.get(username="root")
    u.set_password("root")
    u.save()
    print("Successfully reset password for user 'root' to 'root'")
except User.DoesNotExist:
    print("User 'root' not found. Creating...")
    User.objects.create_superuser("root", "root@example.com", "root")
    print("Created superuser 'root' with password 'root'")
