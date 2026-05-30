  "use client";

  import { useState, useEffect } from 'react';
  import Link from 'next/link';
  import NewClientModal from '@/components/admin/NewClientModal';
  import { createBrowserClient } from '@supabase/ssr';

  // 1. Define the Client Architecture shape
  interface Client {
    id: string;
    entity_name: string;
    business_division: string;
    status: string;
    months_billed: number;
    phase_1_amount: number;
    phase_1_duration_months: number;
    phase_2_amount: number;
  }

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  export default function ClientsDashboard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 3. Fetch the Roster on Load
    useEffect(() => {
      async function fetchClients() {
        try {
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          setClients(data || []);
        } catch (error) {
          console.error("Error fetching roster:", error);
        } finally {
          setIsLoading(false);
        }
      }
      fetchClients();
    }, []);

    // 4. Dynamic Financial Phase Calculator
    const getFinancialStatus = (client: Client) => {
      if (client.months_billed < client.phase_1_duration_months) {
        return {
          phaseText: `Phase I (Month ${client.months_billed + 1} of ${client.phase_1_duration_months})`,
          amount: client.phase_1_amount
        };
      } else {
        return {
          phaseText: 'Phase II (Performance Retainer)',
          amount: client.phase_2_amount
        };
      }
    };

    return (
      <div className="min-h-screen bg-[#080C16] text-[#F7F5F0] p-12 font-sans antialiased relative">
        
        {/* Header & Master Action */}
        <header className="flex justify-between items-end border-b border-white/10 pb-8 mb-12">
          <div>
            <Link href="/admin" className="text-gray-500 text-sm tracking-widest uppercase hover:text-[#C59A6D] transition-colors mb-4 inline-block">
              &larr; Back to Hub
            </Link>
            <h1 className="text-4xl serif">Client Architecture</h1>
          </div>
          
          <div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#C59A6D] text-[#080C16] font-semibold px-8 py-3 text-sm tracking-widest uppercase hover:bg-transparent hover:text-[#C59A6D] border border-[#C59A6D] transition-all"
            >
              + Configure New Client
            </button>
          </div>
        </header>

        {/* The Extracted Modal Component */}
        <NewClientModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />

        {/* Roster Ledger (Blurred when modal is open) */}
        <div className={`transition-all duration-500 ${isModalOpen ? 'blur-sm opacity-50 pointer-events-none' : ''}`}>
          <div className="bg-[#111726] border border-white/5 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs tracking-widest uppercase text-gray-500 border-b border-white/5">
                  <th className="p-6 font-light">Entity Name</th>
                  <th className="p-6 font-light">Division</th>
                  <th className="p-6 font-light">Financial Phase</th>
                  <th className="p-6 font-light">Current Retainer</th>
                  <th className="p-6 font-light text-right">Relational Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                
                {/* Dynamic Data Mapping */}
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500 italic serif">
                      Loading roster architecture...
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500 italic serif">
                      No active clients found. Configure a new client to begin.
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => {
                    const currentFinance = getFinancialStatus(client);
                    
                    return (
                      <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-6">
                          <div className="font-medium tracking-wide text-white">{client.entity_name}</div>
                          <div className="text-xs text-emerald-400 mt-1 capitalize">{client.status}</div>
                        </td>
                        <td className="p-6 text-[#C59A6D] text-xs tracking-widest uppercase font-semibold">
                          {client.business_division}
                        </td>
                        <td className="p-6 font-light text-gray-300">
                          {currentFinance.phaseText}
                        </td>
                        <td className="p-6 font-light text-gray-300 font-mono">
                          ${Number(currentFinance.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} / mo
                        </td>
                        <td className="p-6 text-right">
                          {/* Routes dynamically to the specific client's ID */}
                          <Link href={`/admin/clients/${client.id}`} className="text-sm tracking-widest uppercase text-gray-500 group-hover:text-[#C59A6D] transition-colors">
                            Open Card &rarr;
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}

              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  }