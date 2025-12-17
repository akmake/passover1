import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

const GoldButton = ({ children, to, variant = 'dark' }) => {
  const isDark = variant === 'dark';
  return (
    <Link to={to} className="inline-block relative group overflow-hidden">
      <div className={`
        relative px-8 py-3 md:py-4 border transition-all duration-500 ease-out
        ${isDark ? 'border-[#D4AF37] text-white' : 'border-[#0a0a0a] text-[#0a0a0a]'}
      `}>
        <span className="relative z-10 font-serif tracking-[0.2em] text-xs uppercase group-hover:text-white transition-colors duration-500">
          {children}
        </span>
        <div className={`
          absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left
          ${isDark ? 'bg-[#D4AF37]' : 'bg-[#0a0a0a]'}
        `} />
      </div>
    </Link>
  );
};

const SectionHeading = ({ subtitle, title, color = 'white', align = 'center' }) => (
  <div className={`text-${align} mb-12`}>
    <motion.span 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`block text-xs font-bold tracking-[0.3em] uppercase mb-4 ${color === 'white' ? 'text-[#D4AF37]' : 'text-[#9C824A]'}`}
    >
      {subtitle}
    </motion.span>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className={`text-3xl md:text-5xl font-serif ${color === 'white' ? 'text-white' : 'text-[#0a0a0a]'}`}
    >
      {title}
    </motion.h2>
    <div className={`h-[1px] w-16 bg-[#D4AF37] mt-6 ${align === 'center' ? 'mx-auto' : ''}`} />
  </div>
);

