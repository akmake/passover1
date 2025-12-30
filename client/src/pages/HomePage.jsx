import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { CardContainer, CardBody, CardItem } from '../components/ui/Hover3DCard'; 
import ProductDrawer from '../components/ProductDrawer'; 
import api from '@/api'; 
// הוספת אייקונים עבור אזור הלידים
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // הוספתי את הספרייה

// --- פונקציית עזר למניעת קריסות (טקסטים שהם אובייקטים) ---
// עדכנתי שתקבל את השפה הנוכחית
const getText = (textObj, lang) => {
  if (!textObj) return '';
  if (typeof textObj === 'string') return textObj;
  // לוגיקה חכמה: אם עברית, נסה עברית. אם אין, קח אנגלית. ולהפך.
  return lang === 'he' ? (textObj.he || textObj.en || textObj.name || '') : (textObj.en || textObj.he || textObj.name || '');
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

      /* סגנונות לשדות הטופס באזור הלידים */
      .contact-input {
        width: 100%;
        background-color: transparent;
        border-bottom: 1px solid #e5e7eb;
        padding: 12px 0;
        font-family: 'Montserrat', sans-serif;
        color: #1A1A1A;
        outline: none;
        transition: border-color 0.3s;
      }
      .contact-input:focus {
        border-bottom-color: #D4AF37;
      }
      .contact-label {
        font-size: 11px;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: #9CA3AF;
        margin-bottom: 4px;
        display: block;
      }
    `}
  </style>
);

// --- נתוני ברירת מחדל (העיצוב המקורי) ---

const DEFAULT_HERO_SLIDES = [
  {
    type: 'video',
    url: '/videos/opo.mp4',
    topText: 'EST. 2024 • ISRAEL',
    title: 'ALI ZAHAV',
    subtitle: 'The Art of Celebration',
    buttonText: 'Explore Collection',
    link: '/menu'
  }
];

const DEFAULT_CATEGORIES = [
  { _id: 'd1', title: "WEDDINGS", hebrewTitle: "חתונות ואירועים", subtitle: "עיצוב בלתי נשכח לרגעים הגדולים", image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop", link: "/menu" },
  { _id: 'd2', title: "VIP GIFTS", hebrewTitle: "מארזי יוקרה", subtitle: "כשרוצים להעניק את הטוב ביותר", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop", link: "/menu?category=695041e21902b53a72acdbe8" },
  { _id: 'd3', title: "BESPOKE", hebrewTitle: "בהתאמה אישית", subtitle: "אומנות היצירה לפי החזון שלך", image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069&auto=format&fit=crop", link: "/menu?category=695041e21902b53a72acdbe4" }
];

// --- רכיב הסליידר הראשי ---
const HeroSlider = ({ slides, interval = 5, height = 95 }) => {
    const { t } = useTranslation(); // תרגום
    const [current, setCurrent] = useState(0);
    const hasValidSlides =
      Array.isArray(slides) &&
      slides.some(s => typeof s?.url === 'string' && s.url.trim().length > 0);

    const activeSlides = hasValidSlides ? slides : DEFAULT_HERO_SLIDES;

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
                        {/* כאן אפשר להשתמש ב-t אם רוצים לתרגם את הכותרת הראשית */}
                        {slide.title || t('hero.title') || 'ALI ZAHAV'}
                    </h1>

                    <p className="font-montserrat text-gray-200 tracking-[0.2em] text-lg uppercase font-light mb-10 drop-shadow-md">
                        {slide.subtitle || t('hero.subtitle') || 'The Art of Celebration'}
                    </p>
                    
                    <div className="flex justify-center mt-12">
                        <Link 
                            to={slide.link || '/menu'} 
                            className="group relative px-10 py-4 overflow-hidden border border-[#D4AF37] text-[#D4AF37] transition-all hover:text-black bg-black/20 hover:bg-white"
                        >
                            <span className="relative z-10 font-cinzel tracking-widest font-bold">
                                {slide.buttonText || t('hero.cta') || 'Explore Collection'}
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
                <span className="text-[10px] tracking-[0.3em] font-montserrat">{t('hero.scroll')}</span>
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

// --- רכיב המוצרים (CuratedSelection) - שונה לקרוסלה כפי שביקשת ---
const CuratedSelection = ({ featured, onProductClick }) => {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;
  
  // שימוש ב-ref כדי לעקוב אחרי הריחוף מבלי לגרום לרינדור מחדש או איפוס הטיימר
  const isHoveredRef = useRef(false);

  const validFeatured = featured || [];
  const totalPages = Math.ceil(validFeatured.length / itemsPerPage);

  // לוגיקת החלפה: הטיימר רץ תמיד, אבל מחליף דף רק אם לא מרחפים
  useEffect(() => {
      if (totalPages <= 1) return;
      
      const timer = setInterval(() => {
          if (!isHoveredRef.current) {
              setCurrentPage((prev) => (prev + 1) % totalPages);
          }
      }, 5000); // כל 5 שניות

      return () => clearInterval(timer);
  }, [totalPages]);

  const currentProducts = validFeatured.slice(
      currentPage * itemsPerPage, 
      (currentPage * itemsPerPage) + itemsPerPage
  );

  return (
    <section className="py-24 bg-[#F9F9F9] relative overflow-hidden">
      {/* תיקון סימטריה: max-w-[1440px] px-6 */}
      <div className="max-w-[1440px] mx-auto px-6 mb-12 flex justify-between items-end">
         <div>
            <h3 className="font-cinzel text-4xl text-[#1A1A1A]">{t('home.featured_title')}</h3>
            <p className="font-montserrat text-gray-500 mt-2 text-sm tracking-widest">{t('menu.sale') || 'LIMITED EDITIONS'}</p>
         </div>
         <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
                <button 
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`h-1 transition-all duration-500 rounded-full ${currentPage === idx ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                />
            ))}
         </div>
      </div>

      {/* תיקון סימטריה: אותו רוחב בדיוק כמו למעלה */}
      <div 
        className="max-w-[1440px] mx-auto px-6 min-h-[500px]"
        onMouseEnter={() => { isHoveredRef.current = true; }}
        onMouseLeave={() => { isHoveredRef.current = false; }}
      >
          <AnimatePresence mode="wait">
             <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
             >
                 {currentProducts.length > 0 ? currentProducts.map((product) => (
                    <div 
                        key={product._id} 
                        className="group cursor-pointer relative"
                        onClick={() => onProductClick(product)}
                    >
                      <div className="h-[450px] overflow-hidden relative mb-6 bg-white shadow-sm group-hover:shadow-xl transition-all duration-500 border border-gray-100">
                          <img 
                            src={product.image || product.imageUrl} 
                            alt={getText(product.name, i18n.language)} 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[1.5s]"
                          />
                          <div className="absolute bottom-6 left-6 text-left bg-white/90 px-4 py-2 backdrop-blur-sm shadow-sm z-10">
                            <p className="text-[#1A1A1A] font-cinzel text-xl">₪{product.price}</p>
                          </div>
                      </div>
                      <h4 className="font-playfair text-2xl text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors">{getText(product.name, i18n.language)}</h4>
                      <p className="font-montserrat text-xs text-gray-500 mt-1 uppercase tracking-wider">{product.category || 'Premium'}</p>
                    </div>
                 )) : (
                     <div className="col-span-4 text-center py-20 text-gray-400 font-montserrat tracking-widest">COLLECTION UPDATING...</div>
                 )}
             </motion.div>
          </AnimatePresence>
      </div>
    </section>
  );
};

