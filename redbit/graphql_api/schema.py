import strawberry
from graphql_api.communities.schema import CommunityQuery
from graphql_api.users.schema import UserQuery
from strawberry_django.optimizer import DjangoOptimizerExtension

from .jwt import JWTMutation


@strawberry.type
class Query(UserQuery, CommunityQuery):
    pass

@strawberry.type
class Mutation(JWTMutation):
    pass


schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    extensions=[
        DjangoOptimizerExtension,
    ]
)
