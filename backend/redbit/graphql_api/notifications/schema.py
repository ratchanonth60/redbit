import graphene
from graphql_jwt.decorators import login_required

from .types import NotificationType


class NotificationQuery(graphene.ObjectType):
    my_notifications = graphene.List(NotificationType, unread_only=graphene.Boolean())
    unread_count = graphene.Int()
    
    @login_required
    def resolve_my_notifications(self, info, unread_only=False):
        user = info.context.user
        qs = user.notifications.all()
        if unread_only:
            qs = qs.filter(is_read=False)
        return qs[:20]
    
    @login_required
    def resolve_unread_count(self, info):
        return info.context.user.notifications.filter(is_read=False).count()
