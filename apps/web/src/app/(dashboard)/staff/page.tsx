'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useHRStore } from '@/store/hrStore';
import { Users, Shield, UserCog, Mail } from 'lucide-react';
import clsx from 'clsx';

export default function StaffPage() {
  const { orgId } = useAuthStore();
  const { staff, isLoading, fetchStaff, updateRole } = useHRStore();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (orgId) fetchStaff(orgId);
  }, [orgId, fetchStaff]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!orgId) return;
    setUpdatingId(userId);
    try {
      await updateRole(orgId, userId, newRole);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const roles = ['OWNER', 'MANAGER', 'CASHIER', 'INVENTORY_MANAGER'];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Staff Directory</h1>
          <p className="text-neutral-500 mt-1 font-medium">Manage employee roles, access levels, and team members.</p>
        </div>
      </div>

      <div className="bg-white/[0.02]/[0.02] border border-white/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="bg-white/[0.02]/[0.01] text-neutral-500 font-bold uppercase tracking-wider border-b border-white/10 text-xs">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Current Role</th>
                <th className="px-6 py-4 text-right">Update Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {isLoading && staff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-neutral-600">Loading staff members...</td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-neutral-600 font-medium">No staff found.</td>
                </tr>
              ) : (
                staff.map(member => (
                  <tr key={member.user.id} className="hover:bg-white/[0.02]/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                          {member.user.firstName.charAt(0)}{member.user.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{member.user.firstName} {member.user.lastName}</div>
                          <div className="text-xs text-neutral-500 font-mono mt-0.5">ID: {member.user.id.split('-')[0]}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-400 font-medium flex items-center gap-2 mt-2">
                      <Mail size={14} className="text-neutral-600" />
                      {member.user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1 w-max",
                        member.role === 'OWNER' ? "bg-purple-100 text-purple-700" :
                        member.role === 'MANAGER' ? "bg-blue-100 text-blue-700" :
                        "bg-white/[0.02]/[0.04] text-neutral-300"
                      )}>
                        {member.role === 'OWNER' ? <Shield size={12} /> : <UserCog size={12} />}
                        {member.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.user.id, e.target.value)}
                        disabled={updatingId === member.user.id}
                        className="px-3 py-1.5 bg-white/[0.02]/[0.02] border border-white/10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {roles.map(r => (
                          <option key={r} value={r}>{r.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
