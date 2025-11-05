// เพิ่ม 2 Types นี้เพื่อรองรับข้อมูลจาก GraphQL
export interface Author {
  username: string;
}

export interface CommunityInfo {
  name: string;
}

// อัปเดต Post Interface
export interface Post {
  id: string;
  // เปลี่ยนจาก string
  community: CommunityInfo;
  author: Author;
  timeAgo: string;
  title: string;
  content?: string;
  imageUrl?: string;
  upvotes: number;
  commentCount: number;
  userVote?: "up" | "down" | null;
}

// อัปเดต Comment Interface
export interface Comment {
  id: string;
  // เปลี่ยนจาก string
  author: Author;
  timeAgo: string;
  content: string;
  upvotes: number;
  userVote?: "up" | "down" | null;
  replies?: Comment[];
}
