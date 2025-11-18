import { View, Text } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

const GET_UNREAD_NOTIFICATIONS = gql`
  query UnreadNotifications {
    unreadNotifications {
      id
    }
  }
`;

export function NotificationBadge() {
  const { data } = useQuery(GET_UNREAD_NOTIFICATIONS);
  const unreadCount = data?.unreadNotifications?.length || 0;

  if (unreadCount === 0) return null;

  return (
    <View className="absolute -top-1 -right-1 bg-upvote w-5 h-5 rounded-full items-center justify-center">
      <Text className="text-white text-xs font-bold">
        {unreadCount > 9 ? '9+' : unreadCount}
      </Text>
    </View>
  );
}
