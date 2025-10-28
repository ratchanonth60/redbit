import strawberry
from graphql_api.communities.schema import CommunityQuery
from graphql_api.users.schema import UserQuery
from strawberry_django.optimizer import DjangoOptimizerExtension


@strawberry.type
class Query(UserQuery, CommunityQuery):
    """
    นี่คือ Root Query
    มันจะรวม field ทั้งหมดจาก UserQuery และ CommunityQuery
    """
    pass

# เราจะเพิ่ม Mutation (สำหรับ CUD) ที่นี่ในภายหลัง
# @strawberry.type
# class Mutation:
#     pass

schema = strawberry.Schema(query=Query, extensions=[DjangoOptimizerExtension]) #, mutation=Mutation)
