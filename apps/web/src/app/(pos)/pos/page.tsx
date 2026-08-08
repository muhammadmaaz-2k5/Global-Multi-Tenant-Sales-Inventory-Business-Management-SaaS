'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/apiClient';
import { usePosStore } from '@/store/posStore';
import { useAuthStore } from '@/store/authStore';
import { Search, MapPin, User as UserIcon, Plus, Minus, Trash2, CreditCard, Banknote, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

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

export default function PosPage() {
  const router = useRouter();
  const { orgId } = useAuthStore();
  const posStore = usePosStore();
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [cashAmount, setCashAmount] = useState<string>('');
  const [cardAmount, setCardAmount] = useState<string>('');

  // Load Initial Data
  useEffect(() => {
    if (!orgId) return;
    
    async function init() {
      try {
        const [prods, locs, custs] = await Promise.all([
          fetchApi<Product[]>(`/organizations/${orgId}/products`),
          fetchApi<Location[]>(`/organizations/${orgId}/locations`),
          fetchApi<Customer[]>(`/organizations/${orgId}/customers`),
        ]);
        
        setProducts(prods);
        setLocations(locs);
        setCustomers(custs);
        
        if (locs.length > 0 && !posStore.locationId) {
          posStore.setLocationId(locs[0].id);
        }
      } catch (err) {
        console.error('Error loading POS data', err);
      }
    }
    init();
  }, [orgId, posStore]);

  // Search Data
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

  // Add Product to Cart
  const handleAddToCart = (product: Product, variant: Variant) => {
    posStore.addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      variantName: variant.name,
      price: variant.price ?? product.basePrice,
    });
  };

  // Checkout Process
  const processCheckout = async () => {
    if (!posStore.locationId) {
      alert('Please select a location first');
      return;
    }
    
    try {
      const order = await fetchApi<{ id: string }>(`/organizations/${orgId}/orders/checkout`, {
        method: 'POST',
        body: JSON.stringify({
          locationId: posStore.locationId,
          payments: [
            ...(parseFloat(cashAmount) > 0 ? [{ method: 'CASH', amount: parseFloat(cashAmount) }] : []),
            ...(parseFloat(cardAmount) > 0 ? [{ method: 'CARD', amount: parseFloat(cardAmount) }] : [])
          ],
          items: posStore.cart,
          customerId: posStore.customerId || undefined,
          tax: posStore.getTax(),
          discount: posStore.getSubtotal() * (posStore.discount / 100),
        }),
      });
      
      posStore.clearCart();
      setIsPayModalOpen(false);
      setCashAmount('');
      setCardAmount('');
      
      // Navigate to receipt
      router.push(`/pos/receipt/${order.id}?orgId=${orgId}`);
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message || 'Checkout failed!');
      } else {
        alert('Checkout failed!');
      }
    }
  };

  const subtotal = posStore.getSubtotal();
  const tax = posStore.getTax();
  const total = posStore.getTotal();

  return (
    <div className="flex w-full h-full p-6 gap-6">
      {/* LEFT PANEL: Products & Search */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Top Controls */}
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search products by name, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all backdrop-blur-sm"
            />
          </form>

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 h-12 backdrop-blur-sm">
            <MapPin size={18} className="text-slate-400" />
            <select
              value={posStore.locationId || ''}
              onChange={(e) => posStore.setLocationId(e.target.value)}
              className="bg-transparent border-none text-slate-200 focus:outline-none text-sm font-medium cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-200">Select Location</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-slate-900 text-slate-200">{loc.name} ({loc.type})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 h-12 backdrop-blur-sm">
            <UserIcon size={18} className="text-slate-400" />
            <select
              value={posStore.customerId || ''}
              onChange={(e) => posStore.setCustomer(e.target.value || null)}
              className="bg-transparent border-none text-slate-200 focus:outline-none text-sm font-medium cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-200">Walk-in Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
            {products.map((product) => (
              product.variants.map((variant) => (
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  key={variant.id}
                  onClick={() => handleAddToCart(product, variant)}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 cursor-pointer hover:bg-white/10 hover:border-indigo-500/50 transition-all flex flex-col justify-between aspect-square relative overflow-hidden group backdrop-blur-sm shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
                    <h3 className="font-semibold text-slate-200 line-clamp-2 leading-tight mb-1">{product.name}</h3>
                    <p className="text-sm text-slate-400">{variant.name}</p>
                  </div>
                  <div className="relative z-10 flex items-center justify-between mt-4">
                    <span className="font-bold text-xl text-indigo-400">
                      ${(variant.price ?? product.basePrice).toFixed(2)}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                      <Plus size={18} />
                    </div>
                  </div>
                </motion.div>
              ))
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Cart Sidebar */}
      <div className="w-[420px] flex flex-col bg-slate-900/50 border border-white/10 rounded-3xl shrink-0 overflow-hidden shadow-2xl backdrop-blur-xl relative">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-bold text-xl flex items-center gap-3">
            <ShoppingBag className="text-indigo-400" />
            Current Sale
          </h2>
          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full">
            {posStore.cart.reduce((acc, item) => acc + item.quantity, 0)} Items
          </span>
        </div>
        
        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar relative">
          <AnimatePresence initial={false}>
            {posStore.cart.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4"
              >
                <ShoppingBag size={48} className="opacity-20" />
                <p>Your cart is empty</p>
              </motion.div>
            ) : (
              posStore.cart.map((item) => (
                <motion.div
                  key={`${item.productId}-${item.variantId}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="flex flex-col gap-3 p-4 bg-white/5 rounded-2xl border border-white/5"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-medium text-slate-200 leading-snug">{item.name}</h4>
                      {item.variantName && <p className="text-xs text-slate-400 mt-0.5">{item.variantName}</p>}
                    </div>
                    <span className="font-semibold text-indigo-300 whitespace-nowrap">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1 border border-white/5">
                      <button 
                        onClick={() => posStore.updateQuantity(item.productId, item.quantity - 1, item.variantId)} 
                        className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white/10 text-slate-300 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-medium w-8 text-center text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => posStore.updateQuantity(item.productId, item.quantity + 1, item.variantId)} 
                        className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white/10 text-slate-300 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button 
                      onClick={() => posStore.removeItem(item.productId, item.variantId)} 
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Totals & Checkout */}
        <div className="bg-slate-900 border-t border-white/10 p-6 space-y-4">
          {/* Discount Selector */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-medium text-slate-400">Discount</span>
            <div className="flex gap-2">
              {[0, 10, 15, 20].map(pct => (
                <button
                  key={pct}
                  onClick={() => posStore.setDiscount(pct)}
                  className={clsx(
                    "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                    posStore.discount === pct 
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" 
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                  )}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {posStore.discount > 0 && (
              <div className="flex justify-between text-emerald-400 text-sm font-medium">
                <span>Discount ({posStore.discount}%)</span>
                <span>-${(subtotal * (posStore.discount / 100)).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Tax ({(posStore.taxRate * 100).toFixed(3)}%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-2xl font-bold text-white pt-4 border-t border-white/10">
              <span>Total</span>
              <span className="text-indigo-400">${total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button 
              onClick={() => posStore.clearCart()} 
              disabled={posStore.cart.length === 0}
              className="px-4 py-4 rounded-xl font-bold transition-all bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
            <button 
              onClick={() => {
                setCashAmount(total.toFixed(2));
                setCardAmount('');
                setIsPayModalOpen(true);
              }}
              disabled={posStore.cart.length === 0}
              className="px-4 py-4 rounded-xl font-bold transition-all bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>
      
      {/* PAY MODAL */}
      <AnimatePresence>
        {isPayModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setIsPayModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Process Payment</h2>
                <div className="text-4xl font-black text-indigo-400">${total.toFixed(2)}</div>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="text-sm text-slate-400 text-center -mt-4">
                  Enter amounts to split payment, or pay in full with one method.
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Banknote className="text-emerald-500" size={20} />
                    </div>
                    <input 
                      type="number"
                      step="0.01"
                      placeholder="Cash Amount"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <CreditCard className="text-indigo-400" size={20} />
                    </div>
                    <input 
                      type="number"
                      step="0.01"
                      placeholder="Card Amount"
                      value={cardAmount}
                      onChange={(e) => setCardAmount(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>

                {/* Validation calculation */}
                {(() => {
                   const csh = parseFloat(cashAmount) || 0;
                   const crd = parseFloat(cardAmount) || 0;
                   const sum = csh + crd;
                   const remaining = total - sum;
                   return remaining > 0.001 ? (
                     <div className="text-amber-400 text-sm font-medium text-center">Remaining balance: ${remaining.toFixed(2)}</div>
                   ) : remaining < -0.001 ? (
                     <div className="text-emerald-400 text-sm font-medium text-center">Change due: ${Math.abs(remaining).toFixed(2)}</div>
                   ) : (
                     <div className="text-emerald-400 text-sm font-medium text-center flex items-center justify-center gap-1"><CheckCircle2 size={16}/> Fully covered</div>
                   );
                })()}
              </div>
              
              <div className="p-6 bg-slate-950/50 border-t border-white/10 flex justify-end gap-3">
                <button 
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={processCheckout}
                  className="px-6 py-3 rounded-xl font-bold bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/25 transition-all"
                >
                  Confirm Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
