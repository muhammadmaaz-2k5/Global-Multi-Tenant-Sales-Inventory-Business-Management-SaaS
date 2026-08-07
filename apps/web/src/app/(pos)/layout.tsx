'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* Background Effects (Subtle for POS to maintain focus) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="relative z-10 h-16 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 supports-[backdrop-filter]:bg-[#0a0a0a]/60">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-white leading-none text-sm">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">POS Terminal</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-neutral-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <Clock size={14} className="text-indigo-400" />
            <span className="text-sm font-medium font-mono">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-white">{user?.firstName} {user?.lastName}</div>
              <div className="text-xs text-neutral-500">Cashier</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
              {user?.firstName?.charAt(0) || 'C'}
            </div>
          </div>
        </div>
      </nav>

      {/* POS Content */}
      <main className="relative z-10 flex-1 flex overflow-hidden">
        {children}
      </main>

    </div>
  );
}
