import { create } from 'zustand';
import { fetchApi } from '../lib/apiClient';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface StaffMember {
  user: User;
  role: 'OWNER' | 'MANAGER' | 'CASHIER' | 'INVENTORY_MANAGER';
}

export interface Shift {
  id: string;
  clockInTime: string;
  clockOutTime: string | null;
  user: User;
  location: {
    name: string;
  };
}

interface HRState {
  staff: StaffMember[];
  shifts: Shift[];
  activeShifts: Shift[];
  isLoading: boolean;
  error: string | null;

  fetchStaff: (orgId: string) => Promise<void>;
  updateRole: (orgId: string, userId: string, role: string) => Promise<void>;
  
  fetchShifts: (orgId: string) => Promise<void>;
  fetchActiveShifts: (orgId: string) => Promise<void>;
  clockIn: (orgId: string, locationId: string) => Promise<void>;
  clockOut: (orgId: string) => Promise<void>;
}

export const useHRStore = create<HRState>((set, get) => ({
  staff: [],
  shifts: [],
  activeShifts: [],
  isLoading: false,
  error: null,

  fetchStaff: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchApi<StaffMember[]>(`/organizations/${orgId}/staff`);
      set({ staff: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch staff', isLoading: false });
    }
  },

  updateRole: async (orgId: string, userId: string, role: string) => {
    try {
      await fetchApi(`/organizations/${orgId}/staff/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role })
      });
      set(state => ({
        staff: state.staff.map(s => s.user.id === userId ? { ...s, role: role as any } : s)
      }));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update role');
    }
  },

  fetchShifts: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchApi<Shift[]>(`/organizations/${orgId}/shifts`);
      set({ shifts: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch shifts', isLoading: false });
    }
  },

  fetchActiveShifts: async (orgId: string) => {
    try {
      const data = await fetchApi<Shift[]>(`/organizations/${orgId}/shifts/active`);
      set({ activeShifts: data });
    } catch (err: any) {
      console.error(err);
    }
  },

  clockIn: async (orgId: string, locationId: string) => {
    try {
      await fetchApi(`/organizations/${orgId}/shifts/clock-in`, {
        method: 'POST',
        body: JSON.stringify({ locationId })
      });
      get().fetchActiveShifts(orgId);
      get().fetchShifts(orgId);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to clock in');
    }
  },

  clockOut: async (orgId: string) => {
    try {
      await fetchApi(`/organizations/${orgId}/shifts/clock-out`, {
        method: 'POST'
      });
      get().fetchActiveShifts(orgId);
      get().fetchShifts(orgId);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to clock out');
    }
  }
}));
