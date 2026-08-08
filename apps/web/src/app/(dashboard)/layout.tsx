'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  Store,
  Wallet,
  Clock,
  PieChart,
  LogOut,
  Truck,
  Box
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/store/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'POS Terminal', href: '/pos', icon: Store },
    { name: 'Sales & Orders', href: '/sales', icon: ShoppingCart },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Purchase Orders', href: '/purchase-orders', icon: Truck },
    { name: 'Suppliers', href: '/suppliers', icon: Box },
    { name: 'Expenses', href: '/expenses', icon: Wallet },
    { name: 'Staff & Roles', href: '/staff', icon: Users },
    { name: 'Timeclock', href: '/shifts', icon: Clock },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Background Effects (Cursor style) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      {/* Sidebar */}
      <div className="relative z-10 w-64 border-r border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl flex flex-col supports-[backdrop-filter]:bg-[#0a0a0a]/60">
        
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-white leading-none">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">ShopFlow</span>
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
                <Icon size={18} className={isActive ? "text-indigo-400" : "text-neutral-500"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]/5 border border-white/10 mb-4">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
            </div>
          </div>
          
          <button 
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={16} /> Sign out
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
