import React, { useState } from 'react';
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
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';

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
  const [communityName, setCommunityName] = useState('general'); // Default community
  const [createPost, { loading }] = useMutation<CreatePostData>(CREATE_POST_MUTATION);

  const handleCreatePost = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title.');
      return;
    }
    if (!communityName.trim()) {
      Alert.alert('Error', 'Please enter a community name.');
      return;
    }

    try {
      const { data } = await createPost({
        variables: {
          communityName,
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
              disabled={loading}
              className={`px-4 py-2 rounded-full ${loading ? 'bg-gray-400' : 'bg-upvote'
                }`}
            >
              {loading ? (
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
          <Text className="text-gray-500 mb-1">Community</Text>
          <TextInput
            className="bg-white p-3 rounded-lg border border-gray-200 text-text"
            placeholder="e.g. general"
            value={communityName}
            onChangeText={setCommunityName}
            autoCapitalize="none"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-500 mb-1">Title</Text>
          <TextInput
            className="bg-white p-3 rounded-lg border border-gray-200 text-text font-bold text-lg"
            placeholder="An interesting title"
            value={title}
            onChangeText={setTitle}
            maxLength={300}
          />
        </View>

        <View className="flex-1">
          <Text className="text-gray-500 mb-1">Content (Optional)</Text>
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
