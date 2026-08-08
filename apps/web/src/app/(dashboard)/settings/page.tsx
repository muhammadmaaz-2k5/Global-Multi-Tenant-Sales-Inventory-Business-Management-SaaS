'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, Calculator, Users, Save, CheckCircle2, Globe } from 'lucide-react';
import clsx from 'clsx';

interface Organization {
  id: string;
  name: string;
  defaultTaxRate: number;
  currency: string;
  timezone: string;
}

export default function SettingsPage() {
  const { orgId } = useAuthStore();
  const [org, setOrg] = useState<Organization | null>(null);
  
  // Form State
  const [orgName, setOrgName] = useState<string>('');
  const [taxRate, setTaxRate] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [timezone, setTimezone] = useState<string>('UTC');
  
  // UI State
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'GLOBALIZATION' | 'TAXES' | 'TEAM'>('GENERAL');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadOrg() {
      if (!orgId) return;
      try {
        const data = await fetchApi<Organization>(`/organizations/${orgId}`);
        setOrg(data);
        setOrgName(data.name || '');
        setTaxRate(data.defaultTaxRate?.toString() || '0');
        setCurrency(data.currency || 'USD');
        setTimezone(data.timezone || 'UTC');
      } catch (err) {
        console.error('Failed to load org settings:', err);
      }
    }
    loadOrg();
  }, [orgId]);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    
    try {
      await fetchApi(`/organizations/${org.id}/settings`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          name: orgName,
          defaultTaxRate: parseFloat(taxRate) || 0,
          currency,
          timezone
        })
      });
      setSuccessMsg('Settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  if (!orgId) {
    return <div className="p-12 text-center text-neutral-500 font-bold">No organization assigned to this account.</div>;
  }

  if (!org) {
    return (
      <div className="flex h-full items-center justify-center p-12 text-neutral-500 gap-2">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        Loading configuration...
      </div>
    );
  }

  const tabs = [
    { id: 'GENERAL', label: 'General', icon: Building2 },
    { id: 'GLOBALIZATION', label: 'Globalization', icon: Globe },
    { id: 'TAXES', label: 'Tax & Compliance', icon: Calculator },
    { id: 'TEAM', label: 'Team', icon: Users },
  ] as const;

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Organization Settings</h1>
        <p className="text-neutral-500 mt-1 font-medium">Manage your retail operations, compliance, and team preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                    : "text-neutral-400 hover:bg-white/[0.02]/[0.01] hover:text-white"
                )}
              >
                <Icon size={18} className={isActive ? "text-indigo-600" : "text-neutral-600"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <form onSubmit={saveSettings} className="bg-white/[0.02]/[0.02] rounded-2xl shadow-sm border border-white/10 overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-white/[0.05] bg-white/[0.02]/[0.01]">
              <h2 className="text-xl font-bold text-white">
                {tabs.find(t => t.id === activeTab)?.label} Settings
              </h2>
            </div>
            
            <div className="p-8 min-h-[300px]">
              
              {activeTab === 'GENERAL' && (
                <div className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Organization Name</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={e => setOrgName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/[0.02]/[0.02] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div className="p-4 bg-white/[0.02]/[0.01] border border-white/10 rounded-xl">
                    <p className="text-sm font-medium text-neutral-400 mb-1">Organization ID</p>
                    <code className="text-xs text-neutral-500 break-all">{org.id}</code>
                  </div>
                </div>
              )}

              {activeTab === 'TAXES' && (
                <div className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Global Tax Rate (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={taxRate}
                        onChange={e => setTaxRate(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-white/[0.02]/[0.02] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="e.g., 8.875"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 font-medium">%</span>
                    </div>
                    <p className="text-sm text-neutral-500 mt-2">
                      This tax rate will be automatically applied and calculated at checkout across all connected POS terminals.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'TEAM' && (
                <div className="flex flex-col items-center justify-center text-center h-full py-12 text-neutral-500 space-y-4">
                  <div className="w-16 h-16 bg-white/[0.02]/[0.01] border border-white/10 rounded-full flex items-center justify-center">
                    <Users size={24} className="text-neutral-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-300">Team Management</h3>
                    <p className="text-sm mt-1 max-w-sm">Manage staff roles, invites, and permissions in the dedicated Staff directory.</p>
                  </div>
                </div>
              )}

            </div>

            {/* Footer / Actions */}
            {(activeTab === 'GENERAL' || activeTab === 'TAXES' || activeTab === 'GLOBALIZATION') && (
              <div className="p-6 bg-white/[0.02]/[0.01] border-t border-white/[0.05] flex items-center justify-between">
                
                <div className="flex-1">
                  {successMsg && (
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium animate-in slide-in-from-left-2">
                      <CheckCircle2 size={16} />
                      {successMsg}
                    </div>
                  )}
                  {errorMsg && (
                    <div className="text-red-600 text-sm font-medium animate-in slide-in-from-left-2">
                      {errorMsg}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-sm transition-colors"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save Changes
                </button>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}
