'use client'
// Mark Jewelry Homepage - Industrial Artisan Aesthetic
// Theme: Labradorite (Teal, Cyan, Brass, Oxidized Silver)

export default function Home() {
  
  // 🟢 build categories data template (5 items)
  const buildCategories = [
    { title: "Heavyweight Rings", slug: "rings", description: "Solid .925. 25g+ averages. Built for abuse." },
    { title: "Raw Stone Craftsmanship", slug: "stone", description: "Pendants, bolos, broaches, rings, earings." },
    { title: "Forged Silver", slug: "silver", description: "Hammered wristware. Oxidized and distressed finishes." },
    { title: "Commissioned Pieces", slug: "custom", description: "Your vision, forged from earth and fire. Pick your metals and let's go." },
    { title: "Stacker Rings", slug: "stacker", description: "Wire rings for a self-customizing experience." },
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-[#E0E6ED] font-sans antialiased selection:bg-[#14B8A6]/30 selection:text-[#CCFFFD]">
      {/* 🟢 Labradorite Typography & Styles Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Inter:wght@300;400;600;800&display=swap');
        
        h1, h2, h3, .display-font {
            font-family: 'Oswald', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* Labradorite Color Spectrum */
        .labradorite-flash { color: #00F2FE; text-shadow: 0 0 15px rgba(0,242,254,0.5); }
        .labradorite-teal { color: #14B8A6; }
        .metal-oxidized { color: #71717A; }
        .accent-brass { color: #B59A54; }

        /* Background Noise for Texture */
        .noise-bg {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
            pointer-events: none;
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 50;
        }

        /* Subtle glowing underlay simulating labradorescence */
        .labradorite-glow {
            background: radial-gradient(circle at center, rgba(20,184,166,0.15) 0%, rgba(0,242,254,0.05) 40%, rgba(5,7,10,0) 70%);
        }
      `}} />

      <div className="noise-bg"></div>

      {/* 🟢 NAVIGATION */}
      <nav className="w-full p-6 md:p-8 flex justify-between items-center border-b border-white/5 relative z-10 bg-[#05070A]/80 backdrop-blur-sm">
        <div className="text-3xl display-font tracking-widest text-white">Earthen Miners <span className="labradorite-teal">Designs</span></div>
        <div className="text-xs tracking-[0.3em] uppercase font-bold metal-oxidized hidden md:block">Forged from earth & fire • USA</div>
      </nav>

      {/* 🟢 SECTION 1: THE FORGE STATUS (Hero / "Come with me") */}
      {/* Psychology: Builds intense connection and trust. Proves "handmade." */}
      <header className="relative w-full border-b border-white/5 labradorite-glow">
        <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-0 items-center">
            
            {/* Template for public/banner.png */}
            <div className="md:col-span-3 aspect-[16/10] md:aspect-auto md:h-full border-r border-white/5 bg-[#0A0C10] relative overflow-hidden group">
                <img 
                    src="/banner2.png"  // ⚠️ THIS IS YOUR UPDATEABLE IMAGE
                    alt="Current state of the forge workbench" 
                    className="w-full h-full object-cover transition-transform duration-[20s] scale-105 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 p-3 backdrop-blur-sm border border-white/10">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F2FE] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00F2FE]"></span>
                    </div>
                    <span className="display-font text-white tracking-widest text-sm">LIVE FROM THE WORKBENCH</span>
                </div>
            </div>

            {/* Current Process Copy */}
            <div className="md:col-span-2 p-8 md:p-16 flex flex-col justify-center">
                <span className="text-sm font-semibold tracking-[0.2em] uppercase metal-oxidized mb-3">CURRENT PROJECT LOG</span>
                <h1 className="text-6xl md:text-7xl font-bold leading-[0.9] mb-6 text-white display-font tracking-tight">
                    Follow <br /> The <span className="labradorite-flash">Build.</span>
                </h1>
                <div className="border-l-2 border-[#14B8A6] pl-6 py-1 mb-8">
                    <p className="text-lg md:text-xl text-[#A1A1AA] font-light leading-relaxed">
                        I don't stockpile inventory. I forge one piece at a time. Right now, on the bench, is a custom stone pendant set in solid silver undergoing heavy hand-hammering and deep oxidation.
                    </p>
                    <p className="text-sm text-white/50 mt-4 italic">Updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                </div>
                <button className="w-full md:w-fit bg-[#B59A54] text-black display-font text-lg tracking-[0.2em] px-10 py-5 hover:bg-white transition-colors duration-300">
                    Claim the current project
                </button>
            </div>
        </div>
      </header>

      {/* 🟢 SECTION 2: 5 CATEGORIES OF BUILDS */}
      {/* Psychology: Industrial structure, metallurgy-focused specs. */}
      <section className="bg-[#0A0C10] py-24 border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6 border-b border-white/10 pb-8">
                <h2 className="text-4xl md:text-5xl display-font text-white uppercase">Build Categories</h2>
                <p className="metal-oxidized font-light max-w-md md:text-right">Industrial architectures set with geological specimens. Choose your loadout.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
                {buildCategories.map((category, index) => (
                    <a href={`/shop?category=${category.slug}`} key={index} className="group bg-[#05070A] border border-white/5 p-6 hover:border-[#14B8A6] transition-all duration-300 flex flex-col h-full">
                        <div className="aspect-square bg-[#111419] mb-6 flex items-center justify-center border border-white/5 group-hover:border-[#14B8A6]/30">
                            {/* Template Placeholder for category icon/image */}
                            <span className="text-xs text-white/20 display-font">[{category.slug.toUpperCase()} IMAGE]</span>
                        </div>
                        <h3 className="text-xl display-font mb-2 text-white group-hover:text-[#00F2FE]">{category.title}</h3>
                        <p className="text-sm text-[#A1A1AA] font-light leading-relaxed flex-grow">{category.description}</p>
                        <span className="accent-brass text-xs font-bold tracking-widest uppercase mt-6 block group-hover:translate-x-1 transition-transform">&rarr; View Specs</span>
                    </a>
                ))}
            </div>
        </div>
      </section>

      {/* 🟢 SECTION 3: SOCIAL PROOF (REVIEWS) */}
      {/* Psychology: Emphasizes weight, durability, and raw authenticity. */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <h2 className="text-4xl md:text-5xl display-font text-center mb-16 text-white uppercase tracking-wider">Ironclad Verdicts</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
            {/* Review Template 1 */}
            <div className="bg-[#0A0C10] p-8 border border-white/5 relative group rounded-sm overflow-hidden">
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#14B8A6] opacity-5 blur-3xl group-hover:opacity-10 transition-opacity"></div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#A1A1AA] mb-1 font-semibold"><span>5.0</span> <span className="labradorite-flash">★★★★★</span></div>
                <p className="text-lg md:text-xl font-bold leading-relaxed mb-6 uppercase text-white tracking-wide">
                    "Finally, jewelry that doesn't feel fragile. You know you're wearing it. This ring is a solid piece of industrial art. Biker tested."
                </p>
                <p className="text-xs tracking-[0.2em] uppercase metal-oxidized font-bold">— Jax M., CA</p>
            </div>
            {/* Review Template 2 */}
            <div className="bg-[#0A0C10] p-8 border border-white/5 relative group rounded-sm overflow-hidden">
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#14B8A6] opacity-5 blur-3xl group-hover:opacity-10 transition-opacity"></div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#A1A1AA] mb-1 font-semibold"><span>5.0</span> <span className="labradorite-flash">★★★★★</span></div>
                <p className="text-lg md:text-xl font-bold leading-relaxed mb-6 uppercase text-white tracking-wide">
                    "The Labradorite stone has incredible flash, set deep into massive silver. I don't dread documenting my day anymore because I just want to look at this ring."
                </p>
                <p className="text-xs tracking-[0.2em] uppercase metal-oxidized font-bold">— James Harfield, NY</p>
            </div>
            {/* Review Template 3 */}
            <div className="bg-[#0A0C10] p-8 border border-white/5 relative group rounded-sm overflow-hidden">
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#14B8A6] opacity-5 blur-3xl group-hover:opacity-10 transition-opacity"></div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#A1A1AA] mb-1 font-semibold"><span>5.0</span> <span className="labradorite-flash">★★★★★</span></div>
                <p className="text-lg md:text-xl font-bold leading-relaxed mb-6 uppercase text-white tracking-wide">
                    "I ordered a pendant and asked for a specific hammered finish. Mark hit it perfectly. It looks like it was dug out of an ancient forge."
                </p>
                <p className="text-xs tracking-[0.2em] uppercase metal-oxidized font-bold">— Collector, TX</p>
            </div>
        </div>
      </section>

      {/* 🟢 SECTION 4: SHOP DISPLAY (Individual Items) */}
      {/* Psychology: Focus on specific weight, metallurgy, and geological specs. */}
      <section className="bg-[#0A0C10] py-24 border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
                <h2 className="text-4xl md:text-5xl display-font text-white uppercase tracking-wider">Available Handiworks</h2>
                <a href="/shop" className="w-fit border border-[#B59A54] text-[#B59A54] display-font tracking-[0.2em] px-8 py-3 hover:bg-[#B59A54] hover:text-black transition-colors text-sm">
                    Shop Entire Forge
                </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {/* Product Template 1 */}
                <div className="group bg-[#05070A] border border-white/5">
                    <div className="aspect-square bg-[#111419] border-b border-white/5 relative overflow-hidden flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500">
                        <span className="text-xs text-white/20 display-font">[Product Image]</span>
                    </div>
                    <div className="p-6">
                        <h4 className="text-xl display-font text-white mb-2 group-hover:labradorite-teal transition-colors">The Asphalt Signet</h4>
                        <p className="text-sm metal-oxidized mb-4">Solid .925 Silver / 38g / Deep Oxidation finish.</p>
                        <div className="flex justify-between items-baseline border-t border-white/5 pt-4">
                            <span className="text-lg font-bold text-white">$240.00</span>
                            <span className="accent-brass text-[10px] font-bold tracking-widest uppercase">View Specs</span>
                        </div>
                    </div>
                </div>
                 {/* Product Template 2 */}
                 <div className="group bg-[#05070A] border border-white/5">
                    <div className="aspect-square bg-[#111419] border-b border-white/5 relative overflow-hidden flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500">
                        <span className="text-xs text-white/20 display-font">[Product Image]</span>
                    </div>
                    <div className="p-6">
                        <h4 className="text-xl display-font text-white mb-2 group-hover:labradorite-teal transition-colors">Raw Onyx Pendant</h4>
                        <p className="text-sm metal-oxidized mb-4">Jagged stone / Forged bezel / 24" heavy chain.</p>
                        <div className="flex justify-between items-baseline border-t border-white/5 pt-4">
                            <span className="text-lg font-bold text-white">$185.00</span>
                            <span className="accent-brass text-[10px] font-bold tracking-widest uppercase">View Specs</span>
                        </div>
                    </div>
                </div>
                 {/* Product Template 3 */}
                 <div className="group bg-[#05070A] border border-white/5">
                    <div className="aspect-square bg-[#111419] border-b border-white/5 relative overflow-hidden flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500">
                        <span className="text-xs text-white/20 display-font">[Product Image]</span>
                    </div>
                    <div className="p-6">
                        <h4 className="text-xl display-font text-white mb-2 group-hover:labradorite-teal transition-colors">Distressed Copper Cuff</h4>
                        <p className="text-sm metal-oxidized mb-4">Heat-treated copper / Hammered texture / 8mm width.</p>
                        <div className="flex justify-between items-baseline border-t border-white/5 pt-4">
                            <span className="text-lg font-bold text-white">$95.00</span>
                            <span className="accent-brass text-[10px] font-bold tracking-widest uppercase">View Specs</span>
                        </div>
                    </div>
                </div>
                 {/* Product Template 4 */}
                 <div className="group bg-[#05070A] border border-white/5">
                    <div className="aspect-square bg-[#111419] border-b border-white/5 relative overflow-hidden flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500">
                        <span className="text-xs text-white/20 display-font">[Product Image]</span>
                    </div>
                    <div className="p-6">
                        <h4 className="text-xl display-font text-white mb-2 group-hover:labradorite-teal transition-colors">Labradorite Flash Ring</h4>
                        <p className="text-sm metal-oxidized mb-4">Solid .925 Silver / 42g / Heavy flash grade stone.</p>
                        <div className="flex justify-between items-baseline border-t border-white/5 pt-4">
                            <span className="text-lg font-bold text-white">$275.00</span>
                            <span className="accent-brass text-[10px] font-bold tracking-widest uppercase">View Specs</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 🟢 FOOTER */}
      <footer className="py-12 border-t border-white/5 bg-[#05070A] relative z-10 text-center">
        <div className="text-sm tracking-[0.2em] uppercase font-bold text-white/30">EARTHEN MINERS <span className="labradorite-teal">DESIGNS</span> &copy; {new Date().getFullYear()}</div>
        <p className="text-xs text-white/10 mt-2">Unapologetic Craft. No Molds. No Fluff.</p>
      </footer>
    </div>
  )
}