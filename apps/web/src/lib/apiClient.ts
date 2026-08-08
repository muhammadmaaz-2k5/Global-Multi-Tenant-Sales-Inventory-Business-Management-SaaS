import { useAuthStore } from '../store/authStore';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://global-multi-tenant-sales-inventory.onrender.com';

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { requireAuth = true, ...customConfig } = options;
  const headers = new Headers(customConfig.headers);

  if (!headers.has('Content-Type') && !(customConfig.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject Auth Token & Org ID from Zustand
  if (requireAuth && typeof window !== 'undefined') {
    const state = useAuthStore.getState();
    if (state.token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${state.token}`);
    }
    if (state.orgId && !headers.has('x-organization-id')) {
      headers.set('x-organization-id', state.orgId);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...customConfig,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      useAuthStore.getState().logout();
    }
    let errorMsg = response.statusText;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMsg = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
      }
    } catch {
      // Ignored
    }
    throw new Error(errorMsg || 'An error occurred during the request.');
  }

  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

