import Link from 'next/link';
import { ArrowRight, Terminal, BarChart2, Shield, Layers, Code, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30 font-sans overflow-hidden selection:text-white">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/20 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.05] bg-[#0a0a0a]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0a0a0a]/60">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-white leading-none">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">ShopFlow</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/dashboard" className="group flex items-center gap-2 text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-neutral-200 transition-all">
              Go to Dashboard
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-16 flex flex-col items-center justify-center min-h-[90vh] max-w-7xl mx-auto px-6 text-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-8 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-neutral-300">ShopFlow OS v2.0 is now live</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-medium tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6 leading-[1.1]">
          The operating system <br className="hidden md:block" />
          for modern retail.
        </h1>
        
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
          Point of Sale, Inventory, HR, and advanced Analytics—unified in one lightning-fast, highly scalable platform built for the enterprise.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/pos" className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2">
            Open POS Terminal <ArrowRight size={18} />
          </Link>
          <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-medium hover:bg-white/10 transition-colors flex items-center justify-center">
            View Features
          </a>
        </div>

        {/* Mockup / Terminal Window */}
        <div className="mt-20 w-full max-w-5xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="flex items-center px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            </div>
            <div className="mx-auto flex items-center gap-2 text-xs font-mono text-neutral-500">
              <Shield size={12} /> shopflow.app/pos
            </div>
          </div>
          <div className="p-8 aspect-[16/9] md:aspect-[21/9] flex items-center justify-center relative overflow-hidden">
             {/* Abstract POS UI representation */}
             <div className="absolute inset-0 grid grid-cols-12 gap-4 p-4 opacity-30 pointer-events-none">
                <div className="col-span-3 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-2 p-4">
                  <div className="w-full h-8 rounded bg-white/10" />
                  <div className="w-3/4 h-4 rounded bg-white/5" />
                  <div className="w-1/2 h-4 rounded bg-white/5" />
                </div>
                <div className="col-span-6 grid grid-cols-3 gap-4">
                   {[1,2,3,4,5,6,7,8,9].map(i => (
                     <div key={i} className="rounded-xl border border-white/10 bg-white/5 aspect-square" />
                   ))}
                </div>
                <div className="col-span-3 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-2 p-4 justify-end">
                  <div className="w-full h-12 rounded bg-indigo-500/20 border border-indigo-500/50" />
                </div>
             </div>
             
             <div className="z-10 flex flex-col items-center">
               <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 backdrop-blur-md">
                 <Terminal size={32} className="text-white" />
               </div>
               <p className="text-xl font-medium text-white">Hardware-accelerated rendering.</p>
               <p className="text-neutral-400 mt-2 font-mono text-sm">60fps POS checkouts.</p>
             </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tighter mb-4">Built for scale.</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto text-lg">Everything you need to manage one store, or one thousand stores.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                <Layers className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-xl font-medium mb-3 text-white">Global Inventory</h3>
              <p className="text-neutral-400 leading-relaxed text-sm">Track stock across unlimited stores and warehouses in real-time with automatic low-stock alerts and PO generation.</p>
            </div>
            
            <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6">
                <Zap className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-xl font-medium mb-3 text-white">Lightning POS</h3>
              <p className="text-neutral-400 leading-relaxed text-sm">Hardware-ready Point of Sale with instant barcode scanning, local caching, and offline-resilience.</p>
            </div>
            
            <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-6">
                <BarChart2 className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-medium mb-3 text-white">Deep Analytics</h3>
              <p className="text-neutral-400 leading-relaxed text-sm">Visualize gross profit, COGS, and pinpoint your top-performing products instantly via the executive dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 py-32 border-t border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-500/10" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter mb-6">Ready to upgrade?</h2>
          <p className="text-xl text-neutral-400 mb-10">ShopFlow is available via our white-glove onboarding program.</p>
          <a href="mailto:sales@shopflow.app" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-neutral-200 transition-colors">
            Contact Sales <Code size={18} />
          </a>
        </div>
      </section>

    </div>
  );
}
