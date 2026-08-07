'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  Users, 
  Activity, 
  Settings,
  Shield,
  LogOut
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/store/authStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  const navigation = [
    { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'System Logs', href: '/admin/logs', icon: Activity },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] bg-pink-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
      </div>

      {/* Sidebar */}
      <div className="relative z-10 w-64 border-r border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl flex flex-col supports-[backdrop-filter]:bg-[#0a0a0a]/60">
        
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Shield size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Super Admin</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-hide">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium",
                  isActive 
                    ? "bg-white/[0.02]/10 text-white shadow-sm" 
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.02]/5"
                )}
              >
                <Icon size={18} className={isActive ? "text-purple-400" : "text-neutral-500"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={16} /> Exit Admin
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="min-h-full">
          {children}
        </div>
      </main>

    </div>
  );
}
