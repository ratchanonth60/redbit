from apps import APPS_MODULE_NAME

from .base import *

INSTALLED_APPS += APPS_MODULE_NAME
AUTH_USER_MODEL = "users.User"

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR.parent / "mediafiles"  # ชี้ไปที่ redbit/mediafiles
