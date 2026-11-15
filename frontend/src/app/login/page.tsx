'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Code2, ArrowRight } from 'lucide-react';
import { GithubIcon, GoogleIcon } from '@/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/users/login', { email, password });
      const { access_token } = response.data;
      
      const maxAge = rememberMe ? 2592000 : 86400;
      document.cookie = `token=${access_token}; path=/; max-age=${maxAge}`;
      
      const userResponse = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      const userData = userResponse.data;
      login(userData, access_token);
      toast.success('Signed in successfully');

      // Admin or User redirection
      if (userData.is_admin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/users/github/login`;
  };

  const handleGoogleLogin = () => {
    toast.info('Google OAuth integration is in preview mode.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-md w-full space-y-8 bg-slate-900/90 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              Devfolio OS
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold text-white">Sign in to your account</h2>
          <p className="mt-2 text-sm text-slate-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
              Create one now
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              required
              className="w-full px-3.5 py-2.5 border border-slate-700 placeholder-slate-500 text-white rounded-xl bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3.5 py-2.5 border border-slate-700 placeholder-slate-500 text-white rounded-xl bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer select-none text-slate-400 text-xs">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 mr-2"
              />
              Remember me
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition shadow-lg shadow-indigo-600/30 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-slate-900 text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={handleGithubLogin}
              disabled={loading}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-[var(--border-subtle)] rounded-lg shadow-sm bg-[var(--surface)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)] transition"
            >
              <GithubIcon size={18} />
              GitHub
            </button>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-[var(--border-subtle)] rounded-lg shadow-sm bg-[var(--surface)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)] transition"
            >
              <GoogleIcon size={18} />
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
