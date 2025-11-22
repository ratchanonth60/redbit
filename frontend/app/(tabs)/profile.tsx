import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Image } from 'react-native';
import { useQuery, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import PostCard from '@/components/PostCard';

const GET_MY_PROFILE = gql`
  query GetMyProfile {
    me {
      id
      username
      email
      bio
      profilePicture
      totalKarma
      followerCount
      followingCount
      dateJoined
    }
    myPosts {
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

interface ProfileData {
  me: {
    id: string;
    username: string;
    email: string;
    bio: string;
    profilePicture: string;
    totalKarma: number;
    followerCount: number;
    followingCount: number;
    dateJoined: string;
  };
  myPosts: any[];
}

export default function ProfileScreen() {
  const { loading, error, data, refetch } = useQuery<ProfileData>(GET_MY_PROFILE);
  const client = useApolloClient();

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await client.resetStore();
      router.replace('/auth/login');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to logout.');
    }
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
          Error loading profile: {error.message}
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text className="text-upvote font-bold">Try again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} className="mt-8">
          <Text className="text-red-500 font-bold">Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const user = data?.me;

  const renderHeader = () => (
    <View className="bg-white p-6 mb-2 border-b border-gray-200 items-center">
      <View className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden">
        {user?.profilePicture ? (
          <Image source={{ uri: user.profilePicture }} className="w-full h-full" />
        ) : (
          <View className="w-full h-full items-center justify-center bg-gray-300">
            <Text className="text-4xl font-bold text-white">{user?.username?.[0]?.toUpperCase()}</Text>
          </View>
        )}
      </View>
      <Text className="text-2xl font-bold text-text mb-1">{user?.username}</Text>
      <Text className="text-gray-500 mb-4">u/{user?.username} • {user?.totalKarma} karma</Text>

      <View className="flex-row justify-around w-full mb-6">
        <View className="items-center">
          <Text className="font-bold text-lg text-text">{user?.followerCount}</Text>
          <Text className="text-gray-500 text-xs">Followers</Text>
        </View>
        <View className="items-center">
          <Text className="font-bold text-lg text-text">{user?.followingCount}</Text>
          <Text className="text-gray-500 text-xs">Following</Text>
        </View>
        <View className="items-center">
          <Text className="font-bold text-lg text-text">{new Date(user?.dateJoined || Date.now()).getFullYear()}</Text>
          <Text className="text-gray-500 text-xs">Joined</Text>
        </View>
      </View>

      <View className="flex-row justify-center space-x-4 w-full">
        <TouchableOpacity
          onPress={() => router.push('/profile/edit' as any)}
          className="px-6 py-2 rounded-full border border-gray-300 bg-white"
        >
          <Text className="text-text font-bold">Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          className="px-6 py-2 rounded-full border border-red-500"
        >
          <Text className="text-red-500 font-bold">Logout</Text>
        </TouchableOpacity>
      </View>
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
    <View className="flex-1 bg-background">
      <FlatList
        data={data?.myPosts || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#D93A00" />
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
