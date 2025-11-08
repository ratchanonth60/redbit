from celery import shared_task


@shared_task
def send_notification(user_id, notification_type, message):
    # Implement logic to send notifications to a user
    pass


@shared_task
def update_post_score(post_id):
    """
    update hot score for posts
    """
    pass
