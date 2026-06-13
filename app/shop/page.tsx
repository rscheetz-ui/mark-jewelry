'use client'
import { useState, useEffect, Suspense } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 🟢 Wrap the main logic in a component to use search params
function ShopGallery() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category'); // Grabs ?category=rings from the URL

  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter & Search States
  const [activeCategory, setActiveCategory] = useState(urlCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: "All Specs", slug: "all" },
    { name: "Heavyweight Rings", slug: "rings" },
    { name: "Raw Stone", slug: "stone" },
    { name: "Forged Silver", slug: "silver" },
    { name: "Stackers", slug: "stacker" },
    { name: "Commissioned", slug: "custom" },
  ];

  // Fetch Inventory
  useEffect(() => {
    async function fetchInventory() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('shop_inventory')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (data) setItems(data);
      setIsLoading(false);
    }
    fetchInventory();
  }, []); // <-- Empty dependency array!

  // Update active category if URL changes
  useEffect(() => {
      if (urlCategory) setActiveCategory(urlCategory);
  }, [urlCategory]);

  
  // 🟢 Live Filter Logic
  const filteredItems = items.filter(item => {
      // Category Match
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      
      // Search Match (Checks Title, Description, AND the Tags Array)
      const lowerQuery = searchQuery.toLowerCase();
      const matchesSearch = 
            item.title.toLowerCase().includes(lowerQuery) || 
            (item.description && item.description.toLowerCase().includes(lowerQuery)) ||
            (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery)));

      return matchesCategory && matchesSearch;
  });

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
      `}} />
      <div className="noise-bg"></div>

      {/* NAVIGATION */}
      <nav className="w-full p-6 md:p-8 flex justify-between items-center border-b border-white/5 relative z-10 bg-[#05070A]/80 backdrop-blur-sm">
        <Link href="/" className="text-3xl display-font tracking-widest text-white hover:text-[#14B8A6] transition-colors">
            Earthen Miners <span className="labradorite-teal">Designs</span>
        </Link>
        <div className="flex gap-6 items-center">
            <Link href="/workbench" className="text-xs tracking-[0.2em] uppercase font-bold text-[#71717A] hover:text-white transition-colors">Live Forge</Link>
            <div className="text-xs tracking-[0.3em] uppercase font-bold metal-oxidized hidden md:block border-l border-white/10 pl-6">
                Forged from earth & fire
            </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 py-12 md:py-24 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-white/5 pb-8 gap-8">
            <div>
                <h1 className="text-5xl md:text-7xl display-font text-white mb-4 tracking-tight">
                    THE <span className="labradorite-flash">VAULT.</span>
                </h1>
                <p className="text-[#A1A1AA] font-light max-w-xl text-lg">
                    Completed architectures, cooled and ready for acquisition. Filter by specification or search for specific loads.
                </p>
            </div>

            {/* LIVE SEARCH BAR */}
            <div className="w-full md:w-72 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]">🔍</span>
                <input 
                    type="text" 
                    placeholder="Search the vault..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0A0C10] border border-[#27272A] p-4 pl-12 text-white focus:border-[#14B8A6] outline-none text-sm placeholder:text-[#71717A] transition-colors"
                />
            </div>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div className="flex flex-wrap gap-4 mb-16">
            {categories.map((cat) => (
                <button
                    key={cat.slug}
                    onClick={() => setActiveCategory(cat.slug)}
                    className={`px-6 py-3 display-font tracking-widest text-sm transition-all duration-300 border
                        ${activeCategory === cat.slug 
                            ? 'bg-[#14B8A6] text-black border-[#14B8A6] shadow-[0_0_15px_rgba(20,184,166,0.3)]' 
                            : 'bg-[#0A0C10] text-[#71717A] border-[#27272A] hover:border-[#14B8A6] hover:text-white'
                        }
                    `}
                >
                    {cat.name}
                </button>
            ))}
        </div>

        {/* INVENTORY GRID */}
        {isLoading ? (
            <div className="text-center py-24 text-[#71717A] display-font text-2xl animate-pulse">Unlocking Vault...</div>
        ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredItems.map((item) => (
                    <div key={item.id} className="group bg-[#0A0C10] border border-white/5 flex flex-col h-full hover:border-[#B59A54] transition-all duration-500">
                        {/* Image Container */}
                        <div className="aspect-[4/5] bg-[#111419] relative overflow-hidden flex items-center justify-center border-b border-white/5">
                            <img 
    src={item.photos && item.photos.length > 0 ? item.photos[0] : ''} 
    alt={item.title} 
    className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
/>
                            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-white/10 px-3 py-1">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-[#14B8A6]">{item.piece_type}</span>
                            </div>
                        </div>
                        
                        {/* Details Container */}
                        <div className="p-6 flex flex-col flex-grow">
                            <h4 className="text-2xl display-font text-white mb-2 group-hover:text-[#B59A54] transition-colors">{item.title}</h4>
                            <p className="text-sm metal-oxidized mb-6 flex-grow leading-relaxed line-clamp-2">{item.description}</p>
                            
                            {/* Specs Mini-Grid */}
                            <div className="grid grid-cols-2 gap-2 mb-6 border-y border-[#27272A] py-4">
                                <div>
                                    <div className="text-[9px] text-[#71717A] uppercase tracking-widest font-bold mb-1">Weight</div>
                                    <div className="text-xs text-white font-mono">{item.specs?.weight || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-[#71717A] uppercase tracking-widest font-bold mb-1">Size</div>
                                    <div className="text-xs text-white font-mono">{item.specs?.size || 'N/A'}</div>
                                </div>
                            </div>

                            {/* Price & Action */}
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold text-white display-font tracking-wider">${item.price.toFixed(2)}</span>
                                <button className="accent-brass text-xs font-bold tracking-widest uppercase border border-[#B59A54]/30 px-4 py-2 hover:bg-[#B59A54] hover:text-black transition-all">
                                    Acquire
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-32 border border-[#27272A] bg-[#0A0C10]">
                <span className="text-5xl mb-4 block grayscale opacity-30">🕸️</span>
                <h3 className="text-2xl display-font text-white mb-2">NO SPECIMENS FOUND</h3>
                <p className="text-[#71717A]">Try adjusting your filters or searching for different specs.</p>
                <button 
                    onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                    className="mt-6 text-[#14B8A6] text-xs uppercase tracking-widest font-bold border-b border-[#14B8A6]/30 pb-1 hover:border-[#14B8A6]"
                >
                    Clear All Filters
                </button>
            </div>
        )}
      </main>
      
      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 bg-[#05070A] relative z-10 text-center mt-24">
        <div className="text-sm tracking-[0.2em] uppercase font-bold text-white/30">EARTHEN MINERS <span className="labradorite-teal">DESIGNS</span> &copy; {new Date().getFullYear()}</div>
        <p className="text-xs text-white/10 mt-2">Unapologetic Craft. No Molds. No Fluff.</p>
      </footer>
    </div>
  )
}

// 🟢 Export with Suspense boundary required by Next.js for URL parameters
export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#05070A] flex items-center justify-center text-white display-font tracking-widest">Accessing Vault...</div>}>
            <ShopGallery />
        </Suspense>
    )
}