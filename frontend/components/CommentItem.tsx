import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowUp, ArrowDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { formatNumber } from '@/utils/format'; // Import
import { Comment } from '@/types/post'; // (ต้องอัปเดต Type นี้ให้ตรงกับ GQL)

interface CommentItemProps {
  comment: Comment; // (ควรอัปเดต Type)
  onVote: (commentId: string, voteType: 'up' | 'down') => void;
  depth: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onVote, depth }) => {
  // แปลง styles.commentItem
  return (
    <View
      className="py-3 px-4 border-l-2 border-border"
      style={{ marginLeft: depth * 16 }}
    >
      {/* commentHeader */}
      <View className="flex-row items-center mb-1.5">
        {/* commentAuthor */}
        <Text className="text-xs font-bold text-text">
          {comment.author.username}
        </Text>
        {/* commentTime */}
        <Text className="text-xs text-textSecondary ml-1">
          • {comment.timeAgo}
        </Text>
      </View>

      {/* commentContent */}
      <Text className="text-sm text-text leading-5 mb-2">
        {comment.content}
      </Text>

      {/* commentActions */}
      <View className="flex-row items-center">
        {/* commentVoteButton */}
        <TouchableOpacity
          className="p-1"
          onPress={() => onVote(comment.id, 'up')}
        >
          <ArrowUp
            size={16}
            color={comment.userVote === 'up' ? Colors.light.upvote : Colors.light.textSecondary}
            fill={comment.userVote === 'up' ? Colors.light.upvote : 'transparent'}
          />
        </TouchableOpacity>
        {/* commentVoteCount */}
        <Text
          className={`text-xs font-bold text-text mx-1.5 ${
            comment.userVote === 'up' ? 'text-upvote' : ''
          } ${comment.userVote === 'down' ? 'text-downvote' : ''}`}
        >
          {formatNumber(comment.upvotes)}
        </Text>
        {/* commentVoteButton */}
        <TouchableOpacity
          className="p-1"
          onPress={() => onVote(comment.id, 'down')}
        >
          <ArrowDown
            size={16}
            color={comment.userVote === 'down' ? Colors.light.downvote : Colors.light.textSecondary}
            fill={comment.userVote === 'down' ? Colors.light.downvote : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Recursion สำหรับ Replies */}
      {comment.replies &&
        comment.replies.map((reply: any) => (
          <MemoizedCommentItem
            key={reply.id}
            comment={reply}
            onVote={onVote}
            depth={depth + 1}
          />
        ))}
    </View>
  );
};

export const MemoizedCommentItem = React.memo(CommentItem);
