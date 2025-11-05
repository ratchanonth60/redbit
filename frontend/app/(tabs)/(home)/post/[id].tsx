
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ArrowUp, ArrowDown, MessageSquare, Send } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { mockPosts, mockComments } from '@/mocks/posts';
import { Comment } from '@/types/post';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = mockPosts.find(p => p.id === id);
  const [comments, setComments] = useState(mockComments[id] || []);
  const [newComment, setNewComment] = useState('');
  const [postVote, setPostVote] = useState<'up' | 'down' | null>(post?.userVote || null);
  const [postUpvotes, setPostUpvotes] = useState(post?.upvotes || 0);

  if (!post) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  const handlePostVote = (voteType: 'up' | 'down') => {
    let upvoteDelta = 0;
    let newVote: 'up' | 'down' | null = voteType;

    if (postVote === voteType) {
      newVote = null;
      upvoteDelta = voteType === 'up' ? -1 : 1;
    } else if (postVote === null) {
      upvoteDelta = voteType === 'up' ? 1 : -1;
    } else {
      upvoteDelta = voteType === 'up' ? 2 : -2;
    }

    setPostVote(newVote);
    setPostUpvotes(postUpvotes + upvoteDelta);
  };

  const handleCommentVote = (commentId: string, voteType: 'up' | 'down') => {
    const updateCommentVote = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          let upvoteDelta = 0;
          let newVote: 'up' | 'down' | null = voteType;

          if (comment.userVote === voteType) {
            newVote = null;
            upvoteDelta = voteType === 'up' ? -1 : 1;
          } else if (comment.userVote === null) {
            upvoteDelta = voteType === 'up' ? 1 : -1;
          } else {
            upvoteDelta = voteType === 'up' ? 2 : -2;
          }

          return {
            ...comment,
            userVote: newVote,
            upvotes: comment.upvotes + upvoteDelta,
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: updateCommentVote(comment.replies),
          };
        }
        return comment;
      });
    };

    setComments(updateCommentVote(comments));
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `new-${Date.now()}`,
      author: 'u/you',
      timeAgo: 'just now',
      content: newComment,
      upvotes: 1,
      userVote: 'up',
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <Text style={styles.community}>{post.community}</Text>
            <Text style={styles.metadata}>
              • {post.author} • {post.timeAgo}
            </Text>
          </View>

          <Text style={styles.postTitle}>{post.title}</Text>

          {post.content && <Text style={styles.postContent}>{post.content}</Text>}

          {post.imageUrl && (
            <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
          )}

          <View style={styles.postActions}>
            <View style={styles.voteContainer}>
              <TouchableOpacity
                onPress={() => handlePostVote('up')}
                style={styles.voteButton}
              >
                <ArrowUp
                  size={22}
                  color={postVote === 'up' ? Colors.light.upvote : Colors.light.textSecondary}
                  fill={postVote === 'up' ? Colors.light.upvote : 'transparent'}
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.voteCount,
                  postVote === 'up' && { color: Colors.light.upvote },
                  postVote === 'down' && { color: Colors.light.downvote },
                ]}
              >
                {formatNumber(postUpvotes)}
              </Text>
              <TouchableOpacity
                onPress={() => handlePostVote('down')}
                style={styles.voteButton}
              >
                <ArrowDown
                  size={22}
                  color={postVote === 'down' ? Colors.light.downvote : Colors.light.textSecondary}
                  fill={postVote === 'down' ? Colors.light.downvote : 'transparent'}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.commentInfo}>
              <MessageSquare size={20} color={Colors.light.textSecondary} />
              <Text style={styles.commentInfoText}>
                {formatNumber(post.commentCount)} comments
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor={Colors.light.textSecondary}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !newComment.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Send
              size={20}
              color={newComment.trim() ? Colors.light.upvote : Colors.light.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.commentsSection}>
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onVote={handleCommentVote}
              formatNumber={formatNumber}
              depth={0}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

interface CommentItemProps {
  comment: Comment;
  onVote: (commentId: string, voteType: 'up' | 'down') => void;
  formatNumber: (num: number) => string;
  depth: number;
}

function CommentItem({ comment, onVote, formatNumber, depth }: CommentItemProps) {
  const marginLeft = depth * 16;

  return (
    <View style={[styles.commentItem, { marginLeft }]}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentAuthor}>{comment.author}</Text>
        <Text style={styles.commentTime}>• {comment.timeAgo}</Text>
      </View>

      <Text style={styles.commentContent}>{comment.content}</Text>

      <View style={styles.commentActions}>
        <TouchableOpacity
          onPress={() => onVote(comment.id, 'up')}
          style={styles.commentVoteButton}
        >
          <ArrowUp
            size={16}
            color={comment.userVote === 'up' ? Colors.light.upvote : Colors.light.textSecondary}
            fill={comment.userVote === 'up' ? Colors.light.upvote : 'transparent'}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.commentVoteCount,
            comment.userVote === 'up' && { color: Colors.light.upvote },
            comment.userVote === 'down' && { color: Colors.light.downvote },
          ]}
        >
          {formatNumber(comment.upvotes)}
        </Text>
        <TouchableOpacity
          onPress={() => onVote(comment.id, 'down')}
          style={styles.commentVoteButton}
        >
          <ArrowDown
            size={16}
            color={comment.userVote === 'down' ? Colors.light.downvote : Colors.light.textSecondary}
            fill={comment.userVote === 'down' ? Colors.light.downvote : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {comment.replies &&
        comment.replies.map(reply => (
          <CommentItem
            key={reply.id}
            comment={reply}
            onVote={onVote}
            formatNumber={formatNumber}
            depth={depth + 1}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  postCard: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: Colors.light.background,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  community: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
  },
  metadata: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 4,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
    lineHeight: 28,
  },
  postContent: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  voteButton: {
    padding: 4,
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    marginHorizontal: 8,
    minWidth: 40,
    textAlign: 'center',
  },
  commentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  commentInputContainer: {
    backgroundColor: Colors.light.card,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.light.text,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  commentsSection: {
    backgroundColor: Colors.light.card,
    paddingTop: 8,
  },
  commentItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderLeftWidth: 2,
    borderLeftColor: Colors.light.border,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
  },
  commentTime: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 4,
  },
  commentContent: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentVoteButton: {
    padding: 4,
  },
  commentVoteCount: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
    marginHorizontal: 6,
  },
});
