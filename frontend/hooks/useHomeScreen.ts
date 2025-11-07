import * as React from "react";
import { useRouter } from "expo-router";
// 1. แก้ไข Import ให้ถูกต้องสำหรับ React 19
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

// (GQL Queries ควรย้ายไป @/graphql/queries แต่ไว้ที่นี่ก่อนได้)
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

// 2. สร้าง Hook
export const useHomeScreen = () => {
  const router = useRouter();

  // 3. ย้าย Data Logic (Query/Mutation)
  const { data, loading, error, refetch } = useQuery(GET_ALL_POSTS, {
    fetchPolicy: "network-only",
  });

  const [voteMutation, { loading: voteLoading }] = useMutation(VOTE_MUTATION, {
    refetchQueries: [{ query: GET_ALL_POSTS }],
    awaitRefetchQueries: true,
  });

  // 4. ย้าย Event Handlers
  const handleVote = (postId: string, voteType: "up" | "down") => {
    voteMutation({
      variables: {
        objectId: postId,
        modelName: "post",
        voteType: voteType,
      },
    });
  };

  const navigateToPost = (id: string) => {
    router.push(`/post/${id}`);
  };

  // 5. คืนค่าทุกอย่างให้ View
  return {
    posts: data?.allPosts || [],
    loading,
    error,
    refetch,
    voteLoading, // ส่งสถานะ loading การโหวตไปด้วย
    handleVote,
    navigateToPost,
  };
};
