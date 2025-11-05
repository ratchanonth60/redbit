import React from 'react'; // ลบ useState ออก
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator, // เพิ่ม ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowUp, ArrowDown, MessageSquare } from 'lucide-react-native';
import Colors from '@/constants/colors';
// --- ลบ Mocks ---
// import { mockPosts } from '@/mocks/posts';
import { Post } from '@/types/post';
import { gql } from "@apollo/client"; // (สำหรับสิ่งที่ไม่ใช่ React เช่น gql)
import { useQuery, useMutation } from "@apollo/client/react"; // (สำหรับ React Hooks ทั้งหมด)

// 1. สร้าง Query เพื่อดึงโพสต์ทั้งหมด
const GET_ALL_POSTS = gql`
  query GetAllPosts {
    allPosts {
      id
      community {
        name
      }
      author {
        username
      }
      timeAgo
      title
      content
      imageUrl
      upvotes
      commentCount
      userVote
    }
  }
`;

// 2. สร้าง Mutation สำหรับโหวต (เหมือนใน [id].tsx)
const VOTE_MUTATION = gql`
  mutation Vote($objectId: ID!, $modelName: String!, $voteType: String!) {
    vote(objectId: $objectId, modelName: $modelName, voteType: $voteType) {
      post {
        id
        upvotes
        userVote
      }
    }
  }
`;


export default function HomeScreen() {
  // --- 3. ลบ useState(mockPosts) และใช้ useQuery แทน ---
  // const [posts, setPosts] = useState(mockPosts); // ลบ
  const router = useRouter();
  
  const { data, loading, error, refetch } = useQuery(GET_ALL_POSTS, {
    fetchPolicy: 'network-only' // ดึงข้อมูลใหม่เสมอ
  });
  
  // 4. ใช้ useMutation
  const [voteMutation] = useMutation(VOTE_MUTATION, {
    // refetch Query เดิมเพื่อให้คะแนนอัปเดต
    refetchQueries: [{ query: GET_ALL_POSTS }],
    awaitRefetchQueries: true,
  });

  // 5. อัปเดต HandleVote
  const handleVote = (postId: string, voteType: 'up' | 'down') => {
    // Logic การอัปเดต state แบบเก่าถูกลบออก
    voteMutation({
      variables: {
        objectId: postId,
        modelName: 'post',
        voteType: voteType,
      },
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // 6. จัดการ State (Loading, Error)
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.light.text} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Error loading posts: {error.message}</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={{ color: Colors.light.upvote }}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 7. ดึงข้อมูลจริงจาก data
  const posts: Post[] = data?.allPosts || [];

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
  post: Post; // ตอนนี้ Type ถูกต้องแล้ว
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
          {/* 8. อัปเดต JSX ให้ตรงกับ Type ที่เราแก้ */}
          <Text style={styles.community}>{post.community.name}</Text>
          <Text style={styles.metadata}>
            • {post.author.username} • {post.timeAgo}
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
  // 9. เพิ่ม Style สำหรับ Loading/Error
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
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
