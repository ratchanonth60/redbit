export interface Post {
  id: string;
  community: string;
  author: string;
  timeAgo: string;
  title: string;
  content?: string;
  imageUrl?: string;
  upvotes: number;
  commentCount: number;
  userVote?: "up" | "down" | null;
}

export interface Comment {
  id: string;
  author: string;
  timeAgo: string;
  content: string;
  upvotes: number;
  userVote?: "up" | "down" | null;
  replies?: Comment[];
}
