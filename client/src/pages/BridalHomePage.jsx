import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Sun, Moon, ArrowLeft } from 'lucide-react';

const BridalHomePage = () => {
  // --- STATE FOR "THE GAME" (MOOD SLIDER) ---
  const [mood, setMood] = useState(50); // 0 = Night, 100 = Day
  const containerRef = useRef(null);

  // --- MOUSE TILT EFFECT FOR CHAIR ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    mouseX.set(x); 
    mouseY.set(y);
  };

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

  // --- DYNAMIC STYLES BASED ON MOOD ---
  // חישוב צבעים בזמן אמת לפי הסליידר
  const bgColor = `hsl(${45 + (mood * 0.1)}, ${20 + (mood * 0.1)}%, ${mood < 20 ? 8 : 95}%)`;
  const textColor = mood < 40 ? '#ffffff' : '#1a1a1a';
  const accentColor = mood < 40 ? '#D4AF37' : '#C4A484';
  const imageBrightness = 0.6 + (mood / 200); // 0.6 to 1.1

  return (
    <motion.div 
      ref={containerRef}
      animate={{ backgroundColor: bgColor }}
      transition={{ duration: 0.5 }} // מעבר חלק בצבעים
      className="min-h-screen transition-colors duration-500 overflow-x-hidden selection:bg-[#D4AF37] selection:text-white"
    >
      
      {/* --- IMPORT DESIGNER HEBREW FONTS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;500;700;900&family=Heebo:wght@100;300;400&display=swap');
        
        .font-royal-hebrew { font-family: 'Frank Ruhl Libre', serif; }
        .font-clean-hebrew { font-family: 'Heebo', sans-serif; }
        
        /* Custom Range Slider Styling */
        input[type=range] {
          -webkit-appearance: none; 
          background: transparent; 
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #D4AF37;
          cursor: pointer;
          margin-top: -10px; 
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 2px;
          cursor: pointer;
          background: ${mood < 40 ? '#ffffff30' : '#00000020'};
        }
      `}</style>

      {/* --- HEADER --- */}
      <nav className="fixed w-full p-8 flex justify-between items-center z-50 mix-blend-difference text-white">
        <div className="font-royal-hebrew text-2xl font-black tracking-wider">עלי זהב</div>
        <Link to="/contact">
           <button className="border border-white/50 px-6 py-2 rounded-full font-clean-hebrew text-xs font-bold hover:bg-white hover:text-black transition-all">
             הזמנה מהירה
           </button>
        </Link>
      </nav>

      {/* --- HERO SECTION: THE INTERACTIVE STAGE --- */}
      <section className="min-h-screen flex flex-col md:flex-row items-center justify-center relative px-6 pt-20 overflow-hidden">
        
        {/* TEXT BEHIND (PARALLAX) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-0 pointer-events-none">
           <motion.h1 
             style={{ color: textColor, opacity: 0.1 }}
             className="font-royal-hebrew text-[25vw] leading-none font-black select-none whitespace-nowrap"
           >
             מלכות
           </motion.h1>
        </div>

        {/* --- THE CHAIR (INTERACTIVE TILT) --- */}
        <div 
          className="relative z-10 perspective-1000"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
        >
          <motion.div 
            style={{ rotateX, rotateY, filter: `brightness(${imageBrightness}) drop-shadow(0px 20px 30px rgba(0,0,0,${0.2 + (100-mood)/200}))` }}
            className="w-[80vw] md:w-[40vw] max-w-[600px] cursor-grab active:cursor-grabbing"
          >
             <img src="/uploads/345.png" alt="Royal Chair" className="w-full h-full object-contain" />
             
             {/* Hotspot: Price Tag */}
             <motion.div 
               whileHover={{ scale: 1.1 }}
               className="absolute top-[20%] right-[10%] bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-xl cursor-pointer"
             >
                <p className="font-clean-hebrew text-[10px] uppercase tracking-widest text-white/80">דגם 2026</p>
                <p style={{ color: accentColor }} className="font-royal-hebrew text-2xl font-bold">₪3,200</p>
             </motion.div>
          </motion.div>
        </div>

        {/* --- THE GAME CONTROLLER (MOOD SLIDER) --- */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-20">
           <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-4" style={{ color: textColor }}>
                 <div className="flex items-center gap-2">
                    <Moon size={18} />
                    <span className="font-clean-hebrew text-xs font-bold">ערב דרמטי</span>
                 </div>
                 <div className="font-royal-hebrew text-lg font-bold">שחקי עם התאורה</div>
                 <div className="flex items-center gap-2">
                    <span className="font-clean-hebrew text-xs font-bold">בוקר טהור</span>
                    <Sun size={18} />
                 </div>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={mood} 
                onChange={(e) => setMood(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-center mt-4 font-clean-hebrew text-[10px] opacity-60" style={{ color: textColor }}>
                הזיזי את הסליידר כדי לראות איך הכיסא משתלב בכל שלב באירוע
              </p>
           </div>
        </div>

      </section>

      {/* --- SECTION 2: EDITORIAL LAYOUT (BROKEN GRID) --- */}
      <section className="py-32 px-6 md:px-20 relative z-10" style={{ color: textColor }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
           
           {/* BIG HEBREW TYPOGRAPHY */}
           <div className="md:col-span-7 text-right" dir="rtl">
              <h2 className="font-royal-hebrew text-6xl md:text-8xl font-bold leading-[0.9] mb-8">
                זה לא <br/>
                <span style={{ color: accentColor }}>רק רהיט.</span>
              </h2>
              <div className="flex gap-6 items-start">
                 <div className="w-1 h-32 bg-current opacity-20 mt-2"></div>
                 <p className="font-clean-hebrew text-xl md:text-2xl font-light leading-relaxed max-w-lg opacity-80">
                   כשאת יושבת עליו, את לא באותו גובה עם שאר האורחים. 
                   עיצבנו פרופורציות שגורמות לך להיראות זקופה, מלכותית, ובלתי נשכחת.
                   זהו הכיסא היחיד שתוכנן ספציפית לצילום עם שמלות כלה רחבות.
                 </p>
              </div>
           </div>

           {/* INTERACTIVE CARD */}
           <div className="md:col-span-5 relative">
              <motion.div 
                whileHover={{ rotate: -2, scale: 1.02 }}
                className="bg-white text-black p-10 shadow-2xl rotate-2 relative overflow-hidden group"
              >
                 <div className="absolute top-0 right-0 bg-[#D4AF37] text-white text-xs font-bold px-4 py-2">
                    מפרט טכני
                 </div>
                 <h3 className="font-royal-hebrew text-4xl mb-6">החומרים</h3>
                 <ul className="font-clean-hebrew space-y-4 text-sm" dir="rtl">
                    <li className="flex justify-between border-b border-gray-100 pb-2">
                       <span className="text-gray-500">בד</span>
                       <span className="font-bold">קטיפת משי (איטליה)</span>
                    </li>
                    <li className="flex justify-between border-b border-gray-100 pb-2">
                       <span className="text-gray-500">שלדה</span>
                       <span className="font-bold">עץ אלון מלא</span>
                    </li>
                    <li className="flex justify-between border-b border-gray-100 pb-2">
                       <span className="text-gray-500">עמידות</span>
                       <span className="font-bold">עד 150 ק"ג</span>
                    </li>
                 </ul>
                 <div className="mt-8 flex justify-center">
                    <Sparkles className="text-[#D4AF37] animate-pulse" />
                 </div>
              </motion.div>
           </div>

        </div>
      </section>

      {/* --- SALES SECTION: STICKY FOOTER CTA --- */}
      <section className="py-20 text-center relative z-10" style={{ color: textColor }}>
         <h2 className="font-royal-hebrew text-5xl md:text-7xl mb-8">היום שלך. הכס שלך.</h2>
         <Link to="/cart">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ backgroundColor: accentColor, color: mood < 40 ? 'black' : 'white' }}
              className="px-16 py-6 rounded-sm font-clean-hebrew font-bold text-lg shadow-2xl flex items-center gap-4 mx-auto"
            >
               <span>בדיקת, זמינות לתאריך החתונה</span>
               <ArrowLeft size={24} />
            </motion.button>
         </Link>
         <p className="mt-6 font-clean-hebrew text-sm opacity-50">
           * נותרו 3 יחידות פנויות לחודש מאי
         </p>
      </section>

    </motion.div>
  );
};

export default BridalHomePage;