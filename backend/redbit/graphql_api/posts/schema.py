import graphene
from apps.posts.models import Comment, Post
from graphql_jwt.decorators import login_required

from .types import CommentType, PostType


class PostQuery(graphene.ObjectType):
    # All posts
    all_posts = graphene.List(
        PostType,
        sort_by=graphene.String(),
        community=graphene.String(),
        search=graphene.String(),
        limit=graphene.Int(),
        offset=graphene.Int(),
        after=graphene.String(),
        first=graphene.String(),
    )

    # Single post
    post = graphene.Field(PostType, id=graphene.ID(required=True))

    # Comments
    comments = graphene.List(CommentType, post_id=graphene.ID(required=True))

    # User's posts
    user_posts = graphene.List(PostType, username=graphene.String(required=True))

    # My posts
    my_posts = graphene.List(PostType)

    def resolve_all_posts(self, info, sort_by="new", community=None, search=None, limit=20, offset=0):
        from django.db import models
        from django.db.models import Count, Q

        queryset = Post.objects.select_related("author", "community").prefetch_related("votes")

        # Filter by community
        if community:
            queryset = queryset.filter(Q(community__name=community) | Q(community__slug=community))

        # Search
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(content__icontains=search))

        # Sort
        if sort_by == "hot":
            # Simple hot algorithm: upvotes / age
            from datetime import timedelta
            from django.db.models import ExpressionWrapper, F, fields
            from django.utils import timezone

            queryset = queryset.annotate(
                upvote_count=Count("votes", filter=Q(votes__value=1)),
                age_hours=ExpressionWrapper(
                    (timezone.now() - F("created_at")) / timedelta(hours=1), output_field=fields.FloatField()
                ),
                hot_score=ExpressionWrapper(F("upvote_count") / (F("age_hours") + 2), output_field=fields.FloatField()),
            ).order_by("-hot_score")
        elif sort_by == "top":
            queryset = queryset.annotate(upvote_count=Count("votes", filter=Q(votes__value=1))).order_by(
                "-upvote_count"
            )
        else:  # new
            queryset = queryset.order_by("-created_at")

        return queryset[offset : offset + limit]

    def resolve_post(self, info, id):
        try:
            return Post.objects.select_related("author", "community").prefetch_related("votes").get(pk=id)
        except Post.DoesNotExist:
            return None

    def resolve_comments(self, info, post_id):
        return (
            Comment.objects.filter(post_id=post_id, parent=None)
            .select_related("author")
            .prefetch_related("votes", "replies")
        )

    def resolve_user_posts(self, info, username):
        return (
            Post.objects.filter(author__username=username).select_related("author", "community").order_by("-created_at")
        )

    @login_required
    def resolve_my_posts(self, info):
        return Post.objects.filter(author=info.context.user).select_related("community").order_by("-created_at")
