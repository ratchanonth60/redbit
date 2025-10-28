from apps import APPS_MODULE_NAME, APPS_THIRD_PARTY
import datetime

from .base import *

KEYS_DIR = BASE_DIR.parent.parent / "keys"
PRIVATE_KEY_PATH = KEYS_DIR / "private_key.pem"
PUBLIC_KEY_PATH = KEYS_DIR / "public_key.pem"

# --- อ่านเนื้อหา Key ---
try:
    with open(PRIVATE_KEY_PATH, "r") as f:
        JWT_PRIVATE_KEY = f.read()
    with open(PUBLIC_KEY_PATH, "r") as f:
        JWT_PUBLIC_KEY = f.read()
except FileNotFoundError:
    print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    print("!!! JWT Private/Public key files not found.         !!!")
    print("!!! Generate them and place in the 'keys' directory. !!!")
    print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    # ควรจะ raise error หรือ exit ใน Production
    JWT_PRIVATE_KEY = None
    JWT_PUBLIC_KEY = None

INSTALLED_APPS += APPS_MODULE_NAME + APPS_THIRD_PARTY
AUTH_USER_MODEL = "users.User"

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR.parent / "mediafiles"

AUTHENTICATION_BACKENDS = [
    "graphql_jwt.backends.JSONWebTokenBackend",
    "django.contrib.auth.backends.ModelBackend",
]
GRAPHENE = {
    "SCHEMA": "redbit.graphql_api.schema.schema",
    "MIDDLEWARE": ("graphql_jwt.middleware.JSONWebTokenMiddleware",),
}


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
GRAPHQL_JWT = {
    # --- เปลี่ยน Algorithm ---
    "JWT_ALGORITHM": "RS256",  # <-- ใช้ RS256
    # --- ระบุ Keys (อ่านมาจากไฟล์ .pem) ---
    "JWT_PRIVATE_KEY": JWT_PRIVATE_KEY,
    "JWT_PUBLIC_KEY": JWT_PUBLIC_KEY,
    # --- การตั้งค่าอื่นๆ ---
    "JWT_VERIFY_EXPIRATION": True,  # ตรวจสอบวันหมดอายุ
    "JWT_LONG_RUNNING_REFRESH_TOKEN": True,  # เปิดใช้งาน Refresh Token
    "JWT_EXPIRATION_DELTA": datetime.timedelta(minutes=15),  # อายุ Access Token
    "JWT_REFRESH_EXPIRATION_DELTA": datetime.timedelta(days=7),  # อายุ Refresh Token
    "JWT_LEEWAY": 0,  # ไม่อนุญาตความคลาดเคลื่อนเวลา
    # --- (Optional) Audience/Issuer ---
    # "JWT_AUDIENCE": "your-frontend-audience",
    # "JWT_ISSUER": "your-api-issuer",
    # --- (Optional) Cookie Settings ---
    # "JWT_AUTH_COOKIE": "authToken",
    # "JWT_REFRESH_COOKIE": "refreshToken",
    # "JWT_AUTH_COOKIE_SECURE": True,
    # "JWT_AUTH_COOKIE_HTTP_ONLY": True,
    # "JWT_AUTH_COOKIE_SAMESITE": "Lax",
}
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = "noreply@redbit.com"


CELERY_BROKER_URL = env("CELERY_BROKER_URL", default="redis://redis:6379/0")  # 'redis' คือชื่อ service ใน docker-compose
CELERY_RESULT_BACKEND = env("CELERY_RESULT_BACKEND", default="redis://redis:6379/0")  # (Optional) ถ้าต้องการเก็บผลลัพธ์ Task
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE
