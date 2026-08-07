'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { fetchApi } from '@/lib/apiClient';

interface Location {
  id: string;
  name: string;
  type: 'STORE' | 'WAREHOUSE';
  address: string;
  createdAt: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [orgId, setOrgId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'STORE' | 'WAREHOUSE'>('STORE');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await fetchApi<{ memberships: { organizationId: string }[] }>('/users/me');
        const id = user.memberships[0]?.organizationId;
        if (id) {
          setOrgId(id);
          const data = await fetchApi<Location[]>(`/organizations/${id}/locations`);
          setLocations(data);
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
      const newLoc = await fetchApi<Location>(`/organizations/${orgId}/locations`, {
        method: 'POST',
        body: JSON.stringify({ name, type, address }),
      });
      setLocations([newLoc, ...locations]);
      setName('');
      setAddress('');
      setType('STORE');
    } catch {
      alert('Failed to create location');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    try {
      await fetchApi(`/organizations/${orgId}/locations/${id}`, { method: 'DELETE' });
      setLocations(locations.filter((l) => l.id !== id));
    } catch {
      alert('Failed to delete location');
    }
  };

  if (isLoading) return <div>Loading locations...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-surface-900">Locations</h2>
          <p className="text-surface-500 mt-1">Manage your Stores and Warehouses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add Location</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Downtown Store"
                  required
                />
                
                <div className="flex flex-col space-y-1.5 w-full">
                  <label className="text-sm font-medium text-surface-900">Type</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={type}
                    onChange={(e) => setType(e.target.value as 'STORE' | 'WAREHOUSE')}
                  >
                    <option value="STORE">Store</option>
                    <option value="WAREHOUSE">Warehouse</option>
                  </select>
                </div>

                <Input
                  label="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St..."
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
                  <TableHead>Type</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-surface-500 py-8">
                      No locations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  locations.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell className="font-medium">{loc.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${loc.type === 'WAREHOUSE' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                          {loc.type}
                        </span>
                      </TableCell>
                      <TableCell>{loc.address || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleDelete(loc.id)}
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
