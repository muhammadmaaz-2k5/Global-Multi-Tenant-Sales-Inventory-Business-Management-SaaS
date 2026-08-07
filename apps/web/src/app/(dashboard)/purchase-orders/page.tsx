'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSupplyStore } from '@/store/supplyStore';
import { FileText, Download, CheckCircle2, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export default function PurchaseOrdersPage() {
  const { orgId } = useAuthStore();
  const { purchaseOrders, isLoading, fetchPurchaseOrders, receivePurchaseOrder } = useSupplyStore();
  const [receivingId, setReceivingId] = useState<string | null>(null);

  useEffect(() => {
    if (orgId) fetchPurchaseOrders(orgId);
  }, [orgId, fetchPurchaseOrders]);

  const handleReceive = async (id: string) => {
    if (!orgId) return;
    if (!confirm('Mark as received? This will automatically add items to your inventory.')) return;
    
    setReceivingId(id);
    try {
      await receivePurchaseOrder(orgId, id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReceivingId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Purchase Orders</h1>
          <p className="text-neutral-500 mt-1 font-medium">Manage restocking, view inbound inventory, and receive shipments.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors">
          <FileText size={18} /> New PO
        </button>
      </div>

      <div className="bg-white/[0.02]/[0.02] border border-white/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="bg-white/[0.02]/[0.01] text-neutral-500 font-bold uppercase tracking-wider border-b border-white/10 text-xs">
              <tr>
                <th className="px-6 py-4">PO Number</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {isLoading && purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-600">Loading purchase orders...</td>
                </tr>
              ) : purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-600 font-medium">No purchase orders found.</td>
                </tr>
              ) : (
                purchaseOrders.map(po => (
                  <tr key={po.id} className="hover:bg-white/[0.02]/[0.01] transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-neutral-500">PO-{po.id.split('-')[0]}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{new Date(po.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-300">{po.supplier.name}</td>
                    <td className="px-6 py-4">{po.location.name}</td>
                    <td className="px-6 py-4 font-bold text-white">${po.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-bold tracking-wide",
                        po.status === 'RECEIVED' ? "bg-emerald-100 text-emerald-700" :
                        po.status === 'ORDERED' ? "bg-blue-100 text-blue-700" :
                        "bg-white/[0.02]/[0.04] text-neutral-300"
                      )}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {po.status === 'ORDERED' && (
                        <button 
                          onClick={() => handleReceive(po.id)}
                          disabled={receivingId === po.id}
                          className="inline-flex items-center gap-1 text-emerald-600 font-bold hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-colors disabled:opacity-50"
                        >
                          <Download size={14} /> {receivingId === po.id ? 'Receiving...' : 'Receive Items'}
                        </button>
                      )}
                      {po.status === 'RECEIVED' && (
                        <span className="inline-flex items-center gap-1 text-neutral-600 font-medium px-3 py-1.5">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      )}
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
