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
        // Set cookie for middleware
        document.cookie = `token=${token}; path=/; max-age=86400`;
        
        const userResponse = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        login(userResponse.data, token);
        toast.success('Successfully logged in with GitHub');
        router.push('/dashboard');
      } catch (err: any) {
        toast.error('Failed to fetch user profile');
        router.push('/login');
      }
    };

    handleCallback();
  }, [searchParams, router, login]);

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Authenticating...</h2>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
    </div>
  );
}

export default function GithubCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Loading...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      }>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
