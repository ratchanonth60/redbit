import graphene
import graphql_jwt
from graphql_jwt.refresh_token.shortcuts import refresh_token_lazy
from graphql_api.users.types import UserType


class ObtainJSONWebToken(graphql_jwt.ObtainJSONWebToken):
    user = graphene.Field(UserType)

    @classmethod
    def resolve(cls, root, info, **kwargs):
        return cls(user=info.context.user)


# สร้างคลาสสำหรับ Auth Mutations
class AuthMutation(graphene.ObjectType):
    token_auth = ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()
    revoke_token = graphql_jwt.Revoke.Field()


# --- หมายเหตุ ---
# graphene-django-jwt (ตัวนี้) จะจัดการแค่การ Login, Verify, Refresh Token
# ส่วนการ Register, Password Reset ฯลฯ (ที่ gqlauth เคยมี)
# คุณจะต้องเขียนเป็น Mutation ของคุณเอง
