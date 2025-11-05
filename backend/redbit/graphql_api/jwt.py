import graphene
import graphql_jwt


# สร้างคลาสสำหรับ Auth Mutations
class AuthMutation(graphene.ObjectType):
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()
    revoke_token = graphql_jwt.Revoke.Field()


# --- หมายเหตุ ---
# graphene-django-jwt (ตัวนี้) จะจัดการแค่การ Login, Verify, Refresh Token
# ส่วนการ Register, Password Reset ฯลฯ (ที่ gqlauth เคยมี)
# คุณจะต้องเขียนเป็น Mutation ของคุณเอง
