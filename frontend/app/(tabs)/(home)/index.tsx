import * as React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import PostCard from '@/components/PostCard';
import { router } from 'expo-router';

const GET_ALL_POSTS = gql`
  query GetAllPosts {
    allPosts {
      id
      title
      content
      createdAt
      voteCount
      commentCount
      userVote
      author {
        username
        profilePicture
      }
      community {
        name
        icon
      }
    }
  }
`;

interface AllPostsData {
  allPosts: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    voteCount: number;
    commentCount: number;
    author: {
      username: string;
      profilePicture?: string;
    };
    community?: {
      name: string;
      icon?: string;
    };
  }[];
}

export default function HomeScreen() {
  const { loading, error, data, refetch } = useQuery<AllPostsData>(GET_ALL_POSTS);

  if (loading && !data) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#D93A00" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-4">
        <Text className="text-base text-text text-center mb-4">
          Error loading posts: {error.message}
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text className="text-upvote font-bold">Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/post/${item.id}` as any)}
      activeOpacity={0.8}
    >
      <PostCard post={item} />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={data?.allPosts || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        className="bg-background"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#D93A00" />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-10">
            <Text className="text-muted-foreground">No posts yet.</Text>
          </View>
        }
      />

      {/* Floating Action Button (Placeholder for Create Post) */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-upvote w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/post/create' as any)}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 8,
        }}
      >
        <Text className="text-white text-3xl font-bold pb-1">+</Text>
      </TouchableOpacity>
    </View>
  );
}
