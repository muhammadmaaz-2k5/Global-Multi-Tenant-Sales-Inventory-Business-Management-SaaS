import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-red-600">ShopFlow Super Admin</h1>
        <div className="text-sm text-surface-500">Restricted Access</div>
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
