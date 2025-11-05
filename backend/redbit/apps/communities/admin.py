from django.contrib import admin

from .models import Community


@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "created_at")
    search_fields = ("name", "description")
    list_filter = ("created_at", "owner")

    prepopulated_fields = {"slug": ("name",)}

    filter_horizontal = ("members",)


