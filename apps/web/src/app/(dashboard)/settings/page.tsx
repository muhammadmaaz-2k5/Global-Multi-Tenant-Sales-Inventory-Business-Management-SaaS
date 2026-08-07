'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Organization {
  id: string;
  name: string;
  defaultTaxRate: number;
}

export default function SettingsPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [taxRate, setTaxRate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const user = await fetchApi<{ memberships: { organizationId: string }[] }>('/users/me');
        const orgId = user.memberships[0]?.organizationId;
        if (orgId) {
          const data = await fetchApi<Organization>(`/organizations/${orgId}`);
          setOrg(data);
          setTaxRate(data.defaultTaxRate?.toString() || '0');
        }
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, []);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    setLoading(true);
    setMessage('');
    try {
      await fetchApi(`/organizations/${org.id}/settings`, {
        method: 'PATCH',
        body: JSON.stringify({ defaultTaxRate: parseFloat(taxRate) || 0 })
      });
      setMessage('Settings saved successfully!');
    } catch (err: unknown) {
      setMessage((err as Error).message || 'Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  if (!org) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Organization Settings</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
        <form onSubmit={saveSettings} className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-surface-900 mb-4">Tax & Compliance</h2>
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Default Tax Rate (%)"
                type="number"
                step="0.01"
                min="0"
                value={taxRate}
                onChange={e => setTaxRate(e.target.value)}
                placeholder="e.g., 5.0"
              />
            </div>
            <p className="text-sm text-surface-500 mt-2">
              This tax rate will be automatically applied to all point-of-sale transactions.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
            {message && (
              <span className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
