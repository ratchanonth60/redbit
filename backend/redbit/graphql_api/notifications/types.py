from apps.notifications.models import Notification
from graphene_django import DjangoObjectType


class NotificationType(DjangoObjectType):
    class Meta:
        model = Notification
        fields = "__all__"
