import graphene
from apps.users.models import User
from graphene_django import DjangoObjectType


# เปลี่ยนจาก @strawberry_django.type
class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ("id", "username", "email", "bio", "profile_picture", "post_karma", "comment_karma")
        # Graphene ต้องกำหนด fields ใน Meta (หรือปล่อยเป็น fields = "__all__")


# เปลี่ยนจาก @strawberry.type
class UserQuery(graphene.ObjectType):
    # 'me' query (ที่เคยได้จาก gqlauth) ต้องทำเอง
    me = graphene.Field(UserType)

    # query ทดสอบ
    hello_user = graphene.String()

    def resolve_me(self, info):
        """
        Query เพื่อดึงข้อมูล User ที่กำลัง login
        """
        user = info.context.user
        if user.is_anonymous:
            return None
        return user

    def resolve_hello_user(self, info):
        return "Hello from the User app!"

