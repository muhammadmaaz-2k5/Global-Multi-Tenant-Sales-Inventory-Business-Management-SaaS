'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { fetchApi } from '@/lib/apiClient';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  memberships: { organizationId: string; organization: { id: string; name: string } }[];
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchApi<User>('/users/me')
      .then(setUser)
      .catch(console.error);
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-surface-900">
          Welcome back, {user.firstName}!
        </h2>
        <p className="text-surface-500 mt-1">
          Here&apos;s an overview of {user.memberships[0]?.organization?.name || 'your business'} today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-surface-500">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-surface-900">$0.00</div>
            <p className="text-xs text-surface-500 mt-1">+0% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-surface-500">Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-surface-900">0</div>
            <p className="text-xs text-surface-500 mt-1">Manage in Catalog</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-surface-500">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-surface-900">0</div>
            <p className="text-xs text-surface-500 mt-1">Items needing restock</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
