from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class Vote(models.Model):
    UPVOTE = 1
    DOWNVOTE = -1
    VOTE_CHOICES = (
        (UPVOTE, "Upvote"),
        (DOWNVOTE, "Downvote"),
    )

    # User ที่โหวต
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="votes")

    # ค่าโหวต (1 หรือ -1)
    value = models.SmallIntegerField(choices=VOTE_CHOICES)

    # --- Generic Foreign Key ---
    # 1. ชนิดของ Model (เช่น Post หรือ Comment)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)

    # 2. ID ของ object นั้นๆ (เช่น Post ID ที่ 5)
    object_id = models.PositiveIntegerField()

    # 3. field เสมือนสำหรับดึง object (Post, Comment)
    content_object = GenericForeignKey("content_type", "object_id")
    # -----------------------------

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        # User 1 คน สามารถโหวต 1 object ได้แค่ครั้งเดียว
        unique_together = ("user", "content_type", "object_id")

        db_table = "votes"
