export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Try to get token if running in the browser
  let token = '';
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find((c) => c.trim().startsWith('shopflow_token='));
    if (authCookie) {
      token = authCookie.split('=')[1];
    }
  }

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
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

  return response.json();
}
