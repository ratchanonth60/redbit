import React from 'react';
import { View, Text, TouchableOpacity, Image, useWindowDimensions, Platform } from 'react-native';
import { router } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, MoreHorizontal } from 'lucide-react-native';
import Colors from '@/constants/colors';

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

  const VoteButtons = () => (
    <View className="flex-row items-center bg-muted/50 rounded-full px-2 py-1 mr-3 border border-transparent hover:border-border">
      <TouchableOpacity onPress={() => handleVote(1)} className="p-1">
        <ArrowBigUp
          size={24}
          color={post.userVote === 'up' ? Colors.light.upvote : Colors.light.textSecondary}
          fill={post.userVote === 'up' ? Colors.light.upvote : 'transparent'}
        />
      </TouchableOpacity>
      <Text className={`font-bold text-sm mx-1 ${post.userVote === 'up' ? 'text-upvote' :
          post.userVote === 'down' ? 'text-downvote' : 'text-text'
        }`}>
        {post.voteCount || 0}
      </Text>
      <TouchableOpacity onPress={() => handleVote(-1)} className="p-1">
        <ArrowBigDown
          size={24}
          color={post.userVote === 'down' ? Colors.light.downvote : Colors.light.textSecondary}
          fill={post.userVote === 'down' ? Colors.light.downvote : 'transparent'}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="bg-card mb-2 border-b border-border">
      <View className="p-3">
        {/* Header: Community & Author */}
        <View className="flex-row items-center mb-2">
          {post.community && (
            <TouchableOpacity
              className="flex-row items-center mr-2"
              onPress={() => router.push(`/r/${post.community!.name}` as any)}
            >
              {post.community.icon ? (
                <Image
                  source={{ uri: post.community.icon }}
                  className="w-8 h-8 rounded-full mr-2"
                />
              ) : (
                <View className="w-8 h-8 rounded-full bg-gray-300 mr-2 items-center justify-center">
                  <Text className="text-xs font-bold">{post.community.name[0].toUpperCase()}</Text>
                </View>
              )}
              <View>
                <Text className="font-bold text-text text-sm">r/{post.community.name}</Text>
                <View className="flex-row items-center">
                  <Text className="text-muted-foreground text-xs">
                    u/{post.author.username} • {timeAgo}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          {!post.community && (
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-gray-300 mr-2 items-center justify-center">
                <Text className="text-xs font-bold">u/</Text>
              </View>
              <View>
                <Text className="font-bold text-text text-sm">u/{post.author.username}</Text>
                <Text className="text-muted-foreground text-xs">{timeAgo}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity className="ml-auto p-1">
            <MoreHorizontal size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <TouchableOpacity onPress={() => router.push(`/post/${post.id}` as any)}>
          <Text className="text-lg font-bold text-text mb-2 leading-6">{post.title}</Text>
          {post.content ? (
            <Text className="text-textSecondary text-sm mb-2" numberOfLines={3}>
              {post.content}
            </Text>
          ) : null}
        </TouchableOpacity>
      </View>

      {/* Footer: Votes & Actions */}
      <View className="flex-row items-center px-3 pb-2">
        <VoteButtons />

        <TouchableOpacity
          className="flex-row items-center bg-muted/50 rounded-full px-3 py-2 mr-3 border border-transparent hover:border-border"
          onPress={() => router.push(`/post/${post.id}` as any)}
        >
          <MessageSquare size={20} color={Colors.light.textSecondary} />
          <Text className="text-textSecondary font-bold text-xs ml-2">{post.commentCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center bg-muted/50 rounded-full px-3 py-2 border border-transparent hover:border-border">
          <Share2 size={20} color={Colors.light.textSecondary} />
          <Text className="text-textSecondary font-bold text-xs ml-2">Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


