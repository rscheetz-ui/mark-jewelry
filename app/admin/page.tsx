'use client'
import { useState } from 'react'

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
    <div className="min-h-screen bg-[#121212] text-white font-sans antialiased p-6 md:p-12">
      
      {/* 🟢 TOP NAVIGATION HEADER */}
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
        <div>
            <h1 className="text-3xl font-bold tracking-wider">Earthen Miners Designs</h1>
            <p className="text-gray-400 text-sm uppercase tracking-widest mt-1">Admin Control Panel</p>
        </div>
        {activeTab !== 'dashboard' && (
            <button 
                onClick={() => setActiveTab('dashboard')}
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded text-sm font-bold uppercase tracking-wider transition-colors"
            >
                &larr; Back to Dashboard
            </button>
        )}
      </header>

      {/* 🟢 MAIN DASHBOARD MENU */}
      {activeTab === 'dashboard' && (
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            <button onClick={() => setActiveTab('add-piece')} className="bg-[#1A1A1A] border border-gray-800 hover:border-[#B59A54] p-10 flex flex-col items-center justify-center rounded-lg transition-all">
                <span className="text-5xl mb-4">⚒️</span>
                <h2 className="text-2xl font-bold">Add New Piece</h2>
                <p className="text-gray-400 text-sm mt-2">Upload rings, pendants, etc.</p>
            </button>

            <button onClick={() => setActiveTab('invoices')} className="bg-[#1A1A1A] border border-gray-800 hover:border-[#14B8A6] p-10 flex flex-col items-center justify-center rounded-lg transition-all">
                <span className="text-5xl mb-4">📄</span>
                <h2 className="text-2xl font-bold">Invoices</h2>
                <p className="text-gray-400 text-sm mt-2">Manage orders & billing.</p>
            </button>

            <button onClick={() => setActiveTab('clients')} className="bg-[#1A1A1A] border border-gray-800 hover:border-[#00F2FE] p-10 flex flex-col items-center justify-center rounded-lg transition-all">
                <span className="text-5xl mb-4">👥</span>
                <h2 className="text-2xl font-bold">Client List</h2>
                <p className="text-gray-400 text-sm mt-2">View customer details.</p>
            </button>
        </div>
      )}

      {/* 🟢 ADD NEW PIECE FORM */}
      {activeTab === 'add-piece' && (
        <div className="max-w-3xl mx-auto space-y-12 pb-24">
            
            {/* STEP 1: CATEGORY */}
            <div className="bg-[#1A1A1A] p-8 border border-gray-800 rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-[#B59A54]">Step 1: Where does this go?</h2>
                <label className="block text-gray-400 uppercase tracking-widest text-xs font-bold mb-3">Select Category</label>
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 text-white text-lg p-4 rounded focus:border-[#B59A54] focus:outline-none"
                >
                    <option value="">-- Click to Choose --</option>
                    <option value="current">Current Project (Will overwrite the homepage live feed)</option>
                    <option value="heavyweight">Heavyweight Rings</option>
                    <option value="raw-stone">Raw Stone Craftsmanship</option>
                    <option value="memory">In Memory Of... (Epoxy/Ashes)</option>
                    <option value="commission">Commissioned Pieces</option>
                    <option value="vault">The Vault (Limited)</option>
                </select>
            </div>

            {/* STEP 2: PHOTOS */}
            <div className="bg-[#1A1A1A] p-8 border border-gray-800 rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-[#B59A54]">Step 2: Add Photos</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Primary Photo */}
                    <div>
                        <label className="block text-gray-400 uppercase tracking-widest text-xs font-bold mb-3">Primary Photo (Required)</label>
                        {!primaryPhoto ? (
                            <button 
                                onClick={() => handleSimulatedUpload('primary')}
                                className="w-full h-48 border-2 border-dashed border-gray-600 hover:border-[#B59A54] bg-[#242424] flex flex-col items-center justify-center rounded transition-colors text-gray-400 hover:text-white"
                            >
                                <span className="text-3xl mb-2">📸</span>
                                {isCropping ? 'Loading Crop Tool...' : 'Click to Add Primary Photo'}
                            </button>
                        ) : (
                            <div className="w-full h-48 bg-gray-800 border-2 border-green-500 rounded flex items-center justify-center flex-col relative">
                                <span className="text-green-500 text-4xl mb-2">✓</span>
                                <span className="font-bold">Photo Saved</span>
                                <button onClick={() => setPrimaryPhoto(null)} className="absolute bottom-2 text-xs text-red-400 underline">Remove</button>
                            </div>
                        )}
                    </div>

                    {/* Secondary Photo */}
                    <div>
                        <label className="block text-gray-400 uppercase tracking-widest text-xs font-bold mb-3">Secondary Photo (Optional)</label>
                        {!secondaryPhoto ? (
                            <button 
                                onClick={() => handleSimulatedUpload('secondary')}
                                className="w-full h-48 border-2 border-dashed border-gray-600 hover:border-[#B59A54] bg-[#242424] flex flex-col items-center justify-center rounded transition-colors text-gray-400 hover:text-white"
                            >
                                <span className="text-3xl mb-2">📸</span>
                                {isCropping ? 'Loading Crop Tool...' : 'Click to Add Another Photo'}
                            </button>
                        ) : (
                            <div className="w-full h-48 bg-gray-800 border-2 border-green-500 rounded flex items-center justify-center flex-col relative">
                                <span className="text-green-500 text-4xl mb-2">✓</span>
                                <span className="font-bold">Photo Saved</span>
                                <button onClick={() => setSecondaryPhoto(null)} className="absolute bottom-2 text-xs text-red-400 underline">Remove</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* STEP 3: SPECIFICS */}
            <div className="bg-[#1A1A1A] p-8 border border-gray-800 rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-[#B59A54]">Step 3: Piece Specifics</h2>
                
                <label className="block text-gray-400 uppercase tracking-widest text-xs font-bold mb-3">What kind of piece is this?</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {['Ring', 'Pendant', 'Raw Stone', 'Other'].map((type) => (
                        <button 
                            key={type}
                            onClick={() => setPieceType(type)}
                            className={`p-4 border rounded text-lg font-bold transition-all ${pieceType === type ? 'bg-[#B59A54] text-black border-[#B59A54]' : 'bg-[#242424] text-gray-300 border-gray-700 hover:border-gray-500'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* 🟢 DYNAMIC FIELDS BASED ON TYPE */}
                <div className="space-y-6 border-t border-gray-800 pt-8">
                    
                    {/* If Ring is Selected */}
                    {pieceType === 'Ring' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">Ring Size</label>
                                <input type="text" placeholder="e.g. Size 10" className="w-full bg-[#242424] border border-gray-700 p-4 rounded text-white text-lg focus:border-[#B59A54] outline-none" />
                            </div>
                            <div>
                                <label className="block text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">Silver Weight (Grams)</label>
                                <input type="text" placeholder="e.g. 42g" className="w-full bg-[#242424] border border-gray-700 p-4 rounded text-white text-lg focus:border-[#B59A54] outline-none" />
                            </div>
                            <div>
                                <label className="block text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">Stone Type</label>
                                <select className="w-full bg-[#242424] border border-gray-700 p-4 rounded text-white text-lg focus:border-[#B59A54] outline-none">
                                    <option>Genuine Earth-mined</option>
                                    <option>Lab-Grown / Man-made</option>
                                    <option>None (All Metal)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">Features / Texture</label>
                                <input type="text" placeholder="e.g. Hammered, Oxidized, Leaves..." className="w-full bg-[#242424] border border-gray-700 p-4 rounded text-white text-lg focus:border-[#B59A54] outline-none" />
                            </div>
                        </div>
                    )}

                    {/* If Pendant is Selected */}
                    {pieceType === 'Pendant' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">Silver Weight (Grams)</label>
                                <input type="text" placeholder="e.g. 28g" className="w-full bg-[#242424] border border-gray-700 p-4 rounded text-white text-lg focus:border-[#B59A54] outline-none" />
                            </div>
                            <div>
                                <label className="block text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">Gemstone / Material</label>
                                <input type="text" placeholder="e.g. Raw Onyx, Epoxy Ash..." className="w-full bg-[#242424] border border-gray-700 p-4 rounded text-white text-lg focus:border-[#B59A54] outline-none" />
                            </div>
                        </div>
                    )}

                    {/* ALWAYS SHOW DESCRIPTION */}
                    <div className="pt-4">
                        <label className="block text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">Full Description</label>
                        <textarea 
                            rows={4} 
                            placeholder="Write the story of the piece here..." 
                            className="w-full bg-[#242424] border border-gray-700 p-4 rounded text-white text-lg focus:border-[#B59A54] outline-none resize-none"
                        ></textarea>
                    </div>

                </div>
            </div>

            {/* 🟢 FINAL SUBMIT BUTTON */}
            <button className="w-full bg-[#B59A54] hover:bg-white text-black font-bold uppercase tracking-widest text-xl p-6 rounded transition-colors shadow-lg shadow-[#B59A54]/20">
                Post This Piece to Website
            </button>
        </div>
      )}

      {/* 🟢 PLACEHOLDERS FOR OTHER TABS */}
      {activeTab === 'invoices' && (
          <div className="max-w-4xl mx-auto text-center mt-20">
              <h2 className="text-3xl font-bold text-gray-600">Invoices System Coming Soon</h2>
          </div>
      )}

      {activeTab === 'clients' && (
          <div className="max-w-4xl mx-auto text-center mt-20">
              <h2 className="text-3xl font-bold text-gray-600">Client Database Coming Soon</h2>
          </div>
      )}

    </div>
  )
}