const HomePage = () => {
  // קביעת רקע שחור בסיסי
  useEffect(() => {
    document.body.style.backgroundColor = '#0a0a0a';
    return () => { document.body.style.backgroundColor = ''; };
  }, []);

  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <div className="w-full overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-screen w-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-60">
           {/* תמונה אבסטרקטית יוקרתית של פרחים/זהב */}
           <img 
            src="https://images.unsplash.com/photo-1562690868-60bbe762151c?q=80&w=2000" 
            className="w-full h-full object-cover" 
            alt="Luxury Flowers"
           />
        </div>
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-6xl md:text-9xl font-serif text-white tracking-tight mb-4">
              ALEI ZAHAV
            </h1>
            <p className="text-[#D4AF37] text-sm md:text-lg tracking-[0.4em] uppercase font-light mb-8">
              Gifts with Honor
            </p>
            <GoldButton to="/menu" variant="dark">לכניסה לחנות</GoldButton>
          </motion.div>
        </div>
      </section>

      {/* 2. ABOUT US (Beige Background) */}
      <section className="relative py-24 px-6 md:px-20 bg-[#F4F1EA] text-[#0a0a0a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[500px] w-full"
          >
            <div className="absolute top-4 left-4 right-[-16px] bottom-[-16px] border border-[#D4AF37]" />
            <img 
              src="https://images.unsplash.com/photo-1546842931-886c185b4c8c?q=80&w=1000" 
              alt="Bridal Bouquet" 
              className="w-full h-full object-cover relative z-10"
            />
          </motion.div>

          <div className="md:pl-10 text-center md:text-right rtl:text-right">
            <SectionHeading 
              subtitle="מי אנחנו" 
              title="מתנות עם כבוד" 
              color="dark" 
              align="right" 
            />
            <p className="text-lg leading-relaxed text-gray-700 font-light mb-6">
              "עלי זהב" הוא המרכז הגדול לזרי פרחים בשלל סגנונות ועיצובים ייחודיים. 
              אצלנו תמצאו שוזרת ומעצבת מקצועית עם טאץ' אישי שתהפוך כל זר ליצירת אומנות.
            </p>
            <p className="text-lg leading-relaxed text-gray-700 font-light mb-8">
              אנו מתמחים במתנות יוקרה מהחברות המובילות לכל מטרה: 
              מתנות ליולדת, למחותנים, לכלה, ועדי עובדים ועוד.
            </p>
            <GoldButton to="/menu" variant="light">לקולקציה המלאה</GoldButton>
          </div>
        </div>
      </section>

      {/* 3. BRANDS & CATEGORIES (White Background) */}
      <section className="py-24 px-6 bg-white">
        <SectionHeading subtitle="המותגים שלנו" title="איכות ללא פשרות" color="dark" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* כרטיס 1: פרחים */}
          <Link to="/menu?category=flowers" className="group relative h-[450px] overflow-hidden cursor-pointer">
            <img 
              src="https://images.unsplash.com/photo-1563241527-94a12533c631?q=80&w=800" 
              alt="Flowers" 
              className="w-full h-full object-cover transition-transform duration-[1s] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            <div className="absolute bottom-8 left-0 right-0 text-center z-10 text-white">
              <h3 className="text-2xl font-serif mb-2">זרי פרחים</h3>
              <span className="text-xs tracking-widest uppercase border-b border-white pb-1">לעיצובים</span>
            </div>
          </Link>

          {/* כרטיס 2: בריליאנט */}
          <Link to="/menu?category=dinnerware" className="group relative h-[450px] overflow-hidden cursor-pointer md:-mt-8">
            <img 
              src="https://images.unsplash.com/photo-1577905753086-647d6d370146?q=80&w=800" 
              alt="Brilliant Dinnerware" 
              className="w-full h-full object-cover transition-transform duration-[1s] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            <div className="absolute bottom-8 left-0 right-0 text-center z-10 text-white">
              <h3 className="text-2xl font-serif mb-2">בריליאנט</h3>
              <span className="text-xs tracking-widest uppercase border-b border-white pb-1">מערכות אוכל וסכו"ם</span>
            </div>
          </Link>

          {/* כרטיס 3: שוקולטינה */}
          <Link to="/menu?category=chocolate" className="group relative h-[450px] overflow-hidden cursor-pointer">
            <img 
              src="https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=800" 
              alt="Chocolatina" 
              className="w-full h-full object-cover transition-transform duration-[1s] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            <div className="absolute bottom-8 left-0 right-0 text-center z-10 text-white">
              <h3 className="text-2xl font-serif mb-2">שוקולטינה</h3>
              <span className="text-xs tracking-widest uppercase border-b border-white pb-1">פרלינים ומתוקים</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. SIGNATURE ITEM (Black & Gold) */}
      <section className="relative py-32 bg-[#0a0a0a] text-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 text-center md:text-right rtl:text-right">
             <span className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-4 block">הבחירה המושלמת</span>
             <h2 className="text-4xl md:text-6xl font-serif mb-6">
               מתנה עם <br /> <span className="italic font-light opacity-80">כבוד</span>
             </h2>
             <p className="text-gray-400 text-lg mb-10 font-light">
               בין אם זו מתנה ליולדת, למחותנים או לכלה - אנחנו נדאג שהמתנה תהיה מכובדת, מרשימה ומעוצבת בטוב טעם. אביזרים דקורטיביים לעריכת השולחן שישדרגו כל אירוח.
             </p>
             <GoldButton to="/menu?category=gifts" variant="dark">צפה במארזים</GoldButton>
          </div>
          
          <div className="md:w-1/2">
            <motion.div 
              style={{ y: yParallax }}
              className="relative aspect-square"
            >
               <div className="absolute inset-4 border border-white/20" />
               <img 
                 src="https://images.unsplash.com/photo-1512918760513-95f192972563?q=80&w=1000" 
                 alt="Luxury Gift" 
                 className="w-full h-full object-cover shadow-2xl"
               />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. NEWSLETTER (Beige) */}
      <section className="py-20 bg-[#F4F1EA] text-center px-6">
        <h3 className="text-2xl font-serif text-[#0a0a0a] mb-4">מועדון הלקוחות</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto font-light">
          הצטרפו אלינו וקבלו עדכונים על קולקציות חדשות והטבות לחגים.
        </p>
        <div className="flex flex-col sm:flex-row justify-center max-w-md mx-auto border-b border-[#0a0a0a] pb-2">
          <input 
            type="email" 
            placeholder="כתובת אימייל" 
            className="bg-transparent text-[#0a0a0a] placeholder-gray-500 focus:outline-none flex-grow py-2 px-2 text-right"
          />
          <button className="text-[#0a0a0a] uppercase tracking-widest text-xs font-bold hover:text-[#D4AF37] transition-colors mt-4 sm:mt-0">
            הרשמה
          </button>
        </div>
      </section>

    </div>
  );
};

export default HomePage;