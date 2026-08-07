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

  return (
    <div className="h-full bg-surface-100 flex items-center justify-center p-4">
      
      <div className="flex flex-col items-center gap-6">
        
        <div className="flex gap-4 print:hidden">
          <Button variant="outline" onClick={() => router.push('/pos')}>New Sale</Button>
          <Button onClick={() => window.print()}>Print Receipt</Button>
        </div>
        
        {/* RECEIPT PAPER - Styled for ~80mm width thermal printers conceptually, using standard max-width here */}
        <div className="bg-white p-8 max-w-[400px] w-full shadow-lg border-t-4 border-t-surface-900 text-surface-900 print:shadow-none print:border-none print:max-w-full">
          
          <div className="text-center mb-6">
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
