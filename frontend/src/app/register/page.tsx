'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Code2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create User (backend user_in has username, email, password)
      // We pass the user's name as username (sanitized for slug compatibility if needed)
      const usernameCandidate = name.trim().replace(/\s+/g, '_').toLowerCase();
      
      await api.post('/users/register', {
        username: usernameCandidate || name.trim(),
        email: email.trim(),
        password: password
      });

      // 2. Auto-login User
      const response = await api.post('/users/login', {
        email: email.trim(),
        password: password
      });
      const { access_token } = response.data;

      // 3. Set session cookie for proxy middleware
      document.cookie = `token=${access_token}; path=/; max-age=86400`;

      // 4. Get User details & set state
      const userResponse = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const userData = userResponse.data;
      login(userData, access_token);
      toast.success('Account created successfully');

      // Admin or User redirection
      if (userData.is_admin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Please check your inputs.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      toast.error('Registration failed');
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
          <h2 className="text-3xl font-extrabold text-white">Create an Account</h2>
          <p className="mt-2 text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Full Name / Username</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-3.5 py-2.5 border border-slate-700 placeholder-slate-500 text-white rounded-xl bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
              placeholder="Aditya Raj"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

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

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-950/40 p-2.5 rounded-lg border border-red-800/50">
              {error}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Register Account'}
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
              <span className="px-3 bg-slate-900 text-slate-400">Or sign up with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={handleGithubLogin}
              disabled={loading}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-700 rounded-xl shadow-sm bg-slate-800 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </button>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-700 rounded-xl shadow-sm bg-slate-800 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
