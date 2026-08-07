'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSupplyStore } from '@/store/supplyStore';
import { Truck, Plus, Search, Mail, Phone, MapPin, Trash2 } from 'lucide-react';
import clsx from 'clsx';

export default function SuppliersPage() {
  const { orgId } = useAuthStore();
  const { suppliers, isLoading, fetchSuppliers, createSupplier, deleteSupplier } = useSupplyStore();
  
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const [newSupplier, setNewSupplier] = useState({
    name: '', contactName: '', email: '', phone: '', address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (orgId) fetchSuppliers(orgId);
  }, [orgId, fetchSuppliers]);

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.contactName && s.contactName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setIsSubmitting(true);
    try {
      await createSupplier(orgId, newSupplier);
      setShowModal(false);
      setNewSupplier({ name: '', contactName: '', email: '', phone: '', address: '' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!orgId) return;
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteSupplier(orgId, id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Suppliers</h1>
          <p className="text-neutral-500 mt-1 font-medium">Manage your vendor relationships and contact details.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      <div className="bg-white/[0.02]/[0.02] p-4 rounded-2xl border border-white/10 shadow-sm mb-6 flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
          <input 
            type="text" 
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/[0.02]/[0.01] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {isLoading && suppliers.length === 0 ? (
        <div className="flex justify-center p-12 text-neutral-600">Loading suppliers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(supplier => (
            <div key={supplier.id} className="bg-white/[0.02]/[0.02] border border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Truck size={24} />
                </div>
                <button 
                  onClick={() => handleDelete(supplier.id, supplier.name)}
                  className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1 truncate">{supplier.name}</h3>
              <p className="text-sm text-neutral-500 font-medium mb-4 truncate">{supplier.contactName || 'No primary contact'}</p>
              
              <div className="space-y-2 text-sm text-neutral-400">
                {supplier.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail size={14} className="text-neutral-600 shrink-0" />
                    <a href={`mailto:${supplier.email}`} className="hover:text-indigo-600 truncate">{supplier.email}</a>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2 truncate">
                    <Phone size={14} className="text-neutral-600 shrink-0" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center gap-2 truncate">
                    <MapPin size={14} className="text-neutral-600 shrink-0" />
                    <span className="truncate">{supplier.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {filtered.length === 0 && (
            <div className="col-span-full p-12 text-center text-neutral-500 bg-white/[0.02]/[0.01] rounded-2xl border border-dashed border-white/10">
              No suppliers found. Click "Add Supplier" to create one.
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0a0a0a]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/[0.02]/[0.02] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/[0.05]">
              <h2 className="text-xl font-bold text-white">Add New Supplier</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-1">Company Name *</label>
                <input 
                  required type="text" 
                  value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                  className="w-full px-4 py-2 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  placeholder="Acme Distributing"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-1">Contact Name</label>
                <input 
                  type="text" 
                  value={newSupplier.contactName} onChange={e => setNewSupplier({...newSupplier, contactName: e.target.value})}
                  className="w-full px-4 py-2 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  placeholder="John Doe"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-1">Email</label>
                  <input 
                    type="email" 
                    value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})}
                    className="w-full px-4 py-2 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-1">Address</label>
                <input 
                  type="text" 
                  value={newSupplier.address} onChange={e => setNewSupplier({...newSupplier, address: e.target.value})}
                  className="w-full px-4 py-2 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.05] mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-neutral-400 font-medium hover:bg-white/[0.02]/[0.01] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
