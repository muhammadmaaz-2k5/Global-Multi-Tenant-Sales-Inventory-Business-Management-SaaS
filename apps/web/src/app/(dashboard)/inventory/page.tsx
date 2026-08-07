'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { fetchApi } from '@/lib/apiClient';

interface Location { id: string; name: string }
interface Variant { id: string; name: string; product: { name: string } }
interface InventoryLevel {
  id: string;
  quantity: number;
  location: Location;
  variant: Variant;
}

export default function InventoryPage() {
  const [levels, setLevels] = useState<InventoryLevel[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [orgId, setOrgId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Adjust stock form state
  const [variantId, setVariantId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // We should ideally fetch all variants, but for simplicity we'll just extract from levels or let user type ID.
  // In a real app, you'd have a Variant Selector component. We'll use a simple text input for variant ID for now.

  const loadData = async () => {
    try {
      const user = await fetchApi<{ memberships: { organizationId: string }[] }>('/users/me');
      const id = user.memberships[0]?.organizationId;
      if (id) {
        setOrgId(id);
        const [locs, inv] = await Promise.all([
          fetchApi<Location[]>(`/organizations/${id}/locations`),
          fetchApi<InventoryLevel[]>(`/organizations/${id}/inventory`),
        ]);
        setLocations(locs);
        setLevels(inv);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      await loadData();
    }
    init();
  }, []);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setIsSubmitting(true);
    
    try {
      await fetchApi(`/organizations/${orgId}/inventory/adjust`, {
        method: 'POST',
        body: JSON.stringify({ 
          locationId, 
          variantId, 
          quantity: parseInt(quantity, 10),
          reason: 'Manual Adjustment'
        }),
      });
      await loadData();
      setVariantId('');
      setQuantity('');
    } catch {
      alert('Failed to adjust inventory. Make sure the Variant ID is valid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Loading inventory...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-surface-900">Inventory</h2>
          <p className="text-surface-500 mt-1">Track and adjust stock levels.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Adjust Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdjust} className="space-y-4">
                
                <div className="flex flex-col space-y-1.5 w-full">
                  <label className="text-sm font-medium text-surface-900">Location</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    required
                  >
                    <option value="">Select Location...</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>

                <Input
                  label="Variant ID (UUID)"
                  value={variantId}
                  onChange={(e) => setVariantId(e.target.value)}
                  placeholder="Paste Variant ID"
                  required
                />
                
                <Input
                  label="Quantity (+ to add, - to deduct)"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="10"
                  required
                />
                
                <Button type="submit" isLoading={isSubmitting} className="w-full">
                  Adjust Inventory
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
                  <TableHead>Location</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {levels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-surface-500 py-8">
                      No inventory records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  levels.map((level) => (
                    <TableRow key={level.id}>
                      <TableCell className="font-medium">{level.location.name}</TableCell>
                      <TableCell>{level.variant.product.name}</TableCell>
                      <TableCell>
                        {level.variant.name} <br/>
                        <span className="text-xs text-surface-400 font-mono">{level.variant.id}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`px-2 py-1 rounded-full font-bold text-sm ${level.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {level.quantity}
                        </span>
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
