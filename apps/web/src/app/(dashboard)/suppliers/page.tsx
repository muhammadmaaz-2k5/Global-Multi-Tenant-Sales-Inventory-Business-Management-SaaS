'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/apiClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    async function init() {
      try {
        const user = await fetchApi<{ memberships: { organizationId: string }[] }>('/users/me');
        const orgId = user.memberships[0]?.organizationId;
        if (orgId) {
          const data = await fetchApi<Supplier[]>(`/organizations/${orgId}/suppliers`);
          setSuppliers(data);
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
        <h1 className="text-2xl font-bold text-surface-900">Suppliers</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-surface-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map(sup => (
              <TableRow key={sup.id}>
                <TableCell>{sup.name}</TableCell>
                <TableCell>{sup.email || '-'}</TableCell>
                <TableCell>{sup.phone || '-'}</TableCell>
                <TableCell>{new Date(sup.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
