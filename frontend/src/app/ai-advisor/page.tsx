'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Bot, Send, Plus, Sparkles, MessageSquare, Shield, RefreshCw, AlertCircle } from 'lucide-react';

export default function AICareerAdvisorPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true); 
  const [streaming, setStreaming] = useState(false);
  const [showContextDrawer, setShowContextDrawer] = useState(false);

  // Preset Mode State
  const [mode, setMode] = useState('career_advice');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/ai/conversations');
      const list = Array.isArray(res.data) ? res.data : [];
      setConversations(list);
      if (list.length > 0) {
        selectConversation(list[0]);
      } else {
        createNewConversation('career_advice');
      }
    } catch (err) {
      console.error(err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async (selectedMode: string = mode) => {
    try {
      const res = await api.post('/ai/conversations', {
        title: `${selectedMode.replace('_', ' ').toUpperCase()} Session`,
        mode: selectedMode
      });
      setConversations(prev => [res.data, ...prev]);
      selectConversation(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectConversation = async (conv: any) => {
    setActiveConv(conv);
    setMode(conv.mode);
    try {
      const res = await api.get(`/ai/conversations/${conv.id}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv || streaming) return;

    const userText = inputMessage;
    setInputMessage('');
    
    // Optimistic UI append
    const tempUserMsg = { id: Date.now().toString(), role: 'user', content: userText, status: 'complete' };
    setMessages(prev => [...prev, tempUserMsg]);
    setStreaming(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ conversation_id: activeConv.id, message: userText })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      const tempAssistantMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', status: 'complete' };
      setMessages(prev => [...prev, tempAssistantMsg]);

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const token = line.replace('data: ', '');
            if (token === '[STREAM_INTERRUPTED]') {
              tempAssistantMsg.status = 'interrupted';
            } else {
              assistantText += token;
              setMessages(prev =>
                prev.map(m => (m.id === tempAssistantMsg.id ? { ...m, content: assistantText } : m))
              );
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStreaming(false);
    }
  };

  if (loading) {
    return <DashboardShell><div className="text-white">Loading AI Career Advisor...</div></DashboardShell>;
  }

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex gap-6 pb-6">
        {/* Left Sidebar: Conversations */}
        <div className="w-80 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hidden md:flex">
          <div className="space-y-4">
            <button
              onClick={() => createNewConversation(mode)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" /> New AI Session
            </button>

            <div className="space-y-1">
              <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider px-2">Preset Modes</p>
              {[
                { id: 'career_advice', label: 'Career Advisor' },
                { id: 'mock_interview', label: 'Mock Interviewer' },
                { id: 'code_review', label: 'Code Reviewer' },
                { id: 'system_design', label: 'System Design Architect' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => { setMode(m.id); createNewConversation(m.id); }}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold transition ${mode === m.id ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-white'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-1">
              <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider px-2">History</p>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {conversations.map(c => (
                  <button
                    key={c.id}
                    onClick={() => selectConversation(c)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs transition truncate ${c.id === activeConv?.id ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Drawer */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-indigo-400" />
              <div>
                <h2 className="text-sm font-bold text-white">{activeConv?.title || 'AI Career Advisor'}</h2>
                <span className="text-[10px] text-indigo-300 uppercase font-mono">{activeConv?.mode || mode}</span>
              </div>
            </div>

            <button
              onClick={() => setShowContextDrawer(!showContextDrawer)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-400" /> What I Know About You
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed space-y-1 ${m.role === 'user' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {m.status === 'interrupted' && (
                    <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> Stream Interrupted
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/90 flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder={`Ask your AI Advisor (${activeConv?.mode || mode})...`}
              className="flex-1 px-4 py-2.5 border border-slate-700 rounded-xl bg-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={streaming || !inputMessage.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </div>

        {/* "What I Know About You" Live Context Drawer */}
        {showContextDrawer && (
          <div className="w-80 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 overflow-y-auto text-xs text-slate-300">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Active Context Sources
            </h3>

            {activeConv?.context_snapshot ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <p className="font-semibold text-indigo-300 mb-1">Developer Profile</p>
                  <p>{activeConv.context_snapshot.profile?.name} ({activeConv.context_snapshot.profile?.current_position})</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <p className="font-semibold text-indigo-300 mb-1">Resume</p>
                  <p>{activeConv.context_snapshot.resume?.title} ({activeConv.context_snapshot.resume?.template} template)</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <p className="font-semibold text-indigo-300 mb-1">Coding Dashboard</p>
                  <p>{activeConv.context_snapshot.coding?.total_solved} Problems Solved</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No snapshot context found.</p>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
