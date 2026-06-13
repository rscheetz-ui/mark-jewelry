'use client'
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

// Earthen Miners Designs - The Live Workbench
export default function WorkbenchPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  const [buildData, setBuildData] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  // Fetch from Supabase
  useEffect(() => {
    async function fetchBuild() {
      const { data } = await supabase.from('current_build').select('*').limit(1).single();
      if (data) {
        setBuildData(data);
        if (data.progress_images && data.progress_images.length > 0) {
            setActiveImageIndex(data.progress_images.length - 1);
        }
      }
    }
    fetchBuild();
  }, []); // Empty array prevents rate limiting

  return (
    <div className="min-h-screen bg-[#05070A] text-[#E0E6ED] font-sans antialiased selection:bg-[#14B8A6]/30 selection:text-[#CCFFFD]">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Inter:wght@300;400;600;800&display=swap');
        h1, h2, h3, .display-font { font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; }
        .labradorite-flash { color: #00F2FE; text-shadow: 0 0 15px rgba(0,242,254,0.5); }
        .labradorite-teal { color: #14B8A6; }
        .metal-oxidized { color: #71717A; }
        .accent-brass { color: #B59A54; }
        .noise-bg {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
            pointer-events: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 50;
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      <div className="noise-bg"></div>

      {/* NAVIGATION */}
      <nav className="w-full p-6 md:p-8 flex justify-between items-center border-b border-white/5 relative z-10 bg-[#05070A]/80 backdrop-blur-sm">
        <Link href="/" className="text-3xl display-font tracking-widest text-white hover:text-[#14B8A6] transition-colors">
            Earthen Miners <span className="labradorite-teal">Designs</span>
        </Link>
        <div className="text-xs tracking-[0.3em] uppercase font-bold metal-oxidized hidden md:block">
            Forged from earth & fire • USA
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 py-12 md:py-24 relative z-10">
        
        {/* 🟢 STRICT STATUS CHECK FOR ACTIVE WORKBENCH */}
        {buildData && buildData.status === 'active' ? (
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-start">
            
            {/* LEFT COLUMN: THE MEDIA & TIMELINE (60%) */}
            <div className="lg:col-span-7 space-y-16">
                
                {/* 1. THE PICTURE TIMELINE */}
                <div className="space-y-6">
                    <h3 className="display-font tracking-widest text-lg text-[#71717A]">BUILD PROGRESSION</h3>
                    
                    <div className="relative w-full">
                        <div className="flex overflow-x-auto hide-scrollbar py-12 px-8 -mx-8 items-center justify-start space-x-[-3rem]">
                            {buildData && buildData.progress_images && buildData.progress_images[0] !== "" ? buildData.progress_images.map((img: string, index: number) => {
                                const isActive = activeImageIndex === index;
                                return (
                                    <div 
                                        key={index}
                                        onClick={() => setActiveImageIndex(index)}
                                        className={`relative shrink-0 aspect-[4/5] rounded-sm transition-all duration-500 cursor-pointer border border-white/10
                                            ${isActive 
                                                ? 'w-72 scale-110 z-30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] brightness-110 ring-1 ring-[#14B8A6]/50' 
                                                : 'w-56 scale-90 z-10 opacity-40 grayscale hover:grayscale-[50%] hover:opacity-80 hover:-translate-y-2 hover:z-20'
                                            }
                                        `}
                                    >
                                        <img src={img} alt={`Progress step ${index + 1}`} className="w-full h-full object-cover rounded-sm pointer-events-none" />
                                        
                                        <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest uppercase transition-opacity duration-300 ${isActive ? 'text-[#14B8A6] opacity-100' : 'opacity-0'}`}>
                                            Step 0{index + 1}
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-[#71717A] text-sm italic">No timeline images logged yet.</div>
                            )}
                        </div>
                        
                        <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-[#05070A] to-transparent pointer-events-none"></div>
                        <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-[#05070A] to-transparent pointer-events-none"></div>
                    </div>
                </div>

                {/* 2. INDUSTRIAL FACEBOOK LIVE VIEWPORT */}
                <div className="space-y-4 pt-8 border-t border-[#27272A]">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-3 w-3">
                            {activeVideoIndex === 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${activeVideoIndex === 0 ? 'bg-red-600' : 'bg-[#71717A]'}`}></span>
                        </div>
                        <h2 className="display-font tracking-widest text-lg text-white">
                            {activeVideoIndex === 0 ? 'LATEST SESSION' : 'ARCHIVED SESSION'}
                        </h2>
                    </div>
                    
                    <div className="relative aspect-video bg-[#0A0C10] border-2 border-[#27272A] p-2 shadow-[0_0_40px_rgba(20,184,166,0.05)]">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#14B8A6]"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#14B8A6]"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#14B8A6]"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#14B8A6]"></div>
                        
                        <div className="w-full h-full bg-black relative overflow-hidden flex items-center justify-center">
                            {buildData && buildData.video_archive && buildData.video_archive.length > 0 ? (
                                <iframe 
                                    src={buildData.video_archive[activeVideoIndex].url} 
                                    className="w-full h-full border-none" 
                                    scrolling="no" 
                                    allowFullScreen={true}
                                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                ></iframe>
                            ) : (
                                <div className="text-center">
                                    <span className="text-4xl mb-4 opacity-50 block">🎥</span>
                                    <span className="text-[#71717A] text-xs font-bold tracking-[0.2em] uppercase">Stream Currently Offline</span>
                                    <span className="text-white/30 text-[10px] mt-2 block italic">Awaiting next forge session...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. THE ARCHIVE SHADOW STACK (VIDEO TIMELINE) */}
                <div className="space-y-6 pt-2">
                    <div className="relative w-full">
                        <div className="flex overflow-x-auto hide-scrollbar py-8 px-8 -mx-8 items-center justify-start space-x-[-2rem]">
                            {buildData && buildData.video_archive ? buildData.video_archive.map((video: any, index: number) => {
                                const isActive = activeVideoIndex === index;
                                return (
                                    <div 
                                        key={video.id}
                                        onClick={() => setActiveVideoIndex(index)}
                                        className={`relative shrink-0 aspect-video rounded-sm transition-all duration-500 cursor-pointer border border-[#27272A] bg-[#0A0C10] flex flex-col items-center justify-center p-4
                                            ${isActive 
                                                ? 'w-64 scale-105 z-30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] ring-1 ring-[#14B8A6]/50 bg-[#111419]' 
                                                : 'w-48 scale-90 z-10 opacity-50 hover:opacity-100 hover:-translate-y-2 hover:z-20 hover:bg-[#111419]'
                                            }
                                        `}
                                    >
                                        <div className={`text-3xl mb-2 ${isActive ? 'text-[#14B8A6]' : 'text-[#71717A]'}`}>▶</div>
                                        <div className="text-[10px] font-bold tracking-widest uppercase text-center text-white">{video.title}</div>
                                        <div className="text-xs text-[#71717A] mt-1">{video.date}</div>
                                    </div>
                                );
                            }) : null }
                        </div>
                        
                        <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-[#05070A] to-transparent pointer-events-none"></div>
                        <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-[#05070A] to-transparent pointer-events-none"></div>
                    </div>
                </div>

            </div>

            {/* RIGHT COLUMN: STICKY CTA (40%) */}
            <div className="lg:col-span-5 relative">
                <div className="sticky top-24 bg-[#0A0C10] border border-[#27272A] p-8 md:p-12">
                    
                    <div className="border-b border-[#27272A] pb-8 mb-8">
                        <span className="text-[#14B8A6] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 block">Currently Forging</span>
                        <h1 className="text-4xl md:text-5xl display-font text-white mb-6 leading-tight">
                            The Current <br/> <span className="labradorite-flash">Project.</span>
                        </h1>
                        <p className="text-[#A1A1AA] font-light leading-relaxed">
                            {buildData ? buildData.description : "Loading workbench data..."}
                        </p>
                    </div>

                    <div className="space-y-4 mb-12">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[#71717A] uppercase tracking-widest font-bold text-[10px]">Status</span>
                            <span className="text-white font-mono">On the Anvil</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-[#27272A]/50 pt-4">
                            <span className="text-[#71717A] uppercase tracking-widest font-bold text-[10px]">Material Base</span>
                            <span className="text-white font-mono">Solid .925 Silver</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-[#27272A]/50 pt-4">
                            <span className="text-[#71717A] uppercase tracking-widest font-bold text-[10px]">Authentication</span>
                            <span className="text-white font-mono">1 of 1 Custom</span>
                        </div>
                    </div>

                    {/* MASSIVE CTA BUTTON */}
                    <button className="w-full bg-[#B59A54] text-black display-font text-2xl tracking-[0.1em] py-6 hover:bg-transparent hover:text-[#B59A54] border-2 border-[#B59A54] transition-all duration-300 hover:shadow-[0_0_30px_rgba(181,154,84,0.3)] group relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                        <span className="relative z-10">CLAIM THIS PIECE</span>
                    </button>
                    
                    <p className="text-center text-[#71717A] text-[10px] font-bold tracking-widest uppercase mt-4">
                        Secures the item before completion.
                    </p>
                </div>
            </div>

        </div>
        ) : (
            // 🟢 THE "FORGE IS RESTING" STATE
            <div className="flex flex-col items-center justify-center py-32 text-center border border-[#27272A] bg-[#0A0C10] relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 w-full h-1 bg-[#71717A]"></div>
                <span className="text-6xl mb-6 opacity-30 grayscale">⚒️</span>
                <h1 className="text-5xl md:text-6xl display-font text-white mb-4 tracking-widest text-[#71717A]">
                    FORGE ON STANDBY
                </h1>
                <p className="text-[#A1A1AA] text-lg max-w-xl mx-auto font-light leading-relaxed mb-8">
                    The previous piece has been finalized and moved to the vault. The anvil is cleared and the next bespoke project is currently being drafted.
                </p>
                <Link href="/shop" className="bg-[#05070A] text-[#B59A54] display-font text-xl tracking-[0.2em] px-10 py-5 border border-[#B59A54] hover:bg-[#B59A54] hover:text-black transition-all shadow-[0_0_15px_rgba(181,154,84,0.1)]">
                    ENTER THE SHOP
                </Link>
            </div>
        )}
      </main>
    </div>
  )
}