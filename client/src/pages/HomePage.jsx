import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { Link } from 'react-router-dom';

// --- רכיבי עזר לאנימציות ---

/** כפתור יוקרתי עם אפקט מילוי עדין */
const LuxuryButton = ({ children, onClick, className = "" }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`relative px-8 py-4 overflow-hidden group border border-white/30 bg-transparent text-white font-serif tracking-[0.2em] uppercase text-sm transition-all hover:border-white ${className}`}
  >
    <span className="relative z-10">{children}</span>
    <div className="absolute inset-0 h-full w-full bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
  </motion.button>
);

/** כרטיס מוצר עם אפקט Tilt (תלת מימד) לפי עכבר */
const TiltCard = ({ title, subtitle, image, link }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = (e.clientX - rect.left) * 32.5;
    const mouseY = (e.clientY - rect.top) * 32.5;
    const rX = (mouseY / height - 32.5 / 2) * -1;
    const rY = (mouseX / width - 32.5 / 2);
    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: x, rotateY: y, transformStyle: "preserve-3d" }}
      className="relative h-[500px] w-full cursor-pointer group perspective-1000"
    >
      <Link to={link || '/menu'} className="block h-full w-full">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10 duration-500" />
        <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        
        <div className="absolute bottom-10 left-0 right-0 text-center z-20 translate-z-20">
          <p className="text-white/80 text-xs tracking-[0.3em] uppercase mb-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            {subtitle}
          </p>
          <h3 className="text-3xl text-white font-serif tracking-widest">
            {title}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
};

// --- הדף הראשי ---

const HomePage = () => {
  // גלילת Parallax לרקע
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityRange = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white overflow-x-hidden selection:bg-[#d4af37] selection:text-black">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* רקע וידאו/תמונה עם Parallax */}
        <motion.div style={{ y: yRange }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" /> {/* Overlay כהה */}
          <img 
            src="https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=2070&auto=format&fit=crop" 
            alt="Luxury Background" 
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* תוכן Hero */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <p className="text-[#d4af37] text-sm md:text-base tracking-[0.4em] uppercase mb-6 font-light">
              Welcome to The Exclusive
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-serif tracking-wider mb-8 text-white mix-blend-overlay"
          >
            TIMELESS <br /> ELEGANCE
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <Link to="/menu">
              <LuxuryButton>גלה את הקולקציה</LuxuryButton>
            </Link>
          </motion.div>
        </div>

        {/* אינדיקטור גלילה */}
        <motion.div 
          style={{ opacity: opacityRange }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/50">Scroll</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </section>

      {/* 2. PHILOSOPHY SECTION (טקסט מינימליסטי) */}
      <section className="py-24 px-6 md:px-20 bg-[#0f0f0f]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-xl md:text-3xl font-serif leading-relaxed text-neutral-300"
          >
            "יוקרה היא לא רק מחיר, היא חוויה. אנו אוצרים עבורכם את המתנות המרגשות ביותר, בעיצוב עוצר נשימה ובאיכות ללא פשרות."
          </motion.p>
          <div className="w-24 h-[1px] bg-[#d4af37] mx-auto mt-12" />
        </div>
      </section>

      {/* 3. FEATURED COLLECTIONS (גריד עם אפקט) */}
      <section className="py-20 px-4 md:px-12 bg-[#0a0a0a]">
        <div className="flex justify-between items-end mb-16 max-w-7xl mx-auto">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-2">קולקציות נבחרות</h2>
            <p className="text-neutral-500 tracking-widest uppercase text-sm">Curated for perfection</p>
          </div>
          <Link to="/menu" className="hidden md:block text-[#d4af37] hover:text-white transition-colors tracking-widest text-sm uppercase border-b border-[#d4af37] pb-1">
            צפה בהכל
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* כרטיס 1: שעונים */}
          <TiltCard 
            title="WATCHES" 
            subtitle="Swiss Engineering"
            image="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1780&auto=format&fit=crop"
            link="/menu?category=watches"
          />
          
          {/* כרטיס 2: תכשיטים - מודגש */}
          <div className="md:-mt-12"> {/* Shift layout for asymmetry */}
            <TiltCard 
              title="JEWELRY" 
              subtitle="Rare Diamonds"
              image="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop"
              link="/menu?category=jewelry"
            />
          </div>

          {/* כרטיס 3: בשמים */}
          <TiltCard 
            title="PERFUME" 
            subtitle="Signature Scents"
            image="https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=2080&auto=format&fit=crop"
            link="/menu?category=perfumes"
          />
        </div>
      </section>

      {/* 4. SPLIT FEATURE SECTION */}
      <section className="py-32 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          {/* תמונה עם אנימציית חשיפה */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative h-[600px] w-full"
          >
            <div className="absolute inset-0 border border-[#d4af37]/30 translate-x-4 translate-y-4" /> {/* מסגרת דקורטיבית */}
            <img 
              src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop" 
              alt="Exclusive Gift"
              className="w-full h-full object-cover relative z-10 grayscale hover:grayscale-0 transition-all duration-700"
            />
          </motion.div>

          {/* טקסט */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-right md:text-left rtl:text-right" // תמיכה בעברית/אנגלית
          >
            <span className="text-[#d4af37] tracking-[0.3em] uppercase text-sm font-bold">New Arrival</span>
            <h2 className="text-4xl md:text-6xl font-serif text-white mt-4 mb-6 leading-tight">
              מארז הזהב <br /> המלכותי
            </h2>
            <p className="text-neutral-400 text-lg leading-relaxed mb-8 font-light">
              שילוב נדיר של אומנות ועיצוב. המארז כולל שעון יוקרה, בקבוק וויסקי מיושן ושוקולד בלגי בעבודת יד. המתנה המושלמת למי שיש לו הכל.
            </p>
            <Link to="/package/golden-set">
              <button className="text-white border-b border-white pb-2 hover:text-[#d4af37] hover:border-[#d4af37] transition-all tracking-widest uppercase text-sm">
                הזמן עכשיו
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 5. NEWSLETTER / FOOTER CTA */}
      <section className="py-24 bg-[#0a0a0a] border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="relative z-10 max-w-xl mx-auto text-center px-4">
          <h3 className="text-3xl font-serif text-white mb-4">הצטרפו למועדון האקסקלוסיבי</h3>
          <p className="text-neutral-500 mb-8">קבלו עדכונים על השקות מיוחדות ומכירות פרטיות.</p>
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="email" 
              placeholder="כתובת האימייל שלך" 
              className="flex-1 bg-transparent border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors placeholder:text-neutral-700"
            />
            <button className="bg-white text-black px-8 py-3 uppercase tracking-widest text-sm hover:bg-[#d4af37] transition-colors font-medium">
              הרשמה
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;