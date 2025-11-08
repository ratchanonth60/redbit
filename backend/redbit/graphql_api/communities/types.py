import graphene
from apps.communities.models import Community
from graphene_django import DjangoObjectType


class CommunityType(DjangoObjectType):
    member_count = graphene.Int()
    post_count = graphene.Int()
    is_member = graphene.Boolean()
    
    class Meta:
        model = Community
        fields = "__all__"
    
    def resolve_member_count(self, info):
        return self.members.count()
    
    def resolve_post_count(self, info):
        return self.posts.count()
    
    def resolve_is_member(self, info):
        user = info.context.user
        if not user.is_authenticated:
            return False
        return self.members.filter(id=user.id).exists()
