'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useFinanceStore } from '@/store/financeStore';
import { DollarSign, Plus, Trash2, PieChart } from 'lucide-react';

export default function ExpensesPage() {
  const { orgId } = useAuthStore();
  const { expenses, isLoading, fetchExpenses, createExpense, deleteExpense } = useFinanceStore();
  
  const [showModal, setShowModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: 'PAYROLL',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (orgId) fetchExpenses(orgId);
  }, [orgId, fetchExpenses]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setIsSubmitting(true);
    try {
      await createExpense(orgId, {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        date: new Date(newExpense.date).toISOString()
      });
      setShowModal(false);
      setNewExpense({ category: 'PAYROLL', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, desc: string) => {
    if (!orgId) return;
    if (!confirm(`Delete expense "${desc}"?`)) return;
    try {
      await deleteExpense(orgId, id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const categories = ['PAYROLL', 'RENT', 'UTILITIES', 'MARKETING', 'MAINTENANCE', 'SUPPLIES', 'OTHER'];
  
  const totalSpend = useMemo(() => expenses.reduce((acc, e) => acc + e.amount, 0), [expenses]);
  const thisMonthSpend = useMemo(() => {
    const now = new Date();
    return expenses
      .filter(e => new Date(e.date).getMonth() === now.getMonth() && new Date(e.date).getFullYear() === now.getFullYear())
      .reduce((acc, e) => acc + e.amount, 0);
  }, [expenses]);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Expenses</h1>
          <p className="text-neutral-500 mt-1 font-medium">Track operational costs and manage ledger entries.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} /> Log Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/[0.02]/[0.02] rounded-2xl p-6 border border-white/10 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">This Month's Spend</p>
            <p className="text-4xl font-black text-white mt-1">${thisMonthSpend.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white/[0.02]/[0.02] rounded-2xl p-6 border border-white/10 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-white/[0.02]/[0.01] text-neutral-400 rounded-2xl flex items-center justify-center shrink-0">
            <PieChart size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Total Recorded Spend</p>
            <p className="text-4xl font-black text-white mt-1">${totalSpend.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02]/[0.02] border border-white/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="bg-white/[0.02]/[0.01] text-neutral-500 font-bold uppercase tracking-wider border-b border-white/10 text-xs">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {isLoading && expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-600">Loading expenses...</td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-600 font-medium">No expenses logged yet.</td>
                </tr>
              ) : (
                expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-white/[0.02]/[0.01] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-neutral-300 font-medium">{expense.description}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-white/[0.02]/[0.04] text-neutral-300">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-red-600">
                      -${expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(expense.id, expense.description)}
                        className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all inline-flex"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#0a0a0a]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/[0.02]/[0.02] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/[0.05]">
              <h2 className="text-xl font-bold text-white">Log Expense</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-1">Description *</label>
                <input 
                  required type="text" 
                  value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full px-4 py-2 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  placeholder="Office Supplies"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-1">Amount ($) *</label>
                  <input 
                    required type="number" step="0.01" min="0"
                    value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                    className="w-full px-4 py-2 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                    placeholder="50.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-1">Date *</label>
                  <input 
                    required type="date"
                    value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                    className="w-full px-4 py-2 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-1">Category *</label>
                <select 
                  value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full px-4 py-2 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white/[0.02]/[0.02]"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.05] mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-neutral-400 font-medium hover:bg-white/[0.02]/[0.01] rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  {isSubmitting ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
