'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { fetchApi } from '@/lib/apiClient';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    organizationName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Register
      await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      // 2. Auto Login after register
      const loginData = await fetchApi<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      // Set cookie
      document.cookie = `shopflow_token=${loginData.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`;
      
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to register account';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-primary-900">Join ShopFlow</h1>
          <p className="text-surface-500 mt-2">Create your business account</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              label="Business Name"
              name="organizationName"
              placeholder="Acme Corp"
              value={formData.organizationName}
              onChange={handleChange}
              required
            />
            
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
              Create Account
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-surface-500">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in instead
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
