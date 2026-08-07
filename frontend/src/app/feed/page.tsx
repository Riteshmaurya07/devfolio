'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { MessageCircle, Heart, Bookmark, Send, TrendingUp, Share2, Flame, Plus } from 'lucide-react';

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
      const newPosts = Array.isArray(data?.posts) ? data.posts : (Array.isArray(data) ? data : []);

      if (appendMode) {
        setPosts(prev => [...prev, ...newPosts]);
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
      setMessage('Post created!');
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
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, is_liked: res.data.liked, likes_count: res.data.liked ? p.likes_count + 1 : p.likes_count - 1 }
          : p
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = async (postId: string) => {
    try {
      const res = await api.post(`/feed/posts/${postId}/bookmark`);
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, is_bookmarked: res.data.bookmarked } : p
      ));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <DashboardShell><div className="text-white">Loading Feed...</div></DashboardShell>;
  }

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                <MessageCircle className="w-8 h-8 text-indigo-400" /> Developer Feed
              </h1>
              <p className="text-slate-400 text-sm mt-1">Posts from you and developers you follow.</p>
            </div>

            {message && (
              <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/50 text-indigo-200 text-sm">
                {message}
              </div>
            )}

            {/* Post Composer */}
            <form onSubmit={handleCreatePost} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <textarea
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Share something with the community..."
                maxLength={5000}
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm resize-none focus:outline-none focus:border-indigo-500 transition"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPostType('text')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${postType === 'text' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  >
                    Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('project_share')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${postType === 'project_share' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  >
                    <Share2 className="w-3 h-3" /> Share Project
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">{newContent.length}/5000</span>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/30">
                    <Send className="w-3.5 h-3.5" /> Post
                  </button>
                </div>
              </div>
            </form>

            {/* Feed Posts */}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
                  <p className="text-sm">No posts yet. Follow other developers or create your first post!</p>
                </div>
              ) : (
                posts.map(post => (
                  <div key={post.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition">
                    {/* Post Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {post.profile_id?.toString().slice(0, 2).toUpperCase() || 'DV'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Developer</p>
                        <p className="text-[10px] text-slate-500">{new Date(post.created_at).toLocaleString()}</p>
                      </div>
                      {post.post_type === 'project_share' && (
                        <span className="ml-auto px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-full font-semibold flex items-center gap-1">
                          <Share2 className="w-3 h-3" /> Project
                        </span>
                      )}
                    </div>

                    {/* Post Content */}
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                    {/* Action Bar */}
                    <div className="flex items-center gap-4 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 text-xs transition ${post.is_liked ? 'text-red-400' : 'text-slate-500 hover:text-red-400'}`}
                      >
                        <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-red-400' : ''}`} />
                        {post.likes_count}
                      </button>
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MessageCircle className="w-4 h-4" /> {post.comments_count}
                      </span>
                      <button
                        onClick={() => handleToggleBookmark(post.id)}
                        className={`flex items-center gap-1.5 text-xs transition ml-auto ${post.is_bookmarked ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}
                      >
                        <Bookmark className={`w-4 h-4 ${post.is_bookmarked ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Load More */}
            {hasMore && posts.length > 0 && (
              <button
                onClick={() => fetchFeed(true)}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Load More
              </button>
            )}
          </div>

          {/* Trending Sidebar */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 sticky top-24">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" /> Trending Projects
              </h2>

              {trending.length === 0 ? (
                <p className="text-xs text-slate-400">No trending projects yet.</p>
              ) : (
                <div className="space-y-3">
                  {trending.map((t, idx) => (
                    <div key={t.project_id} className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-3">
                      <span className="text-lg font-extrabold text-indigo-400 w-6 text-center">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">Project {t.project_id.slice(0, 8)}</p>
                        <p className="text-[10px] text-slate-400">
                          {t.views_count} views · {t.likes_count} likes
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" /> {t.score.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
