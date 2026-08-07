'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';

interface OrderItem {
  id: string;
  variant: {
    name: string;
    product: { name: string };
  };
  quantity: number;
  unitPrice: number;
  discount: number;
}

interface Order {
  id: string;
  status: string;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
  organization: {
    name: string;
  };
  location: {
    name: string;
  };
  user: {
    firstName: string;
    lastName: string;
  };
}

export default function ReceiptPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('orgId');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [userRole, setUserRole] = useState<string>('CASHIER');

  useEffect(() => {
    async function init() {
      try {
        const user = await fetchApi<{ memberships: { organizationId: string, role: string }[] }>('/users/me');
        const role = user.memberships.find(m => m.organizationId === orgId)?.role || 'CASHIER';
        setUserRole(role);
      } catch {}
    }
    init();
  }, [orgId]);

  useEffect(() => {
    async function loadOrder() {
      if (!id || !orgId) return;
      try {
        const data = await fetchApi<Order>(`/organizations/${orgId}/orders/${id}`);
        setOrder(data);
      } catch {
        setError(true);
      }
    }
    loadOrder();
  }, [id, orgId]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center flex-col gap-4">
        <h1 className="text-xl font-bold text-red-500">Failed to load receipt</h1>
        <Button onClick={() => router.push('/pos')}>Back to POS</Button>
      </div>
    );
  }

  if (!order) {
    return <div className="flex h-full items-center justify-center">Loading receipt...</div>;
  }

  const handleRefund = async () => {
    if (!confirm('Are you sure you want to refund this order? This will restock the inventory automatically.')) return;
    setIsRefunding(true);
    try {
      await fetchApi(`/organizations/${orgId}/orders/${id}/refund`, {
        method: 'POST'
      });
      setOrder({ ...order, status: 'REFUNDED' });
      alert('Order successfully refunded!');
    } catch (err: unknown) {
      alert((err as Error).message || 'Refund failed');
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 p-8 print:p-0 print:bg-white flex justify-center">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            margin: 0;
            size: 80mm 297mm;
          }
          body {
            background-color: #fff;
          }
          .no-print {
            display: none !important;
          }
          .receipt-container {
            width: 80mm !important;
            padding: 4mm !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            font-size: 12px;
            color: #000;
          }
        }
      `}} />
      <div className="max-w-md w-full">
        {/* Action Bar (hidden when printing) */}
        <div className="flex justify-between mb-4 no-print">
          <Button variant="outline" onClick={() => router.push('/pos')}>Back to POS</Button>
          <div className="flex gap-2">
            <Button onClick={() => window.print()}>Print Receipt</Button>
            {(userRole === 'OWNER' || userRole === 'MANAGER') && order.status !== 'REFUNDED' && (
              <Button variant="danger" onClick={handleRefund} disabled={isRefunding}>{isRefunding ? 'Refunding...' : 'Process Refund'}</Button>
            )}
          </div>
        </div>

        {/* Receipt Paper */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-surface-200 receipt-container relative overflow-hidden">
          {order.status === 'REFUNDED' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-20">
              <span className="text-red-600 font-black text-6xl transform -rotate-45 tracking-widest border-8 border-red-600 px-4 py-2">
                REFUNDED
              </span>
            </div>
          )}
          
          <div className="text-center mb-6 relative">
            <h1 className="text-2xl font-black uppercase tracking-widest">{order.organization.name}</h1>
            <p className="text-sm font-medium">{order.location.name}</p>
            <p className="text-xs text-surface-500 mt-2">Cashier: {order.user.firstName} {order.user.lastName}</p>
            <p className="text-xs text-surface-500">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          
          <div className="border-t border-dashed border-surface-300 my-4"></div>
          
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between items-start text-sm">
                <div>
                  <div className="font-semibold">{item.variant.product.name}</div>
                  <div className="text-xs text-surface-500">{item.variant.name} x {item.quantity} @ ${item.unitPrice.toFixed(2)}</div>
                </div>
                <div className="font-bold">${((item.unitPrice * item.quantity) - item.discount).toFixed(2)}</div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-dashed border-surface-300 my-4"></div>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-xl mt-2 pt-2 border-t border-surface-900">
              <span>TOTAL</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="border-t border-dashed border-surface-300 my-4"></div>
          
          <div className="text-center text-sm font-medium">
            <p>Paid via {order.paymentMethod}</p>
            <p className="mt-4 text-surface-500">Thank you for your business!</p>
            <div className="mt-6 text-xs text-surface-400 font-mono break-all">
              Order ID: {order.id}
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  );
}
