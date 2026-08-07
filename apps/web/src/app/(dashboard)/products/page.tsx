'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { fetchApi } from '@/lib/apiClient';

interface Category { id: string; name: string }
interface Brand { id: string; name: string }
interface Product {
  id: string;
  name: string;
  basePrice: number;
  sku: string;
  category: Category;
  brand: Brand;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  const [orgId, setOrgId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await fetchApi<{ memberships: { organizationId: string }[] }>('/users/me');
        const id = user.memberships[0]?.organizationId;
        if (id) {
          setOrgId(id);
          const [prodData, catData, brandData] = await Promise.all([
            fetchApi<Product[]>(`/organizations/${id}/products`),
            fetchApi<Category[]>(`/organizations/${id}/categories`),
            fetchApi<Brand[]>(`/organizations/${id}/brands`),
          ]);
          setProducts(prodData);
          setCategories(catData);
          setBrands(brandData);
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
      const newProduct = await fetchApi<Product>(`/organizations/${orgId}/products`, {
        method: 'POST',
        body: JSON.stringify({ 
          name, 
          basePrice: parseFloat(basePrice) || 0,
          sku,
          categoryId: categoryId || undefined,
          brandId: brandId || undefined
        }),
      });
      setProducts([newProduct, ...products]);
      setName('');
      setBasePrice('');
      setSku('');
    } catch {
      alert('Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetchApi(`/organizations/${orgId}/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter((p) => p.id !== id));
    } catch {
      alert('Failed to delete product');
    }
  };

  if (isLoading) return <div>Loading products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-surface-900">Products</h2>
          <p className="text-surface-500 mt-1">Manage your product catalog and variants.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add Product</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. T-Shirt"
                  required
                />
                <Input
                  label="Price"
                  type="number"
                  step="0.01"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
                <Input
                  label="SKU"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="TSHIRT-001"
                />
                
                <div className="flex flex-col space-y-1.5 w-full">
                  <label className="text-sm font-medium text-surface-900">Category</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Select Category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="flex flex-col space-y-1.5 w-full">
                  <label className="text-sm font-medium text-surface-900">Brand</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                  >
                    <option value="">Select Brand...</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
                  Create Product
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
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-surface-500 py-8">
                      No products found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku || '-'}</TableCell>
                      <TableCell>{product.category?.name || '-'}</TableCell>
                      <TableCell>{product.brand?.name || '-'}</TableCell>
                      <TableCell>${product.basePrice?.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleDelete(product.id)}
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
