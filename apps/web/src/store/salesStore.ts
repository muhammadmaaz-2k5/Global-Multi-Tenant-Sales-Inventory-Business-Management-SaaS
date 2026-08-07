import { create } from 'zustand';
import { fetchApi } from '../lib/apiClient';

export interface OrderItem {
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
  unitPrice: number;
  discount: number;
}

export interface Order {
  id: string;
  status: 'COMPLETED' | 'REFUNDED' | 'CANCELLED';
  paymentMethod: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
  location: {
    name: string;
  };
  user: {
    firstName: string;
    lastName: string;
  };
  customer?: {
    firstName: string;
    lastName: string;
  };
}

interface SalesState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  filters: {
    status: string;
    search: string;
  };
  
  setFilters: (filters: Partial<SalesState['filters']>) => void;
  fetchOrders: (orgId: string) => Promise<void>;
  refundOrder: (orgId: string, orderId: string) => Promise<void>;
}

export const useSalesStore = create<SalesState>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,
  filters: {
    status: 'ALL',
    search: '',
  },

  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),

  fetchOrders: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real scenario with pagination, we'd pass skip/take and filters in the query string
      const data = await fetchApi<Order[]>(`/organizations/${orgId}/orders`);
      set({ orders: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch orders', isLoading: false });
    }
  },

  refundOrder: async (orgId: string, orderId: string) => {
    try {
      await fetchApi(`/organizations/${orgId}/orders/${orderId}/refund`, {
        method: 'POST',
      });
      // Update the local state to reflect the refund without refetching everything
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status: 'REFUNDED' } : o
        ),
      }));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to refund order');
    }
  }
}));
