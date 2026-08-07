'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Variant {
  id: string;
  name: string;
  price: number | null;
}

interface Product {
  id: string;
  name: string;
  basePrice: number;
  variants: Variant[];
}

interface Location {
  id: string;
  name: string;
  type: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
}

interface CartItem {
  variantId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  discount: number;
}

export default function PosPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string>('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Pay Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  // Clock In State
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);

  useEffect(() => {
    async function init() {
      try {
        const user = await fetchApi<{ memberships: { organizationId: string }[] }>('/users/me');
        const id = user.memberships[0]?.organizationId;
        if (id) {
          setOrgId(id);
          
          const orgRes = await fetchApi<{ defaultTaxRate?: number }>(`/organizations/${id}`);
          setTaxRate(orgRes.defaultTaxRate || 0);

          const [prods, locs, custs] = await Promise.all([
            fetchApi<Product[]>(`/organizations/${id}/products`),
            fetchApi<Location[]>(`/organizations/${id}/locations`),
            fetchApi<Customer[]>(`/organizations/${id}/customers`),
          ]);
          
          setProducts(prods);
          setLocations(locs);
          setCustomers(custs);
          if (locs.length > 0) {
            setSelectedLocationId(locs[0].id);
          }

          // Check shift status
          try {
            const shift = await fetchApi<{ id: string }>(`/organizations/${id}/shifts/active`);
            if (shift && shift.id) {
              setIsClockedIn(true);
            }
          } catch (e) {
            // No active shift
            setIsClockedIn(false);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    try {
      const prods = await fetchApi<Product[]>(`/organizations/${orgId}/products?q=${encodeURIComponent(searchQuery)}`);
      setProducts(prods);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = async (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 50) barcodeBuffer = '';
      lastKeyTime = currentTime;

      if (e.key === 'Enter' && barcodeBuffer.length > 3) {
        const scannedCode = barcodeBuffer;
        barcodeBuffer = '';
        if (!orgId) return;
        try {
          const prods = await fetchApi<Product[]>(`/organizations/${orgId}/products?q=${encodeURIComponent(scannedCode)}`);
          if (prods.length > 0 && prods[0].variants.length > 0) {
            const product = prods[0];
            const variant = prods[0].variants[0];
            const price = variant.price ?? product.basePrice;
            setCart((prev) => {
              const existing = prev.find((i) => i.variantId === variant.id);
              if (existing) {
                return prev.map((i) => i.variantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i);
              }
              return [...prev, {
                variantId: variant.id,
                name: `${product.name} - ${variant.name}`,
                unitPrice: price,
                quantity: 1,
                discount: 0,
              }];
            });
          }
        } catch (err) {
          console.error(err);
        }
      } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [orgId]);

  const addToCart = (product: Product, variant: Variant) => {
    const price = variant.price ?? product.basePrice;
    setCart((prev) => {
      const existing = prev.find((i) => i.variantId === variant.id);
      if (existing) {
        return prev.map((i) => i.variantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        variantId: variant.id,
        name: `${product.name} - ${variant.name}`,
        unitPrice: price,
        quantity: 1,
        discount: 0,
      }];
    });
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.variantId === variantId) {
        const newQ = item.quantity + delta;
        return { ...item, quantity: Math.max(1, newQ) };
      }
      return item;
    }));
  };

  const removeItem = (variantId: string) => {
    setCart((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const suspendSale = async () => {
    if (cart.length === 0) return;
    try {
      await fetchApi(`/organizations/${orgId}/pos-carts`, {
        method: 'POST',
        body: JSON.stringify({
          name: `Suspended at ${new Date().toLocaleTimeString()}`,
          items: cart,
        }),
      });
      setCart([]);
      alert('Sale suspended successfully!');
    } catch {
      alert('Failed to suspend sale');
    }
  };

  const processCheckout = async () => {
    if (!selectedLocationId) {
      alert('Please select a location first');
      return;
    }
    
    try {
      const order = await fetchApi<{ id: string }>(`/organizations/${orgId}/orders/checkout`, {
        method: 'POST',
        body: JSON.stringify({
          locationId: selectedLocationId,
          paymentMethod,
          items: cart,
          customerId: selectedCustomerId || undefined,
          tax,
          discount: cartDiscountAmount,
        }),
      });
      
      setCart([]);
      setDiscountPercent(0);
      setIsPayModalOpen(false);
      
      // Navigate to receipt
      router.push(`/pos/receipt/${order.id}?orgId=${orgId}`);
      
    } catch {
      alert('Checkout failed! Insufficient inventory or network error.');
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity) - item.discount, 0);
  const cartDiscountAmount = (subtotal * discountPercent) / 100;
  const tax = (subtotal - cartDiscountAmount) * (taxRate / 100);
  const total = subtotal - cartDiscountAmount + tax;

  const toggleShift = async () => {
    try {
      if (isClockedIn) {
        await fetchApi(`/organizations/${orgId}/shifts/clock-out`, { method: 'POST' });
        setIsClockedIn(false);
        alert('Clocked Out successfully');
      } else {
        await fetchApi(`/organizations/${orgId}/shifts/clock-in`, { method: 'POST' });
        setIsClockedIn(true);
        alert('Clocked In successfully');
      }
    } catch (err) {
      alert('Failed to update shift status.');
    }
  };

  return (
    <div className="flex h-full relative">
      {/* LEFT PANEL: Products & Search */}
      <div className="flex-1 flex flex-col border-r border-surface-200 bg-surface-50">
        <div className="p-4 bg-white border-b border-surface-200 flex items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="flex-1">
              <Input
                label=""
                placeholder="Search products by name, SKU, or scan barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
          
          {/* Location Selector */}
          <div className="shrink-0 flex items-center gap-2 bg-surface-100 p-2 rounded-lg border border-surface-200">
            <span className="text-sm font-medium text-surface-600">Location:</span>
            <select 
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-surface-900 focus:outline-none focus:ring-0"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name} ({loc.type})</option>
              ))}
            </select>
          </div>

          {/* Customer Selector */}
          <div className="shrink-0 flex items-center gap-2 bg-surface-100 p-2 rounded-lg border border-surface-200">
            <span className="text-sm font-medium text-surface-600">Customer:</span>
            <select 
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-surface-900 focus:outline-none focus:ring-0"
            >
              <option value="">Walk-in Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>
          
          <Button 
            variant={isClockedIn ? 'danger' : 'primary'} 
            onClick={toggleShift}
          >
            {isClockedIn ? 'Clock Out' : 'Clock In'}
          </Button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
          {products.map((product) => (
            product.variants.map((variant) => (
              <div 
                key={variant.id} 
                onClick={() => addToCart(product, variant)}
                className="bg-white border border-surface-200 rounded-xl p-4 cursor-pointer hover:border-primary-500 hover:shadow-md transition-all flex flex-col justify-between aspect-square"
              >
                <div>
                  <h3 className="font-semibold text-surface-900 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-surface-500">{variant.name}</p>
                </div>
                <div className="font-bold text-lg text-primary-600 mt-2">
                  ${(variant.price ?? product.basePrice).toFixed(2)}
                </div>
              </div>
            ))
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: Cart */}
      <div className="w-[400px] flex flex-col bg-white shrink-0">
        <div className="p-4 border-b border-surface-200 font-bold text-lg text-surface-900">
          Current Sale
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-surface-400">
              Cart is empty
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.variantId} className="flex flex-col gap-2 p-3 bg-surface-50 rounded-lg border border-surface-100">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-surface-900">{item.name}</span>
                  <span className="font-semibold">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.variantId, -1)} className="w-8 h-8 rounded-full bg-white border border-surface-200 flex items-center justify-center hover:bg-surface-100">-</button>
                    <span className="font-medium w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.variantId, 1)} className="w-8 h-8 rounded-full bg-white border border-surface-200 flex items-center justify-center hover:bg-surface-100">+</button>
                  </div>
                  <button onClick={() => removeItem(item.variantId)} className="text-red-500 text-sm font-medium hover:underline">Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Discount Section */}
        <div className="flex justify-between items-center px-4 py-2 bg-surface-50 border-t border-surface-200">
          <span className="text-sm font-medium text-surface-600">Apply Discount</span>
          <div className="flex gap-2">
            {[0, 5, 10, 15, 20].map(pct => (
              <button
                key={pct}
                onClick={() => setDiscountPercent(pct)}
                className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                  discountPercent === pct 
                    ? 'bg-primary-100 text-primary-700 border-primary-300' 
                    : 'bg-white text-surface-600 border-surface-200 hover:bg-surface-100'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-surface-50 border-t border-surface-200 space-y-2">
          <div className="flex justify-between text-surface-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {cartDiscountAmount > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Discount ({discountPercent}%)</span>
              <span>-${cartDiscountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-surface-600">
            <span>Tax ({taxRate}%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-surface-900 pt-2 border-t border-surface-200 mt-2">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button variant="outline" onClick={suspendSale} disabled={cart.length === 0}>
              Suspend Sale
            </Button>
            <Button disabled={cart.length === 0} onClick={() => setIsPayModalOpen(true)}>
              Pay Now
            </Button>
          </div>
        </div>
      </div>
      
      {/* PAY MODAL */}
      {isPayModalOpen && (
        <div className="absolute inset-0 bg-surface-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-surface-200">
              <h2 className="text-2xl font-bold text-surface-900">Process Payment</h2>
              <p className="text-surface-500">Total Amount Due: <span className="font-bold text-lg text-primary-600">${total.toFixed(2)}</span></p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setPaymentMethod('CASH')}
                  className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${paymentMethod === 'CASH' ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-surface-300'}`}
                >
                  <span className="font-bold text-lg">💵 Cash</span>
                </div>
                <div 
                  onClick={() => setPaymentMethod('CARD')}
                  className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-surface-300'}`}
                >
                  <span className="font-bold text-lg">💳 Card</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-surface-200 bg-surface-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsPayModalOpen(false)}>Cancel</Button>
              <Button onClick={processCheckout}>Confirm Payment</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
