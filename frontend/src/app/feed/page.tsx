'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { MessageCircle, Heart, Bookmark, Send, TrendingUp, Share2, Flame } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Textarea } from '@/components/ui';

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Composer state
  const [newContent, setNewContent] = useState('');
  const [postType, setPostType] = useState('text');

  // Cursor state
  const [cursorTs, setCursorTs] = useState<string | null>(null);
  const [cursorId, setCursorId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchFeed();
    fetchTrending();
  }, []);

  const fetchFeed = async (appendMode = false) => {
    try {
      const params: any = { limit: 20 };
      if (appendMode && cursorTs && cursorId) {
        params.cursor_ts = cursorTs;
        params.cursor_id = cursorId;
      }
      const res = await api.get('/feed', { params });
      const data = res.data;
      const newPosts = Array.isArray(data?.posts) ? data.posts : Array.isArray(data) ? data : [];

      if (appendMode) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      if (data?.next_cursor_ts && data?.next_cursor_id) {
        setCursorTs(data.next_cursor_ts);
        setCursorId(data.next_cursor_id);
        setHasMore(newPosts.length === 20);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const res = await api.get('/feed/trending', { params: { limit: 5 } });
      setTrending(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setTrending([]);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    try {
      await api.post('/feed/posts', { post_type: postType, content: newContent });
      setNewContent('');
      setMessage('Post published to developer feed!');
      setCursorTs(null);
      setCursorId(null);
      fetchFeed();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to create post');
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      const res = await api.post(`/feed/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, is_liked: res.data.liked, likes_count: res.data.liked ? p.likes_count + 1 : p.likes_count - 1 }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = async (postId: string) => {
    try {
      const res = await api.post(`/feed/posts/${postId}/bookmark`);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, is_bookmarked: res.data.bookmarked } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  Developer Community Feed
                </h1>
                <Badge variant="burnt" size="sm">
                  Discussions
                </Badge>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Real-time updates, milestone announcements, and project shares from verified developers.
              </p>
            </div>

            {message && (
              <div className="p-3 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] flex items-center justify-between">
                <span>{message}</span>
                <button
                  onClick={() => setMessage('')}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-mono"
                >
                  dismiss
                </button>
              </div>
            )}

            {/* Post Composer */}
            <Card className="p-5 space-y-3">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Share your latest engineering milestone, project launch, or algorithm breakthrough..."
                maxLength={5000}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-xs resize-none focus:outline-none focus:border-[#d9541e] transition-colors"
              />
              <div className="flex justify-between items-center pt-1 border-t border-[var(--border-subtle)]">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPostType('text')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      postType === 'text'
                        ? 'bg-[#d9541e] text-white'
                        : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('project_share')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                      postType === 'project_share'
                        ? 'bg-[#d9541e] text-white'
                        : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Share2 size={12} /> Share Project
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {newContent.length}/5000
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCreatePost}
                    disabled={!newContent.trim()}
                    rightIcon={<Send size={12} />}
                  >
                    Publish
                  </Button>
                </div>
              </div>
            </Card>

            {/* Posts List */}
            <div className="space-y-4">
              {loading ? (
                <div className="py-12 text-center text-xs text-[var(--text-muted)]">
                  Loading community feed...
                </div>
              ) : posts.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-lg">
                  No posts yet. Publish your first project or milestone above!
                </div>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="p-5 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#d9541e]/15 text-[#d9541e] flex items-center justify-center font-bold text-xs">
                        {post.profile_id?.toString().slice(0, 2).toUpperCase() || 'DV'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">
                          {post.profile_name || 'Developer'}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] font-mono">
                          {new Date(post.created_at).toLocaleString()}
                        </p>
                      </div>
                      {post.post_type === 'project_share' && (
                        <Badge variant="burnt" size="sm" className="ml-auto">
                          Project
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-2 border-t border-[var(--border-subtle)]">
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                          post.is_liked
                            ? 'text-[#d9541e] font-semibold'
                            : 'text-[var(--text-muted)] hover:text-[#d9541e]'
                        }`}
                      >
                        <Heart size={14} className={post.is_liked ? 'fill-[#d9541e]' : ''} />
                        <span>{post.likes_count || 0}</span>
                      </button>
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                        <MessageCircle size={14} />
                        <span>{post.comments_count || 0}</span>
                      </span>
                      <button
                        onClick={() => handleToggleBookmark(post.id)}
                        className={`flex items-center gap-1.5 text-xs ml-auto transition-colors ${
                          post.is_bookmarked
                            ? 'text-[#d9541e]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <Bookmark size={14} className={post.is_bookmarked ? 'fill-[#d9541e]' : ''} />
                      </button>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {hasMore && posts.length > 0 && (
              <Button
                variant="secondary"
                fullWidth
                size="sm"
                onClick={() => fetchFeed(true)}
              >
                Load More Posts
              </Button>
            )}
          </div>

          {/* Trending Projects Sidebar */}
          <div className="space-y-6">
            <Card className="p-5 space-y-4 sticky top-24">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-[#d9541e]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Trending Projects
                </h2>
              </div>

              {trending.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)]">No trending projects indexed.</p>
              ) : (
                <div className="space-y-2.5">
                  {trending.map((t, idx) => (
                    <div
                      key={t.project_id}
                      className="p-3 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex items-center gap-3"
                    >
                      <span className="text-sm font-bold font-mono text-[#d9541e] w-5 text-center">
                        #{idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                          Project {t.project_id.slice(0, 8)}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] font-mono">
                          {t.views_count} views · {t.likes_count} likes
                        </p>
                      </div>
                      <div className="text-right font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <TrendingUp size={12} /> {t.score.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
