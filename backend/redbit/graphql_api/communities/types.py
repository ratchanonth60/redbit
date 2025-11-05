from apps.communities.models import Community
from graphene_django import DjangoObjectType


# --- สร้าง Types ---
class CommunityType(DjangoObjectType):
    class Meta:
        model = Community
        fields = "__all__"



