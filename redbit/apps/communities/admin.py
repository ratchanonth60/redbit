from django.contrib import admin

from apps.votes.admin import VoteInline

from .models import Comment, Community, Post


@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "created_at")
    search_fields = ("name", "description")
    list_filter = ("created_at", "owner")

    prepopulated_fields = {"slug": ("name",)}

    filter_horizontal = ("members",)


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "community", "created_at")
    list_filter = ("community", "created_at", "author")
    search_fields = ("title", "content")

    inlines = [
        VoteInline,
    ]


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "author", "post_title", "created_at")
    list_filter = ("created_at", "author")
    search_fields = ("content",)

    inlines = [
        VoteInline,
    ]

    def post_title(self, obj):
        return obj.post.title

    post_title.short_description = "Post"  # ตั้งชื่อหัวคอลัมน์

