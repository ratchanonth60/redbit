import graphene
from apps.posts.models import Comment, Post
from apps.votes.models import Vote
from django.utils.timesince import timesince
from graphene_django import DjangoObjectType


class PostType(DjangoObjectType):
    """
    GraphQL Type สำหรับ Post Model
    เราจะเพิ่ม custom fields ที่นี่เพื่อให้ตรงกับ frontend
    """

    # Custom fields ให้ตรงกับ frontend types/post.ts
    time_ago = graphene.String()
    upvotes = graphene.Int()
    comment_count = graphene.Int()
    user_vote = graphene.String()  # "up", "down", หรือ null

    class Meta:
        model = Post
        fields = (
            "id",
            "author",
            "community",
            "title",
            "content",
            "image_url",
            "created_at",
        )

    def resolve_time_ago(self, info):
        """แปลง datetime เป็น 'X hours ago'"""
        return f"{timesince(self.created_at)} ago"

    def resolve_upvotes(self, info):
        """ดึงคะแนนโหวตสุทธิจาก property ของ model"""
        return self.total_votes

    def resolve_comment_count(self, info):
        """ดึงจำนวนคอมเมนต์จาก property ของ model"""
        return self.comment_count

    def resolve_user_vote(self, info):
        """
        ตรวจสอบว่า user ที่ login อยู่ โหวตโพสต์นี้หรือยัง
        """
        user = info.context.user
        if not user.is_authenticated:
            return None
        try:
            # ใช้ GenericRelation 'votes' ที่เราตั้งใน model
            vote = self.votes.get(user=user)
            # VoteType ใน model ของคุณคือ "UPVOTE" หรือ "DOWNVOTE"
            # frontend คาดหวัง "up" หรือ "down"
            return "up" if vote.vote_type == Vote.VoteType.UPVOTE else "down"
        except Vote.DoesNotExist:
            return None


class CommentType(DjangoObjectType):
    """
    GraphQL Type สำหรับ Comment Model
    """

    time_ago = graphene.String()
    upvotes = graphene.Int()
    user_vote = graphene.String()
    # Field สำหรับ nested replies
    replies = graphene.List(lambda: CommentType)

    class Meta:
        model = Comment
        fields = (
            "id",
            "author",
            "post",
            "parent",
            "content",
            "created_at",
        )

    def resolve_time_ago(self, info):
        return f"{timesince(self.created_at)} ago"

    def resolve_upvotes(self, info):
        return self.total_votes

    def resolve_user_vote(self, info):
        user = info.context.user
        if not user.is_authenticated:
            return None
        try:
            vote = self.votes.get(user=user)
            return "up" if vote.value = 1 else "down"
        except Vote.DoesNotExist:
            return None

    def resolve_replies(self, info):
        """
        ดึง replies (comment ลูก) ของ comment นี้
        """
        return self.replies.all()
