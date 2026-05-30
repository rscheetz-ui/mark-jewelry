"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

// 1. The Client Architecture
interface Client {
  id: string;
  entity_name: string;
  contact_email: string;
  business_division: string;
  status: string;
  months_billed: number;
  phase_1_amount: number;
  phase_1_duration_months: number;
  phase_2_amount: number;
  created_at: string;
  notes: string;
}

// 2. The Invoice Architecture
interface Invoice {
  id: string;
  amount: number;
  stripe_invoice_id: string;
  stripe_payment_url: string; // The golden ticket to the PDF
  status: string;
  created_at: string;
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function RelationalCard() {
  const params = useParams();
  const clientId = params.id as string;

  // Vault States
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDesc, setInvoiceDesc] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  
  // Notes State
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Manual Override State
  const [isClearingId, setIsClearingId] = useState<string | null>(null);

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
      
      // Refresh to show the green "paid" dot instantly
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      alert("Error clearing the invoice manually.");
      setIsClearingId(null);
    }
  };

  // SAFE FETCH: This will only run ONCE per client load.
  useEffect(() => {
    async function fetchEntityAndLedger() {
      if (!clientId) return;
      try {
        // A. Fetch Client Identity
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();

        if (clientError) throw clientError;
        setClient(clientData);
        setNotes(clientData.notes || '');

        // B. Fetch Client's Financial Directives
        if (clientData?.contact_email) {
          const { data: invoiceData, error: invoiceError } = await supabase
            .from('invoices')
            .select('*')
            .eq('client_email', clientData.contact_email)
            .order('created_at', { ascending: false });

          if (!invoiceError && invoiceData) {
            setInvoices(invoiceData);
          }
        }
      } catch (error) {
        console.error("Error fetching vault data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchEntityAndLedger();
  }, [clientId]); 

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const response = await fetch('/api/clients/update-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client?.id, notes }),
      });

      if (!response.ok) throw new Error('Failed to save directives.');
      
      // Optional: Show a brief success state or let the button text change
      setTimeout(() => setIsSavingNotes(false), 1000); 
    } catch (error) {
      console.error(error);
      alert("Error securing notes to the vault.");
      setIsSavingNotes(false);
    }
  };

  // The Dispatch Function
  const handleDispatchInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDispatching(true);

    try {
      const response = await fetch('/api/invoices/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client?.id,
          amount: Number(invoiceAmount),
          description: invoiceDesc,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to dispatch invoice.');
      }

      setInvoiceAmount('');
      setInvoiceDesc('');
      setIsInvoiceModalOpen(false);
      
      // Auto-refresh to instantly show the newly generated PDF link
      window.location.reload(); 

    } catch (error: any) {
      alert(`Dispatch Error: ${error.message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080C16] flex items-center justify-center text-[#C59A6D] text-sm tracking-widest uppercase font-semibold">
        Accessing Vault...
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-[#080C16] flex items-center justify-center text-gray-500 serif italic">
        Entity not found in the architecture.
      </div>
    );
  }

  const isPhaseI = client.months_billed < client.phase_1_duration_months;
  const currentPhase = isPhaseI ? 'Phase I: The Build' : 'Phase II: The Performance';
  const currentAmount = isPhaseI ? client.phase_1_amount : client.phase_2_amount;
  const progressPercentage = isPhaseI 
    ? (client.months_billed / client.phase_1_duration_months) * 100 
    : 100;

  return (
    <div className="min-h-screen bg-[#080C16] text-[#F7F5F0] p-12 font-sans antialiased relative">
      
      {/* --- INVOICE MODAL (Frosted Glass) --- */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080C16]/80 backdrop-blur-md transition-all duration-500">
          <div className="bg-[#111726] border border-white/10 rounded-xl p-10 w-full max-w-lg shadow-2xl relative">
            <button 
              onClick={() => setIsInvoiceModalOpen(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
              disabled={isDispatching}
            >
              &#x2715;
            </button>
            
            <h2 className="text-2xl serif mb-2">Dispatch Bespoke Invoice</h2>
            <p className="text-gray-400 font-light text-sm mb-8">Execute a one-off financial directive for {client.entity_name}.</p>

            <form onSubmit={handleDispatchInvoice} className="space-y-6">
              <div>
                <label className="block text-[#C59A6D] text-xs tracking-widest uppercase mb-2">Total Amount ($)</label>
                <input 
                  type="number" 
                  required
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  className="w-full bg-[#080C16] border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#C59A6D] transition-colors" 
                  placeholder="e.g. 1500" 
                />
              </div>
              <div>
                <label className="block text-[#C59A6D] text-xs tracking-widest uppercase mb-2">Directive / Description</label>
                <input 
                  type="text" 
                  required
                  value={invoiceDesc}
                  onChange={(e) => setInvoiceDesc(e.target.value)}
                  className="w-full bg-[#080C16] border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#C59A6D] transition-colors" 
                  placeholder="e.g. Custom Webhook Architecture" 
                />
              </div>
              
              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isDispatching}
                  className="bg-[#C59A6D] text-[#080C16] font-semibold px-8 py-3 text-sm tracking-widest uppercase hover:bg-transparent hover:text-[#C59A6D] border border-[#C59A6D] transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                  {isDispatching ? 'Orchestrating...' : 'Dispatch via Stripe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PAGE CONTENT --- */}
      <div className={`transition-all duration-500 ${isInvoiceModalOpen ? 'blur-sm opacity-50 pointer-events-none' : ''}`}>
        
        {/* ZONE 1: IDENTITY & TELEMETRY */}
        <header className="mb-12">
          <Link href="/admin/clients" className="text-gray-500 text-sm tracking-widest uppercase hover:text-[#C59A6D] transition-colors mb-6 inline-block">
            &larr; Return to Roster
          </Link>
          
          <div className="flex justify-between items-end border-b border-white/10 pb-8">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-[#C59A6D] text-xs tracking-widest uppercase font-semibold border border-[#C59A6D]/30 px-3 py-1 bg-[#C59A6D]/5 rounded-full">
                  {client.business_division}
                </span>
                <span className="text-emerald-400 text-xs tracking-widest uppercase font-semibold">
                  {client.status}
                </span>
              </div>
              <h1 className="text-5xl serif mb-1">{client.entity_name}</h1>
              <p className="text-gray-400 font-light text-sm">{client.contact_email}</p>
            </div>

            <div className="flex space-x-4">
              <button 
                onClick={() => setIsInvoiceModalOpen(true)}
                className="border border-[#C59A6D]/50 text-[#C59A6D] px-6 py-3 text-xs tracking-widest uppercase hover:bg-[#C59A6D] hover:text-[#080C16] transition-all font-semibold"
              >
                Draft Invoice
              </button>
              <button className="bg-[#111726] text-gray-400 border border-white/10 px-6 py-3 text-xs tracking-widest uppercase hover:text-white transition-colors">
                Edit Architecture
              </button>
            </div>
          </div>
        </header>
        
        {/* --- MASTER GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ZONE 2: ACTION LOG & INSIGHTS */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#111726] border border-white/5 rounded-xl p-8">
              <h2 className="text-[#C59A6D] text-xs tracking-widest uppercase mb-6">Orchestrator's Notes</h2>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#080C16] border border-white/5 rounded-lg p-6 text-gray-300 font-light focus:outline-none focus:border-[#C59A6D]/50 transition-colors resize-none h-48"
                placeholder="Log session details, technical constraints, or upcoming directives here. This data remains locked in the vault..."
              />
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="text-xs tracking-widest uppercase text-gray-500 hover:text-[#C59A6D] transition-colors disabled:opacity-50"
                >
                  {isSavingNotes ? 'Securing...' : 'Save Directives'}
                </button>
              </div>
            </div>

            {/* THE NEW DYNAMIC TIMELINE */}
            <div className="bg-[#111726] border border-white/5 rounded-xl p-8">
              <h2 className="text-[#C59A6D] text-xs tracking-widest uppercase mb-6">Ledger & Timeline</h2>
              
              <div className="space-y-6">
                
                {invoices.length === 0 ? (
                  <p className="text-gray-500 text-sm font-light italic">No financial directives dispatched yet.</p>
                ) : (
                  invoices.map((inv) => (
                    <div key={inv.id} className="flex items-start space-x-4">
                      <div className={`w-2 h-2 rounded-full mt-2 ${inv.status === 'paid' ? 'bg-emerald-500' : 'bg-[#C59A6D]'}`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-white">
                            Invoice Dispatched <span className="font-mono text-xs text-gray-400 ml-2">${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          </p>
                          
                          {/* The Flex Container for proper button alignment */}
                          <div className="flex items-center space-x-4">
                            {inv.stripe_payment_url && (
                              <a 
                                href={inv.stripe_payment_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs tracking-widest uppercase text-[#C59A6D] hover:text-white transition-colors border border-[#C59A6D]/30 px-3 py-1 rounded-full bg-[#C59A6D]/5"
                              >
                                View Invoice
                              </a>
                            )}
                            
                            {inv.status !== 'paid' && (
                              <button 
                                onClick={() => handleManualOverride(inv.id, inv.stripe_invoice_id)}
                                disabled={isClearingId === inv.id}
                                className="text-xs tracking-widest uppercase text-gray-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
                              >
                                {isClearingId === inv.id ? 'Clearing...' : 'Mark Paid'}
                              </button>
                            )}
                          </div>

                        </div>
                        <div className="flex space-x-3 text-xs text-gray-500 mt-1">
                          <span>{new Date(inv.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="uppercase tracking-widest">{inv.status}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div className="flex items-start space-x-4 opacity-50 pt-4 border-t border-white/5">
                  <div className="w-2 h-2 rounded-full bg-gray-600 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Entity Architecture Configured</p>
                    <p className="text-xs text-gray-600 mt-1">{new Date(client.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ZONE 3: TELEMETRY & SANDBOX */}
          <div className="space-y-8">
            <div className="bg-[#111726] border border-white/5 rounded-xl p-8">
              <h2 className="text-[#C59A6D] text-xs tracking-widest uppercase mb-6">Financial Lifecycle</h2>
              <div className="mb-6">
                <p className="text-gray-400 text-xs tracking-widest uppercase mb-1">Current Status</p>
                <p className="text-xl serif text-white">{currentPhase}</p>
              </div>
              <div className="mb-8">
                <p className="text-gray-400 text-xs tracking-widest uppercase mb-1">Active Retainer</p>
                <p className="text-2xl font-mono text-emerald-400">
                  ${Number(currentAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-sm text-gray-500 font-sans">/ mo</span>
                </p>
              </div>
              <div>
                <div className="flex justify-between text-xs tracking-widest text-gray-500 mb-2">
                  <span>Phase I Progress</span>
                  <span>{client.months_billed} / {client.phase_1_duration_months} Mos</span>
                </div>
                <div className="w-full bg-[#080C16] rounded-full h-1 overflow-hidden">
                  <div 
                    className="bg-[#C59A6D] h-1 transition-all duration-1000 ease-out" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-[#111726] border border-white/5 rounded-xl p-8">
              <h2 className="text-[#C59A6D] text-xs tracking-widest uppercase mb-6">Active Deployments</h2>
              {client.business_division === 'RCSuite' ? (
                <ul className="space-y-4 text-sm font-light text-gray-300">
                  <li className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span>Vercel Environment</span>
                    <span className="text-emerald-400 text-xs">Healthy</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span>Supabase Vault</span>
                    <span className="text-emerald-400 text-xs">Secure</span>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-4 text-sm font-light text-gray-300">
                  <li className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span>Ad Account Link</span>
                    <span className="text-emerald-400 text-xs">Active</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span>Funnel Analytics</span>
                    <span className="text-emerald-400 text-xs">Syncing</span>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}