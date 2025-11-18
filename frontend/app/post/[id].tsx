import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import PostCard from '@/components/PostCard';
import { formatDistanceToNow } from 'date-fns';

const GET_POST_DETAILS = gql`
  query GetPostDetails($id: ID!) {
    post(id: $id) {
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
    comments(postId: $id) {
      id
      content
      createdAt
      author {
        username
      }
    }
  }
`;

const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($postId: ID!, $content: String!) {
    createComment(postId: $postId, content: $content) {
      success
      comment {
        id
        content
        createdAt
        author {
          username
        }
      }
      errors
    }
  }
`;

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    username: string;
  };
}

interface PostDetailsData {
  post: {
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
  };
  comments: Comment[];
}

interface CreateCommentData {
  createComment: {
    success: boolean;
    comment: Comment;
    errors: string[] | null;
  };
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const [commentContent, setCommentContent] = useState('');
  const { loading, error, data, refetch } = useQuery<PostDetailsData>(GET_POST_DETAILS, {
    variables: { id },
    skip: !id,
  });

  const [createComment, { loading: creatingComment }] = useMutation<CreateCommentData>(CREATE_COMMENT_MUTATION);

  const handleCreateComment = async () => {
    if (!commentContent.trim()) return;

    try {
      await createComment({
        variables: { postId: id, content: commentContent },
        update: (cache, { data }) => {
          if (data?.createComment?.success) {
            const newComment = data.createComment.comment;
            const existingData = cache.readQuery<PostDetailsData>({
              query: GET_POST_DETAILS,
              variables: { id },
            });

            if (existingData) {
              cache.writeQuery({
                query: GET_POST_DETAILS,
                variables: { id },
                data: {
                  ...existingData,
                  comments: [newComment, ...existingData.comments],
                  post: {
                    ...existingData.post,
                    commentCount: (existingData.post.commentCount || 0) + 1,
                  },
                },
              });
            }
          }
        },
      });
      setCommentContent('');
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

  if (error || !data?.post) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-text text-lg">Post not found.</Text>
      </View>
    );
  }

  const renderComment = ({ item }: { item: Comment }) => (
    <View className="bg-white p-4 border-b border-gray-200 ml-4 border-l-2 border-l-gray-300">
      <View className="flex-row justify-between mb-1">
        <Text className="font-bold text-text text-xs">u/{item.author.username}</Text>
        <Text className="text-gray-500 text-xs">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</Text>
      </View>
      <Text className="text-text">{item.content}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen options={{ title: 'Post', headerBackTitle: 'Feed' }} />
      <FlatList
        data={data.comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View className="mb-2">
            <PostCard post={data.post} />
            <View className="p-4 bg-gray-100 border-b border-gray-200">
              <Text className="font-bold text-gray-600">Comments</Text>
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#D93A00" />
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <View className="p-4 bg-white border-t border-gray-200 flex-row items-center">
        <TextInput
          className="flex-1 bg-gray-100 p-3 rounded-full mr-2 text-text"
          placeholder="Add a comment..."
          value={commentContent}
          onChangeText={setCommentContent}
          multiline
        />
        <TouchableOpacity
          onPress={handleCreateComment}
          disabled={!commentContent.trim() || creatingComment}
          className={`p-3 rounded-full ${!commentContent.trim() ? 'bg-gray-300' : 'bg-upvote'}`}
        >
          {creatingComment ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-bold">Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
