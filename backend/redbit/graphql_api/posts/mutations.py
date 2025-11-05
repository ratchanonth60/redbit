import graphene
from apps.communities.models import Community
from apps.posts.models import Comment, Post
from apps.votes.models import Vote
from django.contrib.contenttypes.models import ContentType
from graphql_jwt.decorators import login_required

from .types import CommentType, PostType


class CreatePost(graphene.Mutation):
    """สร้างโพสต์ใหม่"""
    class Arguments:
        community_name = graphene.String(required=True)
        title = graphene.String(required=True)
        content = graphene.String()
        image_url = graphene.String()

    post = graphene.Field(PostType)

    @login_required
    def mutate(self, info, community_name, title, content=None, image_url=None):
        user = info.context.user
        try:
            # หา community จากชื่อ
            community = Community.objects.get(name=community_name)
        except Community.DoesNotExist:
            raise Exception("Community not found")

        post = Post.objects.create(
            author=user,
            community=community,
            title=title,
            content=content,
            image_url=image_url
        )
        return CreatePost(post=post)

class CreateComment(graphene.Mutation):
    """สร้างคอมเมนต์ใหม่ (หรือ reply)"""
    class Arguments:
        post_id = graphene.ID(required=True)
        content = graphene.String(required=True)
        parent_id = graphene.ID() # ระบุ ID นี้ ถ้าเป็นการ reply comment อื่น

    comment = graphene.Field(CommentType)

    @login_required
    def mutate(self, info, post_id, content, parent_id=None):
        user = info.context.user
        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            raise Exception("Post not found")
        
        parent = None
        if parent_id:
            try:
                parent = Comment.objects.get(pk=parent_id)
            except Comment.DoesNotExist:
                raise Exception("Parent comment not found")

        comment = Comment.objects.create(
            author=user,
            post=post,
            content=content,
            parent=parent
        )
        return CreateComment(comment=comment)

class VoteMutation(graphene.Mutation):
    """
    Mutation กลางสำหรับโหวต (Up/Down) ทั้ง Post และ Comment
    """
    class Arguments:
        object_id = graphene.ID(required=True) # ID ของ Post หรือ Comment
        model_name = graphene.String(required=True) # "post" หรือ "comment"
        vote_type = graphene.String(required=True) # "up" หรือ "down"

    # คืนค่า object ที่อัปเดตแล้ว
    post = graphene.Field(PostType)
    comment = graphene.Field(CommentType)

    @login_required
    def mutate(self, info, object_id, model_name, vote_type):
        user = info.context.user
        
        if model_name.lower() == 'post':
            model = Post
        elif model_name.lower() == 'comment':
            model = Comment
        else:
            raise Exception("Invalid model name")

        try:
            obj = model.objects.get(pk=object_id)
        except model.DoesNotExist:
            raise Exception("Object not found")

        # แปลง vote_type จาก frontend ("up", "down") เป็น "UPVOTE", "DOWNVOTE"
        new_vote_type = Vote.VoteType.UPVOTE if vote_type.lower() == 'up' else Vote.VoteType.DOWNVOTE
        
        content_type = ContentType.objects.get_for_model(model)
        
        try:
            # ตรวจสอบว่าเคยโหวตหรือยัง
            current_vote = Vote.objects.get(
                user=user, content_type=content_type, object_id=obj.id
            )
            
            if current_vote.vote_type == new_vote_type:
                # ถ้ากดปุ่มเดิมซ้ำ (เช่น กด upvote ซ้ำ) = ยกเลิกโหวต
                current_vote.delete()
            else:
                # ถ้าสลับโหวต (เช่น จาก up เป็น down) = อัปเดตโหวต
                current_vote.vote_type = new_vote_type
                current_vote.save()
        
        except Vote.DoesNotExist:
            # ถ้ายังไม่เคยโหวต = สร้างโหวตใหม่
            Vote.objects.create(
                user=user,
                content_type=content_type,
                object_id=obj.id,
                vote_type=new_vote_type
            )
        
        # คืนค่า object ที่อัปเดตแล้ว (เพื่อให้ frontend อัปเดต UI)
        obj.refresh_from_db()
        if model_name.lower() == 'post':
            return VoteMutation(post=obj)
        else:
            return VoteMutation(comment=obj)

class Mutation(graphene.ObjectType):
    create_post = CreatePost.Field()
    create_comment = CreateComment.Field()
    vote = VoteMutation.Field()
