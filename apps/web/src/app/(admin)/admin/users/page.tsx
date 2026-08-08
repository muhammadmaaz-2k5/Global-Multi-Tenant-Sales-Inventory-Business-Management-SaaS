'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/apiClient';
import { Users, Shield, Building2 } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isSuperAdmin: boolean;
  createdAt: string;
  memberships: {
    role: string;
    organization: {
      name: string;
    };
  }[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      try {
        const data = await fetchApi<User[]>('/admin/users');
        setUsers(data);
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in p-8">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">Global Users Directory</h2>
        <p className="text-neutral-400 mt-2">Manage all platform users across every tenant.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Users size={18} /></div>
          <h3 className="text-lg font-bold text-white">Platform Users ({users.length})</h3>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12 text-neutral-500 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            Loading global directory...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center">
            <Users size={32} className="opacity-20 mb-3" />
            No users found
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-neutral-400 text-sm border-b border-white/10">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Platform Role</th>
                  <th className="p-4 font-semibold">Tenants</th>
                  <th className="p-4 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-transparent text-white">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition">
                    <td className="p-4 font-bold">{user.firstName} {user.lastName}</td>
                    <td className="p-4 text-neutral-400">{user.email}</td>
                    <td className="p-4">
                      {user.isSuperAdmin ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded-lg border border-purple-500/20">
                          <Shield size={12} /> Super Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-500/20 text-neutral-400 text-xs font-bold rounded-lg border border-white/5">
                          Standard User
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {user.memberships.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {user.memberships.map((m, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-indigo-300">
                              <Building2 size={12} /> {m.organization.name} <span className="opacity-50">({m.role})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-neutral-600 text-xs italic">No tenants</span>
                      )}
                    </td>
                    <td className="p-4 text-neutral-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
