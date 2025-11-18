import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import { router } from 'expo-router';

const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    myNotifications {
      id
      notificationType
      message
      isRead
      createdAt
      objectId
      sender {
        username
        profilePicture
      }
    }
    unreadCount
  }
`;

const MARK_READ_MUTATION = gql`
  mutation MarkRead($id: ID!) {
    markNotificationRead(notificationId: $id) {
      success
    }
  }
`;

interface Notification {
    id: string;
    notificationType: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    objectId?: string;
    sender: {
        username: string;
        profilePicture?: string;
    };
}

interface NotificationsData {
    myNotifications: Notification[];
    unreadCount: number;
}

export default function NotificationsScreen() {
    const { loading, data, refetch } = useQuery<NotificationsData>(GET_NOTIFICATIONS, {
        pollInterval: 10000, // Poll every 10s
    });
    const [markRead] = useMutation(MARK_READ_MUTATION);

    const handleNotificationPress = (notification: Notification) => {
        if (!notification.isRead) {
            markRead({
                variables: { id: notification.id },
                optimisticResponse: {
                    markNotificationRead: {
                        success: true,
                        __typename: 'MarkNotificationRead',
                    },
                },
                update: (cache) => {
                    const existingData = cache.readQuery<NotificationsData>({ query: GET_NOTIFICATIONS });
                    if (existingData) {
                        cache.writeQuery({
                            query: GET_NOTIFICATIONS,
                            data: {
                                ...existingData,
                                myNotifications: existingData.myNotifications.map((n) =>
                                    n.id === notification.id ? { ...n, isRead: true } : n
                                ),
                                unreadCount: Math.max(0, existingData.unreadCount - 1),
                            },
                        });
                    }
                },
            });
        }

        // Navigation logic
        if (notification.objectId) {
            // Assuming objectId refers to Post ID for now (simplified)
            // In a real app, we'd check contentType to distinguish between Post and Comment
            // But for now, let's assume we navigate to the post.
            router.push(`/post/${notification.objectId}` as any);
        }
    };

    const renderNotification = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            className={`flex-row items-center p-4 border-b border-border ${item.isRead ? 'bg-background' : 'bg-blue-50'}`}
            onPress={() => handleNotificationPress(item)}
        >
            {item.sender?.profilePicture ? (
                <Image source={{ uri: item.sender.profilePicture }} className="w-10 h-10 rounded-full mr-3" />
            ) : (
                <View className="w-10 h-10 rounded-full bg-gray-300 mr-3 justify-center items-center">
                    <Text className="text-lg font-bold text-gray-600">
                        {item.sender?.username?.[0]?.toUpperCase() || '!'}
                    </Text>
                </View>
            )}
            <View className="flex-1">
                <Text className="text-text">
                    <Text className="font-bold">{item.sender?.username}</Text> {item.message}
                </Text>
                <Text className="text-muted-foreground text-xs mt-1">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </Text>
            </View>
            {!item.isRead && <View className="w-2 h-2 rounded-full bg-blue-500 ml-2" />}
        </TouchableOpacity>
    );

    if (loading && !data) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" color="#D93A00" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <FlatList
                data={data?.myNotifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#D93A00" />
                }
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center p-8 mt-10">
                        <Text className="text-muted-foreground text-lg">No notifications yet.</Text>
                    </View>
                }
            />
        </View>
    );
}
