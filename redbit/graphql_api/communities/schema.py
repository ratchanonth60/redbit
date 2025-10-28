import graphene
from apps.communities.models import Comment, Community, Post
from graphene_django import DjangoObjectType


# --- สร้าง Types ---
class CommunityType(DjangoObjectType):
    class Meta:
        model = Community
        fields = "__all__"


class PostType(DjangoObjectType):
    class Meta:
        model = Post
        fields = "__all__"


class CommentType(DjangoObjectType):
    class Meta:
        model = Comment
        fields = "__all__"


# --- สร้าง Queries ---
class CommunityQuery(graphene.ObjectType):
    # posts: List[PostType] -> graphene.List(PostType)
    posts = graphene.List(PostType)

    # community_by_slug(slug: str) -> CommunityType
    community_by_slug = graphene.Field(CommunityType, slug=graphene.String(required=True))

    def resolve_posts(self, info, **kwargs):
        """
        Query เพื่อดึง Post ทั้งหมด
        (Graphene ต้องเขียน resolver ชัดเจน)
        """
        return Post.objects.all()

    def resolve_community_by_slug(self, info, slug):
        """
        Query เพื่อดึง Community 1 อันด้วย slug
        """
        try:
            return Community.objects.get(slug=slug)
        except Community.DoesNotExist:
            return None

