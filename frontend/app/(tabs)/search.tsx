import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { router } from 'expo-router';
import PostCard from '@/components/PostCard';

const SEARCH_QUERY = gql`
  query Search($query: String!) {
    search(query: $query) {
      posts {
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
      communities {
        name
        description
        icon
        membersCount
      }
      users {
        username
        profilePicture
        bio
      }
    }
  }
`;

interface SearchData {
    search: {
        posts: any[];
        communities: any[];
        users: any[];
    };
}

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [executeSearch, { loading, data }] = useLazyQuery<SearchData>(SEARCH_QUERY);

    const handleSearch = () => {
        if (query.trim().length > 0) {
            executeSearch({ variables: { query } });
        }
    };

    const renderCommunity = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="flex-row items-center p-3 bg-card border-b border-border"
            onPress={() => router.push(`/r/${item.name}` as any)}
        >
            {item.icon ? (
                <Image source={{ uri: item.icon }} className="w-10 h-10 rounded-full mr-3" />
            ) : (
                <View className="w-10 h-10 rounded-full bg-gray-300 mr-3 justify-center items-center">
                    <Text className="text-lg font-bold text-gray-600">r/</Text>
                </View>
            )}
            <View>
                <Text className="font-bold text-text">r/{item.name}</Text>
                <Text className="text-muted-foreground text-xs">{item.membersCount} members</Text>
            </View>
        </TouchableOpacity>
    );

    const renderUser = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="flex-row items-center p-3 bg-card border-b border-border"
            onPress={() => router.push(`/u/${item.username}` as any)}
        >
            {item.profilePicture ? (
                <Image source={{ uri: item.profilePicture }} className="w-10 h-10 rounded-full mr-3" />
            ) : (
                <View className="w-10 h-10 rounded-full bg-gray-300 mr-3 justify-center items-center">
                    <Text className="text-lg font-bold text-gray-600">u/</Text>
                </View>
            )}
            <View>
                <Text className="font-bold text-text">u/{item.username}</Text>
                {item.bio && <Text className="text-muted-foreground text-xs" numberOfLines={1}>{item.bio}</Text>}
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-background">
            <View className="p-4 bg-card border-b border-border">
                <TextInput
                    className="bg-muted p-3 rounded-lg text-text"
                    placeholder="Search Redbit"
                    placeholderTextColor="#9ca3af"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#D93A00" />
                </View>
            ) : (
                <ScrollView className="flex-1">
                    {data?.search && (
                        <>
                            {data.search.communities.length > 0 && (
                                <View>
                                    <Text className="p-3 font-bold text-muted-foreground bg-muted/20">Communities</Text>
                                    {data.search.communities.map((c, i) => (
                                        <View key={i}>{renderCommunity({ item: c })}</View>
                                    ))}
                                </View>
                            )}

                            {data.search.users.length > 0 && (
                                <View>
                                    <Text className="p-3 font-bold text-muted-foreground bg-muted/20">Users</Text>
                                    {data.search.users.map((u, i) => (
                                        <View key={i}>{renderUser({ item: u })}</View>
                                    ))}
                                </View>
                            )}

                            {data.search.posts.length > 0 && (
                                <View>
                                    <Text className="p-3 font-bold text-muted-foreground bg-muted/20">Posts</Text>
                                    {data.search.posts.map((p) => (
                                        <TouchableOpacity
                                            key={p.id}
                                            onPress={() => router.push(`/post/${p.id}` as any)}
                                            activeOpacity={0.8}
                                        >
                                            <PostCard post={p} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {data.search.communities.length === 0 &&
                                data.search.users.length === 0 &&
                                data.search.posts.length === 0 && (
                                    <View className="p-8 items-center">
                                        <Text className="text-muted-foreground text-lg">No results found.</Text>
                                    </View>
                                )}
                        </>
                    )}
                </ScrollView>
            )}
        </View>
    );
}
