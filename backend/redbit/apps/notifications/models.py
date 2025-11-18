from core.models import TimestampedModel
from django.conf import settings
from django.db import models


class Notification(TimestampedModel):
    class NotificationType(models.TextChoices):
        UPVOTE = "upvote", "Upvote"
        COMMENT = "comment", "Comment"
        REPLY = "reply", "Reply"
        FOLLOW = "follow", "Follow"
        MENTION = "mention", "Mention"
    
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_notifications",
        null=True
    )
    
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices
    )
    
    # Generic relation to Post/Comment
    content_type = models.ForeignKey(
        'contenttypes.ContentType',
        on_delete=models.CASCADE,
        null=True
    )
    object_id = models.PositiveIntegerField(null=True)
    
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
        ]
