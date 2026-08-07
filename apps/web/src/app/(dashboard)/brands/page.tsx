'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { fetchApi } from '@/lib/apiClient';

interface Brand {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface User {
  memberships: { organizationId: string }[];
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [orgId, setOrgId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await fetchApi<User>('/users/me');
        const id = user.memberships[0]?.organizationId;
        if (id) {
          setOrgId(id);
          const data = await fetchApi<Brand[]>(`/organizations/${id}/brands`);
          setBrands(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setIsSubmitting(true);
    
    try {
      const newBrand = await fetchApi<Brand>(`/organizations/${orgId}/brands`, {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });
      setBrands([newBrand, ...brands]);
      setName('');
      setDescription('');
    } catch {
      alert('Failed to create brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await fetchApi(`/organizations/${orgId}/brands/${id}`, { method: 'DELETE' });
      setBrands(brands.filter((b) => b.id !== id));
    } catch {
      alert('Failed to delete brand');
    }
  };

  if (isLoading) return <div>Loading brands...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-surface-900">Brands</h2>
          <p className="text-surface-500 mt-1">Manage your product brands.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create Brand</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nike"
                  required
                />
                <Input
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                />
                <Button type="submit" isLoading={isSubmitting} className="w-full">
                  Create
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-surface-500 py-8">
                      No brands found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  brands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell>{brand.description || '-'}</TableCell>
                      <TableCell>{new Date(brand.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleDelete(brand.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
