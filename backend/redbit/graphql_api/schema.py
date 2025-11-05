import graphene
from graphql_api.communities.schema import CommunityQuery
from graphql_api.posts.schema import Query as PostsQuery
from graphql_api.users.mutations import UserMutation
from graphql_api.users.schema import UserQuery

from .jwt import AuthMutation


# Query หลัก รวมทุก Query-App และ graphene.ObjectType
class Query(UserQuery, CommunityQuery, PostsQuery, graphene.ObjectType):
    pass


# Mutation หลัก รวมทุก Mutation-App และ graphene.ObjectType
class Mutation(AuthMutation, UserMutation, graphene.ObjectType):
    pass


schema = graphene.Schema(
    query=Query,
    mutation=Mutation,
)

