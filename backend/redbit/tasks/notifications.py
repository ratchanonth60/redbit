from celery import shared_task
from django.contrib.contenttypes.models import ContentType


@shared_task
def create_notification_task(recipient_id, sender_id, notification_type, message, content_type_id=None, object_id=None):
    """
    Celery task to create a notification asynchronously.
    """
    from apps.notifications.models import Notification
    from django.contrib.auth import get_user_model
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    
    User = get_user_model()
    
    try:
        recipient = User.objects.get(id=recipient_id)
        sender = User.objects.get(id=sender_id) if sender_id else None
        
        # Don't create notification if sender and recipient are the same
        if recipient == sender:
            return None
        
        content_type = None
        if content_type_id:
            content_type = ContentType.objects.get(id=content_type_id)
        
        notification = Notification.objects.create(
            recipient=recipient,
            sender=sender,
            notification_type=notification_type,
            message=message,
            content_type=content_type,
            object_id=object_id
        )
        
        # Publish notification to Channels for real-time delivery
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"user_{recipient_id}_notifications",
                {
                    "type": "notification_message",
                    "notification": {
                        "id": str(notification.id),
                        "message": notification.message,
                        "notificationType": notification.notification_type,
                        "isRead": notification.is_read,
                        "createdAt": notification.created_at.isoformat(),
                        "sender": {
                            "id": str(sender.id) if sender else None,
                            "username": sender.username if sender else None,
                        } if sender else None,
                    }
                }
            )
        
        return notification.id
    except Exception as e:
        # Log error but don't fail the main request
        print(f"Error creating notification: {e}")
        return None


@shared_task
def update_post_score(post_id):
    """
    Update hot score for posts
    """
    pass