// --- רכיב חדש: Contact Section (לידים) ---
const ContactSection = () => {
    const { t } = useTranslation();
    const handleSubmit = (e) => {
        e.preventDefault();
        alert(t('common.success') || "תודה רבה! פנייתך התקבלה בהצלחה.");
    };

    return (
        <section className="bg-white py-24 border-t border-gray-100">
            {/* תיקון סימטריה: max-w-[1440px] px-6 */}
            <div className="max-w-[1440px] mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    
                    {/* צד שמאל: פרטים */}
                    <div className="flex flex-col justify-center">
                        <span className="font-cinzel text-[#D4AF37] text-xs tracking-[0.4em] mb-4">GET IN TOUCH</span>
                        <h2 className="font-playfair text-4xl lg:text-5xl text-[#1A1A1A] mb-8 leading-tight">
                            {t('home.contact_title')} <br />
                            <span className="italic text-gray-400">Unique</span>
                        </h2>
                        
                        <div className="space-y-8 font-montserrat text-sm tracking-wide mt-8">
                            {/* טלפון / וואטסאפ לחיץ */}
                            <a href="https://wa.me/972501234567" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group cursor-pointer">
                                <div className="p-3 bg-[#F9F9F9] rounded-full text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white transition-colors">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#1A1A1A] uppercase mb-1 text-xs tracking-widest">{t('home.phone_label')}</h4>
                                    <p className="text-gray-500 group-hover:text-[#D4AF37] transition-colors">050-123-4567</p>
                                </div>
                            </a>

                            <div className="flex items-start gap-4 group">
                                <div className="p-3 bg-[#F9F9F9] rounded-full text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white transition-colors">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#1A1A1A] uppercase mb-1 text-xs tracking-widest">{t('home.email')}</h4>
                                    <p className="text-gray-500">studio@alizahav.co.il</p>
                                </div>
                            </div>
                            
                             <div className="flex items-start gap-4 group">
                                <div className="p-3 bg-[#F9F9F9] rounded-full text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white transition-colors">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#1A1A1A] uppercase mb-1 text-xs tracking-widest">{t('home.address')}</h4>
                                    <p className="text-gray-500">Jerusalem, Israel</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* צד ימין: טופס */}
                    <div className="bg-[#F9F9F9] p-8 md:p-12 shadow-sm border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="contact-label">{t('home.name_label')}</label>
                                    <input type="text" className="contact-input" required />
                                </div>
                                <div>
                                    <label className="contact-label">{t('home.phone_label')}</label>
                                    <input type="text" className="contact-input" required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="contact-label">{t('home.email')}</label>
                                    <input type="email" className="contact-input" required />
                                </div>
                                <div>
                                    <label className="contact-label">{t('nav.menu')}</label>
                                    <input type="text" className="contact-input" />
                                </div>
                            </div>

                            <div>
                                <label className="contact-label">{t('home.msg_label')}</label>
                                <textarea rows="4" className="contact-input resize-none" required></textarea>
                            </div>

                            <button type="submit" className="w-full bg-[#1A1A1A] text-white py-4 font-cinzel text-xs tracking-[0.2em] font-bold hover:bg-[#D4AF37] transition-colors flex items-center justify-center gap-2 mt-4">
                                {t('home.submit')} <Send size={14} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- הדף הראשי ---
const HomePage = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
        <div className="text-[#D4AF37] font-cinzel text-xl animate-pulse tracking-widest">{t('common.loading') || 'LOADING...'}</div>
    </div>
  );

  return (
    <div className="bg-[#F9F9F9] min-h-screen text-[#1A1A1A] overflow-x-hidden selection:bg-[#D4AF37] selection:text-white">
      <FontsInjection />
      
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

      {/* Statement Bar */}
      <div className="bg-white py-6 border-b border-gray-100 shadow-sm">
        {/* תיקון סימטריה: max-w-[1440px] px-6 */}
        <div className="max-w-[1440px] mx-auto px-6 flex justify-between items-center text-xs md:text-sm font-montserrat text-gray-500 tracking-widest uppercase font-medium">
          <span className="hidden md:inline">Worldwide Inspiration</span>
          <span className="text-[#D4AF37]">Premium Quality</span>
          <span className="hidden md:inline">Personal Concierge</span>
        </div>
      </div>

      {/* Categories */}
      <section className="py-32 bg-[#F9F9F9] relative">
         <div className="max-w-[1440px] mx-auto mb-20 text-center px-6">
            <h3 className="font-cinzel text-3xl md:text-5xl text-[#1A1A1A] mb-4">Masterpieces</h3>
            <div className="w-[1px] h-20 bg-[#D4AF37] mx-auto mb-4"></div>
            <p className="font-playfair italic text-gray-500 text-xl">"Details are not just details. They make the design."</p>
         </div>

         {/* תיקון סימטריה קריטי: החלפתי max-w-screen-2xl ב-max-w-[1440px] px-6 כדי שיתאים בול למוצרים */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-10 w-full max-w-[1440px] mx-auto px-6">
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
                    <CardBody className="bg-white relative group/card border-gray-100 w-full h-[550px] overflow-hidden border shadow-lg hover:shadow-2xl transition-shadow duration-500">
                      
                      <CardItem translateZ="40" className="w-full h-full">
                        <div className="absolute inset-0 bg-black/10 group-hover/card:bg-black/0 transition-colors duration-500 z-10"></div>
                        <img 
                            src={cat.image} 
                            alt={getText(cat.title, i18n.language)} 
                            className="h-full w-full object-cover grayscale group-hover/card:grayscale-0 transition-[filter,transform] duration-700 ease-out transform-gpu will-change-transform"
                        />
                      </CardItem>

                      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-8 m-4 border-[1px] border-white/40 group-hover/card:border-[#D4AF37] transition-all duration-700">
                        <CardItem translateZ="80" className="text-center">
                           <h4 className="font-cinzel text-4xl text-white mb-2 drop-shadow-lg">{getText(cat.title, i18n.language)}</h4>
                           <h5 className="font-playfair text-[#D4AF37] text-2xl italic mb-6 drop-shadow-md bg-black/30 px-4 py-1 rounded backdrop-blur-sm">{getText(cat.hebrewTitle, i18n.language)}</h5>
                        </CardItem>
                        <CardItem translateZ="60" className="opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-100">
                           <p className="font-montserrat text-xs tracking-widest text-white/90 uppercase border-b border-white/50 pb-1 font-bold">{getText(cat.subtitle, i18n.language)}</p>
                        </CardItem>
                      </div>

                    </CardBody>
                  </CardContainer>
                </Link>
              </motion.div>
            ))}
         </div>
      </section>
      <CuratedSelection featured={featured} onProductClick={openDrawer} />
      <ContactSection />
    </div>
  );
};

export default HomePage;