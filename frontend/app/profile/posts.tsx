import { gql } from "@apollo/client";
import { FlatList } from 'react-native';
import PostCard from '@/components/PostCard';

const GET_USER_POSTS = gql`
  query GetUserPosts($username: String!) {
    userPosts(username: $username) {
      id
      title
      upvotes
      commentCount
      timeAgo
    }
  }
`;

export default function UserPostsScreen() {
  const { user } = useAuth();
  const { data } = useQuery(GET_USER_POSTS, {
    variables: { username: user?.username }
  });

  return (
    <FlatList
      data={data?.userPosts}
      renderItem={({ item }) => <PostCard post={item} />}
      keyExtractor={(item) => item.id}
    />

  );
}
