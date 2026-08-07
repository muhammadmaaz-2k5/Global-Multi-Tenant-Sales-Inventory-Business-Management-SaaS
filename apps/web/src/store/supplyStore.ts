import { create } from 'zustand';
import { fetchApi } from '../lib/apiClient';

export interface Supplier {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface PurchaseOrderItem {
  id: string;
  variant: {
    id: string;
    name: string;
    product: {
      id: string;
      name: string;
    };
  };
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  expectedDate: string | null;
  supplier: {
    id: string;
    name: string;
  };
  location: {
    id: string;
    name: string;
  };
  items: PurchaseOrderItem[];
}

interface SupplyState {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  isLoading: boolean;
  error: string | null;
  
  fetchSuppliers: (orgId: string) => Promise<void>;
  createSupplier: (orgId: string, data: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (orgId: string, id: string) => Promise<void>;
  
  fetchPurchaseOrders: (orgId: string) => Promise<void>;
  receivePurchaseOrder: (orgId: string, id: string) => Promise<void>;
}

export const useSupplyStore = create<SupplyState>((set, get) => ({
  suppliers: [],
  purchaseOrders: [],
  isLoading: false,
  error: null,

  fetchSuppliers: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchApi<Supplier[]>(`/organizations/${orgId}/suppliers`);
      set({ suppliers: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch suppliers', isLoading: false });
    }
  },

  createSupplier: async (orgId: string, data: Partial<Supplier>) => {
    try {
      const newSupplier = await fetchApi<Supplier>(`/organizations/${orgId}/suppliers`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      set(state => ({ suppliers: [...state.suppliers, newSupplier] }));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create supplier');
    }
  },

  deleteSupplier: async (orgId: string, id: string) => {
    try {
      await fetchApi(`/organizations/${orgId}/suppliers/${id}`, { method: 'DELETE' });
      set(state => ({ suppliers: state.suppliers.filter(s => s.id !== id) }));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete supplier');
    }
  },

  fetchPurchaseOrders: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchApi<PurchaseOrder[]>(`/organizations/${orgId}/purchase-orders`);
      set({ purchaseOrders: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch purchase orders', isLoading: false });
    }
  },

  receivePurchaseOrder: async (orgId: string, id: string) => {
    try {
      await fetchApi(`/organizations/${orgId}/purchase-orders/${id}/receive`, {
        method: 'PATCH',
      });
      set(state => ({
        purchaseOrders: state.purchaseOrders.map(po => 
          po.id === id ? { ...po, status: 'RECEIVED' } : po
        )
      }));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to receive PO');
    }
  }
}));
