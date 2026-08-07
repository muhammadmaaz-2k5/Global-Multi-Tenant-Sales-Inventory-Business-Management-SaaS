'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useSalesStore, Order } from '@/store/salesStore';
import { fetchApi } from '@/lib/apiClient';
import { ArrowLeft, Clock, MapPin, User, Package, AlertTriangle, CreditCard, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { orgId } = useAuthStore();
  const { refundOrder } = useSalesStore();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefunding, setIsRefunding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // We determine if user is allowed to refund by checking their role.
  // In a real app we'd decode the token or check the user memberships.
  const [canRefund, setCanRefund] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!orgId || !id) return;
      try {
        const [me, orderData] = await Promise.all([
          fetchApi<{ memberships: { organizationId: string, role: string }[] }>('/users/me'),
          fetchApi<Order>(`/organizations/${orgId}/orders/${id}`)
        ]);
        
        const role = me.memberships.find(m => m.organizationId === orgId)?.role || 'CASHIER';
        setCanRefund(role === 'OWNER' || role === 'MANAGER');
        setOrder(orderData);
      } catch (err: any) {
        setError(err.message || 'Failed to load order');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [orgId, id]);

  const handleRefund = async () => {
    if (!orgId || !order || typeof id !== 'string') return;
    if (!confirm('Are you sure you want to refund this order? Inventory will be automatically restocked.')) return;
    
    setIsRefunding(true);
    try {
      await refundOrder(orgId, id);
      setOrder({ ...order, status: 'REFUNDED' });
      alert('Order successfully refunded!');
    } catch (err: any) {
      alert(err.message || 'Refund failed');
    } finally {
      setIsRefunding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2 text-neutral-500">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Loading order details...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-start gap-3 max-w-2xl">
          <AlertTriangle className="shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold">Error</h3>
            <p>{error || 'Order not found'}</p>
          </div>
        </div>
        <Link href="/sales" className="mt-4 inline-flex text-indigo-600 font-medium hover:underline">
          &larr; Back to Sales
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/sales')} className="p-2 bg-white/[0.02]/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.02]/[0.01] transition-colors">
          <ArrowLeft size={20} className="text-neutral-400" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight">Order #{order.id.split('-')[0]}</h1>
            <span className={clsx(
              "px-2.5 py-1 rounded-full text-xs font-bold tracking-wide",
              order.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700" :
              order.status === 'REFUNDED' ? "bg-red-100 text-red-700" :
              "bg-white/[0.02]/[0.04] text-neutral-300"
            )}>
              {order.status}
            </span>
          </div>
          <p className="text-neutral-500 text-sm font-medium mt-1">
            <Clock size={14} className="inline mr-1" />
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        
        <div className="ml-auto">
          {order.status === 'COMPLETED' && canRefund && (
            <button 
              onClick={handleRefund}
              disabled={isRefunding}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.02]/[0.02] border border-red-200 text-red-600 rounded-xl font-bold shadow-sm hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <RotateCcw size={16} className={isRefunding ? "animate-spin" : ""} />
              {isRefunding ? 'Refunding...' : 'Refund Order'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Content (Left) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/[0.02]/[0.02] border border-white/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-white/[0.05] bg-white/[0.02]/[0.01] flex items-center gap-2 text-neutral-300 font-bold">
              <Package size={18} /> Order Items
            </div>
            <div className="divide-y divide-white/[0.05]">
              {order.items.map(item => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{item.variant.product.name}</h4>
                    <p className="text-sm text-neutral-500">{item.variant.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">${((item.unitPrice * item.quantity) - item.discount).toFixed(2)}</p>
                    <p className="text-sm text-neutral-500">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white/[0.02]/[0.01] border-t border-white/10 space-y-2 text-sm">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-400">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-lg pt-2 border-t border-white/10 mt-2 text-white">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="space-y-6">
          <div className="bg-white/[0.02]/[0.02] border border-white/10 rounded-2xl shadow-sm p-4">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <User size={18} className="text-neutral-600" /> Customer
            </h3>
            {order.customer ? (
              <p className="font-medium text-neutral-300">{order.customer.firstName} {order.customer.lastName}</p>
            ) : (
              <p className="italic text-neutral-500">Walk-in Customer</p>
            )}
          </div>

          <div className="bg-white/[0.02]/[0.02] border border-white/10 rounded-2xl shadow-sm p-4">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-neutral-600" /> Location
            </h3>
            <p className="font-medium text-neutral-300">{order.location.name}</p>
            <p className="text-sm text-neutral-500 mt-1">Cashier: {order.user.firstName} {order.user.lastName}</p>
          </div>

          <div className="bg-white/[0.02]/[0.02] border border-white/10 rounded-2xl shadow-sm p-4">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-neutral-600" /> Payment
            </h3>
            <p className="font-medium text-neutral-300">{order.paymentMethod}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
