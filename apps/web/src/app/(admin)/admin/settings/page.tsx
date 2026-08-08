'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/apiClient';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

interface GlobalSettings {
  maintenanceMode: boolean;
  stripePublicKey: string;
  supportEmail: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form states
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [stripePublicKey, setStripePublicKey] = useState('');
  const [supportEmail, setSupportEmail] = useState('');

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const data = await fetchApi<GlobalSettings>('/admin/settings');
        setSettings(data);
        setMaintenanceMode(data.maintenanceMode);
        setStripePublicKey(data.stripePublicKey);
        setSupportEmail(data.supportEmail);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      await fetchApi('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          maintenanceMode,
          stripePublicKey,
          supportEmail
        })
      });
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: unknown) {
      setMessage((err as Error).message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-neutral-500 gap-3">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        Loading global settings...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-8">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">Platform Settings</h2>
        <p className="text-neutral-400 mt-2">Configure global SaaS variables, payment gateways, and maintenance controls.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        
        <div className="p-8 space-y-8">
          
          {/* General Section */}
          <section>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Settings size={18} className="text-indigo-400" /> General Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-2">Support Email Address</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={e => setSupportEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                />
                <p className="text-xs text-neutral-500 mt-2">This email is displayed globally across all tenant portals for platform support.</p>
              </div>
            </div>
          </section>

          <div className="w-full h-px bg-white/10" />

          {/* Billing Section */}
          <section>
            <h3 className="text-lg font-bold text-white mb-4">Billing & Payments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-2">Stripe Public Key</label>
                <input
                  type="text"
                  value={stripePublicKey}
                  onChange={e => setStripePublicKey(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-mono"
                />
              </div>
            </div>
          </section>

          <div className="w-full h-px bg-white/10" />

          {/* Maintenance Section */}
          <section>
            <h3 className="text-lg font-bold text-red-400 mb-4">Danger Zone</h3>
            
            <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div>
                <h4 className="text-white font-bold text-sm">Platform Maintenance Mode</h4>
                <p className="text-neutral-400 text-xs mt-1">When active, all tenants will be locked out and see a maintenance screen.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={maintenanceMode}
                  onChange={e => setMaintenanceMode(e.target.checked)}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
          </section>

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white/[0.02] border-t border-white/10 flex items-center justify-between">
          <div className="flex-1">
            {message && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold animate-fade-in">
                <CheckCircle2 size={16} />
                {message}
              </div>
            )}
          </div>
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-sm transition-colors text-sm"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save Configuration
          </button>
        </div>

      </form>
    </div>
  );
}
