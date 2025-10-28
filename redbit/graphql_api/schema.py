import graphene
from graphql_api.communities.schema import CommunityQuery
from graphql_api.users.mutations import UserMutation
from graphql_api.users.schema import UserQuery

from .jwt import AuthMutation  # <-- Import mutation ใหม่


# Query หลัก รวมทุก Query-App และ graphene.ObjectType
class Query(UserQuery, CommunityQuery, graphene.ObjectType):
    pass


# Mutation หลัก รวมทุก Mutation-App และ graphene.ObjectType
class Mutation(AuthMutation, UserMutation, graphene.ObjectType):
    pass


schema = graphene.Schema(
    query=Query,
    mutation=Mutation,
)

