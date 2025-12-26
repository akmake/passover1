import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { CardContainer, CardBody, CardItem } from '../components/ui/Hover3DCard'; 
import ProductDrawer from '../components/ProductDrawer'; // ודא שיש לך את הרכיב הזה מהשלב הקודם
import api from '@/api'; 

// --- פונקציית עזר למניעת קריסות (טקסטים שהם אובייקטים) ---
const getText = (textObj) => {
  if (!textObj) return '';
  if (typeof textObj === 'string') return textObj;
  return textObj.he || textObj.en || textObj.name || '';
};

// --- הגדרות עיצוב ופונטים ---
const FontsInjection = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@200;300;400;500&display=swap');
      
      .font-cinzel { font-family: 'Cinzel', serif; }
      .font-playfair { font-family: 'Playfair Display', serif; }
      .font-montserrat { font-family: 'Montserrat', sans-serif; }
      
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}
  </style>
);

// --- נתוני ברירת מחדל (העיצוב המקורי) ---
const DEFAULT_HERO_SLIDES = [
    {
        type: 'video',
        url: 'https://cdn.coverr.co/videos/coverr-pouring-champagne-into-a-glass-5494/1080p.mp4', 
        topText: 'EST. 2024 • ISRAEL',
        title: 'ALI ZAHAV',
        subtitle: 'The Art of Celebration',
        buttonText: 'Explore Collection',
        link: '/menu'
    }
];

