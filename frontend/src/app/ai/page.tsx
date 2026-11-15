'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AIPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ai-advisor');
  }, [router]);

  return null;
}
