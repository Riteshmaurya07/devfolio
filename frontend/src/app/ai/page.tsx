'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';

export default function AIChatPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [input, setInput] = useState('');

  const fetchChats = async () => {
    const res = await api.get('/ai/chats');
    setChats(res.data);
  };

  const fetchMessages = async (chatId: string) => {
    const res = await api.get(`/ai/chats/${chatId}`);
    setMessages(res.data.messages);
    setActiveChat(chatId);
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const createChat = async () => {
    const res = await api.post('/ai/chats', { title: 'New Conversation', topic: 'general' });
    fetchChats();
    fetchMessages(res.data.id);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;

    // Optimistic UI
    const tempMsg = { id: Date.now(), role: 'user', content: input };
    setMessages([...messages, tempMsg]);
    const currentInput = input;
    setInput('');

    const res = await api.post(`/ai/chats/${activeChat}/messages`, { content: currentInput });
    // Refetch messages to get proper DB state
    fetchMessages(activeChat);
  };

  return (
    <DashboardShell>
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        {/* Sidebar for chat list */}
        <div className="w-64 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <button onClick={createChat} className="w-full bg-indigo-600 text-white rounded p-2 mb-4 hover:bg-indigo-700">
            + New Chat
          </button>
          <div className="space-y-2">
            {chats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => fetchMessages(chat.id)}
                className={`p-3 rounded cursor-pointer ${activeChat === chat.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <div className="text-sm font-medium dark:text-gray-200">{chat.title}</div>
                <div className="text-xs text-gray-500">{new Date(chat.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 flex flex-col">
          {activeChat ? (
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 dark:text-white rounded-bl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t dark:border-gray-700 flex gap-2">
                <input 
                  type="text" 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ask the AI advisor..."
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a chat or start a new conversation.
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
