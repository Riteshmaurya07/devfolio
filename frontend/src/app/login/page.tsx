'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Code2, ArrowRight } from 'lucide-react';
import { Button, Input, Card, GithubIcon, GoogleIcon, ThemeToggle } from '@/components/ui';

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
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const userData = userResponse.data;
      login(userData, access_token);
      toast.success('Signed in successfully');

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
    <div className="min-h-screen flex flex-col justify-between bg-[var(--bg-canvas)] py-12 px-4 sm:px-6 lg:px-8 text-[var(--text-primary)] transition-colors duration-200">
      {/* Top Bar with Brand & Theme Toggle */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between mb-4">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#d9541e] text-white flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
            <Code2 size={18} />
          </div>
          <span className="font-bold text-base tracking-tight text-[var(--text-primary)]">
            Devfolio
          </span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto">
        <Card className="p-8 shadow-sm space-y-6">
          <div className="text-left space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Welcome back
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Sign in to manage your synchronized developer telemetry.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <Input
                label="Email Address"
                id="email-address"
                name="email"
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[var(--text-secondary)]">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[var(--border-subtle)] text-[#d9541e] focus:ring-[#d9541e]"
                />
                Remember me for 30 days
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
              rightIcon={!loading ? <ArrowRight size={14} /> : undefined}
            >
              Sign In
            </Button>
          </form>

          {/* Social Divider */}
          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-subtle)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[var(--surface)] text-[var(--text-muted)] font-mono">
                or continue with
              </span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={handleGithubLogin}
              disabled={loading}
              type="button"
              leftIcon={<GithubIcon size={16} />}
            >
              GitHub
            </Button>
            <Button
              variant="secondary"
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
              leftIcon={<GoogleIcon size={16} />}
            >
              Google
            </Button>
          </div>

          {/* Registration link */}
          <p className="text-center text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border-subtle)]">
            Don&apos;t have an account yet?{' '}
            <Link
              href="/register"
              className="text-[#d9541e] hover:underline font-semibold"
            >
              Create account
            </Link>
          </p>
        </Card>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-[var(--text-muted)] mt-6">
        Protected by Devfolio authentication tokens.
      </div>
    </div>
  );
}
