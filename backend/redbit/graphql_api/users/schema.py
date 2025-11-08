import graphene
from apps.users.models import User
from graphql_jwt.decorators import login_required

from .types import UserSettingsType, UserType


class UserQuery(graphene.ObjectType):
    # Current user
    me = graphene.Field(UserType)
    my_settings = graphene.Field(UserSettingsType)
    
    # User lookup
    user = graphene.Field(UserType, username=graphene.String(required=True))
    users = graphene.List(UserType, search=graphene.String())
    
    # Followers/Following
    my_followers = graphene.List(UserType)
    my_following = graphene.List(UserType)
    user_followers = graphene.List(UserType, username=graphene.String(required=True))
    user_following = graphene.List(UserType, username=graphene.String(required=True))

    @login_required
    def resolve_me(self, info):
        return info.context.user

    @login_required
    def resolve_my_settings(self, info):
        user = info.context.user
        return {
            'notifications_enabled': user.notifications_enabled,
            'dark_mode': user.dark_mode,
        }

    def resolve_user(self, info, username):
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None

    def resolve_users(self, info, search=None):
        if search:
            return User.objects.filter(
                username__icontains=search
            )[:10]
        return User.objects.all()[:10]

    @login_required
    def resolve_my_followers(self, info):
        return info.context.user.followers.all()

    @login_required
    def resolve_my_following(self, info):
        return info.context.user.following.all()

    def resolve_user_followers(self, info, username):
        try:
            user = User.objects.get(username=username)
            return user.followers.all()
        except User.DoesNotExist:
            return []

    def resolve_user_following(self, info, username):
        try:
            user = User.objects.get(username=username)
            return user.following.all()
        except User.DoesNotExist:
            return []
