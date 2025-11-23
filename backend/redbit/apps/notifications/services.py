from django.contrib.contenttypes.models import ContentType
from tasks.notifications import create_notification_task


def create_notification(recipient, sender, notification_type, message, related_object=None):
    """
    Service function to create notifications asynchronously using Celery.
    
    Args:
        recipient: User who will receive the notification
        sender: User who triggered the notification  
        notification_type: Type of notification
        message: Notification message
        related_object: Optional related object (Post, Comment, etc.)
    """
    if recipient == sender:
        return None
    
    content_type_id = None
    object_id = None
    
    if related_object:
        content_type = ContentType.objects.get_for_model(related_object)
        content_type_id = content_type.id
        object_id = related_object.id
    
    # Dispatch Celery task asynchronously
    create_notification_task.delay(
        recipient_id=recipient.id,
        sender_id=sender.id if sender else None,
        notification_type=notification_type,
        message=message,
        content_type_id=content_type_id,
        object_id=object_id
    )
    
    return None  # Task is async, no immediate return value
