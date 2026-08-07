'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();

    // Setup SSE Stream for real-time notification alerts
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const eventSource = new EventSource(`${apiUrl}/notifications/stream`, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.unread_count !== undefined) {
          setUnreadCount(data.unread_count);
          fetchNotifications();
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications', { params: { limit: 10 } });
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchUnreadCount();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchUnreadCount();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-900 shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id)}
                  className={`p-3 rounded-xl border text-xs space-y-1 transition cursor-pointer ${
                    n.is_read ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-800/80 border-indigo-500/40 text-white font-medium'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs">{n.title}</span>
                    <span className="text-[9px] text-slate-500">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">{n.message}</p>

                  {n.payload?.action_url && (
                    <Link
                      href={n.payload.action_url}
                      className="inline-flex items-center gap-1 text-[10px] text-indigo-400 font-semibold hover:underline pt-1"
                    >
                      View details <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
