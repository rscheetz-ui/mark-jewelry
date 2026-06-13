'use client'
import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#05070A] text-white font-sans antialiased p-6 md:p-12 relative">
      
      {/* 🟢 TYPOGRAPHY INJECTION */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap');
        .display-font { font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; }
      `}} />

      {/* 🟢 TOP NAVIGATION HEADER */}
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-12 border-b border-[#27272A] pb-6">
        <div>
            <h1 className="text-3xl font-bold tracking-wider display-font">
              EARTHEN MINERS <span className="text-[#14B8A6]">DESIGNS</span>
            </h1>
            <p className="text-[#71717A] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Admin Control Panel</p>
        </div>
        <Link 
            href="/"
            className="bg-[#0A0C10] border border-[#27272A] hover:border-[#14B8A6] text-[#A1A1AA] hover:text-white px-6 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors"
        >
            &larr; Exit to Public Site
        </Link>
      </header>

      {/* 🟢 MAIN DASHBOARD MENU */}
      <div className="max-w-4xl mx-auto">
        
        {/* MASSIVE CURRENT BUILD ROUTING BANNER */}
        <div className="mb-12">
          <Link href="/admin/current-project" className="block bg-[#0A0C10] border border-[#14B8A6]/30 hover:border-[#14B8A6] p-8 rounded-sm group transition-colors relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#14B8A6]"></div>
              <h2 className="text-2xl display-font text-white group-hover:text-[#00F2FE] transition-colors">Current Build: Live Feed</h2>
              <p className="text-[#A1A1AA] text-sm mt-2 font-light">Update the workbench slideshow, post livestreams, or finalize the current piece.</p>
              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[#14B8A6] display-font text-xl transition-transform group-hover:translate-x-2">&rarr;</span>
          </Link>
        </div>

        {/* STANDARD MENU GRID */}
        <div className="grid md:grid-cols-3 gap-6">
            
            {/* 🟢 NEW ROUTE: MANUAL VAULT ENTRY */}
            <Link href="/admin/add-piece" className="bg-[#0A0C10] border border-[#27272A] hover:border-[#B59A54] p-10 flex flex-col items-center justify-center rounded-sm transition-all group text-center cursor-pointer">
                <span className="text-5xl mb-4 grayscale group-hover:grayscale-0 transition-all">⚒️</span>
                <h2 className="text-xl display-font group-hover:text-[#B59A54] transition-colors">Manual Vault Entry</h2>
                <p className="text-[#71717A] text-[10px] tracking-widest uppercase mt-2 font-bold">Add finished rings, pendants, etc.</p>
            </Link>

            {/* PLACEHOLDER: LEDGER */}
            <div className="bg-[#05070A] border border-[#27272A]/50 p-10 flex flex-col items-center justify-center rounded-sm transition-all text-center opacity-60">
                <span className="text-5xl mb-4 grayscale opacity-50">📄</span>
                <h2 className="text-xl display-font text-[#71717A]">The Ledger</h2>
                <p className="text-[#71717A] text-[10px] tracking-widest uppercase mt-2 font-bold">Invoices (Coming Soon)</p>
            </div>

            {/* PLACEHOLDER: CLIENTS */}
            <div className="bg-[#05070A] border border-[#27272A]/50 p-10 flex flex-col items-center justify-center rounded-sm transition-all text-center opacity-60">
                <span className="text-5xl mb-4 grayscale opacity-50">👥</span>
                <h2 className="text-xl display-font text-[#71717A]">Client Roster</h2>
                <p className="text-[#71717A] text-[10px] tracking-widest uppercase mt-2 font-bold">Customers (Coming Soon)</p>
            </div>
            
        </div>
      </div>
    </div>
  )
}