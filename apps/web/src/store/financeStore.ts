import { create } from 'zustand';
import { fetchApi } from '../lib/apiClient';

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  location?: {
    id: string;
    name: string;
  };
}

interface FinanceState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;

  fetchExpenses: (orgId: string) => Promise<void>;
  createExpense: (orgId: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (orgId: string, id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  expenses: [],
  isLoading: false,
  error: null,

  fetchExpenses: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchApi<Expense[]>(`/organizations/${orgId}/expenses`);
      set({ expenses: data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch expenses', isLoading: false });
    }
  },

  createExpense: async (orgId: string, data: Partial<Expense>) => {
    try {
      const newExpense = await fetchApi<Expense>(`/organizations/${orgId}/expenses`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      set(state => ({ 
        expenses: [newExpense, ...state.expenses] 
      }));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to log expense');
    }
  },

  deleteExpense: async (orgId: string, id: string) => {
    try {
      await fetchApi(`/organizations/${orgId}/expenses/${id}`, { method: 'DELETE' });
      set(state => ({
        expenses: state.expenses.filter(e => e.id !== id)
      }));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete expense');
    }
  }
}));
