"""
WebSocket URL routing for GraphQL subscriptions
"""
from django.urls import path
from graphql_api.consumers import GraphQLSubscriptionConsumer

websocket_urlpatterns = [
    path("graphql/", GraphQLSubscriptionConsumer.as_asgi()),
]
