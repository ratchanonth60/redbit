from django.contrib import admin

from .models import Comment, Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'community', 'created_at', 'total_votes')
    list_filter = ('community', 'created_at', 'author')
    search_fields = ('title', 'content', 'author__username')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'post', 'parent', 'created_at', 'total_votes')
    list_filter = ('created_at', 'author')
    search_fields = ('content', 'author__username', 'post__title')
