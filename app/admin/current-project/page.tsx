'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import Cropper from 'react-easy-crop'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function CurrentProjectAdmin() {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    progress_images: [''],
    description: ''
  });

  // 🟢 Cropper States
  const [activeCropIndex, setActiveCropIndex] = useState<number | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    async function loadCurrentBuild() {
      const { data } = await supabase.from('current_build').select('*').limit(1).single();
      if (data) setFormData({
        id: data.id,
        progress_images: data.progress_images || [''],
        description: data.description || ''
      });
    }
    loadCurrentBuild();
  }, []);

  // 🟢 Trigger file selector
  const handleFileClick = (index: number) => {
    setActiveCropIndex(index);
    document.getElementById('image-upload')?.click();
  };

  // 🟢 Load image into Cropper
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = URL.createObjectURL(file);
      setImageSrc(imageDataUrl);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // 🟢 Finalize Crop (Simulated for now until Supabase Storage is connected)
  const generateCropAndSave = async () => {
    if (activeCropIndex === null || !imageSrc) return;
    
    // Simulate uploading the cropped image to a bucket and getting a URL back
    alert("In the future, this cropped area will upload directly to Supabase Storage!");
    const mockUploadedUrl = imageSrc; // Using the local blob for the mockup

    const newImages = [...formData.progress_images];
    newImages[activeCropIndex] = mockUploadedUrl;
    setFormData({ ...formData, progress_images: newImages });

    // Close cropper
    setImageSrc(null);
    setActiveCropIndex(null);
  };

  const handleProgressImageChange = (index: number, value: string) => {
    const newImages = [...formData.progress_images];
    newImages[index] = value;
    setFormData({ ...formData, progress_images: newImages });
  };

  const addProgressStep = () => {
    setFormData({ ...formData, progress_images: [...formData.progress_images, ''] });
  };

  const removeProgressStep = (index: number) => {
    const newImages = formData.progress_images.filter((_, i) => i !== index);
    setFormData({ ...formData, progress_images: newImages });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const cleanImages = formData.progress_images.filter(img => img.trim() !== '');

    const { error } = await supabase
      .from('current_build')
      .update({
        progress_images: cleanImages,
        description: formData.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', formData.id);

    if (error) alert("Error saving to the forge: " + error.message);
    else alert("Workbench Live Feed Updated Successfully!");
    
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white p-6 md:p-12 font-sans relative">
        <style dangerouslySetInnerHTML={{ __html: `
            @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap');
            .display-font { font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; }
        `}} />

      {/* Hidden File Input for Cropper */}
      <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={onFileChange} />

      {/* 🟢 CROPPER MODAL */}
      {imageSrc && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6">
            <div className="relative w-full max-w-4xl h-[60vh] bg-[#0A0C10] border border-[#27272A] rounded-sm overflow-hidden mb-6">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={16 / 10} // Locks the ratio perfectly to the homepage frame
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                />
            </div>
            <div className="flex gap-4">
                <button onClick={() => setImageSrc(null)} className="px-8 py-3 bg-[#0A0C10] border border-[#27272A] text-white hover:border-[#71717A] uppercase tracking-widest text-xs font-bold transition-colors">
                    Cancel
                </button>
                <button onClick={generateCropAndSave} className="px-8 py-3 bg-[#B59A54] text-black border border-[#B59A54] hover:bg-transparent hover:text-[#B59A54] uppercase tracking-widest text-xs font-bold transition-colors">
                    Crop & Add to Timeline
                </button>
            </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <Link href="/admin" className="text-[#71717A] text-[10px] font-bold tracking-[0.2em] uppercase hover:text-[#14B8A6] mb-6 inline-block">
          &larr; Back to Control Panel
        </Link>
        
        <h1 className="text-4xl display-font mb-2">Live Workbench Feed</h1>
        <p className="text-[#A1A1AA] text-sm mb-10">Add unlimited progress steps. The homepage will automatically sequence them.</p>

        <div className="space-y-8 bg-[#0A0C10] p-8 border border-[#27272A] rounded-sm">

          <div className="border-b border-[#27272A] pb-8 space-y-6">
            <div className="flex justify-between items-end">
                <label className="block text-[#14B8A6] text-[10px] font-bold tracking-[0.2em] uppercase">The Build Timeline (Start to Finish)</label>
                <button onClick={addProgressStep} className="text-[#B59A54] text-xs uppercase tracking-widest font-bold hover:text-white">+ Add Step</button>
            </div>
            
            {formData.progress_images.map((img, index) => (
                <div key={index} className="flex gap-4 items-center">
                    <span className="text-[#71717A] font-bold w-6">{index + 1}.</span>
                    
                    {/* The new Upload/Crop Trigger Button */}
                    <button 
                        onClick={() => handleFileClick(index)}
                        className="bg-[#05070A] border border-[#27272A] hover:border-[#14B8A6] text-[#71717A] hover:text-[#14B8A6] px-4 py-4 transition-colors"
                        title="Upload & Crop Image"
                    >
                        📸
                    </button>

                    <input 
                        type="text" 
                        value={img}
                        onChange={e => handleProgressImageChange(index, e.target.value)}
                        className="w-full bg-[#05070A] border border-[#27272A] p-4 text-white focus:border-[#14B8A6] outline-none" 
                        placeholder="Image URL will appear here after cropping..."
                    />
                    
                    {formData.progress_images.length > 1 && (
                        <button onClick={() => removeProgressStep(index)} className="text-red-500 text-2xl hover:text-red-400">&times;</button>
                    )}
                </div>
            ))}
          </div>

          <div>
            <label className="block text-[#14B8A6] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
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

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#B59A54] text-black display-font text-xl py-4 hover:bg-transparent hover:text-[#B59A54] border border-[#B59A54] transition-all disabled:opacity-50"
          >
            {isSaving ? 'Forging...' : 'Update Homepage Feed'}
          </button>
        </div>
      </div>
    </div>
  )
}