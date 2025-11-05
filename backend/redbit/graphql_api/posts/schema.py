import graphene
from apps.posts.models import Comment, Post

from .types import CommentType, PostType


class Query(graphene.ObjectType):
    # สำหรับหน้าแรก (index.tsx)
    all_posts = graphene.List(PostType)
    
    # สำหรับหน้ารายละเอียดโพสต์ ([id].tsx)
    post = graphene.Field(PostType, id=graphene.ID(required=True))
    
    # สำหรับดึงคอมเมนต์ในหน้ารายละเอียด ([id].tsx)
    comments = graphene.List(CommentType, post_id=graphene.ID(required=True))

    def resolve_all_posts(self, info, **kwargs):
        # ดึงโพสต์ทั้งหมด (ในอนาคตสามารถเพิ่ม pagination ที่นี่ได้)
        return Post.objects.all()

    def resolve_post(self, info, id):
        try:
            return Post.objects.get(pk=id)
        except Post.DoesNotExist:
            return None
    
    def resolve_comments(self, info, post_id):
        try:
            # ดึงเฉพาะคอมเมนต์ระดับบนสุด (ที่ไม่ใช่ reply)
            return Comment.objects.filter(post_id=post_id, parent=None)
        except Comment.DoesNotExist:
            return []
