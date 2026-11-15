'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { toast } from 'sonner';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        toast.error('Authentication failed: No token received');
        router.push('/login');
        return;
      }

      try {
        // Set cookie for middleware proxy
        document.cookie = `token=${token}; path=/; max-age=86400`;
        
        const userResponse = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userData = userResponse.data;
        login(userData, token);
        toast.success('Successfully logged in with GitHub');

        if (userData.is_admin) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } catch (err: any) {
        toast.error('Failed to fetch user profile');
        router.push('/login');
      }
    };

    handleCallback();
  }, [searchParams, router, login]);

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-slate-100 mb-4">Authenticating GitHub session...</h2>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
    </div>
  );
}

export default function GithubCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <Suspense fallback={
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-100 mb-4">Loading...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
        </div>
      }>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
