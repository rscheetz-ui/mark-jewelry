'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import Cropper from 'react-easy-crop'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// Define our video structure
interface VideoSession {
  id: number;
  title: string;
  date: string;
  url: string;
}

export default function CurrentProjectAdmin() {
  const [isSaving, setIsSaving] = useState(false);
  
  // 🟢 Master Form State
  const [formData, setFormData] = useState({
    id: '',
    progress_images: [''],
    video_archive: [] as VideoSession[],
    description: '',
    status: 'active' 
  });

  const [newVideoUrl, setNewVideoUrl] = useState('');

  // 🟢 Cropper States
  const [activeCropIndex, setActiveCropIndex] = useState<number | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // 🟢 Listing Modal States
  const [showListingModal, setShowListingModal] = useState(false);
  const [listingData, setListingData] = useState({
      title: '', category: '', pieceType: '', price: '', weight: '', size: '', material: '', primaryImage: ''
  });

  // Fetch current data
  useEffect(() => {
    async function loadCurrentBuild() {
      const { data } = await supabase.from('current_build').select('*').limit(1).single();
      if (data) setFormData({
        id: data.id,
        progress_images: data.progress_images && data.progress_images.length > 0 ? data.progress_images : [''],
        video_archive: data.video_archive || [],
        description: data.description || '',
        status: data.status || 'active' // 🟢 Forces active if null from DB
      });
    }
    loadCurrentBuild();
  }, []);

  // ----------------------------------------------------
  // IMAGE TIMELINE LOGIC
  // ----------------------------------------------------
  const handleFileClick = (index: number) => {
    setActiveCropIndex(index);
    document.getElementById('image-upload')?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = URL.createObjectURL(file);
      setImageSrc(imageDataUrl);
    }
  };

  const generateCropAndSave = async () => {
    if (activeCropIndex === null || !imageSrc) return;
    const mockUploadedUrl = imageSrc; // Simulated upload URL

    const newImages = [...formData.progress_images];
    newImages[activeCropIndex] = mockUploadedUrl;
    setFormData({ ...formData, progress_images: newImages });

    setImageSrc(null);
    setActiveCropIndex(null);
  };

  const addProgressStep = () => {
    setFormData({ ...formData, progress_images: [...formData.progress_images, ''] });
  };

  const removeProgressStep = (index: number) => {
    const newImages = formData.progress_images.filter((_, i) => i !== index);
    setFormData({ ...formData, progress_images: newImages });
  };

  // ----------------------------------------------------
  // LIVESTREAM VIDEO LOGIC
  // ----------------------------------------------------
  const handleAddVideo = () => {
    if (!newVideoUrl.trim()) return;
    
    const sessionNumber = formData.video_archive.length + 1;
    const newSession: VideoSession = {
       id: Date.now(),
       title: `SESSION 0${sessionNumber}: LIVE FORGE`,
       date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
       url: newVideoUrl.trim()
    };
    
    setFormData({ ...formData, video_archive: [...formData.video_archive, newSession] });
    setNewVideoUrl('');
  };

  const removeVideo = (index: number) => {
    const newVideos = formData.video_archive.filter((_, i) => i !== index);
    const renumberedVideos = newVideos.map((vid, i) => ({
        ...vid,
        title: `SESSION 0${i + 1}: LIVE FORGE`
    }));
    setFormData({ ...formData, video_archive: renumberedVideos });
  };

  // ----------------------------------------------------
  // SAVE / PUBLISH LOGIC
  // ----------------------------------------------------
  const handleSaveWorkbench = async () => {
    setIsSaving(true);
    const cleanImages = formData.progress_images.filter(img => img.trim() !== '');

    const { error } = await supabase
      .from('current_build')
      .update({
        progress_images: cleanImages,
        video_archive: formData.video_archive,
        description: formData.description,
        status: 'active', // 🟢 Forces status back to active in DB
        updated_at: new Date().toISOString()
      })
      .eq('id', formData.id);

    if (error) alert("Error saving to the forge: " + error.message);
    else {
      alert("Workbench Live Feed Updated Successfully!");
      setFormData(prev => ({...prev, status: 'active'})); // Update local state
    }
    
    setIsSaving(false);
  };

  // ----------------------------------------------------
  // FINALIZE AND LIST LOGIC
  // ----------------------------------------------------
  const handleFinalizeListing = async () => {
      setIsSaving(true);
      
      const { error: shopError } = await supabase.from('shop_inventory').insert([{
          title: listingData.title,
          category: listingData.category,
          piece_type: listingData.pieceType,
          price: parseFloat(listingData.price),
          primary_image: listingData.primaryImage || formData.progress_images[formData.progress_images.length - 1], 
          description: formData.description,
          specs: { weight: listingData.weight, size: listingData.size, material: listingData.material }
      }]);

      if (shopError) {
          alert("Error creating shop listing: " + shopError.message);
          setIsSaving(false);
          return;
      }

      await supabase.from('current_build').update({
          status: 'complete', // 🟢 Shuts down the feed
          progress_images: [''], 
          video_archive: [], 
          description: ''
      }).eq('id', formData.id);

      alert("Piece successfully moved to Shop Inventory. Workbench feed cleared.");
      window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white p-6 md:p-12 font-sans relative">
        <style dangerouslySetInnerHTML={{ __html: `
            @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap');
            .display-font { font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; }
        `}} />

      <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={onFileChange} />

      {imageSrc && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6">
            <div className="relative w-full max-w-4xl h-[60vh] bg-[#0A0C10] border border-[#27272A] rounded-sm overflow-hidden mb-6">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={16 / 10}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={() => {}}
                />
            </div>
            <div className="flex gap-4">
                <button onClick={() => setImageSrc(null)} className="px-8 py-3 bg-[#0A0C10] border border-[#27272A] text-white hover:border-[#71717A] uppercase tracking-widest text-xs font-bold transition-colors">Cancel</button>
                <button onClick={generateCropAndSave} className="px-8 py-3 bg-[#B59A54] text-black border border-[#B59A54] hover:bg-transparent hover:text-[#B59A54] uppercase tracking-widest text-xs font-bold transition-colors">Crop & Add to Timeline</button>
            </div>
        </div>
      )}

      {showListingModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
              <div className="bg-[#0A0C10] border border-[#27272A] p-8 md:p-12 max-w-3xl w-full relative mt-24 shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#B59A54]"></div>
                  <button onClick={() => setShowListingModal(false)} className="absolute top-6 right-6 text-[#71717A] hover:text-white text-2xl">&times;</button>
                  
                  <h2 className="text-3xl display-font mb-2">Finalize & List Item</h2>
                  <p className="text-[#A1A1AA] text-sm mb-8">This will shut down the live feed and push the item to your shop.</p>

                  <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-[#14B8A6] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Listing Title</label>
                              <input type="text" value={listingData.title} onChange={e => setListingData({...listingData, title: e.target.value})} className="w-full bg-[#05070A] border border-[#27272A] p-4 text-white focus:border-[#B59A54] outline-none" placeholder="e.g. The Asphalt Signet"/>
                          </div>
                          <div>
                              <label className="block text-[#14B8A6] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Retail Price ($)</label>
                              <input type="number" value={listingData.price} onChange={e => setListingData({...listingData, price: e.target.value})} className="w-full bg-[#05070A] border border-[#27272A] p-4 text-white focus:border-[#B59A54] outline-none" placeholder="240.00"/>
                          </div>
                          <div>
                              <label className="block text-[#14B8A6] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Category</label>
                              <select value={listingData.category} onChange={e => setListingData({...listingData, category: e.target.value})} className="w-full bg-[#05070A] border border-[#27272A] p-4 text-white focus:border-[#B59A54] outline-none">
                                  <option value="">-- Choose --</option>
                                  <option value="heavyweight">Heavyweight Rings</option>
                                  <option value="raw-stone">Raw Stone Craftsmanship</option>
                                  <option value="silver">Forged Silver</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-[#14B8A6] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Primary Photo URL</label>
                              <input type="text" value={listingData.primaryImage} onChange={e => setListingData({...listingData, primaryImage: e.target.value})} className="w-full bg-[#05070A] border border-[#27272A] p-4 text-[#71717A] outline-none" placeholder="Defaults to final progress image" />
                          </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-[#27272A]">
                          <div>
                              <label className="block text-[#71717A] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Material</label>
                              <input type="text" value={listingData.material} onChange={e => setListingData({...listingData, material: e.target.value})} className="w-full bg-[#05070A] border border-[#27272A] p-4 text-white outline-none" placeholder=".925 Silver" />
                          </div>
                          <div>
                              <label className="block text-[#71717A] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Weight</label>
                              <input type="text" value={listingData.weight} onChange={e => setListingData({...listingData, weight: e.target.value})} className="w-full bg-[#05070A] border border-[#27272A] p-4 text-white outline-none" placeholder="42g" />
                          </div>
                          <div>
                              <label className="block text-[#71717A] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Size</label>
                              <input type="text" value={listingData.size} onChange={e => setListingData({...listingData, size: e.target.value})} className="w-full bg-[#05070A] border border-[#27272A] p-4 text-white outline-none" placeholder="10.5" />
                          </div>
                      </div>

                      <button onClick={handleFinalizeListing} disabled={isSaving} className="w-full bg-[#B59A54] text-black display-font text-xl py-6 hover:bg-transparent hover:text-[#B59A54] border-2 border-[#B59A54] transition-all disabled:opacity-50 mt-8">
                          {isSaving ? 'SECURING INVENTORY...' : 'FINISH PROJECT & PUSH TO SHOP'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="max-w-7xl mx-auto">
        <Link href="/admin" className="text-[#71717A] text-[10px] font-bold tracking-[0.2em] uppercase hover:text-[#14B8A6] mb-6 inline-block">
          &larr; Back to Control Panel
        </Link>
        
        <h1 className="text-4xl display-font mb-2">Live Workbench Dashboard</h1>
        <p className={`text-xs font-bold tracking-widest uppercase mb-10 ${formData.status === 'active' ? 'text-emerald-500' : 'text-[#71717A]'}`}>
            Status: {formData.status === 'active' ? 'Forge Active' : 'Forge Resting'}
        </p>
        
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-7 space-y-8">
                <div className="bg-[#0A0C10] p-8 border border-[#27272A] rounded-sm shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#14B8A6]"></div>
                    <div className="flex justify-between items-end mb-8 border-b border-[#27272A] pb-4">
                        <label className="block text-[#14B8A6] text-[10px] font-bold tracking-[0.2em] uppercase">The Build Timeline (Start to Finish)</label>
                        <button onClick={addProgressStep} className="text-[#B59A54] text-[10px] uppercase tracking-widest font-bold hover:text-white">+ Add Step</button>
                    </div>
                    
                    <div className="space-y-4">
                        {formData.progress_images.map((img, index) => (
                            <div key={index} className="flex gap-4 items-center bg-[#05070A] border border-[#27272A] p-3 rounded-sm group transition-colors hover:border-[#71717A]">
                                <span className="text-[#71717A] font-bold w-6 text-center text-xs">{index + 1}.</span>
                                
                                {!img ? (
                                    <button 
                                        onClick={() => handleFileClick(index)}
                                        className="bg-[#111419] border border-[#27272A] hover:border-[#14B8A6] text-[#71717A] hover:text-[#14B8A6] py-3 transition-colors text-[10px] font-bold tracking-widest uppercase flex-grow text-center"
                                    >
                                        📸 Select Image
                                    </button>
                                ) : (
                                    <div className="flex-grow flex items-center justify-between pl-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#14B8A6] text-lg">✓</span>
                                            <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">Image Saved</span>
                                        </div>
                                        <img src={img} className="h-10 w-16 object-cover border border-[#27272A]" alt={`Step ${index + 1}`} />
                                    </div>
                                )}
                                
                                {formData.progress_images.length > 1 && (
                                    <button onClick={() => removeProgressStep(index)} className="text-red-900 group-hover:text-red-500 text-xl font-bold ml-2 px-2 transition-colors">&times;</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#0A0C10] p-8 border border-[#27272A] rounded-sm shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#14B8A6]"></div>
                    <label className="block text-[#14B8A6] text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
                        Finish this sentence: "Right now, on the bench..."
                    </label>
                    <textarea 
                        rows={3}
                        placeholder="is a stunning custom stone pendant... / we have a heavy silver cuff... / watch this custom build..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-[#05070A] border border-[#27272A] p-4 text-white focus:border-[#14B8A6] outline-none resize-none" 
                    />
                </div>
            </div>

            <div className="lg:col-span-5">
                <div className="bg-[#0A0C10] p-8 border border-[#27272A] rounded-sm shadow-xl sticky top-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#00F2FE]"></div>
                    <h2 className="text-2xl display-font mb-2 text-white">Livestream Archive</h2>
                    <p className="text-[#A1A1AA] text-xs mb-8 leading-relaxed font-light">Paste your Facebook Live URL here. We will automatically format it into a session card.</p>
                    
                    <div className="flex gap-2 mb-8 border-b border-[#27272A] pb-8">
                        <input 
                            type="text" 
                            value={newVideoUrl}
                            onChange={e => setNewVideoUrl(e.target.value)}
                            className="w-full bg-[#05070A] border border-[#27272A] p-3 text-white focus:border-[#00F2FE] outline-none text-[10px] font-mono" 
                            placeholder="https://facebook.com/..."
                        />
                        <button 
                            onClick={handleAddVideo} 
                            className="bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30 hover:bg-[#00F2FE] hover:text-black px-4 font-bold text-lg transition-colors"
                        >
                            +
                        </button>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[#71717A] text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Saved Sessions</label>
                        {formData.video_archive.map((video, index) => (
                            <div key={video.id} className="bg-[#05070A] border border-[#27272A] p-4 flex justify-between items-center group transition-colors hover:border-[#71717A]">
                                <div>
                                    <div className="text-[10px] font-bold tracking-widest uppercase text-white">{video.title}</div>
                                    <div className="text-[10px] text-[#A1A1AA] mt-1 font-mono">{video.date}</div>
                                </div>
                                <button onClick={() => removeVideo(index)} className="text-red-900 group-hover:text-red-500 font-bold text-xl px-2 transition-colors">&times;</button>
                            </div>
                        ))}
                        {formData.video_archive.length === 0 && (
                            <div className="text-[#71717A] text-xs italic text-center py-8 border border-dashed border-[#27272A]">No livestreams added yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-12 space-y-4">
            <button 
                onClick={handleSaveWorkbench}
                disabled={isSaving}
                className="w-full bg-[#14B8A6] text-black display-font text-2xl py-6 hover:bg-transparent hover:text-[#14B8A6] border-2 border-[#14B8A6] transition-all duration-300 disabled:opacity-50"
            >
                {isSaving ? 'TRANSMITTING...' : 'PUBLISH WORKBENCH UPDATE'}
            </button>
            
            <button 
                onClick={() => setShowListingModal(true)}
                className="w-full bg-[#05070A] text-[#B59A54] display-font text-xl py-4 hover:bg-[#B59A54] hover:text-black border border-[#B59A54] transition-all duration-300"
            >
                FINISH, REMOVE & CREATE LISTING
            </button>
        </div>

      </div>
    </div>
  )
}