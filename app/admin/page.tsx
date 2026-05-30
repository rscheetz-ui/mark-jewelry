'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  // 🟢 ROUTING STATE
  const [activeTab, setActiveTab] = useState('dashboard');

  // 🟢 FORM STATES
  const [category, setCategory] = useState('');
  const [pieceType, setPieceType] = useState('');
  const [primaryPhoto, setPrimaryPhoto] = useState<string | null>(null);
  const [secondaryPhoto, setSecondaryPhoto] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // 🟢 MOCK IMAGE UPLOAD (UI Only for now)
  const handleSimulatedUpload = (type: 'primary' | 'secondary') => {
    // In the future, this will trigger the crop modal and Supabase bucket upload
    setIsCropping(true);
    setTimeout(() => {
      setIsCropping(false);
      if (type === 'primary') setPrimaryPhoto('uploaded-primary.jpg');
      if (type === 'secondary') setSecondaryPhoto('uploaded-secondary.jpg');
    }, 1500);
  }

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
        {activeTab !== 'dashboard' && (
            <button 
                onClick={() => setActiveTab('dashboard')}
                className="bg-[#0A0C10] border border-[#27272A] hover:border-[#14B8A6] text-[#A1A1AA] hover:text-white px-6 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
                &larr; Back to Dashboard
            </button>
        )}
      </header>

      {/* 🟢 MAIN DASHBOARD MENU */}
      {activeTab === 'dashboard' && (
        <div className="max-w-4xl mx-auto">
          
          {/* MASSIVE CURRENT BUILD ROUTING BANNER */}
          <div className="mb-12">
            <Link href="/admin/current-project" className="block bg-[#0A0C10] border border-[#14B8A6]/30 hover:border-[#14B8A6] p-8 rounded-sm group transition-colors relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#14B8A6]"></div>
                <h2 className="text-2xl display-font text-white group-hover:text-[#00F2FE] transition-colors">Current Build: Live Feed</h2>
                <p className="text-[#A1A1AA] text-sm mt-2 font-light">Update the workbench slideshow on the homepage with your latest progress.</p>
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[#14B8A6] display-font text-xl">&rarr;</span>
            </Link>
          </div>

          {/* STANDARD MENU GRID */}
          <div className="grid md:grid-cols-3 gap-6">
              <button onClick={() => setActiveTab('add-piece')} className="bg-[#0A0C10] border border-[#27272A] hover:border-[#B59A54] p-10 flex flex-col items-center justify-center rounded-sm transition-all group">
                  <span className="text-5xl mb-4 grayscale group-hover:grayscale-0 transition-all">⚒️</span>
                  <h2 className="text-xl display-font">Add New Piece</h2>
                  <p className="text-[#71717A] text-xs tracking-widest uppercase mt-2 font-bold">Rings, Pendants, etc.</p>
              </button>

              <button onClick={() => setActiveTab('invoices')} className="bg-[#0A0C10] border border-[#27272A] hover:border-[#14B8A6] p-10 flex flex-col items-center justify-center rounded-sm transition-all group">
                  <span className="text-5xl mb-4 grayscale group-hover:grayscale-0 transition-all">📄</span>
                  <h2 className="text-xl display-font">The Ledger</h2>
                  <p className="text-[#71717A] text-xs tracking-widest uppercase mt-2 font-bold">Manage Invoices.</p>
              </button>

              <button onClick={() => setActiveTab('clients')} className="bg-[#0A0C10] border border-[#27272A] hover:border-[#00F2FE] p-10 flex flex-col items-center justify-center rounded-sm transition-all group">
                  <span className="text-5xl mb-4 grayscale group-hover:grayscale-0 transition-all">👥</span>
                  <h2 className="text-xl display-font">Client Roster</h2>
                  <p className="text-[#71717A] text-xs tracking-widest uppercase mt-2 font-bold">View Customers.</p>
              </button>
          </div>
        </div>
      )}

      {/* 🟢 ADD NEW PIECE FORM */}
      {activeTab === 'add-piece' && (
        <div className="max-w-3xl mx-auto space-y-12 pb-24">
            
            {/* STEP 1: CATEGORY */}
            <div className="bg-[#0A0C10] p-8 border border-[#27272A] rounded-sm shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#B59A54]"></div>
                <h2 className="text-2xl display-font mb-6 text-white">Step 1: Classification</h2>
                <label className="block text-[#71717A] uppercase tracking-[0.2em] text-[10px] font-bold mb-3">Select Category</label>
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#05070A] border border-[#27272A] text-white text-lg p-4 rounded-sm focus:border-[#B59A54] focus:outline-none transition-colors"
                >
                    <option value="">-- Click to Choose --</option>
                    <option value="heavyweight">Heavyweight Rings</option>
                    <option value="raw-stone">Raw Stone Craftsmanship</option>
                    <option value="memory">In Memory Of... (Epoxy/Ashes)</option>
                    <option value="commission">Commissioned Pieces</option>
                    <option value="vault">The Vault (Limited)</option>
                </select>
            </div>

            {/* STEP 2: PHOTOS */}
            <div className="bg-[#0A0C10] p-8 border border-[#27272A] rounded-sm shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#B59A54]"></div>
                <h2 className="text-2xl display-font mb-6 text-white">Step 2: Workbench Imagery</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Primary Photo */}
                    <div>
                        <label className="block text-[#71717A] uppercase tracking-[0.2em] text-[10px] font-bold mb-3">Primary Photo (Required)</label>
                        {!primaryPhoto ? (
                            <button 
                                onClick={() => handleSimulatedUpload('primary')}
                                className="w-full h-48 border-2 border-dashed border-[#27272A] hover:border-[#B59A54] bg-[#05070A] flex flex-col items-center justify-center rounded-sm transition-colors text-[#71717A] hover:text-white"
                            >
                                <span className="text-3xl mb-2">📸</span>
                                {isCropping ? 'Loading Crop Tool...' : 'Click to Add Primary Photo'}
                            </button>
                        ) : (
                            <div className="w-full h-48 bg-[#0A0C10] border-2 border-[#14B8A6] rounded-sm flex items-center justify-center flex-col relative">
                                <span className="text-[#14B8A6] text-4xl mb-2">✓</span>
                                <span className="font-bold tracking-widest uppercase text-xs text-[#14B8A6]">Photo Saved</span>
                                <button onClick={() => setPrimaryPhoto(null)} className="absolute bottom-4 text-[10px] uppercase tracking-widest text-red-500 hover:text-red-400 underline">Remove</button>
                            </div>
                        )}
                    </div>

                    {/* Secondary Photo */}
                    <div>
                        <label className="block text-[#71717A] uppercase tracking-[0.2em] text-[10px] font-bold mb-3">Secondary Photo (Optional)</label>
                        {!secondaryPhoto ? (
                            <button 
                                onClick={() => handleSimulatedUpload('secondary')}
                                className="w-full h-48 border-2 border-dashed border-[#27272A] hover:border-[#B59A54] bg-[#05070A] flex flex-col items-center justify-center rounded-sm transition-colors text-[#71717A] hover:text-white"
                            >
                                <span className="text-3xl mb-2">📸</span>
                                {isCropping ? 'Loading Crop Tool...' : 'Click to Add Another Photo'}
                            </button>
                        ) : (
                            <div className="w-full h-48 bg-[#0A0C10] border-2 border-[#14B8A6] rounded-sm flex items-center justify-center flex-col relative">
                                <span className="text-[#14B8A6] text-4xl mb-2">✓</span>
                                <span className="font-bold tracking-widest uppercase text-xs text-[#14B8A6]">Photo Saved</span>
                                <button onClick={() => setSecondaryPhoto(null)} className="absolute bottom-4 text-[10px] uppercase tracking-widest text-red-500 hover:text-red-400 underline">Remove</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* STEP 3: SPECIFICS */}
            <div className="bg-[#0A0C10] p-8 border border-[#27272A] rounded-sm shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#B59A54]"></div>
                <h2 className="text-2xl display-font mb-6 text-white">Step 3: Metallurgy & Specs</h2>
                
                <label className="block text-[#71717A] uppercase tracking-[0.2em] text-[10px] font-bold mb-3">What kind of piece is this?</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {['Ring', 'Pendant', 'Raw Stone', 'Other'].map((type) => (
                        <button 
                            key={type}
                            onClick={() => setPieceType(type)}
                            className={`p-4 border rounded-sm text-sm font-bold tracking-widest uppercase transition-all ${pieceType === type ? 'bg-[#B59A54] text-black border-[#B59A54]' : 'bg-[#05070A] text-[#A1A1AA] border-[#27272A] hover:border-[#71717A]'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* 🟢 DYNAMIC FIELDS BASED ON TYPE */}
                <div className="space-y-6 border-t border-[#27272A] pt-8">
                    
                    {/* If Ring is Selected */}
                    {pieceType === 'Ring' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[#71717A] uppercase tracking-[0.2em] text-[10px] font-bold mb-2">Ring Size</label>
                                <input type="text" placeholder="e.g. Size 10" className="w-full bg-[#05070A] border border-[#27272A] p-4 rounded-sm text-white focus:border-[#B59A54] outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[#71717A] uppercase tracking-[0.2em] text-[10px] font-bold mb-2">Silver Weight (Grams)</label>
                                <input type="text" placeholder="e.g. 42g" className="w-full bg-[#05070A] border border-[#27272A] p-4 rounded-sm text-white focus:border-[#B59A54] outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[#71717A] uppercase tracking-[0.2em] text-[10px] font-bold mb-2">Stone Type</label>
                                <select className="w-full bg-[#05070A] border border-[#27272A] p-4 rounded-sm text-white focus:border-[#B59A54] outline-none transition-colors">
                                    <option>Genuine Earth-mined</option>
                                    <option>Lab-Grown / Man-made</option>
                                    <option>None (All Metal)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[#71717A] uppercase tracking-[0.2em] text-[10px] font-bold mb-2">Features / Texture</label>
                                <input type="text" placeholder="e.g. Hammered, Oxidized, Leaves..." className="w-full bg-[#05070A] border border-[#27272A] p-4 rounded-sm text-white focus:border-[#B59A54] outline-none transition-colors" />
                            </div>
                        </div>
                    )}

                    {/* If Pendant is Selected */}
                    {pieceType === 'Pendant' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[#71717A] uppercase tracking-[0.2em] text-[10px] font-bold mb-2">Silver Weight (Grams)</label>
                                <input type="text" placeholder="e.g. 28g" className="w-full bg-[#05070A] border border-[#27272A] p-4 rounded-sm text-white focus:border-[#B59A54] outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[#71717A] uppercase tracking-[0.2em] text-[10px] font-bold mb-2">Gemstone / Material</label>
                                <input type="text" placeholder="e.g. Raw Onyx, Epoxy Ash..." className="w-full bg-[#05070A] border border-[#27272A] p-4 rounded-sm text-white focus:border-[#B59A54] outline-none transition-colors" />
                            </div>
                        </div>
                    )}

                    {/* ALWAYS SHOW DESCRIPTION */}
                    <div className="pt-4">
                        <label className="block text-[#71717A] uppercase tracking-[0.2em] text-[10px] font-bold mb-2">Full Description</label>
                        <textarea 
                            rows={4} 
                            placeholder="Write the story of the piece here..." 
                            className="w-full bg-[#05070A] border border-[#27272A] p-4 rounded-sm text-white focus:border-[#B59A54] outline-none resize-none transition-colors"
                        ></textarea>
                    </div>

                </div>
            </div>

            {/* 🟢 FINAL SUBMIT BUTTON */}
            <button className="w-full bg-[#B59A54] hover:bg-transparent hover:text-[#B59A54] border border-[#B59A54] text-black display-font text-xl p-6 rounded-sm transition-all shadow-lg shadow-[#B59A54]/10">
                Forge & Publish Piece
            </button>
        </div>
      )}

      {/* 🟢 PLACEHOLDERS FOR OTHER TABS */}
      {activeTab === 'invoices' && (
          <div className="max-w-4xl mx-auto text-center mt-20">
              <h2 className="text-3xl display-font text-[#71717A]">Ledger System Coming Soon</h2>
          </div>
      )}

      {activeTab === 'clients' && (
          <div className="max-w-4xl mx-auto text-center mt-20">
              <h2 className="text-3xl display-font text-[#71717A]">Client Roster Coming Soon</h2>
          </div>
      )}

    </div>
  )
}