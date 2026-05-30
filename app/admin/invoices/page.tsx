"use client";

import { useState } from 'react';
import Link from 'next/link';

// Simplified interface for our dummy data
interface Invoice {
  id: string;
  client_name: string;
  amount: number;
  item: string;
  status: string;
  created_at: string;
}

// 🟢 STATIC DUMMY DATA (Replaces Supabase)
const DUMMY_INVOICES: Invoice[] = [
  { id: 'inv_001', client_name: 'J. "Bear" Thompson', amount: 240.00, item: 'The Asphalt Signet', status: 'paid', created_at: '2026-05-28T10:00:00Z' },
  { id: 'inv_002', client_name: 'Sarah M.', amount: 450.00, item: 'In Memory Of... Epoxy Pendant', status: 'outstanding', created_at: '2026-05-25T14:30:00Z' },
  { id: 'inv_003', client_name: 'Marcus R.', amount: 275.00, item: 'Labradorite Flash Ring (Custom)', status: 'reminder sent', created_at: '2026-05-20T09:15:00Z' },
  { id: 'inv_004', client_name: 'David T.', amount: 185.00, item: 'Raw Onyx Pendant', status: 'paid', created_at: '2026-04-15T11:00:00Z' },
];

export default function InvoiceDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>(DUMMY_INVOICES);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClearingId, setIsClearingId] = useState<string | null>(null);

  // 🟢 DUMMY BULK ACTION LOGIC
  const handleIssuePending = async () => {
    if (!confirm("Are you sure you want to send out bills for all pending forge work?")) return;
    
    setIsProcessing(true);
    
    // Simulate network delay
    setTimeout(() => {
      alert("All pending invoices have been dispatched to clients.");
      setIsProcessing(false);
    }, 1500);
  };

  // 🟢 DUMMY OVERRIDE LOGIC (Updates local state visually)
  const handleManualOverride = (invoiceId: string) => {
    if (isClearingId) return;
    setIsClearingId(invoiceId);

    setTimeout(() => {
      setInvoices(prev => 
        prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'paid' } : inv)
      );
      setIsClearingId(null);
    }, 800);
  };

  // 🟢 LABRADORITE THEMED BADGES
  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'received':
      case 'paid':
        return (
          <span className="inline-block px-3 py-1 border border-[#14B8A6]/30 text-[#14B8A6] text-[10px] uppercase tracking-widest rounded-sm bg-[#14B8A6]/10 font-bold">
            {status}
          </span>
        );
      case 'reminder sent':
        return (
          <span className="inline-block px-3 py-1 border border-red-900/50 text-red-500 text-[10px] uppercase tracking-widest rounded-sm bg-red-950/30 font-bold">
            {status}
          </span>
        );
      default: // outstanding, generated, etc.
        return (
          <span className="inline-block px-3 py-1 border border-[#B59A54]/30 text-[#B59A54] text-[10px] uppercase tracking-widest rounded-sm bg-[#B59A54]/10 font-bold">
            {status}
          </span>
        );
    }
  };

  // Group invoices by Month for display
  const groupedInvoices = invoices.reduce((groups, invoice) => {
    const date = new Date(invoice.created_at);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(invoice);
    return groups;
  }, {} as Record<string, Invoice[]>);

  return (
    <div className="min-h-screen bg-[#05070A] text-[#E0E6ED] p-6 md:p-12 font-sans antialiased relative">
      
      {/* 🟢 TYPOGRAPHY INJECTION */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Inter:wght@300;400;600;800&display=swap');
        .display-font { font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; }
        .noise-bg {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
            pointer-events: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0;
        }
      `}} />
      <div className="noise-bg"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8 mb-12 gap-6">
          <div>
            <Link href="/admin" className="text-[#71717A] text-[10px] font-bold tracking-[0.2em] uppercase hover:text-[#14B8A6] transition-colors mb-4 inline-block">
              &larr; Back to Workbench
            </Link>
            <h1 className="text-4xl md:text-5xl display-font text-white">The Ledger</h1>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button className="border border-[#27272A] px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover:border-[#14B8A6] transition-colors bg-[#0A0C10] text-[#A1A1AA] hover:text-white rounded-sm">
              + Draft Invoice
            </button>
            
            <button 
              onClick={handleIssuePending}
              disabled={isProcessing}
              className="bg-[#B59A54] text-black font-bold px-8 py-3 text-[10px] tracking-[0.2em] uppercase hover:bg-transparent hover:text-[#B59A54] border border-[#B59A54] transition-all disabled:opacity-50 disabled:cursor-wait rounded-sm"
            >
              {isProcessing ? 'Transmitting...' : 'Issue Pending Bills'}
            </button>
          </div>
        </header>

        {/* Dynamic Ledger Output */}
        <div className="space-y-12">
          {Object.entries(groupedInvoices).map(([monthYear, monthInvoices]) => (
            <section key={monthYear}>
              <h2 className="text-xl display-font text-[#71717A] mb-6 border-b border-[#27272A] pb-2 inline-block">
                {monthYear}
              </h2>
              
              <div className="bg-[#0A0C10] border border-[#27272A] rounded-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#71717A] border-b border-[#27272A] bg-[#05070A]">
                      <th className="p-6">Client & Build</th>
                      <th className="p-6">Amount</th>
                      <th className="p-6">Invoice ID</th>
                      <th className="p-6 text-right">Status / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A]">
                    
                    {monthInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-6">
                            <div className="font-bold text-white tracking-wide">{invoice.client_name}</div>
                            <div className="text-xs text-[#A1A1AA] font-light mt-1">{invoice.item}</div>
                        </td>
                        <td className="p-6 font-light text-[#E0E6ED] text-lg">
                          ${Number(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-6 font-mono text-xs text-[#71717A]">
                          {invoice.id}
                        </td>
                        <td className="p-6">
                          <div className="flex justify-end items-center space-x-6">
                            {renderStatusBadge(invoice.status)}
                            
                            {/* The Override Button */}
                            {invoice.status !== 'paid' && (
                              <button 
                                onClick={() => handleManualOverride(invoice.id)}
                                disabled={isClearingId === invoice.id}
                                className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#71717A] hover:text-[#14B8A6] transition-colors disabled:opacity-50"
                              >
                                {isClearingId === invoice.id ? 'Striking...' : 'Mark Paid'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}