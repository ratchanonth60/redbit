import React, { useState } from 'react';
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
import { FilterChips } from '@/components/FilterChips';
import CreatePostInput from '@/components/CreatePostInput';

const GET_ALL_POSTS = gql`
  query GetAllPosts($sortBy: String) {
    allPosts(sortBy: $sortBy) {
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
    userVote: number;
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

import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function HomeScreen() {
  const [activeFilter, setActiveFilter] = useState('New');
  const { loading, error, data, refetch } = useQuery<AllPostsData>(GET_ALL_POSTS, {
    variables: { sortBy: activeFilter.toLowerCase() },
    fetchPolicy: 'cache-and-network', // Ensure we get fresh data
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleFilterSelect = (filter: string) => {
    setActiveFilter(filter);
  };

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
    <PostCard post={item} />
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
        ListHeaderComponent={
          <View>
            <CreatePostInput />
            <FilterChips active={activeFilter} onSelect={handleFilterSelect} />
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-10">
            <Text className="text-muted-foreground">No posts yet.</Text>
          </View>
        }
      />
    </View>
  );
}
