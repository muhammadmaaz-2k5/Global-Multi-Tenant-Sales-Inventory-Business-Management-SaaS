'use client';

import React, { useEffect, useMemo } from 'react';
import { useSalesStore } from '@/store/salesStore';
import { useAuthStore } from '@/store/authStore';
import { Search, TrendingUp, RefreshCcw, DollarSign, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import Link from 'next/link';

export default function SalesDashboardPage() {
  const { orgId } = useAuthStore();
  const { orders, isLoading, fetchOrders, filters, setFilters } = useSalesStore();
  const router = useRouter();

  useEffect(() => {
    if (orgId) {
      fetchOrders(orgId);
    }
  }, [orgId, fetchOrders]);

  // Derived metrics
  const today = new Date().setHours(0, 0, 0, 0);
  const todaysOrders = orders.filter(o => new Date(o.createdAt).setHours(0,0,0,0) === today);
  const todaysSales = todaysOrders.filter(o => o.status === 'COMPLETED').reduce((acc, o) => acc + o.total, 0);
  const refundRate = orders.length ? ((orders.filter(o => o.status === 'REFUNDED').length / orders.length) * 100).toFixed(1) : '0.0';

  // Apply Filters
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (filters.status !== 'ALL' && o.status !== filters.status) return false;
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesId = o.id.toLowerCase().includes(query);
        const matchesCustomer = o.customer && `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(query);
        const matchesCashier = `${o.user.firstName} ${o.user.lastName}`.toLowerCase().includes(query);
        if (!matchesId && !matchesCustomer && !matchesCashier) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, filters]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Sales Management</h1>
          <p className="text-neutral-500 mt-1 font-medium">Monitor transactions, process refunds, and track store performance.</p>
        </div>
        <button 
          onClick={() => orgId && fetchOrders(orgId)}
          className="flex items-center gap-2 px-4 py-2 bg-white/[0.02]/[0.02] border border-white/10 text-neutral-300 rounded-xl font-medium shadow-sm hover:bg-white/[0.02]/[0.01] transition-colors"
        >
          <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/[0.02]/[0.02] rounded-2xl p-6 border border-white/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={64} className="text-emerald-500" />
          </div>
          <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Today's Sales</p>
          <p className="text-4xl font-black text-white mt-2">${todaysSales.toFixed(2)}</p>
          <p className="text-sm font-medium text-emerald-600 mt-2 flex items-center gap-1">
            <TrendingUp size={14} /> +12% from yesterday
          </p>
        </div>
        
        <div className="bg-white/[0.02]/[0.02] rounded-2xl p-6 border border-white/10 shadow-sm">
          <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Today's Transactions</p>
          <p className="text-4xl font-black text-white mt-2">{todaysOrders.length}</p>
        </div>
        
        <div className="bg-white/[0.02]/[0.02] rounded-2xl p-6 border border-white/10 shadow-sm">
          <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Refund Rate (All-Time)</p>
          <p className="text-4xl font-black text-white mt-2">{refundRate}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/[0.02]/[0.02] p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID, customer, or cashier..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.02]/[0.01] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-white/[0.02]/[0.01] p-1 rounded-xl border border-white/10">
          {['ALL', 'COMPLETED', 'REFUNDED'].map(status => (
            <button
              key={status}
              onClick={() => setFilters({ status })}
              className={clsx(
                "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                filters.status === status 
                  ? "bg-white/[0.02]/[0.02] text-indigo-600 shadow-sm border border-white/10" 
                  : "text-neutral-500 hover:text-white"
              )}
            >
              {status === 'ALL' ? 'All Orders' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/[0.02]/[0.02] border border-white/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="bg-white/[0.02]/[0.01] text-neutral-500 font-bold uppercase tracking-wider border-b border-white/10 text-xs">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {isLoading && orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-600">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-600 font-medium">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-white/[0.02]/[0.01] transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-neutral-500 whitespace-nowrap">
                      {order.id.split('-')[0]}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-neutral-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      {order.location.name}
                    </td>
                    <td className="px-6 py-4">
                      {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : <span className="text-neutral-600 italic">Walk-in</span>}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-bold tracking-wide",
                        order.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700" :
                        order.status === 'REFUNDED' ? "bg-red-100 text-red-700" :
                        "bg-white/[0.02]/[0.04] text-neutral-300"
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/sales/${order.id}`}
                        className="inline-flex items-center gap-1 text-indigo-600 font-medium hover:text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Details <ArrowRight size={14} />
                      </Link>
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
