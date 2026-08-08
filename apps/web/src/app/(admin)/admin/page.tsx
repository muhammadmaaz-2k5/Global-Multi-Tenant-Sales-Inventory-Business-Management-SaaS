'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Activity, DollarSign, Users, Building2 } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count?: { members: number };
}

export default function SuperAdminPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states removed from dashboard (moved to organizations page)

  const loadOrgs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchApi<Organization[]>('/admin/organizations');
      setOrganizations(data);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    loadOrgs();
  }, []);

  // handleCreate removed from dashboard

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">Super Admin Dashboard</h2>
        <p className="text-neutral-400 mt-2">Provision and manage tenant accounts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-neutral-400 text-sm font-medium">Total MRR</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg"><DollarSign size={18} /></div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">${organizations.length * 49}</div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">+12% from last month</div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-neutral-400 text-sm font-medium">Active Tenants</span>
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><Building2 size={18} /></div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{organizations.length}</div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">+2 this week</div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-neutral-400 text-sm font-medium">Platform Users</span>
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Users size={18} /></div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{organizations.reduce((acc, org) => acc + (org._count?.members || 0), 0)}</div>
            <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1">Across all tenants</div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-neutral-400 text-sm font-medium">System Health</span>
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><Activity size={18} /></div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">99.9%</div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">All systems operational</div>
          </div>
        </div>
      </div>
    </div>
  );
}
