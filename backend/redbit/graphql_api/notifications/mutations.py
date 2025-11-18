import graphene
from apps.notifications.models import Notification
from graphql_jwt.decorators import login_required


class MarkNotificationRead(graphene.Mutation):
    class Arguments:
        notification_id = graphene.ID(required=True)
    
    success = graphene.Boolean()
    
    @login_required
    def mutate(self, info, notification_id):
        try:
            notif = Notification.objects.get(
                id=notification_id,
                recipient=info.context.user
            )
            notif.is_read = True
            notif.save()
            return MarkNotificationRead(success=True)
        except Notification.DoesNotExist:
            return MarkNotificationRead(success=False)


class NotificationMutation(graphene.ObjectType):
    mark_notification_read = MarkNotificationRead.Field()
