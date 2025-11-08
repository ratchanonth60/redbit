import graphene
from apps.users.models import User
from graphene_django import DjangoObjectType


class UserType(DjangoObjectType):
    total_karma = graphene.Int()
    follower_count = graphene.Int()
    following_count = graphene.Int()
    is_following = graphene.Boolean()
    
    class Meta:
        model = User
        fields = (
            "id", "username", "email", "bio", 
            "profile_picture", "banner_image",
            "post_karma", "comment_karma",
            "date_joined", "last_seen", "is_online"
        )
    
    def resolve_total_karma(self, info):
        return self.total_karma
    
    def resolve_follower_count(self, info):
        return self.follower_count
    
    def resolve_following_count(self, info):
        return self.following_count
    
    def resolve_is_following(self, info):
        user = info.context.user
        if not user.is_authenticated:
            return False
        return self.followers.filter(id=user.id).exists()

class UserSettingsType(graphene.ObjectType):
    notifications_enabled = graphene.Boolean()
    dark_mode = graphene.Boolean()
