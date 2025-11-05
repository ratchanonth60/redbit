
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowUp, ArrowDown, MessageSquare } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { mockPosts } from '@/mocks/posts';
import { Post } from '@/types/post';

export default function HomeScreen() {
  const [posts, setPosts] = useState(mockPosts);
  const router = useRouter();

  const handleVote = (postId: string, voteType: 'up' | 'down') => {
    setPosts(currentPosts =>
      currentPosts.map(post => {
        if (post.id !== postId) return post;

        let upvoteDelta = 0;
        let newVote: 'up' | 'down' | null = voteType;

        if (post.userVote === voteType) {
          newVote = null;
          upvoteDelta = voteType === 'up' ? -1 : 1;
        } else if (post.userVote === null) {
          upvoteDelta = voteType === 'up' ? 1 : -1;
        } else {
          upvoteDelta = voteType === 'up' ? 2 : -2;
        }

        return {
          ...post,
          userVote: newVote,
          upvotes: post.upvotes + upvoteDelta,
        };
      })
    );
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onVote={handleVote}
            onPress={() => router.push(`/post/${post.id}` as any)}
            formatNumber={formatNumber}
          />
        ))}
      </ScrollView>
    </View>
  );
}

interface PostCardProps {
  post: Post;
  onVote: (postId: string, voteType: 'up' | 'down') => void;
  onPress: () => void;
  formatNumber: (num: number) => string;
}

function PostCard({ post, onVote, onPress, formatNumber }: PostCardProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  return (
    <Animated.View style={[styles.postCard, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.voteSection}>
        <TouchableOpacity
          onPress={() => onVote(post.id, 'up')}
          style={styles.voteButton}
        >
          <ArrowUp
            size={20}
            color={post.userVote === 'up' ? Colors.light.upvote : Colors.light.textSecondary}
            fill={post.userVote === 'up' ? Colors.light.upvote : 'transparent'}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.voteCount,
            post.userVote === 'up' && { color: Colors.light.upvote },
            post.userVote === 'down' && { color: Colors.light.downvote },
          ]}
        >
          {formatNumber(post.upvotes)}
        </Text>
        <TouchableOpacity
          onPress={() => onVote(post.id, 'down')}
          style={styles.voteButton}
        >
          <ArrowDown
            size={20}
            color={post.userVote === 'down' ? Colors.light.downvote : Colors.light.textSecondary}
            fill={post.userVote === 'down' ? Colors.light.downvote : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.postContent}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.postHeader}>
          <Text style={styles.community}>{post.community}</Text>
          <Text style={styles.metadata}>
            • {post.author} • {post.timeAgo}
          </Text>
        </View>

        <Text style={styles.postTitle}>{post.title}</Text>

        {post.content && (
          <Text style={styles.postText} numberOfLines={3}>
            {post.content}
          </Text>
        )}

        {post.imageUrl && (
          <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
        )}

        <View style={styles.postFooter}>
          <View style={styles.commentButton}>
            <MessageSquare size={18} color={Colors.light.textSecondary} />
            <Text style={styles.commentCount}>
              {formatNumber(post.commentCount)} comments
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
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
  scrollContent: {
    paddingVertical: 8,
  },
  postCard: {
    backgroundColor: Colors.light.card,
    marginBottom: 8,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
  },
  voteSection: {
    width: 40,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: Colors.light.card,
  },
  voteButton: {
    padding: 4,
  },
  voteCount: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
    marginVertical: 2,
  },
  postContent: {
    flex: 1,
    paddingVertical: 8,
    paddingRight: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  postText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
});
