"""
GraphQL WebSocket Consumer for Subscriptions
Implements graphql-transport-ws protocol
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class GraphQLSubscriptionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Accept WebSocket connection"""
        await self.accept(subprotocol="graphql-transport-ws")
        
        # Store subscription IDs
        self.subscriptions = {}
        
    async def disconnect(self, close_code):
        """Handle disconnection"""
        # Remove from all notification groups
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """
        Handle incoming WebSocket messages
        Implements graphql-transport-ws protocol
        """
        try:
            message = json.loads(text_data)
            msg_type = message.get('type')
            
            if msg_type == 'connection_init':
                # Initialize connection
                if self.scope['user'].is_authenticated:
                    # Add user to their notification group
                    self.user_group_name = f"user_{self.scope['user'].id}_notifications"
                    await self.channel_layer.group_add(
                        self.user_group_name,
                        self.channel_name
                    )
                    
                    # Send connection acknowledgment
                    await self.send(text_data=json.dumps({
                        'type': 'connection_ack'
                    }))
                else:
                    # Unauthorized
                    await self.send(text_data=json.dumps({
                        'type': 'connection_error',
                        'payload': {'message': 'Unauthorized'}
                    }))
                    await self.close()
            
            elif msg_type == 'subscribe':
                # Subscribe to a GraphQL subscription
                subscription_id = message.get('id')
                payload = message.get('payload', {})
                
                # Store subscription
                self.subscriptions[subscription_id] = payload
                
                # For notifications, we don't need to do anything else
                # The subscription is passive - it just waits for events
                
            elif msg_type == 'complete':
                # Unsubscribe
                subscription_id = message.get('id')
                if subscription_id in self.subscriptions:
                    del self.subscriptions[subscription_id]
            
            elif msg_type == 'ping':
                # Respond to ping
                await self.send(text_data=json.dumps({
                    'type': 'pong'
                }))
                
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'payload': {'message': str(e)}
            }))
    
    async def notification_message(self, event):
        """
        Handle notification messages from channel layer
        Send to all active subscriptions
        """
        notification_data = event['notification']
        
        # Send to all active subscriptions
        for subscription_id in self.subscriptions.keys():
            await self.send(text_data=json.dumps({
                'id': subscription_id,
                'type': 'next',
                'payload': {
                    'data': {
                        'onNotificationCreated': notification_data
                    }
                }
            }))
