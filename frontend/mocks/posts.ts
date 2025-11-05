,
    community: "r/react",
    author: "u/hookmaster",
    timeAgo: "5h",
    title: "New React Native performance tips that actually work",
    imageUrl:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
    upvotes: 5621,
    commentCount: 289,
    userVote: null,
  },
  {
    id: "3",
    community: "r/webdev",
    author: "u/devjourney",
    timeAgo: "7h",
    title: "How I went from zero to landing my first dev job in 8 months",
    content:
      "A lot of people ask about my journey. Here's the honest truth: consistency beats talent. I coded every single day, built projects I was passionate about, and networked genuinely.",
    upvotes: 12453,
    commentCount: 892,
    userVote: null,
  },
  {
    id: "4",
    community: "r/typescript",
    author: "u/typedsafely",
    timeAgo: "9h",
    title: "TypeScript 5.6 is a game changer",
    content:
      "The new features are incredible. The type inference improvements alone are worth the upgrade. Check out the docs!",
    upvotes: 1456,
    commentCount: 78,
    userVote: null,
  },
  {
    id: "5",
    community: "r/design",
    author: "u/pixelperfect",
    timeAgo: "11h",
    title: "Mobile UI/UX trends that are actually good",
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
    upvotes: 3892,
    commentCount: 234,
    userVote: null,
  },
  {
    id: "6",
    community: "r/javascript",
    author: "u/asyncawait",
    timeAgo: "14h",
    title: "Why I stopped using useEffect for data fetching",
    content:
      "React Query changed my life. Server state is NOT client state. Once I understood this, everything clicked.",
    upvotes: 8234,
    commentCount: 512,
    userVote: null,
  },
  {
    id: "7",
    community: "r/devops",
    author: "u/cloudninja",
    timeAgo: "1d",
    title: "Deployed to production on a Friday. AMA.",
    upvotes: 15632,
    commentCount: 1247,
    userVote: null,
  },
];

export const mockComments: { [postId: string]: Comment[] } = {
  "1": [
    {
      id: "c1",
      author: "u/opensourcefan",
      timeAgo: "2h",
      content:
        "Congrats! Which project was it? Always looking for good first contribution opportunities.",
      upvotes: 234,
      userVote: null,
      replies: [
        {
          id: "c1-1",
          author: "u/coderlife",
          timeAgo: "2h",
          content:
            "It was a popular CLI tool. I started with documentation fixes, then moved to small bug fixes. The community was amazing!",
          upvotes: 156,
          userVote: null,
        },
      ],
    },
    {
      id: "c2",
      author: "u/veterandev",
      timeAgo: "1h",
      content:
        "This is the way. Contributing to open source taught me more than any course ever could.",
      upvotes: 89,
      userVote: null,
    },
    {
      id: "c3",
      author: "u/juniordev23",
      timeAgo: "45m",
      content:
        "I'm still nervous about making my first PR. Any tips on finding beginner-friendly issues?",
      upvotes: 67,
      userVote: null,
      replies: [
        {
          id: "c3-1",
          author: "u/coderlife",
          timeAgo: "30m",
          content:
            'Look for labels like "good first issue" or "beginner friendly". Also, don\'t be afraid to ask questions in the discussions!',
          upvotes: 45,
          userVote: null,
        },
      ],
    },
  ],
};
