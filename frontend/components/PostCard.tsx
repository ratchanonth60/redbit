import * as React from 'react';
import { View, Text, TouchableOpacity, Image, Animated } from 'react-native';
import { ArrowUp, ArrowDown, MessageSquare } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Post } from '@/types/post';
import { formatNumber } from '@/utils/format'; // 1. Import util

interface PostCardProps {
  post: Post;
  onVote: (postId: string, voteType: 'up' | 'down') => void;
  onPress: () => void;
  // (เราไม่ต้องการ formatNumber as prop แล้ว)
}

const PostCard: React.FC<PostCardProps> = ({ post, onVote, onPress }) => {
  // 2. Logic Animation ยังคงอยู่ที่นี่ (ถูกต้องแล้ว)
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 3 }).start();
  };

  // 3. แปลง View เป็น NativeWind
  return (
    <Animated.View
      // styles.postCard
      className="bg-card mb-2 flex-row border-t border-b border-border"
      style={[{ transform: [{ scale: scaleAnim }] }]}
    >
      {/* styles.voteSection */}
      <View className="w-10 items-center py-2 bg-card">
        {/* styles.voteButton */}
        <TouchableOpacity className="p-1" onPress={() => onVote(post.id, 'up')}>
          <ArrowUp
            size={20}
            color={post.userVote === 'up' ? Colors.light.upvote : Colors.light.textSecondary}
            fill={post.userVote === 'up' ? Colors.light.upvote : 'transparent'}
          />
        </TouchableOpacity>
        {/* styles.voteCount */}
        <Text
          className={`text-xs font-bold text-text my-0.5 ${
            post.userVote === 'up' ? 'text-upvote' : ''
          } ${post.userVote === 'down' ? 'text-downvote' : ''}`}
        >
          {formatNumber(post.upvotes)}
        </Text>
        <TouchableOpacity className="p-1" onPress={() => onVote(post.id, 'down')}>
          <ArrowDown
            size={20}
            color={post.userVote === 'down' ? Colors.light.downvote : Colors.light.textSecondary}
            fill={post.userVote === 'down' ? Colors.light.downvote : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* styles.postContent */}
      <TouchableOpacity
        className="flex-1 py-2 pr-3"
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* styles.postHeader */}
        <View className="flex-row items-center mb-2">
          {/* styles.community */}
          <Text className="text-xs font-bold text-text">{post.community.name}</Text>
          {/* styles.metadata */}
          <Text className="text-xs text-textSecondary ml-1">
            • {post.author.username} • {post.timeAgo}
          </Text>
        </View>

        {/* styles.postTitle */}
        <Text className="text-base font-semibold text-text mb-1.5 leading-[22px]">
          {post.title}
        </Text>

        {/* styles.postText */}
        {post.content && (
          <Text className="text-sm text-text leading-5 mb-2" numberOfLines={3}>
            {post.content}
          </Text>
        )}

        {/* styles.postImage */}
        {post.imageUrl && (
          <Image
            source={{ uri: post.imageUrl }}
            className="w-full h-50 rounded-lg mb-2"
          />
        )}

        {/* styles.postFooter */}
        <View className="flex-row items-center">
          {/* styles.commentButton */}
          <View className="flex-row items-center gap-1.5">
            <MessageSquare size={18} color={Colors.light.textSecondary} />
            {/* styles.commentCount */}
            <Text className="text-xs font-semibold text-textSecondary">
              {formatNumber(post.commentCount)} comments
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const MemoizedPostCard = React.memo(PostCard);
