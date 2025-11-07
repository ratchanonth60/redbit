import * as React from "react";
import { useLocalSearchParams } from "expo-router";
// 1. แก้ไข Import ให้ถูกต้องสำหรับ React 19
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

// 2. Import GQL (คุณควรย้าย GQL string ไปไว้ใน @/graphql/queries)
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

const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($postId: ID!, $content: String!, $parentId: ID) {
    createComment(postId: $postId, content: $content, parentId: $parentId) {
      comment {
        id
      }
    }
  }
`;

// 3. สร้าง Hook
export const usePostDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [newComment, setNewComment] = React.useState("");

  // 4. ย้าย Data Logic (Query/Mutation)
  const { data, loading, error, refetch } = useQuery(GET_POST_DETAILS, {
    variables: { id: id, postId: id },
    fetchPolicy: "network-only",
  });

  const [voteMutation] = useMutation(VOTE_MUTATION, {
    refetchQueries: [
      { query: GET_POST_DETAILS, variables: { id: id, postId: id } },
    ],
    awaitRefetchQueries: true,
  });

  const [createCommentMutation, { loading: commentLoading }] = useMutation(
    CREATE_COMMENT_MUTATION,
    {
      refetchQueries: [
        { query: GET_POST_DETAILS, variables: { id: id, postId: id } },
      ],
      awaitRefetchQueries: true,
    },
  );

  // 5. ย้าย Event Handlers
  const handlePostVote = (voteType: "up" | "down") => {
    if (data?.post) {
      voteMutation({
        variables: {
          objectId: data.post.id,
          modelName: "post",
          voteType: voteType,
        },
      });
    }
  };

  const handleCommentVote = (commentId: string, voteType: "up" | "down") => {
    voteMutation({
      variables: {
        objectId: commentId,
        modelName: "comment",
        voteType: voteType,
      },
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !data?.post) return;

    createCommentMutation({
      variables: {
        postId: data.post.id,
        content: newComment,
        parentId: null,
      },
      onCompleted: () => {
        setNewComment("");
      },
      onError: (err) => {
        console.error("Error adding comment:", err);
      },
    });
  };

  // 6. คืนค่าทุกอย่างให้ View
  return {
    post: data?.post,
    comments: data?.comments || [],
    loading,
    error,
    newComment,
    setNewComment,
    commentLoading,
    handlePostVote,
    handleCommentVote,
    handleAddComment,
  };
};
