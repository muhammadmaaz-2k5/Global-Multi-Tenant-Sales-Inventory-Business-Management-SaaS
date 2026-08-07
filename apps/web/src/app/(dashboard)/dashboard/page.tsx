'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/apiClient';

interface AnalyticsSummary {
  grossSales: number;
  cogs: number;
  totalExpenses: number;
  netProfit: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const user = await fetchApi<{ memberships: { organizationId: string }[] }>('/users/me');
        const orgId = user.memberships[0]?.organizationId;
        if (orgId) {
          const data = await fetchApi<AnalyticsSummary>(`/organizations/${orgId}/analytics/summary`);
          setSummary(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Financial Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200 flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="text-surface-500 font-medium mb-2">Gross Sales</div>
          <div className="text-3xl font-black text-surface-900">
            ${summary ? summary.grossSales.toFixed(2) : '0.00'}
          </div>
          <div className="text-sm text-green-600 mt-2 font-medium">Revenue generated</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200 flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="text-surface-500 font-medium mb-2">Cost of Goods Sold (COGS)</div>
          <div className="text-3xl font-black text-surface-900">
            ${summary ? summary.cogs.toFixed(2) : '0.00'}
          </div>
          <div className="text-sm text-red-600 mt-2 font-medium">Inventory cost</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200 flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="text-surface-500 font-medium mb-2">Operating Expenses</div>
          <div className="text-3xl font-black text-surface-900">
            ${summary ? summary.totalExpenses.toFixed(2) : '0.00'}
          </div>
          <div className="text-sm text-red-600 mt-2 font-medium">Rent, Payroll, etc.</div>
        </div>

        <div className="bg-primary-900 p-6 rounded-2xl shadow-sm border border-primary-800 flex flex-col justify-between group hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary-800 rounded-full opacity-50"></div>
          <div className="text-primary-200 font-medium mb-2 relative z-10">Net Profit</div>
          <div className="text-4xl font-black text-white relative z-10">
            ${summary ? summary.netProfit.toFixed(2) : '0.00'}
          </div>
          <div className="text-sm text-primary-300 mt-2 font-medium relative z-10">Gross Sales - COGS - Expenses</div>
        </div>

      </div>
    </div>
  );
}
