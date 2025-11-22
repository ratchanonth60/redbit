import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useMutation, useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

const GET_COMMUNITIES = gql`
  query GetCommunities {
    communities {
      name
      slug
      icon
    }
  }
`;

const CREATE_POST_MUTATION = gql`
  mutation CreatePost($communityName: String!, $title: String!, $content: String) {
    createPost(communityName: $communityName, title: $title, content: $content) {
      success
      errors
      post {
        id
        title
      }
    }
  }
`;

interface Community {
  name: string;
  slug: string;
  icon?: string;
}

interface GetCommunitiesData {
  communities: Community[];
}

interface CreatePostData {
  createPost: {
    success: boolean;
    errors: string[] | null;
    post: {
      id: string;
      title: string;
    } | null;
  };
}

export default function CreatePostScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

  const { data: communitiesData, loading: communitiesLoading } = useQuery<GetCommunitiesData>(GET_COMMUNITIES);
  const [createPost, { loading: creating }] = useMutation<CreatePostData>(CREATE_POST_MUTATION);

  useEffect(() => {
    if (communitiesData?.communities?.length && !selectedCommunity) {
      setSelectedCommunity(communitiesData.communities[0].name);
    }
  }, [communitiesData]);

  const handleCreatePost = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title.');
      return;
    }
    if (!selectedCommunity) {
      Alert.alert('Error', 'Please select a community.');
      return;
    }

    try {
      const { data } = await createPost({
        variables: {
          communityName: selectedCommunity,
          title,
          content,
        },
      });

      if (data?.createPost?.success) {
        Alert.alert('Success', 'Post created successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', data?.createPost?.errors?.join('\n') || 'Failed to create post.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An unexpected error occurred.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <Stack.Screen
        options={{
          title: 'Create Post',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleCreatePost}
              disabled={creating || communitiesLoading}
              className={`px-4 py-2 rounded-full ${creating || communitiesLoading ? 'bg-gray-400' : 'bg-upvote'
                }`}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-bold">Post</Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView className="flex-1 p-4">
        <View className="mb-4">
          <Text className="text-gray-500 mb-2">Choose a Community</Text>
          {communitiesLoading ? (
            <ActivityIndicator size="small" color="#D93A00" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {communitiesData?.communities.map((community) => (
                <TouchableOpacity
                  key={community.slug}
                  onPress={() => setSelectedCommunity(community.name)}
                  className={`px-4 py-2 rounded-full mr-2 border ${selectedCommunity === community.name
                      ? 'bg-gray-800 border-gray-800'
                      : 'bg-white border-gray-300'
                    }`}
                >
                  <Text
                    className={`${selectedCommunity === community.name ? 'text-white' : 'text-gray-700'
                      } font-medium`}
                  >
                    r/{community.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          {!communitiesLoading && (!communitiesData?.communities || communitiesData.communities.length === 0) && (
            <Text className="text-red-500 text-sm mt-1">No communities found. Please create one first.</Text>
          )}
        </View>

        <View className="mb-4">
          <TextInput
            className="bg-white p-3 rounded-lg border border-gray-200 text-text font-bold text-lg"
            placeholder="An interesting title"
            value={title}
            onChangeText={setTitle}
            maxLength={300}
          />
        </View>

        <View className="flex-1">
          <TextInput
            className="bg-white p-3 rounded-lg border border-gray-200 text-text min-h-[200px]"
            placeholder="What's on your mind?"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
