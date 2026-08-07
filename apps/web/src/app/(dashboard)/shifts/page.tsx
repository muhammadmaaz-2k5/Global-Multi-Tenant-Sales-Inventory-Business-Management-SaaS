'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/apiClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

interface Shift {
  id: string;
  clockIn: string;
  clockOut: string | null;
  user: {
    firstName: string;
    lastName: string;
  };
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);

  useEffect(() => {
    async function init() {
      try {
        const user = await fetchApi<{ memberships: { organizationId: string }[] }>('/users/me');
        const orgId = user.memberships[0]?.organizationId;
        if (orgId) {
          const data = await fetchApi<Shift[]>(`/organizations/${orgId}/shifts`);
          setShifts(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Employee Shifts</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-surface-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map(s => (
              <TableRow key={s.id}>
                <TableCell>{s.user.firstName} {s.user.lastName}</TableCell>
                <TableCell>{new Date(s.clockIn).toLocaleString()}</TableCell>
                <TableCell>{s.clockOut ? new Date(s.clockOut).toLocaleString() : '-'}</TableCell>
                <TableCell>
                  {s.clockOut ? (
                    <span className="text-surface-500 font-medium text-sm">Completed</span>
                  ) : (
                    <span className="text-green-600 font-medium text-sm">Active</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
