from django.conf import settings
from django.contrib.contenttypes.fields import GenericRelation
from django.db import models

from core.models import TimestampedModel


class Community(TimestampedModel):
    name = models.CharField(max_length=100, unique=True, db_index=True)
    slug = models.SlugField(max_length=120, unique=True, db_index=True)
    description = models.TextField(blank=True)

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name="owned_communities", null=True, blank=True
    )
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="joined_communities", blank=True)

    # ไม่ต้องมี created_at, updated_at แล้ว เพราะอยู่ใน TimestampedModel

    class Meta(TimestampedModel.Meta):
        db_table = "community"
        verbose_name_plural = "communities"  # แก้ชื่อในหน้า Admin ให้ถูกต้อง

    def __str__(self):
        return self.name


class Post(TimestampedModel):
    title = models.CharField(max_length=255)
    content = models.TextField()

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name="posts", null=True, blank=True
    )
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="posts")

    # สร้าง "ทางลัด" ให้เราสามารถเรียก .votes จาก Post object ได้
    # มันจะชี้ไปที่ Vote model ที่ GenericForeignKey ชี้มาหามัน
    votes = GenericRelation("votes.Vote", related_query_name="post")

    class Meta(TimestampedModel.Meta):
        ordering = ["-created_at"]
        db_table = "post"

    def __str__(self):
        return self.title


class Comment(TimestampedModel):
    content = models.TextField()

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name="comments", null=True, blank=True
    )
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")

    # ชี้ไปที่ Vote model เช่นกัน
    votes = GenericRelation("votes.Vote", related_query_name="comment")

    class Meta(TimestampedModel.Meta):
        ordering = ["created_at"]
        db_table = "comment"

    def __str__(self):
        return f"Comment by {self.author_id or 'deleted'} on {self.post_id}"
