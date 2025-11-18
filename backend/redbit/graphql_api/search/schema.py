import graphene
from apps.communities.models import Community
from apps.posts.models import Post
from apps.users.models import User
from django.db import models
from graphql_api.communities.types import CommunityType
from graphql_api.posts.types import PostType
from graphql_api.users.types import UserType


class SearchResultType(graphene.ObjectType):
    posts = graphene.List(PostType)
    communities = graphene.List(CommunityType)
    users = graphene.List(UserType)

class SearchQuery(graphene.ObjectType):
    search = graphene.Field(
        SearchResultType,
        query=graphene.String(required=True),
        limit=graphene.Int()
    )

    def resolve_search(self, info, query, limit=10):
        # Search posts
        posts = Post.objects.filter(
            models.Q(title__icontains=query) | 
            models.Q(content__icontains=query)
        ).select_related('author', 'community')[:limit]
        
        # Search communities
        communities = Community.objects.filter(
            models.Q(name__icontains=query) | 
            models.Q(description__icontains=query)
        ).select_related('owner')[:limit]
        
        # Search users
        users = User.objects.filter(
            models.Q(username__icontains=query) | 
            models.Q(bio__icontains=query)
        )[:limit]
        
        return {
            'posts': posts,
            'communities': communities,
            'users': users
        }
