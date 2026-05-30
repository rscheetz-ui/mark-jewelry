"use client";

import { useState, FormEvent } from 'react';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewClientModal({ isOpen, onClose }: NewClientModalProps) {
  // The Architecture State
  const [division, setDivision] = useState<'RCSuite' | 'RCServices'>('RCSuite');
  const [entityName, setEntityName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phase1Amount, setPhase1Amount] = useState('');
  const [phase1Duration, setPhase1Duration] = useState('');
  const [phase2Amount, setPhase2Amount] = useState('');
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/clients/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityName,
          contactEmail,
          division,
          phase1Amount: Number(phase1Amount),
          phase1Duration: Number(phase1Duration),
          phase2Amount: Number(phase2Amount),
        }),
      });

      // --- THE DIAGNOSTIC UPGRADE ---
      const responseData = await response.json();

      if (!response.ok) {
        // This forces the EXACT database error to show up in the browser
        console.error("Vault Rejection Details:", responseData); 
        throw new Error(responseData.error || 'Failed to orchestrate client.');
      }
      // ------------------------------

      // Reset form and close modal on success
      setEntityName('');
      setContactEmail('');
      setPhase1Amount('');
      setPhase1Duration('');
      setPhase2Amount('');
      setIsSubmitting(false);
      onClose();
      
      // Refresh the page to show the new client in the table
      window.location.reload(); 

    } catch (error: any) {
      console.error(error);
      setIsSubmitting(false);
      // The alert will now print the raw database error so we can fix it
      alert(`Vault Error: ${error.message}`); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080C16]/70 backdrop-blur-md transition-all duration-500">
      
      <div className="bg-[#111726] border border-white/10 rounded-xl p-10 w-full max-w-2xl shadow-2xl relative">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
          disabled={isSubmitting}
        >
          &#x2715;
        </button>

        <h2 className="text-3xl serif mb-2">Financial Lifecycle</h2>
        <p className="text-gray-400 font-light text-sm mb-8">Establish the entity details and the two-tier orchestration billing.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Entity Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[#C59A6D] text-xs tracking-widest uppercase mb-2">Entity Name</label>
              <input 
                type="text" 
                required
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                className="w-full bg-[#080C16] border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#C59A6D] transition-colors" 
                placeholder="e.g. Wayne Enterprises" 
              />
            </div>
            <div>
              <label className="block text-[#C59A6D] text-xs tracking-widest uppercase mb-2">Primary Email</label>
              <input 
                type="email" 
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-[#080C16] border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#C59A6D] transition-colors" 
                placeholder="bruce@wayne.com" 
              />
            </div>
          </div>

          {/* Business Division Toggle */}
          <div>
            <label className="block text-[#C59A6D] text-xs tracking-widest uppercase mb-2">Business Division</label>
            <div className="flex space-x-4">
              <button 
                type="button"
                onClick={() => setDivision('RCSuite')}
                className={`flex-1 py-3 text-sm tracking-widest uppercase transition-all border ${division === 'RCSuite' ? 'border-[#C59A6D] text-[#C59A6D] bg-[#C59A6D]/5' : 'border-white/10 text-gray-500 hover:border-white/30'}`}
              >
                RCSuite
              </button>
              <button 
                type="button"
                onClick={() => setDivision('RCServices')}
                className={`flex-1 py-3 text-sm tracking-widest uppercase transition-all border ${division === 'RCServices' ? 'border-[#C59A6D] text-[#C59A6D] bg-[#C59A6D]/5' : 'border-white/10 text-gray-500 hover:border-white/30'}`}
              >
                RCServices
              </button>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Tier 1: The Build */}
          <div>
            <h3 className="text-lg serif text-white mb-4">Phase I: The Build</h3>
            <div className="grid grid-cols-2 gap-6 items-center">
              <div>
                <label className="block text-gray-500 text-xs tracking-widest uppercase mb-2">Monthly Installment ($)</label>
                <input 
                  type="number" 
                  value={phase1Amount}
                  onChange={(e) => setPhase1Amount(e.target.value)}
                  className="w-full bg-[#080C16] border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#C59A6D] transition-colors" 
                  placeholder="5000" 
                />
              </div>
              <div>
                <label className="block text-gray-500 text-xs tracking-widest uppercase mb-2">Duration (Months)</label>
                <input 
                  type="number" 
                  value={phase1Duration}
                  onChange={(e) => setPhase1Duration(e.target.value)}
                  className="w-full bg-[#080C16] border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#C59A6D] transition-colors" 
                  placeholder="3" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center my-2 text-[#C59A6D] opacity-50">
            &darr;
          </div>

          {/* Tier 2: The Retainer */}
          <div>
            <h3 className="text-lg serif text-white mb-4">Phase II: The Performance</h3>
            <div>
              <label className="block text-gray-500 text-xs tracking-widest uppercase mb-2">Ongoing Retainer / Hosting ($)</label>
              <input 
                type="number" 
                value={phase2Amount}
                onChange={(e) => setPhase2Amount(e.target.value)}
                className="w-full bg-[#080C16] border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#C59A6D] transition-colors" 
                placeholder="500" 
              />
              <p className="text-xs text-gray-600 mt-2 italic">This amount will automatically trigger after Phase I concludes.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 flex justify-end space-x-4">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="px-6 py-3 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#C59A6D] text-[#080C16] font-semibold px-8 py-3 text-sm tracking-widest uppercase hover:bg-transparent hover:text-[#C59A6D] border border-[#C59A6D] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Orchestrating...' : 'Commit & Close'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}