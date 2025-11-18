import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import PostCard from '@/components/PostCard';

const GET_COMMUNITY_DETAILS = gql`
  query GetCommunityDetails($slug: String!) {
    communityBySlug(slug: $slug) {
      id
      name
      description
      memberCount
      isMember
    }
    allPosts(community: $slug) {
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

const JOIN_COMMUNITY_MUTATION = gql`
  mutation JoinCommunity($communityName: String!) {
    joinCommunity(communityName: $communityName) {
      success
      isMember
      memberCount
    }
  }
`;

interface CommunityDetailsData {
    communityBySlug: {
        id: string;
        name: string;
        description: string;
        memberCount: number;
        isMember: boolean;
    };
    allPosts: any[];
}

interface JoinCommunityData {
    joinCommunity: {
        success: boolean;
        isMember: boolean;
        memberCount: number;
    };
}

export default function CommunityScreen() {
    const { slug } = useLocalSearchParams();
    const { loading, error, data, refetch } = useQuery<CommunityDetailsData>(GET_COMMUNITY_DETAILS, {
        variables: { slug },
        skip: !slug,
    });

    const [joinCommunity, { loading: joinLoading }] = useMutation<JoinCommunityData>(JOIN_COMMUNITY_MUTATION);

    const handleJoin = async () => {
        if (!data?.communityBySlug) return;
        try {
            await joinCommunity({
                variables: { communityName: data.communityBySlug.name },
                update: (cache, { data: mutationResult }) => {
                    if (mutationResult?.joinCommunity?.success) {
                        cache.modify({
                            id: cache.identify(data.communityBySlug),
                            fields: {
                                isMember: () => mutationResult.joinCommunity.isMember,
                                memberCount: () => mutationResult.joinCommunity.memberCount,
                            },
                        });
                    }
                },
            });
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    if (loading && !data) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" color="#D93A00" />
            </View>
        );
    }

    if (error || !data?.communityBySlug) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <Text className="text-text text-lg">Community not found.</Text>
            </View>
        );
    }

    const community = data.communityBySlug;

    const renderHeader = () => (
        <View className="bg-white p-4 mb-2 border-b border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mr-3">
                        <Text className="text-xl font-bold text-gray-500">r/</Text>
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-text">r/{community.name}</Text>
                        <Text className="text-sm text-gray-500">{community.memberCount} members</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleJoin}
                    disabled={joinLoading}
                    className={`px-4 py-2 rounded-full ${community.isMember ? 'bg-gray-200' : 'bg-upvote'
                        }`}
                >
                    {joinLoading ? (
                        <ActivityIndicator size="small" color={community.isMember ? '#000' : '#fff'} />
                    ) : (
                        <Text className={`font-bold ${community.isMember ? 'text-text' : 'text-white'}`}>
                            {community.isMember ? 'Joined' : 'Join'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
            <Text className="text-text">{community.description}</Text>
        </View>
    );

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push(`/post/${item.id}` as any)}
            activeOpacity={0.8}
        >
            <PostCard post={item} />
        </TouchableOpacity>
    );

    return (
        <>
            <Stack.Screen options={{ title: `r/${community.name}` }} />
            <FlatList
                data={data.allPosts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#D93A00" />
                }
                contentContainerStyle={{ paddingBottom: 20 }}
                className="bg-background"
            />
        </>
    );
}
