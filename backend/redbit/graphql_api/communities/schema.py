import graphene
from apps.communities.models import Community

from .types import CommunityType


# --- สร้าง Queries ---
class CommunityQuery(graphene.ObjectType):
    # posts: List[PostType] -> graphene.List(PostType)

    # community_by_slug(slug: str) -> CommunityType
    community_by_slug = graphene.Field(CommunityType, slug=graphene.String(required=True))


    def resolve_community_by_slug(self, info, slug):
        """
        Query เพื่อดึง Community 1 อันด้วย slug
        """
        try:
            return Community.objects.get(slug=slug)
        except Community.DoesNotExist:
            return None

