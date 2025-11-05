import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator, // เพิ่ม ActivityIndicator
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ArrowUp, ArrowDown, MessageSquare, Send } from 'lucide-react-native';
import Colors from '@/constants/colors';
// --- ลบ Mocks ---
// import { mockPosts, mockComments } from '@/mocks/posts'; 
import { Comment } from '@/types/post'; // ยังคงใช้ Type
// --- เพิ่ม Apollo Client ---
import { gql } from "@apollo/client"; // (สำหรับสิ่งที่ไม่ใช่ React เช่น gql)
import { useQuery } from "@apollo/client/react"; // (สำหรับ React Hooks ทั้งหมด)

// 1. สร้าง GraphQL Query เพื่อดึงข้อมูล Post และ Comments
// เราดึงข้อมูล 2 อย่างใน query เดียวโดยใช้ alias
const GET_POST_DETAILS = gql`
  query GetPostDetails($id: ID!, $postId: ID!) {
    post(id: $id) {
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
    comments(postId: $postId) {
      id
      author {
        username
      }
      timeAgo
      content
      upvotes
      userVote
      replies {
        id
        author {
          username
        }
        timeAgo
        content
        upvotes
        userVote
      }
    }
  }
`;

// 2. สร้าง GraphQL Mutation สำหรับการโหวต
const VOTE_MUTATION = gql`
  mutation Vote($objectId: ID!, $modelName: String!, $voteType: String!) {
    vote(objectId: $objectId, modelName: $modelName, voteType: $voteType) {
      post {
        id
        upvotes
        userVote
      }
      comment {
        id
        upvotes
        userVote
      }
    }
  }
`;

// 3. สร้าง GraphQL Mutation สำหรับการสร้างคอมเมนต์
const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($postId: ID!, $content: String!, $parentId: ID) {
    createComment(postId: $postId, content: $content, parentId: $parentId) {
      comment {
        id
      }
    }
  }
`;


export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [newComment, setNewComment] = useState('');

  // 4. ใช้ useQuery เพื่อดึงข้อมูล
  const { data, loading, error, refetch } = useQuery(GET_POST_DETAILS, {
    variables: { id: id, postId: id },
    fetchPolicy: 'network-only', // ดึงข้อมูลใหม่เสมอเมื่อเข้าหน้านี้
  });

  // 5. ใช้ useMutation
  const [voteMutation] = useMutation(VOTE_MUTATION, {
    // refetch ข้อมูล Post และ Comments ใหม่หลังจากโหวต
    // เพื่อให้ UI อัปเดตคะแนนและสถานะการโหวต
    refetchQueries: [{ query: GET_POST_DETAILS, variables: { id: id, postId: id } }],
    awaitRefetchQueries: true,
  });

  const [createCommentMutation] = useMutation(CREATE_COMMENT_MUTATION, {
    // refetch ข้อมูล Comments ใหม่หลังจากเพิ่มคอมเมนต์
    refetchQueries: [{ query: GET_POST_DETAILS, variables: { id: id, postId: id } }],
    awaitRefetchQueries: true,
  });


  // 6. ลบ useState ที่ใช้ Mocks ออก
  // const post = mockPosts.find(p => p.id === id); // ลบ
  // const [comments, setComments] = useState(mockComments[id] || []); // ลบ
  // const [postVote, setPostVote] = useState<'up' | 'down' | null>(post?.userVote || null); // ลบ
  // const [postUpvotes, setPostUpvotes] = useState(post?.upvotes || 0); // ลบ

  // 7. จัดการ State (Loading, Error, Data)
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
        <Text style={styles.errorText}>Error loading post: {error.message}</Text>
      </View>
    );
  }

  // 8. ดึงข้อมูลจาก data
  const post = data?.post;
  const comments = data?.comments || [];

  if (!post) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  // 9. อัปเดต Handlers ให้เรียกใช้ useMutation
  const handlePostVote = (voteType: 'up' | 'down') => {
    voteMutation({
      variables: {
        objectId: post.id,
        modelName: 'post',
        voteType: voteType,
      },
    });
  };

  const handleCommentVote = (commentId: string, voteType: 'up' | 'down') => {
    // Logic การอัปเดต state แบบทันที (Optimistic Update) ถูกลบออก
    // และแทนที่ด้วยการเรียก mutation
    voteMutation({
      variables: {
        objectId: commentId,
        modelName: 'comment',
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

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    createCommentMutation({
      variables: {
        postId: post.id,
        content: newComment,
        parentId: null, // (สำหรับการ reply สามารถเพิ่ม logic ทีหลัง)
      },
      onCompleted: () => {
        setNewComment(''); // เคลียร์ช่อง input
      },
      onError: (err) => {
        console.error("Error adding comment:", err);
      }
    });
  };

  // 10. อัปเดต JSX 
  // (ส่วนใหญ่เหมือนเดิม แต่ต้องเปลี่ยน post.community เป็น post.community.name 
  // และ post.author เป็น post.author.username)
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            {/* อัปเดตที่นี่ */}
            <Text style={styles.community}>{post.community.name}</Text>
            <Text style={styles.metadata}>
              • {post.author.username} • {post.timeAgo}
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
                  // อัปเดตที่นี่
                  color={post.userVote === 'up' ? Colors.light.upvote : Colors.light.textSecondary}
                  fill={post.userVote === 'up' ? Colors.light.upvote : 'transparent'}
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.voteCount,
                  // อัปเดตที่นี่
                  post.userVote === 'up' && { color: Colors.light.upvote },
                  post.userVote === 'down' && { color: Colors.light.downvote },
                ]}
              >
                {/* อัปเดตที่นี่ */}
                {formatNumber(post.upvotes)}
              </Text>
              <TouchableOpacity
                onPress={() => handlePostVote('down')}
                style={styles.voteButton}
              >
                <ArrowDown
                  size={22}
                  // อัปเดตที่นี่
                  color={post.userVote === 'down' ? Colors.light.downvote : Colors.light.textSecondary}
                  fill={post.userVote === 'down' ? Colors.light.downvote : 'transparent'}
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
          {comments.map((comment: any) => ( // ใช้ any ชั่วคราว หรืออัปเดต Comment type
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
  comment: any; // ควรอัปเดต Type ให้ตรงกับ GraphQL (มี author.username)
  onVote: (commentId: string, voteType: 'up' | 'down') => void;
  formatNumber: (num: number) => string;
  depth: number;
}

function CommentItem({ comment, onVote, formatNumber, depth }: CommentItemProps) {
  const marginLeft = depth * 16;

  return (
    <View style={[styles.commentItem, { marginLeft }]}>
      <View style={styles.commentHeader}>
        {/* อัปเดตที่นี่ */}
        <Text style={styles.commentAuthor}>{comment.author.username}</Text>
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
        comment.replies.map((reply: any) => (
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

// 11. เพิ่ม style สำหรับ center (ใช้ใน loading)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
