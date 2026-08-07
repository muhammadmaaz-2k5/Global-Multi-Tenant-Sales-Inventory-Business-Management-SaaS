'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/apiClient';

interface AnalyticsSummary {
  grossSales: number;
  cogs: number;
  totalExpenses: number;
  netProfit: number;
  topProducts: { id: string; name: string; quantitySold: number }[];
  lowStockAlerts: { variantName: string; locationName: string; quantity: number }[];
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200 flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="text-surface-500 font-medium mb-2">Gross Sales</div>
          <div className="text-3xl font-black text-surface-900">
            ${summary ? summary.grossSales.toFixed(2) : '0.00'}
          </div>
          <div className="text-sm text-green-600 mt-2 font-medium">Revenue generated</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200 flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="text-surface-500 font-medium mb-2">COGS</div>
          <div className="text-3xl font-black text-surface-900">
            ${summary ? summary.cogs.toFixed(2) : '0.00'}
          </div>
          <div className="text-sm text-red-600 mt-2 font-medium">Inventory cost</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200 flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="text-surface-500 font-medium mb-2">Expenses</div>
          <div className="text-3xl font-black text-surface-900">
            ${summary ? summary.totalExpenses.toFixed(2) : '0.00'}
          </div>
          <div className="text-sm text-red-600 mt-2 font-medium">Rent, Payroll, etc.</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200 flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="text-surface-500 font-medium mb-2">Profit Margin</div>
          <div className="text-3xl font-black text-surface-900">
            {summary && summary.grossSales > 0 ? ((summary.netProfit / summary.grossSales) * 100).toFixed(1) : '0.0'}%
          </div>
          <div className="text-sm text-surface-500 mt-2 font-medium">Net Profit / Gross Sales</div>
        </div>

        <div className="bg-primary-900 p-6 rounded-2xl shadow-sm border border-primary-800 flex flex-col justify-between group hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary-800 rounded-full opacity-50"></div>
          <div className="text-primary-200 font-medium mb-2 relative z-10">Net Profit</div>
          <div className="text-4xl font-black text-white relative z-10">
            ${summary ? summary.netProfit.toFixed(2) : '0.00'}
          </div>
          <div className="text-sm text-primary-300 mt-2 font-medium relative z-10">Bottom Line</div>
        </div>

      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6">
          <h2 className="text-xl font-bold text-surface-900 mb-4">Top Selling Products</h2>
          {summary?.topProducts && summary.topProducts.length > 0 ? (
            <div className="space-y-4">
              {summary.topProducts.map((p, index) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-surface-100">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center">
                      #{index + 1}
                    </div>
                    <span className="font-semibold text-surface-900">{p.name}</span>
                  </div>
                  <span className="font-bold text-primary-600">{p.quantitySold} units</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-surface-500 italic">No sales data available.</div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6">
          <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
            ⚠️ Low Stock Alerts
          </h2>
          {summary?.lowStockAlerts && summary.lowStockAlerts.length > 0 ? (
            <div className="space-y-4">
              {summary.lowStockAlerts.map((l, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                  <div>
                    <div className="font-semibold text-red-900">{l.variantName}</div>
                    <div className="text-sm text-red-600">{l.locationName}</div>
                  </div>
                  <span className="font-black text-red-700 bg-red-200 px-3 py-1 rounded-full text-sm">
                    {l.quantity} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-surface-500 italic">Inventory levels look good.</div>
          )}
        </div>
      </div>
    </div>
  );
}
