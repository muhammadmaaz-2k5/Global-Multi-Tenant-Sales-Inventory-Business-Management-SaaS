'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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

  // Form states
  const [orgName, setOrgName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerFirstName, setOwnerFirstName] = useState('');
  const [ownerLastName, setOwnerLastName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setMessage('');

    try {
      await fetchApi('/admin/organizations', {
        method: 'POST',
        body: JSON.stringify({
          organizationName: orgName,
          ownerEmail,
          ownerPassword,
          ownerFirstName,
          ownerLastName
        })
      });
      setMessage('Organization provisioned successfully!');
      setOrgName('');
      setOwnerEmail('');
      setOwnerPassword('');
      setOwnerFirstName('');
      setOwnerLastName('');
      loadOrgs();
    } catch (err: unknown) {
      setMessage((err as Error).message || 'Failed to provision organization.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-black text-surface-900 tracking-tight">Super Admin Dashboard</h2>
        <p className="text-surface-500 mt-2">Provision and manage tenant accounts.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 glass rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Provision New Business</h3>
          
          {message && (
            <div className="mb-4 p-3 bg-surface-100 text-surface-700 text-sm rounded-lg border border-surface-200">
              {message}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Organization Name" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
            <div className="pt-4 border-t border-surface-100 mt-4">
              <h4 className="text-sm font-bold text-surface-600 mb-2">Owner Details</h4>
            </div>
            <Input label="First Name" value={ownerFirstName} onChange={(e) => setOwnerFirstName(e.target.value)} required />
            <Input label="Last Name" value={ownerLastName} onChange={(e) => setOwnerLastName(e.target.value)} required />
            <Input type="email" label="Email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} required />
            <Input type="password" label="Temporary Password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} required />
            
            <Button type="submit" className="w-full mt-6" isLoading={isCreating}>
              Provision Tenant
            </Button>
          </form>
        </div>

        <div className="md:col-span-2 glass rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Active Tenants ({organizations.length})</h3>
          
          {isLoading ? (
            <div className="text-center py-8">Loading tenants...</div>
          ) : organizations.length === 0 ? (
            <div className="text-center py-8 text-surface-500 bg-surface-50 rounded-xl">No tenants found</div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-surface-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-50 text-surface-600 text-sm">
                    <th className="p-4 font-semibold">Organization</th>
                    <th className="p-4 font-semibold">Slug</th>
                    <th className="p-4 font-semibold">Members</th>
                    <th className="p-4 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 bg-white/[0.02]/[0.02]">
                  {organizations.map(org => (
                    <tr key={org.id} className="hover:bg-surface-50 transition">
                      <td className="p-4 font-medium">{org.name}</td>
                      <td className="p-4 text-surface-500 font-mono text-sm">{org.slug}</td>
                      <td className="p-4 text-surface-500">{org._count?.members || 0}</td>
                      <td className="p-4 text-surface-500">{new Date(org.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
