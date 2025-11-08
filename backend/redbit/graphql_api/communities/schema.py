import graphene
from apps.communities.models import Community
from django.db import models
from graphql_jwt.decorators import login_required

from .types import CommunityType


class CommunityQuery(graphene.ObjectType):
    # Single community
    community_by_slug = graphene.Field(
        CommunityType, 
        slug=graphene.String(required=True)
    )
    
    # All communities
    communities = graphene.List(
        CommunityType,
        search=graphene.String(),
        sort_by=graphene.String(),
        limit=graphene.Int()
    )
    
    # User's communities
    my_communities = graphene.List(CommunityType)
    
    # Trending communities
    trending_communities = graphene.List(CommunityType, limit=graphene.Int())

    def resolve_community_by_slug(self, info, slug):
        try:
            return Community.objects.select_related('owner').prefetch_related(
                'members'
            ).get(slug=slug)
        except Community.DoesNotExist:
            return None

    def resolve_communities(self, info, search=None, sort_by="members", limit=20):
        queryset = Community.objects.select_related('owner')
        
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        if sort_by == "members":
            queryset = queryset.annotate(
                member_count=models.Count('members')
            ).order_by('-member_count')
        elif sort_by == "new":
            queryset = queryset.order_by('-created_at')
        
        return queryset[:limit]

    @login_required
    def resolve_my_communities(self, info):
        return info.context.user.joined_communities.all()

    def resolve_trending_communities(self, info, limit=10):
        from datetime import timedelta

        from django.db.models import Count
        from django.utils import timezone
        
        # Communities with most posts in last 7 days
        week_ago = timezone.now() - timedelta(days=7)
        
        return Community.objects.annotate(
            recent_post_count=Count(
                'posts',
                filter=models.Q(posts__created_at__gte=week_ago)
            )
        ).order_by('-recent_post_count')[:limit]
