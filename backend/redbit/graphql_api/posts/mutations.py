import graphene
from apps.communities.models import Community
from apps.posts.models import Comment, Post
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from graphql_jwt.decorators import login_required
from graphene_file_upload.scalars import Upload
from .types import CommentType, PostType


class VoteMutation(graphene.Mutation):
    """Vote on a post"""

    class Arguments:
        post_id = graphene.ID(required=True)
        value = graphene.Int(required=True)  # 1 for upvote, -1 for downvote

    success = graphene.Boolean()
    post = graphene.Field(PostType)
    errors = graphene.List(graphene.String)

    @login_required
    def mutate(self, info, post_id, value):
        user = info.context.user
        if value not in [1, -1]:
            return VoteMutation(success=False, errors=["Invalid value."])

        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            return VoteMutation(success=False, errors=["Post not found."])

        content_type = ContentType.objects.get_for_model(Post)
        vote, created = post.votes.get_or_create(user=user, content_type=content_type, object_id=post_id)

        if not created:
            if vote.value == value:
                vote.delete()
            else:
                vote.value = value
                vote.save()

        return VoteMutation(success=True, post=post, errors=[])


class CreateComment(graphene.Mutation):
    """Create new comment"""

    class Arguments:
        post_id = graphene.ID(required=True)
        content = graphene.String(required=True)

    success = graphene.Boolean()
    comment = graphene.Field(CommentType)
    errors = graphene.List(graphene.String)

    @login_required
    def mutate(self, info, post_id, content):
        user = info.context.user
        errors = []

        if not content.strip():
            errors.append("Content cannot be empty.")
            return CreateComment(success=False, errors=errors)

        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            errors.append("Post not found.")
            return CreateComment(success=False, errors=errors)

        comment = Comment.objects.create(author=user, post=post, content=content)

        return CreateComment(success=True, comment=comment, errors=[])


class CreatePost(graphene.Mutation):
    """Create new post"""

    class Arguments:
        community_name = graphene.String(required=True)
        title = graphene.String(required=True)
        content = graphene.String()
        image_url = graphene.String()
        image = Upload()

    success = graphene.Boolean()
    post = graphene.Field(PostType)
    errors = graphene.List(graphene.String)

    @login_required
    def mutate(self, info, community_name, title, content=None, image_url=None, image=None):
        user = info.context.user
        errors = []

        # Validation
        if len(title) < 3 or len(title) > 300:
            errors.append("Title must be between 3 and 300 characters.")

        if image_url:
            val = URLValidator()
            try:
                val(image_url)
            except ValidationError:
                errors.append("Invalid image URL.")

        try:
            community = Community.objects.get(name=community_name)
        except Community.DoesNotExist:
            errors.append("Community not found.")
            return CreatePost(success=False, errors=errors)

        if errors:
            return CreatePost(success=False, errors=errors)

        post = Post.objects.create(
            author=user, community=community, title=title, content=content, image_url=image_url, image=image
        )

        return CreatePost(success=True, post=post, errors=[])


class UpdatePost(graphene.Mutation):
    """Update existing post"""

    class Arguments:
        post_id = graphene.ID(required=True)
        title = graphene.String()
        content = graphene.String()
        image_url = graphene.String()

    success = graphene.Boolean()
    post = graphene.Field(PostType)
    errors = graphene.List(graphene.String)

    @login_required
    def mutate(self, info, post_id, **kwargs):
        user = info.context.user
        errors = []

        try:
            post = Post.objects.get(pk=post_id, author=user)
        except Post.DoesNotExist:
            errors.append("Post not found or you don't have permission.")
            return UpdatePost(success=False, errors=errors)

        if "title" in kwargs:
            if len(kwargs["title"]) < 3 or len(kwargs["title"]) > 300:
                errors.append("Title must be between 3 and 300 characters.")
            else:
                post.title = kwargs["title"]

        if "content" in kwargs:
            post.content = kwargs["content"]

        if "image_url" in kwargs:
            image_url = kwargs["image_url"]
            if image_url:
                val = URLValidator()
                try:
                    val(image_url)
                except ValidationError:
                    errors.append("Invalid image URL.")
            post.image_url = image_url

        if errors:
            return UpdatePost(success=False, errors=errors)

        post.save()
        return UpdatePost(success=True, post=post, errors=[])


class DeletePost(graphene.Mutation):
    """Delete post"""

    class Arguments:
        post_id = graphene.ID(required=True)

    success = graphene.Boolean()

    @login_required
    def mutate(self, info, post_id):
        user = info.context.user

        try:
            post = Post.objects.get(pk=post_id)

            # Check permission
            if post.author != user and not user.is_staff:
                return DeletePost(success=False)

            post.delete()
            return DeletePost(success=True)
        except Post.DoesNotExist:
            return DeletePost(success=False)


class UpdateComment(graphene.Mutation):
    """Update comment"""

    class Arguments:
        comment_id = graphene.ID(required=True)
        content = graphene.String(required=True)

    success = graphene.Boolean()
    comment = graphene.Field(CommentType)
    errors = graphene.List(graphene.String)

    @login_required
    def mutate(self, info, comment_id, content):
        user = info.context.user

        try:
            comment = Comment.objects.get(pk=comment_id, author=user)

            if not content.strip():
                return UpdateComment(success=False, errors=["Content cannot be empty."])

            comment.content = content
            comment.save()

            return UpdateComment(success=True, comment=comment, errors=[])
        except Comment.DoesNotExist:
            return UpdateComment(success=False, errors=["Comment not found or you don't have permission."])


class DeleteComment(graphene.Mutation):
    """Delete comment"""

    class Arguments:
        comment_id = graphene.ID(required=True)

    success = graphene.Boolean()

    @login_required
    def mutate(self, info, comment_id):
        user = info.context.user

        try:
            comment = Comment.objects.get(pk=comment_id)

            # Check permission
            if comment.author != user and not user.is_staff:
                return DeleteComment(success=False)

            comment.delete()
            return DeleteComment(success=True)
        except Comment.DoesNotExist:
            return DeleteComment(success=False)


class Mutation(graphene.ObjectType):
    create_post = CreatePost.Field()
    update_post = UpdatePost.Field()
    delete_post = DeletePost.Field()
    create_comment = CreateComment.Field()  # existing
    update_comment = UpdateComment.Field()
    delete_comment = DeleteComment.Field()
    vote = VoteMutation.Field()  # existing
