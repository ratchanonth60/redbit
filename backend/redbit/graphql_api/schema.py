import graphene
from graphql_api.communities.mutations import CommunityMutation
from graphql_api.communities.schema import CommunityQuery
from graphql_api.posts.mutations import Mutation as PostMutation
from graphql_api.posts.schema import PostQuery
from graphql_api.search.schema import SearchQuery
from graphql_api.users.mutations import UserMutation
from graphql_api.users.schema import UserQuery
from graphql_api.notifications.schema import NotificationQuery
from graphql_api.notifications.mutations import NotificationMutation
from graphql_api.notifications.subscriptions import NotificationSubscription

from .jwt import AuthMutation


# Combine all queries
class Query(
    UserQuery, 
    PostQuery, 
    CommunityQuery,
    NotificationQuery,
    SearchQuery,
    graphene.ObjectType
):
    pass

# Combine all mutations
class Mutation(
    AuthMutation,
    UserMutation, 
    PostMutation,
    CommunityMutation,
    NotificationMutation,
    graphene.ObjectType
):
    pass

# Combine all subscriptions
class Subscription(
    NotificationSubscription,
    graphene.ObjectType
):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation, subscription=Subscription)
