from celery import shared_task
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

User = get_user_model()


@shared_task(ignore_result=True)
def send_confirmation_email_task(user_id: int):
    try:
        user = User.objects.get(pk=user_id, is_active=False)
    except User.DoesNotExist:
        print(f"[Celery Task] User {user_id} not found or is already active.")
        return

    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    confirm_url = f"http://your-frontend-domain.com/verify-email/{uid}/{token}/"

    try:
        print(f"[Celery Task] Sending confirmation email to {user.email}...")
        send_mail(
            "Verify your Redbit Account",
            f"Please click the link to confirm your registration: {confirm_url}",
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        print(f"[Celery Task] Email sent successfully to {user.email}.")
    except Exception as e:
        print(f"[Celery Task] Error sending email: {e}")
