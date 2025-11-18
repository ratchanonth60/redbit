import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { router } from 'expo-router';

const GET_COMMUNITIES = gql`
  query GetCommunities {
    communities(limit: 20, sortBy: "members") {
      id
      name
      slug
      description
      memberCount
      postCount
      isMember
    }
  }
`;

interface Community {
    id: string;
    name: string;
    slug: string;
    description: string;
    memberCount: number;
    postCount: number;
    isMember: boolean;
}

interface CommunitiesData {
    communities: Community[];
}

export default function CommunitiesScreen() {
    const { loading, error, data, refetch } = useQuery<CommunitiesData>(GET_COMMUNITIES);

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
                    Error loading communities: {error.message}
                </Text>
                <TouchableOpacity onPress={() => refetch()}>
                    <Text className="text-upvote font-bold">Try again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderItem = ({ item }: { item: Community }) => (
        <TouchableOpacity
            className="flex-row items-center p-4 bg-white border-b border-gray-200"
            onPress={() => router.push(`/r/${item.slug}` as any)}
        >
            <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
                <Text className="text-lg font-bold text-gray-500">r/</Text>
            </View>
            <View className="flex-1">
                <Text className="text-base font-bold text-text">r/{item.name}</Text>
                <Text className="text-sm text-gray-500" numberOfLines={1}>
                    {item.memberCount} members • {item.description || 'No description'}
                </Text>
            </View>
            {item.isMember && (
                <View className="bg-gray-100 px-2 py-1 rounded">
                    <Text className="text-xs text-gray-600 font-bold">Joined</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-background">
            <FlatList
                data={data?.communities || []}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#D93A00" />
                }
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center p-10">
                        <Text className="text-muted-foreground">No communities found.</Text>
                    </View>
                }
            />
        </View>
    );
}
