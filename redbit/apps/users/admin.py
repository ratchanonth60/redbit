from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    ใช้ UserAdmin ที่ Django เตรียมไว้ให้เป็นฐาน
    แล้วเราสามารถปรับแต่ง fieldset หรือ list_display เพิ่มเติมได้
    """

    list_display = ("username", "email", "first_name", "last_name", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active", "date_joined")
    search_fields = ("username", "email", "first_name", "last_name")

