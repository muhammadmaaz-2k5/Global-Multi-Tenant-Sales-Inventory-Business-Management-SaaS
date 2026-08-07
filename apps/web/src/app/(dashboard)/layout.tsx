'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchApi } from '@/lib/apiClient';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  memberships: { organizationId: string; role: string; organization: { id: string; name: string } }[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await fetchApi<User>('/users/me');
        setUser(data);
      } catch {
        // If not authenticated, redirect to login
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-50">Loading...</div>;
  }

  if (!user) return null;

  const currentOrg = user.memberships[0]?.organization;
  const activeClass = "bg-primary-50 text-primary-700 font-medium";
  const inactiveClass = "text-surface-600 hover:bg-surface-50 hover:text-surface-900";

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'Brands', href: '/brands' },
    { name: 'Locations', href: '/locations' },
    { name: 'Inventory', href: '/inventory' },
    { name: 'Suppliers', href: '/suppliers' },
    { name: 'Customers', href: '/customers' },
    { name: 'Purchase Orders', href: '/purchase-orders' },
    { name: 'Expenses', href: '/expenses' },
    { name: 'Launch POS', href: '/pos' },
  ];

  return (
    <div className="min-h-screen flex bg-surface-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-surface-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-surface-200">
          <h1 className="text-xl font-bold text-primary-900">ShopFlow</h1>
        </div>
        
        <div className="p-4 border-b border-surface-200">
          <div className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Organization</div>
          <div className="font-medium text-surface-900 truncate">
            {currentOrg?.name || 'No Organization'}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive ? activeClass : inactiveClass
                }`}
              >
                {item.name}
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-surface-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-surface-900">{user.firstName} {user.lastName}</p>
              <button 
                onClick={() => {
                  document.cookie = 'shopflow_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
                  router.push('/login');
                }}
                className="text-xs text-red-600 hover:text-red-700 font-medium mt-0.5"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6 md:hidden">
          <h1 className="text-xl font-bold text-primary-900">ShopFlow</h1>
          {/* Mobile menu button would go here */}
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
