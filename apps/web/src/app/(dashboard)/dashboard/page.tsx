'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { fetchApi } from '@/lib/apiClient';
import { TrendingUp, DollarSign, PackageMinus, Activity, AlertTriangle, ArrowRight, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface AnalyticsSummary {
  grossSales: number;
  cogs: number;
  totalExpenses: number;
  netProfit: number;
  topProducts: {
    id: string;
    name: string;
    quantitySold: number;
  }[];
  lowStockAlerts: {
    variantName: string;
    locationName: string;
    quantity: number;
  }[];
}

export default function AnalyticsDashboardPage() {
  const { orgId } = useAuthStore();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!orgId) return;
      try {
        const summary = await fetchApi<AnalyticsSummary>(`/organizations/${orgId}/analytics/summary`);
        setData(summary);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [orgId]);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center p-12 text-neutral-500 gap-3">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="font-medium">Aggregating analytics...</span>
      </div>
    );
  }

  if (!data) {
    return <div className="p-12 text-center text-red-500 font-bold">Failed to load analytics summary.</div>;
  }

  const profitMargin = data.grossSales > 0 ? ((data.netProfit / data.grossSales) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-neutral-500 mt-1 font-medium">Real-time overview of your business performance.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/[0.02]/[0.02] rounded-2xl p-6 border border-white/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={64} className="text-emerald-500" />
          </div>
          <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Gross Sales</p>
          <p className="text-3xl font-black text-white mt-2">${data.grossSales.toFixed(2)}</p>
        </div>

        <div className="bg-white/[0.02]/[0.02] rounded-2xl p-6 border border-white/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PackageMinus size={64} className="text-amber-500" />
          </div>
          <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Cost of Goods (COGS)</p>
          <p className="text-3xl font-black text-white mt-2">${data.cogs.toFixed(2)}</p>
        </div>

        <div className="bg-white/[0.02]/[0.02] rounded-2xl p-6 border border-white/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={64} className="text-red-500" />
          </div>
          <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">OpEx (Expenses)</p>
          <p className="text-3xl font-black text-white mt-2">${data.totalExpenses.toFixed(2)}</p>
        </div>

        <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/20 shadow-sm relative overflow-hidden group text-white">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
            <TrendingUp size={64} className="text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-neutral-600 uppercase tracking-wider">Net Profit</p>
          <p className="text-3xl font-black mt-2 text-white flex items-baseline gap-2">
            ${data.netProfit.toFixed(2)}
            <span className="text-sm font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
              {profitMargin}% margin
            </span>
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Products */}
        <div className="bg-white/[0.02]/[0.02] border border-white/10 rounded-2xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-white/[0.05] flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Top Selling Products</h2>
          </div>
          <div className="p-6 flex-1">
            {data.topProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-neutral-600 font-medium">
                No sales data available yet.
              </div>
            ) : (
              <div className="space-y-5">
                {data.topProducts.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/[0.02]/[0.04] text-neutral-500 font-black text-sm flex items-center justify-center shrink-0">
                      #{i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1">
                        <span className="font-bold text-white">{p.name}</span>
                        <span className="text-sm font-bold text-indigo-600">{p.quantitySold} units</span>
                      </div>
                      <div className="w-full bg-white/[0.02]/[0.04] rounded-full h-2">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full" 
                          style={{ width: `${(p.quantitySold / data.topProducts[0].quantitySold) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white/[0.02]/[0.02] border border-white/10 rounded-2xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-lg font-bold text-white">Low Stock Alerts</h2>
            </div>
            <span className="bg-red-100 text-red-700 text-xs font-black px-2.5 py-1 rounded-full">
              {data.lowStockAlerts.length} Action Needed
            </span>
          </div>
          <div className="p-0 flex-1 overflow-hidden">
            {data.lowStockAlerts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-neutral-600 font-medium p-6">
                All inventory levels are healthy!
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05] max-h-[300px] overflow-y-auto">
                {data.lowStockAlerts.map((alert, i) => (
                  <div key={i} className="p-4 hover:bg-white/[0.02]/[0.01] transition-colors flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{alert.variantName}</p>
                      <p className="text-xs font-medium text-neutral-500 mt-0.5">{alert.locationName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-red-600">{alert.quantity}</p>
                      <p className="text-[10px] font-bold text-neutral-600 uppercase">In Stock</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-white/[0.05] bg-white/[0.02]/[0.01] text-center">
            <Link href="/purchase-orders" className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              Create Purchase Order <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
