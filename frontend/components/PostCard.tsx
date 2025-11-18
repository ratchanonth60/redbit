import React from 'react';
import { View, Text, TouchableOpacity, Image, useWindowDimensions, Platform } from 'react-native';
import { router } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';

const VOTE_MUTATION = gql`
  mutation Vote($postId: ID!, $value: Int!) {
    vote(postId: $postId, value: $value) {
      success
      post {
        id
        voteCount
        userVote
      }
    }
  }
`;

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    voteCount?: number;
    commentCount?: number;
    userVote?: string | null;
    author: {
      username: string;
      profilePicture?: string;
    };
    community?: {
      name: string;
      icon?: string;
    };
  };
}

export default function PostCard({ post }: PostCardProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768 && Platform.OS === 'web';
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const [vote] = useMutation(VOTE_MUTATION);

  const handleVote = (value: number) => {
    // Optimistic update logic
    const isUpvote = value === 1;
    const isDownvote = value === -1;
    const currentVote = post.userVote;
    let newVoteCount = post.voteCount || 0;
    let newUserVote: string | null = null;

    if (isUpvote) {
      if (currentVote === 'up') {
        newVoteCount -= 1; // Toggle off
        newUserVote = null;
      } else {
        newVoteCount += currentVote === 'down' ? 2 : 1;
        newUserVote = 'up';
      }
    } else if (isDownvote) {
      if (currentVote === 'down') {
        newVoteCount += 1; // Toggle off
        newUserVote = null;
      } else {
        newVoteCount -= currentVote === 'up' ? 2 : 1;
        newUserVote = 'down';
      }
    }

    vote({
      variables: { postId: post.id, value },
      optimisticResponse: {
        vote: {
          __typename: 'VoteMutation',
          success: true,
          post: {
            __typename: 'PostType',
            id: post.id,
            voteCount: newVoteCount,
            userVote: newUserVote,
          },
        },
      },
    });
  };

  const VoteButtons = ({ vertical = false }) => (
    <View className={`items-center ${vertical ? 'flex-col mr-4 bg-transparent' : 'flex-row bg-muted rounded-full px-2 py-1 mr-4'}`}>
      <TouchableOpacity onPress={() => handleVote(1)}>
        <Text className={`font-bold text-lg ${vertical ? 'mb-1' : 'mr-1'} ${post.userVote === 'up' ? 'text-upvote' : 'text-text'}`}>
          ⬆
        </Text>
      </TouchableOpacity>
      <Text className={`font-bold text-xs ${post.userVote === 'up' ? 'text-upvote' :
        post.userVote === 'down' ? 'text-downvote' : 'text-text'
        }`}>
        {post.voteCount || 0}
      </Text>
      <TouchableOpacity onPress={() => handleVote(-1)}>
        <Text className={`font-bold text-lg ${vertical ? 'mt-1' : 'ml-1'} ${post.userVote === 'down' ? 'text-downvote' : 'text-text'}`}>
          ⬇
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className={`bg-card p-4 mb-2 border-b border-border ${isDesktop ? 'flex-row' : ''}`}>
      {/* Desktop: Side Voting */}
      {isDesktop && <VoteButtons vertical />}

      <View className="flex-1">
        {/* Header: Community & Author */}
        <View className="flex-row items-center mb-2">
          {post.community && (
            <TouchableOpacity
              className="flex-row items-center mr-2"
              onPress={() => router.push(`/r/${post.community!.name}` as any)}
            >
              {post.community.icon && (
                <Image
                  source={{ uri: post.community.icon }}
                  className="w-6 h-6 rounded-full mr-1"
                />
              )}
              <Text className="font-bold text-text text-xs">r/{post.community.name}</Text>
            </TouchableOpacity>
          )}
          <Text className="text-muted-foreground text-xs mr-1">•</Text>
          <TouchableOpacity onPress={() => router.push(`/u/${post.author.username}` as any)}>
            <Text className="text-muted-foreground text-xs">
              u/{post.author.username}
            </Text>
          </TouchableOpacity>
          <Text className="text-muted-foreground text-xs ml-1">
            • {timeAgo}
          </Text>
        </View>

        {/* Content */}
        <TouchableOpacity onPress={() => router.push(`/post/${post.id}` as any)}>
          <Text className="text-lg font-bold text-text mb-2">{post.title}</Text>
          <Text className="text-muted-foreground text-sm mb-4" numberOfLines={3}>
            {post.content}
          </Text>
        </TouchableOpacity>

        {/* Footer: Votes (Mobile) & Comments */}
        <View className="flex-row items-center">
          {!isDesktop && <VoteButtons />}

          <View className="flex-row items-center bg-muted rounded-full px-2 py-1 hover:bg-gray-200">
            <Text className="text-text font-bold text-xs mr-1">💬</Text>
            <Text className="text-text font-bold text-xs">{post.commentCount || 0} Comments</Text>
          </View>
        </View>
      </View>
    </View>
  );
}


