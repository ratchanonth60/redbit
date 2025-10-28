
from apps import APPS_MODULE_NAME, APPS_THIRD_PARTY
from gqlauth.settings_type import GqlAuthSettings

from .base import *

INSTALLED_APPS += APPS_MODULE_NAME + APPS_THIRD_PARTY
AUTH_USER_MODEL = "users.User"

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR.parent / "mediafiles"  # ชี้ไปที่ redbit/mediafiles

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",  # <-- อันนี้คือของเดิม (สำหรับ Admin)
]

STRAWBERRY = {
    "SCHEMA": "redbit.graphql_api.schema.schema",
}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "gqlauth.core.middlewares.django_jwt_middleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
GQL_AUTH = GqlAuthSettings(
    LOGIN_REQUIRE_CAPTCHA=False,
    REGISTER_REQUIRE_CAPTCHA=False,
)
GRAPHQL_JWT = {
    "JWT_VERIFY_EXPIRATION": True,
    "JWT_LONG_RUNNING_REFRESH_TOKEN": True,
}
