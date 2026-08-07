import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  token: string | null;
  orgId: string | null;
  user: User | null;
  setAuth: (token: string, user: User, orgId: string) => void;
  setOrgId: (orgId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      orgId: null,
      user: null,
      setAuth: (token, user, orgId) => set({ token, user, orgId }),
      setOrgId: (orgId) => set({ orgId }),
      logout: () => set({ token: null, orgId: null, user: null }),
    }),
    {
      name: 'shopflow-auth', // localStorage key
    }
  )
);
