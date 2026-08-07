import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-black tracking-widest text-primary-600">SHOPFLOW</div>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 font-medium text-surface-600 hover:text-primary-600 transition">
            Login
          </Link>
          <a href="#contact" className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
            Request Demo
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-surface-900 tracking-tight leading-tight mb-8">
          The Operating System for <br />
          <span className="text-primary-600">Multi-Store Retailers</span>
        </h1>
        <p className="text-xl text-surface-600 max-w-2xl mx-auto mb-12">
          Point of Sale, Inventory, Employees, and CRM—all unified in one lightning-fast, highly scalable platform designed for modern enterprise.
        </p>
        <a href="#contact" className="inline-block px-8 py-4 bg-primary-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-primary-700 transition-all transform hover:-translate-y-1">
          Talk to Sales
        </a>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 text-left">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-surface-200">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">📦</div>
            <h3 className="text-xl font-bold mb-3">Global Inventory</h3>
            <p className="text-surface-600">Track stock across unlimited stores and warehouses in real-time with automatic low-stock alerts.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-surface-200">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">💳</div>
            <h3 className="text-xl font-bold mb-3">Lightning POS</h3>
            <p className="text-surface-600">Hardware-ready Point of Sale with instant barcode scanning, thermal printing, and split payments.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-surface-200">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">🌍</div>
            <h3 className="text-xl font-bold mb-3">Enterprise Grade</h3>
            <p className="text-surface-600">Strict multi-tenant isolation, advanced RBAC, and fully customizable tax and currency structures.</p>
          </div>
        </div>

        {/* Contact/Demo Section */}
        <div id="contact" className="mt-32 max-w-2xl mx-auto bg-surface-900 text-white p-12 rounded-3xl">
          <h2 className="text-3xl font-black mb-4">Ready to upgrade your business?</h2>
          <p className="text-surface-300 mb-8">ShopFlow is exclusively available via our white-glove onboarding program. Contact us to provision your enterprise instance.</p>
          <a href="mailto:sales@shopflow.app" className="inline-block px-8 py-4 bg-white text-surface-900 text-lg font-bold rounded-xl hover:bg-surface-100 transition-colors">
            sales@shopflow.app
          </a>
        </div>
      </main>
    </div>
  );
}