const DEFAULT_CATEGORIES = [
  { _id: 'd1', title: "WEDDINGS", hebrewTitle: "חתונות ואירועים", subtitle: "עיצוב בלתי נשכח לרגעים הגדולים", image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop", link: "/menu" },
  { _id: 'd2', title: "VIP GIFTS", hebrewTitle: "מארזי יוקרה", subtitle: "כשרוצים להעניק את הטוב ביותר", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop", link: "/menu" },
  { _id: 'd3', title: "BESPOKE", hebrewTitle: "בהתאמה אישית", subtitle: "אומנות היצירה לפי החזון שלך", image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069&auto=format&fit=crop", link: "/contact" }
];

// --- רכיב הסליידר הראשי ---
const HeroSlider = ({ slides, interval = 5, height = 95 }) => {
    const [current, setCurrent] = useState(0);
    const activeSlides = (slides && slides.length > 0) ? slides : DEFAULT_HERO_SLIDES;

    useEffect(() => {
        if (activeSlides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % activeSlides.length);
        }, interval * 1000);
        return () => clearInterval(timer);
    }, [activeSlides, interval]);

    const slide = activeSlides[current];

    return (
        <section className="relative w-full overflow-hidden bg-black" style={{ height: `${height}vh` }}>
            <AnimatePresence mode='wait'>
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0"
                >
                    <div className="absolute inset-0 bg-black/30 z-10" />
                    
                    {slide.type === 'video' ? (
                        <video 
                            src={slide.url} 
                            autoPlay loop muted playsInline 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <img 
                            src={slide.url} 
                            alt="Hero" 
                            className="w-full h-full object-cover" 
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 border-y border-[#D4AF37]/30 my-auto h-fit py-12 backdrop-blur-[1px]">
                <motion.div
                    key={`text-${current}`}
                    initial={{ y: 30, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
                >
                    <h2 className="font-cinzel text-[#D4AF37] tracking-[0.5em] text-sm md:text-xl mb-6 drop-shadow-md uppercase">
                        {slide.topText || 'EST. 2024 • ISRAEL'}
                    </h2>
                    
                    <h1 className="font-playfair text-5xl md:text-7xl lg:text-9xl text-white mb-4 leading-none drop-shadow-2xl">
                        {slide.title || 'ALI ZAHAV'}
                    </h1>

                    <p className="font-montserrat text-gray-200 tracking-[0.2em] text-lg uppercase font-light mb-10 drop-shadow-md">
                        {slide.subtitle || 'The Art of Celebration'}
                    </p>
                    
                    <div className="flex justify-center mt-12">
                        <Link 
                            to={slide.link || '/menu'} 
                            className="group relative px-10 py-4 overflow-hidden border border-[#D4AF37] text-[#D4AF37] transition-all hover:text-black bg-black/20 hover:bg-white"
                        >
                            <span className="relative z-10 font-cinzel tracking-widest font-bold">
                                {slide.buttonText || 'Explore Collection'}
                            </span>
                        </Link>
                    </div>
                </motion.div>
            </div>
            
            <motion.div 
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4 text-white/80"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 1.5, duration: 1 }}
            >
                <span className="text-[10px] tracking-[0.3em] font-montserrat">SCROLL TO DISCOVER</span>
                <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent"></div>
            </motion.div>

            {activeSlides.length > 1 && (
                <div className="absolute bottom-10 right-10 z-30 flex flex-col gap-3">
                    {activeSlides.map((_, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => setCurrent(idx)}
                            className={`w-1 transition-all duration-500 ${idx === current ? 'bg-[#D4AF37] h-8' : 'bg-white/50 h-2 hover:bg-white'}`} 
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

// --- רכיב המוצרים הנבחרים ---
const CuratedSelection = ({ featured, onProductClick }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });

  return (
    // שינוי 1: רקע בז' בהיר
    <section className="py-24 bg-[#F9F9F9] relative overflow-hidden" ref={targetRef}>
      <div className="max-w-7xl mx-auto px-6 mb-12 flex justify-between items-end">
         <div>
            {/* טקסט כהה */}
            <h3 className="font-cinzel text-4xl text-[#1A1A1A]">Curated Selection</h3>
            <p className="font-montserrat text-gray-500 mt-2 text-sm tracking-widest">LIMITED EDITIONS</p>
         </div>
         <Link to="/menu" className="hidden md:flex items-center gap-3 text-[#1A1A1A] font-montserrat text-xs tracking-[0.2em] hover:text-[#D4AF37] transition-colors">
            VIEW ALL <span className="text-xl">→</span>
         </Link>
      </div>

      {/* אזור ה-Marquee האינסופי */}
      <div className="relative w-full overflow-hidden py-10">
         {featured && featured.length > 0 ? (
             <div className="flex w-full overflow-hidden group/marquee">
                 <motion.div 
                    className="flex gap-8 px-6 min-w-max"
                    animate={{ x: ["0%", "-100%"] }} 
                    transition={{ repeat: Infinity, ease: "linear", duration: 40 }} 
                    style={{ x: 0 }}
                    whileHover={{ animationPlayState: "paused" }} 
                 >
                    {[...featured, ...featured, ...featured].map((product, idx) => (
                       <div 
                          key={`${product._id}-${idx}`} 
                          onClick={() => onProductClick(product)} // לחיצה פותחת מגירה
                          className="min-w-[300px] md:min-w-[380px] cursor-pointer group/item relative"
                       >
                          {/* שינוי 2: כרטיס לבן עם צללית */}
                          <div className="h-[480px] overflow-hidden relative mb-6 bg-white shadow-sm group-hover/item:shadow-xl transition-all duration-500 border border-gray-100">
                             <img 
                                src={product.image || product.imageUrl} 
                                alt={getText(product.name)} 
                                className="w-full h-full object-cover transform group-hover/item:scale-105 transition-transform duration-[1.5s]"
                             />
                             {/* מחיר על רקע לבן */}
                             <div className="absolute bottom-6 left-6 text-left bg-white/90 px-4 py-2 backdrop-blur-sm shadow-sm">
                                <p className="text-[#1A1A1A] font-cinzel text-xl">₪{product.price}</p>
                             </div>
                          </div>
                          <h4 className="font-playfair text-2xl text-[#1A1A1A] group-hover/item:text-[#D4AF37] transition-colors">{getText(product.name)}</h4>
                          <p className="font-montserrat text-xs text-gray-500 mt-1 uppercase tracking-wider">{product.category || 'Premium'}</p>
                       </div>
                    ))}
                 </motion.div>
             </div>
         ) : (
             <div className="text-center py-10 px-4 border border-gray-200 rounded mx-6 text-gray-400 font-montserrat">
                 The collection is being curated. Please check back soon.
             </div>
         )}
      </div>
    </section>
  );
};

// --- הדף הראשי ---
const HomePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ניהול המגירה
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/api/homepage');
        setData(res.data);
      } catch (error) { 
          console.error("Using defaults due to error:", error); 
      } finally { 
          setLoading(false); 
      }
    };
    fetchHomeData();
  }, []);

  const openDrawer = (product) => {
      setSelectedProduct(product);
      setIsDrawerOpen(true);
  };

  const categories = (data?.categories && data.categories.length > 0 && data.categories[0].image) 
    ? data.categories 
    : DEFAULT_CATEGORIES;
  
  const featured = data?.featured?.productIds || [];
  const heroData = data?.hero || { slides: [], height: 95, interval: 5 };

  if (loading) return (
    <div className="bg-[#F9F9F9] min-h-screen flex items-center justify-center">
        <div className="text-[#D4AF37] font-cinzel text-xl animate-pulse tracking-widest">LOADING LUXURY...</div>
    </div>
  );

  return (
    // שינוי 3: רקע כללי בז' בהיר
    <div className="bg-[#F9F9F9] min-h-screen text-[#1A1A1A] overflow-x-hidden selection:bg-[#D4AF37] selection:text-white">
      <FontsInjection />
      
      {/* מגירה */}
      <ProductDrawer 
        product={selectedProduct} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />

      {/* Hero Slider */}
      <HeroSlider 
          slides={heroData.slides} 
          interval={heroData.interval} 
          height={heroData.height} 
      />

      {/* Statement Bar - בהיר */}
      <div className="bg-white py-6 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-xs md:text-sm font-montserrat text-gray-500 tracking-widest uppercase font-medium">
          <span className="hidden md:inline">Worldwide Inspiration</span>
          <span className="text-[#D4AF37]">Premium Quality</span>
          <span className="hidden md:inline">Personal Concierge</span>
        </div>
      </div>

      {/* Categories (Masterpieces) - רקע בהיר */}
      <section className="py-32 px-4 bg-[#F9F9F9] relative">
         <div className="max-w-7xl mx-auto mb-20 text-center">
            <h3 className="font-cinzel text-3xl md:text-5xl text-[#1A1A1A] mb-4">Masterpieces</h3>
            <div className="w-[1px] h-20 bg-[#D4AF37] mx-auto mb-4"></div>
            <p className="font-playfair italic text-gray-500 text-xl">"Details are not just details. They make the design."</p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 max-w-8xl mx-auto">
            {categories.map((cat, index) => (
              <motion.div 
                key={cat._id || index} 
                initial={{ opacity: 0, y: 50 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Link to={cat.link || '#'}>
                  <CardContainer containerClassName="w-full h-full">
                    {/* כרטיס לבן */}
                    <CardBody className="bg-white relative group/card border-gray-100 w-full h-[550px] overflow-hidden border shadow-lg hover:shadow-2xl transition-shadow duration-500">
                      
                      <CardItem translateZ="40" className="w-full h-full">
                        <div className="absolute inset-0 bg-black/10 group-hover/card:bg-black/0 transition-colors duration-500 z-10"></div>
                        <img 
                            src={cat.image} 
                            alt={getText(cat.title)} 
                            className="h-full w-full object-cover grayscale group-hover/card:grayscale-0 transition-all duration-1000 ease-out" 
                        />
                      </CardItem>

                      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-8 m-4 border-[1px] border-white/40 group-hover/card:border-[#D4AF37] transition-all duration-700">
                        <CardItem translateZ="80" className="text-center">
                           <h4 className="font-cinzel text-4xl text-white mb-2 drop-shadow-lg">{getText(cat.title)}</h4>
                           <h5 className="font-playfair text-[#D4AF37] text-2xl italic mb-6 drop-shadow-md bg-black/30 px-4 py-1 rounded backdrop-blur-sm">{getText(cat.hebrewTitle)}</h5>
                        </CardItem>
                        <CardItem translateZ="60" className="opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-100">
                           <p className="font-montserrat text-xs tracking-widest text-white/90 uppercase border-b border-white/50 pb-1 font-bold">{getText(cat.subtitle)}</p>
                        </CardItem>
                      </div>

                    </CardBody>
                  </CardContainer>
                </Link>
              </motion.div>
            ))}
         </div>
      </section>

      {/* Featured Products */}
      <CuratedSelection featured={featured} onProductClick={openDrawer} />

      {/* Bespoke / Services (Static) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
         <div className="relative h-[50vh] lg:h-auto overflow-hidden">
            <img 
               src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop" 
               alt="Luxury Event" 
               className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-black/20"></div>
         </div>
         
         <div className="bg-white flex flex-col justify-center p-12 lg:p-24 relative text-[#1A1A1A]">
            <div className="absolute top-10 bottom-10 left-10 right-10 border border-[#D4AF37]/20 pointer-events-none hidden md:block"></div>
            
            <span className="font-cinzel text-[#D4AF37] text-sm tracking-[0.4em] mb-6">SERVICES</span>
            <h2 className="font-playfair text-4xl lg:text-6xl text-[#1A1A1A] mb-8 leading-tight">
               Crafting <br/>
               <span className="italic text-gray-400">Your</span> Legend
            </h2>
            <p className="font-montserrat text-gray-500 font-light leading-8 mb-10 max-w-md">
               אנחנו לא סתם "מפיקים אירועים". אנחנו ארכיטקטים של אווירה.
               <br/>
               מחתונות אקסקלוסיביות ועד מארזי שי עסקיים שנחרטים בזיכרון.
            </p>
            
            <ul className="space-y-4 font-playfair text-xl text-gray-800 mb-12">
               <li className="flex items-center gap-4">
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full"></span> עיצוב שולחנות הוט-קוטור
               </li>
               <li className="flex items-center gap-4">
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full"></span> שזירת פרחים אומנותית
               </li>
               <li className="flex items-center gap-4">
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full"></span> מארזי מיתוג VIP
               </li>
            </ul>

            <Link to="/contact" className="inline-block border-b border-[#D4AF37] text-[#D4AF37] pb-2 text-sm tracking-[0.3em] hover:text-black hover:border-black transition-all w-max font-bold">
               START A PROJECT
            </Link>
         </div>
      </section>

      {/* Footer CTA - כהה לקונטרסט */}
      <section className="py-32 bg-black text-center px-4 relative overflow-hidden">
         <div className="relative z-10">
            <h2 className="font-cinzel text-5xl md:text-8xl text-white mb-8 font-bold">ALI ZAHAV</h2>
            <h3 className="font-playfair text-2xl md:text-4xl text-gray-400 mb-10">מוכנים ליצור את הבלתי יאומן?</h3>
            <Link to="/menu" className="inline-block bg-[#D4AF37] text-white font-cinzel font-bold px-12 py-5 hover:bg-white hover:text-black transition-colors tracking-widest shadow-lg shadow-[#D4AF37]/20">
               SHOP NOW
            </Link>
         </div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[120px]"></div>
      </section>

    </div>
  );
};

export default HomePage;