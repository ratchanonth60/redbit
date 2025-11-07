import * as React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { ArrowUp, ArrowDown, MessageSquare, Send } from 'lucide-react-native';
import Colors from '@/constants/colors';

import { usePostDetail } from '@/hooks/usePostDetail';
import { MemoizedCommentItem } from '@/components/CommentItem';
import { formatNumber } from '@/utils/format';

export default function PostDetailScreen() {
  // 2. เรียก Logic ทั้งหมด
  const {
    post,
    comments,
    loading,
    error,
    newComment,
    setNewComment,
    commentLoading,
    handlePostVote,
    handleCommentVote,
    handleAddComment,
  } = usePostDetail();

  // 3. จัดการ State (Loading, Error) - โดยใช้ NativeWind
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color={Colors.light.text} />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-4">
        <Text className="text-base text-textSecondary text-center mt-10">
          {error ? `Error: ${error.message}` : 'Post not found'}
        </Text>
      </View>
    );
  }

  // 4. นี่คือ View ที่แปลงเป็น NativeWind ทั้งหมด
  // (ลบ StyleSheet.create ท้ายไฟล์ทิ้งได้เลย)
  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: post.title }} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* postCard */}
        <View className="bg-card p-4 border-b-8 border-background">
          {/* postHeader */}
          <View className="flex-row items-center mb-3">
            <Text className="text-xs font-bold text-text">
              {post.community.name}
            </Text>
            <Text className="text-xs text-textSecondary ml-1">
              • {post.author.username} • {post.timeAgo}
            </Text>
          </View>

          {/* postTitle */}
          <Text className="text-xl font-bold text-text mb-3 leading-7">
            {post.title}
          </Text>

          {/* postContent */}
          {post.content && (
            <Text className="text-[15px] text-text leading-6 mb-4">
              {post.content}
            </Text>
          )}

          {/* postImage */}
          {post.imageUrl && (
            <Image
              source={{ uri: post.imageUrl }}
              className="w-full h-72 rounded-lg mb-4"
            />
          )}

          {/* postActions */}
          <View className="flex-row items-center gap-4">
            {/* voteContainer */}
            <View className="flex-row items-center bg-background rounded-full py-1 px-2">
              {/* voteButton */}
              <TouchableOpacity
                className="p-1"
                onPress={() => handlePostVote('up')}
              >
                <ArrowUp
                  size={22}
                  color={post.userVote === 'up' ? Colors.light.upvote : Colors.light.textSecondary}
                  fill={post.userVote === 'up' ? Colors.light.upvote : 'transparent'}
                />
              </TouchableOpacity>
              {/* voteCount */}
              <Text
                className={`text-sm font-bold text-text mx-2 text-center min-w-[40px] ${
                  post.userVote === 'up' ? 'text-upvote' : ''
                } ${post.userVote === 'down' ? 'text-downvote' : ''}`}
              >
                {formatNumber(post.upvotes)}
              </Text>
              {/* voteButton */}
              <TouchableOpacity
                className="p-1"
                onPress={() => handlePostVote('down')}
              >
                <ArrowDown
                  size={22}
                  color={post.userVote === 'down' ? Colors.light.downvote : Colors.light.textSecondary}
                  fill={post.userVote === 'down' ? Colors.light.downvote : 'transparent'}
                />
              </TouchableOpacity>
            </View>

            {/* commentInfo */}
            <View className="flex-row items-center gap-1.5">
              <MessageSquare size={20} color={Colors.light.textSecondary} />
              <Text className="text-sm font-semibold text-textSecondary">
                {formatNumber(post.commentCount)} comments
              </Text>
            </View>
          </View>
        </View>

        {/* commentInputContainer */}
        <View className="bg-card p-3 flex-row items-end gap-2 border-b border-border">
          {/* commentInput */}
          <TextInput
            className="flex-1 bg-background rounded-2xl py-2 px-4 text-sm text-text max-h-24"
            placeholder="Add a comment..."
            placeholderTextColor={Colors.light.textSecondary}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          {/* sendButton */}
          <TouchableOpacity
            className="p-2"
            onPress={handleAddComment}
            disabled={!newComment.trim() || commentLoading}
          >
            <Send
              size={20}
              color={
                newComment.trim()
                  ? Colors.light.upvote
                  : Colors.light.textSecondary
              }
            />
          </TouchableOpacity>
        </View>

        {/* commentsSection */}
        <View className="bg-card pt-2">
          {comments.map((comment: any) => ( // (ควรใช้ Type ที่ถูกต้อง)
            <MemoizedCommentItem
              key={comment.id}
              comment={comment}
              onVote={handleCommentVote}
              depth={0}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

