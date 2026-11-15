'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Code2, ArrowRight } from 'lucide-react';
import { Button, Input, Card, GithubIcon, GoogleIcon, ThemeToggle } from '@/components/ui';

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
      const usernameCandidate = name.trim().replace(/\s+/g, '_').toLowerCase();

      await api.post('/users/register', {
        username: usernameCandidate || name.trim(),
        email: email.trim(),
        password: password,
      });

      const response = await api.post('/users/login', {
        email: email.trim(),
        password: password,
      });
      const { access_token } = response.data;

      document.cookie = `token=${access_token}; path=/; max-age=86400`;

      const userResponse = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const userData = userResponse.data;
      login(userData, access_token);
      toast.success('Account created successfully');

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
              Create an account
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Join Devfolio to synchronize your engineering trajectory.
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs rounded-md bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <Input
                label="Full Name or Username"
                id="name"
                name="name"
                type="text"
                required
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Input
                label="Email Address"
                id="email-address"
                name="email"
                type="email"
                required
                placeholder="ada@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Input
                label="Password (min 8 characters)"
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

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
              rightIcon={!loading ? <ArrowRight size={14} /> : undefined}
            >
              Create Account
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

          {/* Sign in link */}
          <p className="text-center text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border-subtle)]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[#d9541e] hover:underline font-semibold"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-[var(--text-muted)] mt-6">
        By registering, you agree to technical terms and privacy policies.
      </div>
    </div>
  );
}
