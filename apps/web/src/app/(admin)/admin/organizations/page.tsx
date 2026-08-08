'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, Plus } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count?: { members: number };
}

export default function AdminOrganizationsPage() {
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
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in p-8">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">Organizations Directory</h2>
        <p className="text-neutral-400 mt-2">Manage your SaaS tenants and provision new accounts.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><Plus size={18} /></div>
            <h3 className="text-lg font-bold text-white">Provision New Business</h3>
          </div>
          
          {message && (
            <div className="mb-4 p-3 bg-white/5 text-white text-sm rounded-lg border border-white/10">
              {message}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Organization Name" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
            <div className="pt-4 border-t border-white/10 mt-4">
              <h4 className="text-sm font-bold text-neutral-400 mb-2">Owner Details</h4>
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

        <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><Building2 size={18} /></div>
            <h3 className="text-lg font-bold text-white">Active Tenants ({organizations.length})</h3>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8 text-neutral-500 flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              Loading tenants...
            </div>
          ) : organizations.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center">
              <Building2 size={32} className="opacity-20 mb-3" />
              No tenants found
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] text-neutral-400 text-sm border-b border-white/10">
                    <th className="p-4 font-semibold">Organization</th>
                    <th className="p-4 font-semibold">Slug</th>
                    <th className="p-4 font-semibold text-center">Members</th>
                    <th className="p-4 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-transparent text-white">
                  {organizations.map(org => (
                    <tr key={org.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-4 font-bold">{org.name}</td>
                      <td className="p-4 text-neutral-500 font-mono text-sm">{org.slug}</td>
                      <td className="p-4 text-neutral-400 text-center">
                        <span className="inline-block px-2 py-1 bg-white/5 rounded-md text-xs">{org._count?.members || 0}</span>
                      </td>
                      <td className="p-4 text-neutral-500 text-sm">{new Date(org.createdAt).toLocaleDateString()}</td>
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
