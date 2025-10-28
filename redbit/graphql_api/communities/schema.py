from typing import List

import strawberry
import strawberry_django
from apps.communities.models import Comment, Community, Post


@strawberry_django.type(Community, fields="__all__")
class CommunityType:
    pass

@strawberry_django.type(Post, fields="__all__")
class PostType:
    pass

@strawberry_django.type(Comment, fields="__all__")
class CommentType:
    pass

# --- สร้าง Queries ---

@strawberry.type
class CommunityQuery:

    @strawberry.field
    def posts(self) -> List[PostType]:
        """
        Query เพื่อดึง Post ทั้งหมด
        (Strawberry จะรัน Post.objects.all() ให้)
        """
        return Post.objects.all()

    @strawberry.field
    def community_by_slug(self, slug: str) -> CommunityType:
        """
        Query เพื่อดึง Community 1 อันด้วย slug
        """
        return Community.objects.get(slug=slug)
