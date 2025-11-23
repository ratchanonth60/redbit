import graphene
from apps.notifications.models import Notification
from graphql_jwt.decorators import login_required


class MarkNotificationRead(graphene.Mutation):
    class Arguments:
        notification_id = graphene.ID(required=False)
    
    success = graphene.Boolean()
    
    @login_required
    def mutate(self, info, notification_id=None):
        user = info.context.user
        if notification_id:
            try:
                notif = Notification.objects.get(
                    id=notification_id,
                    recipient=user
                )
                notif.is_read = True
                notif.save()
            except Notification.DoesNotExist:
                return MarkNotificationRead(success=False)
        else:
            # Mark all as read
            user.notifications.filter(is_read=False).update(is_read=True)
            
        return MarkNotificationRead(success=True)


class NotificationMutation(graphene.ObjectType):
    mark_notification_read = MarkNotificationRead.Field()
