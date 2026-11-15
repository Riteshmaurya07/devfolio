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
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-sm bg-[#d9541e] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl p-4 z-50 space-y-3">
          <div className="flex justify-between items-center pb-2.5 border-b border-[var(--border-subtle)]">
            <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] text-[#d9541e] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-6 text-center">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id)}
                  className={`p-3 rounded-lg border text-xs space-y-1 transition cursor-pointer ${
                    n.is_read
                      ? 'bg-[var(--bg-canvas-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                      : 'bg-[#d9541e]/5 border-[#d9541e]/30 text-[var(--text-primary)] font-medium'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-xs text-[var(--text-primary)]">{n.title}</span>
                    <span className="text-[9px] text-[var(--text-muted)] font-mono">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">{n.message}</p>

                  {n.payload?.action_url && (
                    <Link
                      href={n.payload.action_url}
                      className="inline-flex items-center gap-1 text-[10px] text-[#d9541e] font-semibold hover:underline pt-1"
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
