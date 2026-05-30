"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

// Define the shape of our invoice data based on your Supabase table
interface Invoice {
  id: string;
  client_name: string;
  amount: number;
  stripe_invoice_id: string;
  stripe_payment_url?: string; // Added this in case you want to link to the PDF here later
  status: string;
  created_at: string;
}

// Initialize Supabase on the client side
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function InvoiceDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  
  // Manual Override State
  const [isClearingId, setIsClearingId] = useState<string | null>(null);

  // 1. Fetch Real Invoices on Load
  useEffect(() => {
    async function fetchInvoices() {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setInvoices(data || []);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  // 2. The God Button Logic
  const handleOrchestrateAll = async () => {
    if (!confirm("Are you sure you want to trigger the master billing cycle for all active clients?")) return;
    
    setIsOrchestrating(true);
    
    try {
      const res = await fetch('/api/invoices/orchestrate', { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        alert(data.message);
        window.location.reload(); // Refresh to see the new invoices
      } else {
        alert("Orchestration encountered an error: " + data.error);
      }
    } catch (err) {
      alert("A system error occurred.");
    } finally {
      setIsOrchestrating(false);
    }
  };

  // 3. The Manual Override Engine
  const handleManualOverride = async (vaultInvoiceId: string, stripeInvoiceId: string) => {
    if (isClearingId) return; // Prevent double clicks
    setIsClearingId(vaultInvoiceId);

    try {
      const response = await fetch('/api/invoices/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vaultInvoiceId, stripeInvoiceId }),
      });

      if (!response.ok) throw new Error("Failed to manually clear ledger.");
      
      // Auto-refresh the dashboard to instantly show the green "paid" badge
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      alert("Error clearing the invoice manually.");
      setIsClearingId(null);
    }
  };

  // 4. Helper to format status badges dynamically
  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'received':
      case 'paid':
        return (
          <span className="inline-block px-3 py-1 border border-emerald-500/30 text-emerald-400 text-xs uppercase tracking-widest rounded-full bg-emerald-500/10">
            {status}
          </span>
        );
      case 'reminder sent':
        return (
          <span className="inline-block px-3 py-1 border border-amber-500/30 text-amber-400 text-xs uppercase tracking-widest rounded-full bg-amber-500/10">
            {status}
          </span>
        );
      default: // outstanding, generated, etc.
        return (
          <span className="inline-block px-3 py-1 border border-[#C59A6D]/30 text-[#C59A6D] text-xs uppercase tracking-widest rounded-full bg-[#C59A6D]/10">
            {status}
          </span>
        );
    }
  };

  // 5. Helper to group invoices by Month
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
    <div className="min-h-screen bg-[#080C16] text-[#F7F5F0] p-12 font-sans antialiased">
      
      <header className="flex justify-between items-end border-b border-white/10 pb-8 mb-12">
        <div>
          <Link href="/admin" className="text-gray-500 text-sm tracking-widest uppercase hover:text-[#C59A6D] transition-colors mb-4 inline-block">
            &larr; Back to Hub
          </Link>
          <h1 className="text-4xl serif">Invoice Ledger</h1>
        </div>
        
        <div className="flex space-x-4">
          <button className="border border-white/20 px-6 py-3 text-sm tracking-widest uppercase hover:border-white/50 transition-colors">
            + Single Invoice
          </button>
          
          <button 
            onClick={handleOrchestrateAll}
            disabled={isOrchestrating}
            className="bg-[#C59A6D] text-[#080C16] font-semibold px-8 py-3 text-sm tracking-widest uppercase hover:bg-transparent hover:text-[#C59A6D] border border-[#C59A6D] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOrchestrating ? 'Orchestrating...' : 'Orchestrate All Invoices'}
          </button>
        </div>
      </header>

      {/* Dynamic Ledger Output */}
      <div className="space-y-12">
        {isLoading ? (
          <div className="text-gray-500 text-center py-12 italic serif">Loading ledger...</div>
        ) : Object.keys(groupedInvoices).length === 0 ? (
          <div className="text-gray-500 text-center py-12 italic serif">No invoices found. Awaiting orchestration.</div>
        ) : (
          Object.entries(groupedInvoices).map(([monthYear, monthInvoices]) => (
            <section key={monthYear}>
              <h2 className="text-xl serif italic text-gray-400 mb-6 border-b border-white/5 pb-2 inline-block">
                {monthYear}
              </h2>
              
              <div className="bg-[#111726] border border-white/5 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs tracking-widest uppercase text-gray-500 border-b border-white/5">
                      <th className="p-6 font-light">Client</th>
                      <th className="p-6 font-light">Amount</th>
                      <th className="p-6 font-light">Stripe ID</th>
                      <th className="p-6 font-light text-right">Status / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    
                    {monthInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-6 font-medium tracking-wide">{invoice.client_name}</td>
                        <td className="p-6 font-light text-gray-300">
                          ${Number(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-6 font-mono text-xs text-gray-500">
                           {/* Show a truncated Stripe ID for clean UI */}
                          {invoice.stripe_invoice_id.substring(0, 14)}...
                        </td>
                        <td className="p-6">
                          <div className="flex justify-end items-center space-x-6">
                            {renderStatusBadge(invoice.status)}
                            
                            {/* The Override Button specifically aligned for the Master Ledger */}
                            {invoice.status !== 'paid' && (
                              <button 
                                onClick={() => handleManualOverride(invoice.id, invoice.stripe_invoice_id)}
                                disabled={isClearingId === invoice.id}
                                className="text-[10px] tracking-widest uppercase text-gray-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
                              >
                                {isClearingId === invoice.id ? 'Clearing...' : 'Mark Paid'}
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
          ))
        )}
      </div>

    </div>
  );
}