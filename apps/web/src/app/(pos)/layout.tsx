'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/apiClient';
import Link from 'next/link';

export default function PosLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetchApi('/users/me');
        setIsAuthenticated(true);
      } catch {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  if (!isAuthenticated) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading POS...</div>;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-surface-50 overflow-hidden">
      {/* POS Header */}
      <header className="h-16 bg-surface-900 text-white flex items-center justify-between px-6 shrink-0">
        <div className="font-bold text-xl tracking-tight">ShopFlow POS</div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-surface-300 hover:text-white text-sm font-medium">
            Exit to Dashboard
          </Link>
        </div>
      </header>
      
      {/* Main POS Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
