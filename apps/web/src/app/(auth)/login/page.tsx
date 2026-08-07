'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { fetchApi } from '@/lib/apiClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await fetchApi<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Set cookie to expire in 7 days
      document.cookie = `shopflow_token=${data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`;
      
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid email or password';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-primary-900">ShopFlow</h1>
          <p className="text-surface-500 mt-2">Sign in to manage your business</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <input id="remember" type="checkbox" className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="remember" className="ml-2 block text-sm text-surface-900">Remember me</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">Forgot password?</a>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
              Sign in
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-surface-500">
            Don&apos;t have an account?{' '}
            <a href="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Register your business
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
