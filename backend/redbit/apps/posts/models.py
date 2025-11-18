from apps.communities.models import Community
from apps.users.models import User
from apps.votes.models import Vote
from core.models import TimestampedModel
from django.contrib.contenttypes.fields import GenericRelation
from django.db import models


class Post(TimestampedModel):
    """
    Model สำหรับเก็บโพสต์
    """

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="posts")
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    image = models.ImageField(upload_to="images/", blank=True, null=True)
    # เชื่อมโยงกับระบบ Vote ที่มีอยู่
    votes = GenericRelation(Vote)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def upvotes_count(self):
        """นับคะแนนโหวต (คำนวณจากระบบ Vote)"""
        return self.votes.filter(value=Vote.VoteType.UPVOTE).count()

    @property
    def downvotes_count(self):
        """นับคะแนนโหวตลง"""
        return self.votes.filter(value=Vote.VoteType.DOWNVOTE).count()

    @property
    def total_votes(self):
        """คะแนนโหวตสุทธิ"""
        return self.upvotes_count - self.downvotes_count

    @property
    def comment_count(self):
        """นับจำนวนคอมเมนต์ทั้งหมด (รวม replies)"""
        return self.comments.count()


class Comment(TimestampedModel):
    """
    Model สำหรับเก็บคอมเมนต์
    """

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")

    # สำหรับ nested comments (replies)
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="replies")

    content = models.TextField()

    # เชื่อมโยงกับระบบ Vote ที่มีอยู่
    votes = GenericRelation(Vote)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.title}"

    @property
    def total_votes(self):
        """คะแนนโหวตสุทธิ"""
        upvotes = self.votes.filter(vote_type=Vote.VoteType.UPVOTE).count()
        downvotes = self.votes.filter(vote_type=Vote.VoteType.DOWNVOTE).count()
        return upvotes - downvotes
