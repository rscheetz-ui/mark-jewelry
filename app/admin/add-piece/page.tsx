'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import Cropper from 'react-easy-crop'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function AddPieceAdmin() {
  const [isSaving, setIsSaving] = useState(false);
  
  // 🟢 Form State
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    pieceType: '',
    customPieceType: '', // For when "Other" is selected
    price: '',
    description: '',
    tags: '', // Comma separated string, parsed on submit
    photos: [''], // Starts with 1 input. Auto-expands up to 5.
    specs: {
        weight: '',
        size: '',
        width: '',
        material: ''
    }
  });

  // 🟢 Cropper States
  const [activeCropIndex, setActiveCropIndex] = useState<number | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // ----------------------------------------------------
  // DYNAMIC PHOTO LOGIC (Max 5)
  // ----------------------------------------------------
  const handleFileClick = (index: number) => {
    setActiveCropIndex(index);
    document.getElementById('image-upload')?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageSrc(URL.createObjectURL(file));
    }
  };

  const generateCropAndSave = async () => {
    if (activeCropIndex === null || !imageSrc) return;
    const mockUploadedUrl = imageSrc; // Simulated upload URL

    let newPhotos = [...formData.photos];
    newPhotos[activeCropIndex] = mockUploadedUrl;

    // If they just filled the last slot, and we have less than 5 photos, add a new empty slot
    if (activeCropIndex === newPhotos.length - 1 && newPhotos.length < 5) {
        newPhotos.push('');
    }

    setFormData({ ...formData, photos: newPhotos });
    setImageSrc(null);
    setActiveCropIndex(null);
  };

  const removePhoto = (index: number) => {
    let newPhotos = formData.photos.filter((_, i) => i !== index);
    // Ensure there is always at least one slot
    if (newPhotos.length === 0 || (newPhotos.length < 5 && newPhotos[newPhotos.length - 1] !== '')) {
        newPhotos.push('');
    }
    setFormData({ ...formData, photos: newPhotos });
  };

  // ----------------------------------------------------
  // SUBMIT TO VAULT
  // ----------------------------------------------------
  const handleSubmit = async () => {
      setIsSaving(true);

      // Clean Data
      const finalPhotos = formData.photos.filter(p => p.trim() !== '');
      if (finalPhotos.length === 0) {
          alert("You must include at least one photo.");
          setIsSaving(false);
          return;
      }

      const finalPieceType = formData.pieceType === 'Other' ? formData.customPieceType : formData.pieceType;
      
      // Parse comma-separated tags into an array
      const tagArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

      const { error } = await supabase.from('shop_inventory').insert([{
          title: formData.title,
          category: formData.category,
          piece_type: finalPieceType,
          price: parseFloat(formData.price),
          photos: finalPhotos,
          description: formData.description,
          tags: tagArray,
          specs: formData.specs
      }]);

      if (error) {
          alert("Error adding to Vault: " + error.message);
      } else {
          alert("Piece secured in Vault!");
          window.location.reload(); // Reset form
      }
      setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white p-6 md:p-12 font-sans relative">
      <style dangerouslySetInnerHTML={{ __html: `
            @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap');
            .display-font { font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; }
      `}} />

      <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={onFileChange} />

      {/* 🟢 CROPPER MODAL */}
      {imageSrc && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6">
            <div className="relative w-full max-w-4xl h-[60vh] bg-[#0A0C10] border border-[#27272A] rounded-sm overflow-hidden mb-6">
                <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={4 / 5} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={() => {}} />
            </div>
            <div className="flex gap-4">
                <button onClick={() => setImageSrc(null)} className="px-8 py-3 bg-[#0A0C10] border border-[#27272A] text-white uppercase text-xs font-bold">Cancel</button>
                <button onClick={generateCropAndSave} className="px-8 py-3 bg-[#B59A54] text-black uppercase text-xs font-bold">Crop & Add</button>
            </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-12 pb-24">
        
        <div>
            <Link href="/admin" className="text-[#71717A] text-[10px] font-bold tracking-[0.2em] uppercase hover:text-[#14B8A6] mb-6 inline-block">
                &larr; Back to Control Panel
            </Link>
            <h1 className="text-4xl display-font">Manual Vault Entry</h1>
            <p className="text-[#A1A1AA] text-sm mt-2">Bypass the live workbench and insert directly into the shop inventory.</p>
        </div>

        {/* 🟢 STEP 1: CLASSIFICATION */}
        <div className="bg-[#0A0C10] p-8 border border-[#27272A] rounded-sm shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#14B8A6]"></div>
            <h2 className="text-2xl display-font mb-6 text-white">1. Classification</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-[#14B8A6] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Item Title</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#05070A] border border-[#27272A] p-4 text-white focus:border-[#B59A54] outline-none" />
                </div>
                <div>
                    <label className="block text-[#14B8A6] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Price ($)</label>
                    <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-[#05070A] border border-[#27272A] p-4 text-white focus:border-[#B59A54] outline-none" />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-[#14B8A6] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Category (Filters the Shop)</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#05070A] border border-[#27272A] p-4 text-white focus:border-[#B59A54] outline-none">
                        <option value="">-- Select Category --</option>
                        <option value="rings">Heavyweight Rings</option>
                        <option value="stone">Raw Stone</option>
                        <option value="silver">Forged Silver</option>
                        <option value="stacker">Stacker Rings</option>
                        <option value="custom">Commissioned</option>
                        <option value="memory">In Memory Of</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[#14B8A6] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Kind of Piece</label>
                    <select value={formData.pieceType} onChange={e => setFormData({...formData, pieceType: e.target.value})} className="w-full bg-[#05070A] border border-[#27272A] p-4 text-white focus:border-[#B59A54] outline-none">
                        <option value="">-- Select Kind --</option>
                        <option value="Ring">Ring</option>
                        <option value="Pendant">Pendant</option>
                        <option value="Cuff">Cuff / Bracelet</option>
                        <option value="Earrings">Earrings</option>
                        <option value="Other">Other (Specify)</option>
                    </select>
                </div>
            </div>

            {formData.pieceType === 'Other' && (
                <div className="mt-6">
                    <label className="block text-[#14B8A6] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Specify Kind</label>
                    <input type="text" value={formData.customPieceType} onChange={e => setFormData({...formData, customPieceType: e.target.value})} className="w-full bg-[#05070A] border border-[#27272A] p-4 text-white focus:border-[#B59A54] outline-none" placeholder="e.g. Bolo Tie" />
                </div>
            )}
        </div>

        {/* 🟢 STEP 2: METALLURGY & SPECS */}
        <div className="bg-[#0A0C10] p-8 border border-[#27272A] rounded-sm shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#B59A54]"></div>
            <h2 className="text-2xl display-font mb-6 text-white">2. Specs & SEO</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                    <label className="block text-[#71717A] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Weight (g)</label>
                    <input type="text" value={formData.specs.weight} onChange={e => setFormData({...formData, specs: {...formData.specs, weight: e.target.value}})} className="w-full bg-[#05070A] border border-[#27272A] p-3 text-sm text-white outline-none focus:border-[#B59A54]" placeholder="42g" />
                </div>
                <div>
                    <label className="block text-[#71717A] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Size</label>
                    <input type="text" value={formData.specs.size} onChange={e => setFormData({...formData, specs: {...formData.specs, size: e.target.value}})} className="w-full bg-[#05070A] border border-[#27272A] p-3 text-sm text-white outline-none focus:border-[#B59A54]" placeholder="10.5" />
                </div>
                <div>
                    <label className="block text-[#71717A] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Width (mm)</label>
                    <input type="text" value={formData.specs.width} onChange={e => setFormData({...formData, specs: {...formData.specs, width: e.target.value}})} className="w-full bg-[#05070A] border border-[#27272A] p-3 text-sm text-white outline-none focus:border-[#B59A54]" placeholder="8mm" />
                </div>
                <div>
                    <label className="block text-[#71717A] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Material</label>
                    <input type="text" value={formData.specs.material} onChange={e => setFormData({...formData, specs: {...formData.specs, material: e.target.value}})} className="w-full bg-[#05070A] border border-[#27272A] p-3 text-sm text-white outline-none focus:border-[#B59A54]" placeholder=".925 Silver" />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-[#71717A] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Full Description</label>
                <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#05070A] border border-[#27272A] p-4 text-white focus:border-[#B59A54] outline-none resize-none" placeholder="The story of the piece..." />
            </div>

            <div>
                <label className="block text-[#71717A] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Search Tags (Comma Separated)</label>
                <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full bg-[#05070A] border border-[#27272A] p-4 text-white focus:border-[#B59A54] outline-none" placeholder="hammered, oxidized, biker, gothic, turquoise..." />
            </div>
        </div>

        {/* 🟢 STEP 3: DYNAMIC PHOTOS */}
        <div className="bg-[#0A0C10] p-8 border border-[#27272A] rounded-sm shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#00F2FE]"></div>
            <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl display-font text-white">3. Visuals</h2>
                <span className="text-[#71717A] text-xs font-bold">{formData.photos.filter(p => p !== '').length} / 5 Loaded</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {formData.photos.map((img, index) => (
                    <div key={index} className="aspect-[4/5] bg-[#05070A] border border-[#27272A] relative group">
                        {!img ? (
                            <button onClick={() => handleFileClick(index)} className="w-full h-full flex flex-col items-center justify-center text-[#71717A] hover:text-[#00F2FE] hover:border-[#00F2FE] border border-transparent transition-all">
                                <span className="text-2xl mb-2">📸</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest">{index === 0 ? 'Primary' : 'Add Angle'}</span>
                            </button>
                        ) : (
                            <>
                                <img src={img} className="w-full h-full object-cover" alt="Angle" />
                                <button onClick={() => removePhoto(index)} className="absolute top-2 right-2 bg-red-900/80 text-white w-6 h-6 flex items-center justify-center rounded-sm hover:bg-red-500 transition-colors">&times;</button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* 🟢 SUBMIT */}
        <button onClick={handleSubmit} disabled={isSaving} className="w-full bg-[#B59A54] text-black display-font text-2xl py-6 hover:bg-transparent hover:text-[#B59A54] border-2 border-[#B59A54] transition-all disabled:opacity-50">
            {isSaving ? 'SECURING...' : 'SECURE IN VAULT'}
        </button>

      </div>
    </div>
  )
}