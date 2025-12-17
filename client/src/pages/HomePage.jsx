import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

const Marquee = ({ text }) => (
  <div className="overflow-hidden py-4 bg-white text-black border-y border-black">
    <motion.div 
      className="whitespace-nowrap flex gap-12"
      animate={{ x: [0, -1000] }}
      transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
    >
      {[...Array(10)].map((_, i) => (
        <span key={i} className="text-4xl md:text-6xl font-serif tracking-tight uppercase">
          {text} — 
        </span>
      ))}
    </motion.div>
  </div>
);

const FeaturedSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        <div className="bg-[#111] p-12 flex flex-col justify-center items-start">
            <span className="text-[#888] text-xs tracking-[0.3em] uppercase mb-6">New Arrival</span>
            <h2 className="text-5xl md:text-7xl font-serif text-white mb-8 leading-tight">
                The Velvet <br /> Collection
            </h2>
            <p className="text-gray-400 text-lg max-w-md font-light mb-12">
                רכות בלתי מתפשרת וצבעים עמוקים. הקולקציה החדשה שלנו מביאה את המלון לתוך הסלון.
            </p>
            <Link to="/menu?category=furniture" className="border-b border-white text-white pb-2 text-xs uppercase tracking-widest hover:text-gray-300 hover:border-gray-300 transition-all">
                Shop The Look
            </Link>
        </div>
        <div className="relative h-[50vh] md:h-auto overflow-hidden">
            <img 
                src="https://images.unsplash.com/photo-1550226891-ef816aed4a98?q=80&w=1200" 
                alt="Velvet Sofa" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1.5s]"
            />
        </div>
    </div>
);

const HomePage = () => {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);

  return (
    <div className="bg-[#050505] min-h-screen text-white selection:bg-white selection:text-black">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-screen w-full overflow-hidden flex flex-col justify-center items-center">
        <motion.div style={{ y: yHero }} className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img 
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=2000" 
                alt="Hero" 
                className="w-full h-full object-cover"
            />
        </motion.div>
        
        <div className="relative z-20 text-center mix-blend-difference px-4">
            <motion.h1 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="text-[15vw] leading-none font-serif tracking-tighter text-white"
            >
                MAISON
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-lg md:text-xl font-light tracking-widest mt-4 uppercase"
            >
                Art of Living
            </motion.p>
        </div>
        
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-10 z-20 text-xs tracking-[0.3em] uppercase"
        >
            Scroll to Explore
        </motion.div>
      </section>

      <Marquee text="Timeless Design for Modern Living" />

      {/* 2. CATEGORY HIGHLIGHTS */}
      <section className="py-24 px-6 md:px-12">
        <div className="flex justify-between items-end mb-16">
            <h2 className="text-3xl font-serif">Curated Spaces</h2>
            <Link to="/menu" className="text-xs uppercase tracking-widest border-b border-white pb-1">View All</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[80vh]">
            <Link to="/menu?category=furniture" className="relative group h-full overflow-hidden block">
                <img src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                <span className="absolute bottom-8 left-8 text-2xl font-serif z-10">Furniture</span>
            </Link>
            <Link to="/menu?category=decor" className="relative group h-full overflow-hidden block md:mt-12">
                <img src="https://images.unsplash.com/photo-1581783342308-f792ca11dfdd?q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                <span className="absolute bottom-8 left-8 text-2xl font-serif z-10">Decor</span>
            </Link>
            <Link to="/menu?category=lighting" className="relative group h-full overflow-hidden block">
                <img src="https://images.unsplash.com/photo-1513506003011-38f04415426a?q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                <span className="absolute bottom-8 left-8 text-2xl font-serif z-10">Lighting</span>
            </Link>
        </div>
      </section>

      <FeaturedSection />

      {/* 3. QUOTE */}
      <section className="py-40 px-8 text-center bg-white text-black">
        <p className="text-3xl md:text-5xl font-serif max-w-4xl mx-auto leading-tight">
          "Architecture is really about well-being. I think that people want to feel good in a space."
        </p>
        <span className="block mt-8 text-xs tracking-widest uppercase text-gray-500">— Zaha Hadid</span>
      </section>

    </div>
  );
};

export default HomePage;