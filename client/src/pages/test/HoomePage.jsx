import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CardContainer, CardBody, CardItem } from '../components/ui/Hover3DCard';
import { useTranslation } from 'react-i18next';

// --- הגדרות יוקרה וייבוא פונטים ---
const LUXURY_GOLD = "#D4AF37"; // זהב קלאסי
const CHAMPAGNE_GOLD = "#F7E7CE"; // שמפניה עדין
const DEEP_BLACK = "#050505"; // שחור עמוק
const RICH_CHARCOAL = "#0F0F0F"; // פחם עשיר

const FontsInjection = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@200;300;400&display=swap');
      
      .font-cinzel { font-family: 'Cinzel', serif; }
      .font-playfair { font-family: 'Playfair Display', serif; }
      .font-montserrat { font-family: 'Montserrat', sans-serif; }
      
      .gold-text-gradient {
        background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      
      .luxury-border {
        border: 1px solid transparent;
        border-image: linear-gradient(to bottom, #bf953f, #000000, #bf953f) 1;
      }
    `}
  </style>
);

const HomePage = () => {
  const { t } = useTranslation();
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-95%"]);

  // קטגוריות בסגנון מגזין אופנה
  const categories = [
    {
      id: 1,
      title: "WEDDINGS",
      hebrewTitle: "חתונות ואירועים",
      subtitle: "עיצוב בלתי נשכח לרגעים הגדולים",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop", // תמונה כהה ואלגנטית יותר
      link: "/menu?category=wedding"
    },
    {
      id: 2,
      title: "VIP GIFTS",
      hebrewTitle: "מארזי יוקרה",
      subtitle: "כשרוצים להעניק את הטוב ביותר",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop",
      link: "/menu?category=holidays"
    },
    {
      id: 3,
      title: "BESPOKE",
      hebrewTitle: "בהתאמה אישית",
      subtitle: "אומנות היצירה לפי החזון שלך",
      image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069&auto=format&fit=crop",
      link: "/package-builder"
    }
  ];

  const featured = [
    { id: 1, name: "The Royal Box", price: "₪850", img: "https://images.unsplash.com/photo-1599639668312-3b1a5e4774b6?q=80&w=1974&auto=format&fit=crop" },
    { id: 2, name: "Golden Orchid", price: "₪420", img: "https://images.unsplash.com/photo-1566679056263-633ca56e8fb5?q=80&w=1974&auto=format&fit=crop" },
    { id: 3, name: "Black Velvet", price: "₪380", img: "https://images.unsplash.com/photo-1544523927-4493d56f1406?q=80&w=1974&auto=format&fit=crop" }
  ];

  return (
    <div className="bg-[#050505] min-h-screen text-[#E5E5E5] overflow-x-hidden selection:bg-[#D4AF37] selection:text-black">
      <FontsInjection />
      
      {/* --- HERO SECTION: CINEMATIC NOIR --- */}
      <section className="relative h-[95vh] w-full flex items-center justify-center overflow-hidden">
        {/* שכבת רקע כהה מאוד */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <video 
            className="w-full h-full object-cover opacity-80"
            autoPlay loop muted playsInline
            // סרטון אווירה מופשט (זהב/חלקיקים) - כרגע תמונה סטטית מאוד חזקה אם אין וידאו
            poster="https://ibb.co/n80tzMck"
          >
             <source src="https://v.ftcdn.net/05/65/52/62/700_F_565526227_3Xn...mp4" type="video/mp4" /> {/* Placeholder video link */}
          </video>
           <img 
            src="https://ibb.co/n80tzMck"
            className="absolute inset-0 w-full h-full object-cover animate-pan-slow"
            alt="Atmosphere"
           />
        </div>

        <div className="relative z-20 text-center px-6 border-y border-[#D4AF37]/30 py-12 backdrop-blur-sm bg-black/30 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <h2 className="font-cinzel text-[#D4AF37] tracking-[0.5em] text-sm md:text-xl mb-6">EST. 2024 • ISRAEL</h2>
            <h1 className="font-playfair text-5xl md:text-7xl lg:text-9xl text-white mb-4 leading-none">
              Alei Zahav
            </h1>
            <p className="font-montserrat text-gray-300 tracking-[0.2em] text-lg uppercase font-light mb-10">
              The Art of Celebration
            </p>
            
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-12">
               <Link 
                 to="/menu"
                 className="group relative px-10 py-4 overflow-hidden border border-[#D4AF37] text-[#D4AF37] transition-all hover:text-black"
               >
                 <span className="absolute inset-0 w-full h-full bg-[#D4AF37] transform -translate-x-full transition-transform duration-500 group-hover:translate-x-0"></span>
                 <span className="relative z-10 font-cinzel tracking-widest font-bold">Explore Collection</span>
               </Link>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[#D4AF37]/60 text-xs tracking-[0.3em] flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <span>SCROLL TO DISCOVER</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-[#D4AF37] to-transparent"></div>
        </motion.div>
      </section>

      {/* --- STATEMENT BAR --- */}
      <div className="bg-[#0F0F0F] py-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-xs md:text-sm font-montserrat text-gray-400 tracking-widest uppercase">
          <span className="hidden md:inline">Worldwide Inspiration</span>
          <span className="text-[#D4AF37]">Premium Quality</span>
          <span className="hidden md:inline">Personal Concierge</span>
        </div>
      </div>

      {/* --- THE SHOW (Categories with Depth) --- */}
      <section className="py-32 px-4 bg-[#050505] relative">
         {/* אלמנט עיצובי רקע */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none"></div>

         <div className="max-w-7xl mx-auto mb-20 text-center">
            <h3 className="font-cinzel text-3xl md:text-5xl text-white mb-4">Masterpieces</h3>
            <div className="w-[1px] h-20 bg-[#D4AF37] mx-auto mb-4"></div>
            <p className="font-playfair italic text-gray-400 text-xl">"Details are not just details. They make the design."</p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 max-w-8xl mx-auto">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Link to={cat.link}>
                  <CardContainer containerClassName="w-full h-full">
                    <CardBody className="bg-[#111] relative group/card border-white/10 w-full h-[550px] overflow-hidden border border-[#D4AF37]/20">
                      
                      {/* Image Layer */}
                      <CardItem translateZ="40" className="w-full h-full">
                        <div className="absolute inset-0 bg-black/30 group-hover/card:bg-black/10 transition-colors duration-500 z-10"></div>
                        <img 
                          src={cat.image} 
                          alt={cat.title} 
                          className="h-full w-full object-cover grayscale group-hover/card:grayscale-0 transition-all duration-1000 ease-out"
                        />
                      </CardItem>

                      {/* Text Layer - Centered & elegant */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-8 border-[1px] border-white/0 group-hover/card:border-[#D4AF37]/50 transition-all duration-700 m-4">
                        <CardItem translateZ="80" className="text-center">
                           <h4 className="font-cinzel text-4xl text-white mb-2 drop-shadow-2xl">{cat.title}</h4>
                           <h5 className="font-playfair text-[#D4AF37] text-2xl italic mb-6">{cat.hebrewTitle}</h5>
                        </CardItem>
                        
                        <CardItem translateZ="60" className="opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-100">
                           <p className="font-montserrat text-xs tracking-widest text-white/80 uppercase border-b border-white/30 pb-1">
                             Discover More
                           </p>
                        </CardItem>
                      </div>

                    </CardBody>
                  </CardContainer>
                </Link>
              </motion.div>
            ))}
         </div>
      </section>

      {/* --- HORIZONTAL SCROLL / CURATED SELECTION --- */}
      <section className="py-24 bg-[#0F0F0F] relative overflow-hidden" ref={targetRef}>
        <div className="max-w-7xl mx-auto px-6 mb-12 flex justify-between items-end">
           <div>
              <h3 className="font-cinzel text-4xl text-[#D4AF37]">Curated Selection</h3>
              <p className="font-montserrat text-gray-500 mt-2 text-sm tracking-widest">LIMITED EDITIONS 2024</p>
           </div>
           <Link to="/menu" className="hidden md:flex items-center gap-3 text-white font-montserrat text-xs tracking-[0.2em] hover:text-[#D4AF37] transition-colors">
              VIEW ALL <span className="text-xl">→</span>
           </Link>
        </div>

        {/* This creates a horizontal scroll effect */}
        <div className="relative w-full overflow-hidden py-10">
           <div className="flex gap-12 px-6 overflow-x-auto no-scrollbar snap-x">
              {featured.map((item) => (
                 <div key={item.id} className="min-w-[300px] md:min-w-[400px] snap-center group cursor-pointer">
                    <div className="h-[500px] overflow-hidden relative mb-6">
                       <img 
                          src={item.img} 
                          alt={item.name} 
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[1.5s] ease-in-out"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                       <div className="absolute bottom-6 left-6 text-left">
                          <p className="text-[#D4AF37] font-cinzel text-xl">{item.price}</p>
                       </div>
                    </div>
                    <h4 className="font-playfair text-2xl text-white group-hover:text-[#D4AF37] transition-colors">{item.name}</h4>
                    <p className="font-montserrat text-xs text-gray-500 mt-1 uppercase tracking-wider">Premium Package</p>
                 </div>
              ))}
              {/* Fake item for padding */}
              <div className="min-w-[100px]"></div>
           </div>
        </div>
      </section>

      {/* --- BESPOKE EVENTS (TEXT + IMAGE SPLIT) --- */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
         <div className="relative h-[50vh] lg:h-auto overflow-hidden">
            <img 
               src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop" 
               alt="Luxury Event" 
               className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
         </div>
         
         <div className="bg-[#050505] flex flex-col justify-center p-12 lg:p-24 relative">
            {/* גבול זהב עדין פנימי */}
            <div className="absolute top-10 bottom-10 left-10 right-10 border border-[#D4AF37]/20 pointer-events-none hidden md:block"></div>
            
            <span className="font-cinzel text-[#D4AF37] text-sm tracking-[0.4em] mb-6">SERVICES</span>
            <h2 className="font-playfair text-4xl lg:text-6xl text-white mb-8 leading-tight">
               Crafting <br/>
               <span className="italic text-gray-500">Your</span> Legend
            </h2>
            <p className="font-montserrat text-gray-400 font-light leading-8 mb-10 max-w-md">
               אנחנו לא סתם "מפיקים אירועים". אנחנו ארכיטקטים של אווירה.
               <br/>
               מחתונות אקסקלוסיביות ועד מארזי שי עסקיים שנחרטים בזיכרון - עלי זהב מביאה סטנדרט בינלאומי לכל פרט.
            </p>
            
            <ul className="space-y-4 font-playfair text-xl text-gray-300 mb-12">
               <li className="flex items-center gap-4">
                  <span className="w-2 h-2 bg-[#D4AF37] rounded-full"></span> עיצוב שולחנות הוט-קוטור
               </li>
               <li className="flex items-center gap-4">
                  <span className="w-2 h-2 bg-[#D4AF37] rounded-full"></span> שזירת פרחים אומנותית
               </li>
               <li className="flex items-center gap-4">
                  <span className="w-2 h-2 bg-[#D4AF37] rounded-full"></span> מארזי מיתוג VIP
               </li>
            </ul>

            <Link to="/contact" className="inline-block border-b border-[#D4AF37] text-[#D4AF37] pb-2 text-sm tracking-[0.3em] hover:text-white hover:border-white transition-all w-max">
               START A PROJECT
            </Link>
         </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-32 bg-black text-center px-4 relative overflow-hidden">
         <div className="relative z-10">
            <h2 className="font-cinzel text-5xl md:text-8xl text-[#1a1a1a] mb-8 font-bold">Alei Zahav</h2>
            <h3 className="font-playfair text-2xl md:text-4xl text-white mb-10">מוכנים ליצור את הבלתי יאומן?</h3>
            <Link to="/menu" className="inline-block bg-[#D4AF37] text-black font-cinzel font-bold px-12 py-5 hover:bg-white transition-colors tracking-widest">
               SHOP NOW
            </Link>
         </div>
         {/* רקע זהב מטושטש */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[120px]"></div>
      </section>

    </div>
  );
};

export default HomePage;