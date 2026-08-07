'use client';

import React, { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import api from '@/lib/api';

export default function DashboardPage() {
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/leaderboard/global');
        const data = res.data;
        const list = Array.isArray(data) ? data : (data?.rankings || data?.users || data?.items || []);
        setGlobalLeaderboard(list);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
        setGlobalLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mock KPI Cards */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Developer Score</h3>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">1,250</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Problems Solved</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">125</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Current Streak</h3>
            <p className="text-3xl font-bold text-orange-500 dark:text-orange-400 mt-2">12 Days</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Global Leaderboard</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading leaderboard...</div>
          ) : (
            <LeaderboardTable users={globalLeaderboard} />
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
