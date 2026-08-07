'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        // Register user first
        await api.post('/users/register', { username, email, password });
      }

      // Login user
      const response = await api.post('/users/login', { email, password });
      const { access_token } = response.data;
      
      const userResponse = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      login(userResponse.data, access_token);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || (isRegister ? 'Registration failed. User may already exist.' : 'Invalid email or password.');
      setError(msg);
    }
  };

  const handleGithubLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/users/github/login`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">
            {isRegister ? 'Create your Account' : 'Sign in to Devfolio OS'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
            >
              {isRegister ? 'Sign in' : 'Register now'}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-3 py-2 border border-slate-700 placeholder-slate-500 text-white rounded-lg bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                placeholder="developer_pro"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-slate-700 placeholder-slate-500 text-white rounded-lg bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-slate-700 placeholder-slate-500 text-white rounded-lg bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center bg-red-950/40 p-2.5 rounded-lg border border-red-800/50">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition shadow-lg shadow-indigo-600/30"
            >
              {isRegister ? 'Create Account' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-slate-900 text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGithubLogin}
              className="w-full flex justify-center py-2.5 px-4 border border-slate-700 rounded-lg shadow-sm bg-slate-800 text-sm font-medium text-slate-200 hover:bg-slate-700 transition"
            >
              GitHub OAuth
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
