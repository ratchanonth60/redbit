from django.contrib import admin
from django.contrib.contenttypes.admin import GenericTabularInline

from apps.votes.models import Vote


class VoteInline(GenericTabularInline):
    model = Vote
    extra = 1  # แสดงช่องให้กรอกใหม่ 1 ช่อง

    # field ที่ไม่ควรให้แก้ในหน้านี้ (เช่น user ควรเป็นคนโหวตปัจจุบัน)
    # readonly_fields = ('user',)


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "value",
        "content_object",
        "created_at",
    )
    list_filter = ("value", "content_type", "created_at")  # กรองตาม Upvote/Downvote หรือ กรองว่าโหวต Post/Comment
    search_fields = ("user__username",)
