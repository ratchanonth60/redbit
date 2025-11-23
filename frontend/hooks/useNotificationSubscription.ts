/**
 * Custom hook for subscribing to real-time notifications via GraphQL subscriptions
 * NOTE: Temporarily disabled - useSubscription needs proper Apollo Client configuration
 */
import { useEffect } from 'react';
import { gql } from '@apollo/client';
// import { useSubscription } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext';

const NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnNotificationCreated {
    onNotificationCreated {
      id
      message
      notificationType
      isRead
      createdAt
      sender {
        id
        username
        profilePicture
      }
    }
  }
`;

export function useNotificationSubscription() {
  const { user } = useAuth();

  // Temporarily disabled until Apollo Client subscription is properly configured
  /*
  const { data, loading, error } = useSubscription(NOTIFICATION_SUBSCRIPTION, {
    skip: !user, // Only subscribe if user is authenticated
    onData: ({ client, data }) => {
      if (data?.data?.onNotificationCreated) {
        const notification = data.data.onNotificationCreated;
        console.log('New notification received:', notification);

        // You can add toast notification here
        // toast.success(`New notification from ${notification.sender?.username}`);
      }
    },
  });

  useEffect(() => {
    if (error) {
      console.error('Subscription error:', error);
    }
  }, [error]);

  return { data, loading, error };
  */

  return { data: null, loading: false, error: null };
}
