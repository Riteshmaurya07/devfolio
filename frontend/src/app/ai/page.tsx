'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Chat, Message } from '@/types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function AIChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChats = async () => {
    try {
      const res = await api.get('/ai/chats');
      setChats(res.data);
    } catch (err) {
      toast.error('Failed to load chats');
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const res = await api.get(`/ai/chats/${chatId}`);
      setMessages(res.data.messages || []);
      setActiveChat(chatId);
    } catch (err) {
      toast.error('Failed to load chat history');
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const createChat = async () => {
    try {
      const res = await api.post('/ai/chats', { title: 'New Conversation', topic: 'general' });
      fetchChats();
      fetchMessages(res.data.id);
    } catch (err) {
      toast.error('Failed to create new chat');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChat || isSending) return;

    const currentInput = input;
    setInput('');
    setIsSending(true);

    // Optimistic UI for user message
    const tempUserMsg: Message = { id: `temp-${Date.now()}`, role: 'user', content: currentInput };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.post(`/ai/chats/${activeChat}/messages`, { content: currentInput });
      // Replace temp message and add AI response
      setMessages((prev) => {
        const filtered = prev.filter(m => m.id !== tempUserMsg.id);
        if (res.data && res.data.content) {
             return [...filtered, { id: res.data.id || Date.now(), role: 'user', content: currentInput }, { id: Date.now() + 1, role: 'assistant', content: res.data.content }];
        }
        fetchMessages(activeChat);
        return prev;
      });
    } catch (err) {
      toast.error('Failed to send message');
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      setInput(currentInput);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row h-full min-h-[600px] gap-4">
        {/* Sidebar for chat list */}
        <div className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 flex flex-col h-64 md:h-auto">
          <button onClick={createChat} className="w-full bg-indigo-600 text-white rounded p-2 mb-4 hover:bg-indigo-700 transition flex-shrink-0">
            + New Chat
          </button>
          <div className="space-y-2 overflow-y-auto flex-1">
            {chats.length === 0 && (
               <div className="text-gray-500 text-sm text-center">No chats yet.</div>
            )}
            {chats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => fetchMessages(chat.id)}
                className={`p-3 rounded cursor-pointer transition ${activeChat === chat.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <div className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{chat.title}</div>
                <div className="text-xs text-gray-500">{new Date(chat.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 flex flex-col h-[500px] md:h-auto overflow-hidden">
          {activeChat ? (
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-10">Start a conversation!</div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[75%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none overflow-hidden'}`}>
                      {msg.role === 'user' ? (
                        msg.content
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              code({node, inline, className, children, ...props}: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    style={vscDarkPlus as any}
                                    language={match[1]}
                                    PreTag="div"
                                    className="rounded-md !my-2"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className={`${className} bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-sm`} {...props}>
                                    {children}
                                  </code>
                                )
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 text-gray-500 p-3 rounded-lg rounded-bl-none flex gap-1">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce delay-100">.</span>
                      <span className="animate-bounce delay-200">.</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t dark:border-gray-700 flex gap-2 shrink-0 bg-white dark:bg-gray-800">
                <input 
                  type="text" 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  disabled={isSending}
                  className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                  placeholder="Ask the AI advisor..."
                />
                <button type="submit" disabled={isSending || !input.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 p-6 text-center">
              Select a chat from the sidebar or start a new conversation.
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
