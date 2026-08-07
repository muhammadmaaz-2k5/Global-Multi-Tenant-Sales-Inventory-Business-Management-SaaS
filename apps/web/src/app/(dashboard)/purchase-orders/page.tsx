'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/apiClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

interface PurchaseOrder {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  supplier: { name: string };
  location: { name: string };
}

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    async function init() {
      try {
        const user = await fetchApi<{ memberships: { organizationId: string }[] }>('/users/me');
        const orgId = user.memberships[0]?.organizationId;
        if (orgId) {
          const data = await fetchApi<PurchaseOrder[]>(`/organizations/${orgId}/purchase-orders`);
          setPos(data);
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
        <h1 className="text-2xl font-bold text-surface-900">Purchase Orders</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-surface-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pos.map(po => (
              <TableRow key={po.id}>
                <TableCell>{po.id.slice(0, 8) + '...'}</TableCell>
                <TableCell>{po.supplier.name}</TableCell>
                <TableCell>{po.location.name}</TableCell>
                <TableCell>${po.totalAmount.toFixed(2)}</TableCell>
                <TableCell>{po.status}</TableCell>
                <TableCell>{new Date(po.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
