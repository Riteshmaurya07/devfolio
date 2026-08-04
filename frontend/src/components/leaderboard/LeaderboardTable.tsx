import React from 'react';

interface LeaderboardUser {
  username: string;
  avatar_url?: string;
  developer_score: number;
  total_problems_solved: number;
  current_streak: number;
}

interface LeaderboardTableProps {
  users: LeaderboardUser[];
}

export default function LeaderboardTable({ users }: LeaderboardTableProps) {
  if (users.length === 0) {
    return <div className="p-6 text-center text-gray-500">No users found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
            <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
            <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
            <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Solved</th>
            <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Streak</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {users.map((user, index) => (
            <tr key={user.username} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                #{index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full bg-gray-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {user.developer_score.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {user.total_problems_solved}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {user.current_streak} days
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
