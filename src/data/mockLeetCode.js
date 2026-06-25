// Mock LeetCode data — mirrors the real LeetCode GraphQL API response shape
// CORS NOTE: LeetCode's API is blocked in browsers. Use a backend proxy in production.
// GraphQL endpoint: https://leetcode.com/graphql
// Query: matchedUser(username: "user") { submitStats { acSubmissionNum { difficulty count } } }

export const mockLeetCodeData = {
  username: 'devuser',
  realName: 'Alex Developer',
  ranking: 42837,
  reputation: 1250,
  starRating: 4,
  avatar: null,

  submitStats: {
    acSubmissionNum: [
      { difficulty: 'All', count: 247 },
      { difficulty: 'Easy', count: 120 },
      { difficulty: 'Medium', count: 89 },
      { difficulty: 'Hard', count: 38 },
    ],
    totalSubmissionNum: [
      { difficulty: 'All', count: 412 },
      { difficulty: 'Easy', count: 156 },
      { difficulty: 'Medium', count: 178 },
      { difficulty: 'Hard', count: 78 },
    ],
  },

  totalSolved: 247,
  easySolved: 120,
  mediumSolved: 89,
  hardSolved: 38,

  totalEasy: 820,
  totalMedium: 1687,
  totalHard: 741,

  acceptanceRate: 59.9,

  recentSubmissions: [
    {
      id: '1001',
      title: 'Two Sum',
      titleSlug: 'two-sum',
      timestamp: Date.now() / 1000 - 3600,
      statusDisplay: 'Accepted',
      lang: 'javascript',
      difficulty: 'Easy',
    },
    {
      id: '1002',
      title: 'Longest Substring Without Repeating Characters',
      titleSlug: 'longest-substring-without-repeating-characters',
      timestamp: Date.now() / 1000 - 86400,
      statusDisplay: 'Accepted',
      lang: 'javascript',
      difficulty: 'Medium',
    },
    {
      id: '1003',
      title: 'Trapping Rain Water',
      titleSlug: 'trapping-rain-water',
      timestamp: Date.now() / 1000 - 86400 * 2,
      statusDisplay: 'Wrong Answer',
      lang: 'javascript',
      difficulty: 'Hard',
    },
    {
      id: '1004',
      title: 'Binary Tree Level Order Traversal',
      titleSlug: 'binary-tree-level-order-traversal',
      timestamp: Date.now() / 1000 - 86400 * 3,
      statusDisplay: 'Accepted',
      lang: 'python3',
      difficulty: 'Medium',
    },
    {
      id: '1005',
      title: 'Coin Change',
      titleSlug: 'coin-change',
      timestamp: Date.now() / 1000 - 86400 * 4,
      statusDisplay: 'Accepted',
      lang: 'javascript',
      difficulty: 'Medium',
    },
    {
      id: '1006',
      title: 'Valid Parentheses',
      titleSlug: 'valid-parentheses',
      timestamp: Date.now() / 1000 - 86400 * 5,
      statusDisplay: 'Accepted',
      lang: 'javascript',
      difficulty: 'Easy',
    },
    {
      id: '1007',
      title: 'Merge K Sorted Lists',
      titleSlug: 'merge-k-sorted-lists',
      timestamp: Date.now() / 1000 - 86400 * 6,
      statusDisplay: 'Time Limit Exceeded',
      lang: 'javascript',
      difficulty: 'Hard',
    },
    {
      id: '1008',
      title: 'Number of Islands',
      titleSlug: 'number-of-islands',
      timestamp: Date.now() / 1000 - 86400 * 7,
      statusDisplay: 'Accepted',
      lang: 'javascript',
      difficulty: 'Medium',
    },
  ],

  topicStats: [
    { topic: 'Arrays', solved: 68, total: 120 },
    { topic: 'Strings', solved: 45, total: 80 },
    { topic: 'Trees', solved: 32, total: 65 },
    { topic: 'Dynamic Programming', solved: 28, total: 75 },
    { topic: 'Graphs', solved: 22, total: 55 },
    { topic: 'Hash Table', solved: 38, total: 60 },
    { topic: 'Two Pointers', solved: 20, total: 40 },
    { topic: 'Binary Search', solved: 18, total: 45 },
    { topic: 'Backtracking', solved: 12, total: 40 },
    { topic: 'Linked Lists', solved: 25, total: 42 },
    { topic: 'Heaps', solved: 10, total: 35 },
    { topic: 'Sliding Window', solved: 16, total: 28 },
  ],

  badges: [
    { id: '1', name: '50 Days Badge', icon: '🔥', year: 2024 },
    { id: '2', name: 'Knight', icon: '⚔️', year: 2024 },
    { id: '3', name: '100 Days Badge', icon: '💯', year: 2023 },
  ],

  streak: 23,
}
