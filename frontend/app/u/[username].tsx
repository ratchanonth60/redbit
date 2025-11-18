import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Image } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import PostCard from '@/components/PostCard';

const GET_USER_PROFILE = gql`
  query GetUserProfile($username: String!) {
    user(username: $username) {
      id
      username
      bio
      profilePicture
      totalKarma
      followerCount
      followingCount
      dateJoined
      isFollowing
    }
    userPosts(username: $username) {
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

const FOLLOW_USER_MUTATION = gql`
  mutation FollowUser($username: String!) {
    followUser(username: $username) {
      success
      isFollowing
      followerCount
    }
  }
`;

interface UserProfileData {
    user: {
        id: string;
        username: string;
        bio: string;
        profilePicture: string;
        totalKarma: number;
        followerCount: number;
        followingCount: number;
        dateJoined: string;
        isFollowing: boolean;
    };
    userPosts: any[];
}

interface FollowUserData {
    followUser: {
        success: boolean;
        isFollowing: boolean;
        followerCount: number;
    };
}

export default function UserProfileScreen() {
    const { username } = useLocalSearchParams();
    const { loading, error, data, refetch } = useQuery<UserProfileData>(GET_USER_PROFILE, {
        variables: { username },
        skip: !username,
    });

    const [followUser, { loading: followLoading }] = useMutation<FollowUserData>(FOLLOW_USER_MUTATION);

    const handleFollow = async () => {
        if (!data?.user) return;
        try {
            await followUser({
                variables: { username: data.user.username },
                update: (cache, { data: mutationResult }) => {
                    if (mutationResult?.followUser?.success) {
                        cache.modify({
                            id: cache.identify(data.user),
                            fields: {
                                isFollowing: () => mutationResult.followUser.isFollowing,
                                followerCount: () => mutationResult.followUser.followerCount,
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

    if (error || !data?.user) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <Text className="text-text text-lg">User not found.</Text>
            </View>
        );
    }

    const user = data.user;

    const renderHeader = () => (
        <View className="bg-white p-6 mb-2 border-b border-gray-200 items-center">
            <View className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden">
                {user.profilePicture ? (
                    <Image source={{ uri: user.profilePicture }} className="w-full h-full" />
                ) : (
                    <View className="w-full h-full items-center justify-center bg-gray-300">
                        <Text className="text-4xl font-bold text-white">{user.username[0].toUpperCase()}</Text>
                    </View>
                )}
            </View>
            <Text className="text-2xl font-bold text-text mb-1">{user.username}</Text>
            <Text className="text-gray-500 mb-4">u/{user.username} • {user.totalKarma} karma</Text>

            <View className="flex-row justify-around w-full mb-6">
                <View className="items-center">
                    <Text className="font-bold text-lg text-text">{user.followerCount}</Text>
                    <Text className="text-gray-500 text-xs">Followers</Text>
                </View>
                <View className="items-center">
                    <Text className="font-bold text-lg text-text">{user.followingCount}</Text>
                    <Text className="text-gray-500 text-xs">Following</Text>
                </View>
                <View className="items-center">
                    <Text className="font-bold text-lg text-text">{new Date(user.dateJoined).getFullYear()}</Text>
                    <Text className="text-gray-500 text-xs">Joined</Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={handleFollow}
                disabled={followLoading}
                className={`px-8 py-2 rounded-full ${user.isFollowing ? 'bg-gray-200' : 'bg-upvote'
                    }`}
            >
                {followLoading ? (
                    <ActivityIndicator size="small" color={user.isFollowing ? '#000' : '#fff'} />
                ) : (
                    <Text className={`font-bold ${user.isFollowing ? 'text-text' : 'text-white'}`}>
                        {user.isFollowing ? 'Following' : 'Follow'}
                    </Text>
                )}
            </TouchableOpacity>
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
            <Stack.Screen options={{ title: `u/${user.username}` }} />
            <FlatList
                data={data.userPosts}
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
