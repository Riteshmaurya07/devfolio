'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Bot, Send, Plus, Sparkles, Shield, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '@/components/ui';

export default function AICareerAdvisorPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [showContextDrawer, setShowContextDrawer] = useState(false);

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
        mode: selectedMode,
      });
      setConversations((prev) => [res.data, ...prev]);
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
      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv || streaming) return;

    const userText = inputMessage;
    setInputMessage('');

    const tempUserMsg = { id: Date.now().toString(), role: 'user', content: userText, status: 'complete' };
    setMessages((prev) => [...prev, tempUserMsg]);
    setStreaming(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ conversation_id: activeConv.id, message: userText }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      const tempAssistantMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', status: 'complete' };
      setMessages((prev) => [...prev, tempAssistantMsg]);

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
              let parsedText = token;
              try {
                const parsed = JSON.parse(token);
                if (parsed.text !== undefined) parsedText = parsed.text;
              } catch (e) {
                // Raw token fallback
              }
              assistantText += parsedText;
              setMessages((prev) =>
                prev.map((m) => (m.id === tempAssistantMsg.id ? { ...m, content: assistantText } : m))
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

  const MODES = [
    { id: 'career_advice', label: 'Career Advisor' },
    { id: 'mock_interview', label: 'Mock Interviewer' },
    { id: 'code_review', label: 'Code Reviewer' },
    { id: 'system_design', label: 'System Design Architect' },
  ];

  if (loading) {
    return (
      <DashboardShell>
        <div className="py-12 text-center text-xs text-[var(--text-muted)]">
          Loading AI Career Advisor...
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex gap-6 pb-4">
        {/* Left Sidebar: Sessions & Modes */}
        <Card className="w-72 p-4 flex flex-col justify-between hidden md:flex shrink-0">
          <div className="space-y-4">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => createNewConversation(mode)}
              leftIcon={<Plus size={14} />}
            >
              New AI Session
            </Button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase tracking-wider px-1">
                Consultation Modes
              </span>
              {MODES.map((m) => {
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMode(m.id);
                      createNewConversation(m.id);
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-left text-xs font-semibold transition-colors duration-150 ${
                      isSelected
                        ? 'bg-[#d9541e]/10 text-[#d9541e] border border-[#d9541e]/30'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] space-y-1">
              <span className="text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase tracking-wider px-1">
                Session History
              </span>
              <div className="max-h-56 overflow-y-auto space-y-1">
                {conversations.map((c) => {
                  const isCurrent = c.id === activeConv?.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => selectConversation(c)}
                      className={`w-full px-3 py-2 rounded-lg text-left text-xs transition-colors duration-150 truncate ${
                        isCurrent
                          ? 'bg-[var(--surface-hover)] text-[var(--text-primary)] font-bold border border-[var(--border-subtle)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {c.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#d9541e]/15 text-[#d9541e] flex items-center justify-center font-bold">
                <Bot size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  {activeConv?.title || 'AI Career Advisor'}
                </h2>
                <span className="text-[10px] text-[#d9541e] uppercase font-mono font-semibold">
                  {activeConv?.mode || mode}
                </span>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowContextDrawer(!showContextDrawer)}
              leftIcon={<Shield size={13} />}
            >
              Context Profile
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--text-muted)]">
                Ask your AI advisor any technical career, system design, or code review question.
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xl p-4 rounded-lg text-xs leading-relaxed space-y-1 shadow-sm ${
                        isUser
                          ? 'bg-[#d9541e] text-white'
                          : 'bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)]'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      {m.status === 'interrupted' && (
                        <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-1 mt-1">
                          <AlertCircle size={12} /> Response Stream Interrupted
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-[var(--border-subtle)] bg-[var(--surface)] flex gap-2.5"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask advice on ${activeConv?.mode || mode}...`}
              className="flex-1 px-3.5 py-2 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-canvas)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#d9541e]"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={streaming || !inputMessage.trim()}
              isLoading={streaming}
              rightIcon={<Send size={13} />}
            >
              Send
            </Button>
          </form>
        </Card>

        {/* Live Context Drawer */}
        {showContextDrawer && (
          <Card className="w-72 p-4 space-y-3 overflow-y-auto text-xs shrink-0">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles size={14} className="text-[#d9541e]" />
              Active Context Sources
            </h3>
            {activeConv?.context_snapshot ? (
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)]">
                  <span className="font-bold text-[var(--text-primary)] block text-[11px]">
                    Developer Profile
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    {activeConv.context_snapshot.profile?.name} (
                    {activeConv.context_snapshot.profile?.current_position})
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)]">
                  <span className="font-bold text-[var(--text-primary)] block text-[11px]">
                    Resume Attached
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    {activeConv.context_snapshot.resume?.title}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)]">
                  <span className="font-bold text-[var(--text-primary)] block text-[11px]">
                    Coding Stats
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    {activeConv.context_snapshot.coding?.total_solved} Problems Solved
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">No snapshot context recorded.</p>
            )}
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
