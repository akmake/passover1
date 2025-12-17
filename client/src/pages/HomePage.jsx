import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

const Marquee = ({ text }) => (
  <div className="overflow-hidden py-6 bg-white text-black border-y border-black/10">
    <motion.div 
      className="whitespace-nowrap flex gap-12"
      animate={{ x: [0, -1000] }}
      transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
    >
      {[...Array(10)].map((_, i) => (
        <span key={i} className="text-4xl md:text-6xl font-serif tracking-tight uppercase opacity-80">
          {text} — 
        </span>
      ))}
    </motion.div>
  </div>
);

const HomePage = () => {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);

  return (
    <div className="bg-[#050505] min-h-screen text-white selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* 1. HERO SECTION: VIDEO BACKGROUND */}
      <section className="relative h-screen w-full overflow-hidden flex flex-col justify-center items-center">
        <motion.div style={{ y: yHero }} className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/50 z-10" />
            {/* שימוש בוידאו/GIF איכותי לרקע */}
            <img 
                src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000" 
                alt="Luxury Interior" 
                className="w-full h-full object-cover scale-105"
            />
        </motion.div>
        
        <div className="relative z-20 text-center px-4 max-w-5xl">
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-[#d4af37] text-sm md:text-base tracking-[0.4em] uppercase mb-4"
            >
                Est. 2024 • Tel Aviv
            </motion.p>
            <motion.h1 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-6xl md:text-9xl font-serif tracking-wide text-white leading-tight mb-8"
            >
                MAISON <br /> <span className="italic font-light opacity-70">DE LUXE</span>
            </motion.h1>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
            >
                <Link to="/menu" className="inline-block border border-white/30 px-12 py-4 hover:bg-white hover:text-black transition-all duration-500 uppercase tracking-widest text-sm backdrop-blur-sm">
                    View Collection
                </Link>
            </motion.div>
        </div>
      </section>

      <Marquee text="Timeless Design • Modern Living • Pure Elegance" />

      {/* 2. INTRO EDITORIAL */}
      <section className="py-32 px-6 md:px-20 max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
        <div className="md:w-1/2">
            <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200" alt="Chair" className="w-full grayscale hover:grayscale-0 transition-all duration-1000" />
        </div>
        <div className="md:w-1/2 text-center md:text-left rtl:text-right">
            <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">
                Curating the <br /> <span className="text-[#d4af37] italic">Exceptional</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8 font-light">
                אנחנו לא מוכרים רהיטים. אנחנו מוכרים אווירה. כל פריט בקולקציה נבחר בקפידה כדי להפוך את החלל שלך למקדש של רוגע ויופי. מהטקסטורה של הקטיפה ועד לקרירות של השיש.
            </p>
            <Link to="/menu" className="text-white border-b border-[#d4af37] pb-1 uppercase tracking-widest text-xs hover:text-[#d4af37] transition-colors">
                Read Our Story
            </Link>
        </div>
      </section>

      {/* 3. BENTO GRID CATEGORIES */}
      <section className="py-20 px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[120vh] md:h-[80vh]">
            
            {/* FURNITURE - Large Left */}
            <Link to="/menu?category=furniture" className="md:col-span-2 md:row-span-2 relative group overflow-hidden">
                <img src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=1000" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                <div className="absolute bottom-8 left-8 z-10">
                    <h3 className="text-3xl font-serif italic">Furniture</h3>
                </div>
            </Link>

            {/* LIGHTING - Top Right */}
            <Link to="/menu?category=lighting" className="md:col-span-2 relative group overflow-hidden">
                <img src="https://images.unsplash.com/photo-1513506003011-38f04415426a?q=80&w=1000" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                <div className="absolute bottom-8 left-8 z-10">
                    <h3 className="text-3xl font-serif italic">Lighting</h3>
                </div>
            </Link>

            {/* DECOR - Bottom Middle */}
            <Link to="/menu?category=decor" className="relative group overflow-hidden">
                <img src="https://images.unsplash.com/photo-1581783342308-f792ca11dfdd?q=80&w=1000" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                <div className="absolute bottom-8 left-8 z-10">
                    <h3 className="text-2xl font-serif italic">Decor</h3>
                </div>
            </Link>

            {/* TEXTILES - Bottom Right */}
            <Link to="/menu?category=textiles" className="relative group overflow-hidden">
                <img src="https://images.unsplash.com/photo-1617325247661-675ab4b64ae8?q=80&w=1000" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                <div className="absolute bottom-8 left-8 z-10">
                    <h3 className="text-2xl font-serif italic">Textiles</h3>
                </div>
            </Link>
        </div>
      </section>

      {/* 4. NEWSLETTER */}
      <section className="py-32 bg-[#0a0a0a] text-center border-t border-white/5">
        <h3 className="text-4xl font-serif mb-6">Join The List</h3>
        <p className="text-gray-500 mb-8 tracking-widest uppercase text-xs">Unlock exclusive access to new arrivals</p>
        <div className="flex flex-col md:flex-row justify-center gap-0 max-w-md mx-auto">
            <input type="email" placeholder="YOUR EMAIL" className="bg-transparent border-b border-white/30 py-3 px-4 focus:outline-none focus:border-white text-center md:text-left w-full placeholder:text-gray-600" />
            <button className="mt-4 md:mt-0 md:ml-4 text-xs tracking-widest uppercase hover:text-[#d4af37] transition-colors">Subscribe</button>
        </div>
      </section>

    </div>
  );
};

export default HomePage;