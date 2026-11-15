import React from 'react';
import Link from 'next/link';
import { Trophy, Flame, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

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

export default function LeaderboardTable({ users = [] }: LeaderboardTableProps) {
  const userList = Array.isArray(users) ? users : [];

  if (userList.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-[var(--text-muted)]">
        No active developers on the leaderboard yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-canvas-subtle)]/70 text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[10px]">
            <th className="px-5 py-3">Rank</th>
            <th className="px-5 py-3">Developer</th>
            <th className="px-5 py-3">Score</th>
            <th className="px-5 py-3">Problems Solved</th>
            <th className="px-5 py-3">Streak</th>
            <th className="px-5 py-3 text-right">Profile</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {userList.map((user, index) => {
            const isTop3 = index < 3;
            return (
              <tr
                key={user.username}
                className="hover:bg-[var(--bg-surface-hover)] transition-colors duration-150"
              >
                <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold">
                  {index === 0 ? (
                    <Badge variant="burnt" size="sm">
                      <Trophy size={11} className="mr-1" /> #1
                    </Badge>
                  ) : index === 1 ? (
                    <Badge variant="cream" size="sm">
                      #2
                    </Badge>
                  ) : index === 2 ? (
                    <Badge variant="neutral" size="sm">
                      #3
                    </Badge>
                  ) : (
                    <span className="text-[var(--text-muted)] pl-2">#{index + 1}</span>
                  )}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center space-x-2.5">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt=""
                        className="w-7 h-7 rounded-md border border-[var(--border-subtle)] object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-md bg-[#d9541e]/15 border border-[#d9541e]/30 text-[#d9541e] flex items-center justify-center font-bold text-xs">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold text-[var(--text-primary)]">
                      @{user.username}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-[#d9541e]">
                  {user.developer_score ? user.developer_score.toLocaleString() : '0'}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-[var(--text-secondary)] font-mono">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    {user.total_problems_solved ?? 0}
                  </span>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1 font-mono">
                    <Flame size={13} className="text-[#d9541e]" />
                    {user.current_streak || 0}d
                  </span>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-right">
                  <Link
                    href={`/u/${user.username}`}
                    className="text-[11px] font-medium text-[#d9541e] hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
