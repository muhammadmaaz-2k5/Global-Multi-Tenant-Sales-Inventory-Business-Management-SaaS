'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/apiClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

interface StaffMember {
  id: string;
  role: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);

  useEffect(() => {
    async function init() {
      try {
        const user = await fetchApi<{ memberships: { organizationId: string }[] }>('/users/me');
        const orgId = user.memberships[0]?.organizationId;
        if (orgId) {
          const data = await fetchApi<StaffMember[]>(`/organizations/${orgId}/staff`);
          setStaff(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, []);

  const updateRole = async (memberId: string, newRole: string) => {
    try {
      const user = await fetchApi<{ memberships: { organizationId: string }[] }>('/users/me');
      const orgId = user.memberships[0]?.organizationId;
      if (orgId) {
        await fetchApi(`/organizations/${orgId}/staff/${memberId}/role`, {
          method: 'PATCH',
          body: JSON.stringify({ role: newRole }),
        });
        setStaff(staff.map(s => (s.id === memberId ? { ...s, role: newRole } : s)));
      }
    } catch (err) {
      alert('Failed to update role. You might not have permission.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Staff Management</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-surface-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map(s => (
              <TableRow key={s.id}>
                <TableCell>{s.user.firstName} {s.user.lastName}</TableCell>
                <TableCell>{s.user.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    s.role === 'OWNER' ? 'bg-primary-100 text-primary-800' :
                    s.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                    'bg-surface-100 text-surface-800'
                  }`}>
                    {s.role}
                  </span>
                </TableCell>
                <TableCell>
                  <select 
                    value={s.role} 
                    onChange={(e) => updateRole(s.id, e.target.value)}
                    className="border border-surface-200 rounded p-1 text-sm bg-white"
                  >
                    <option value="CASHIER">Cashier</option>
                    <option value="MANAGER">Manager</option>
                    <option value="OWNER">Owner</option>
                  </select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
