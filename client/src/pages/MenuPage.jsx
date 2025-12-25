import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react'; // אייקונים לסינון
import api from '../api';
import ProductCard from '../components/ProductCard';

// הגדרת פונטים (במידה ולא נטענו ב-App)
const FontsInjection = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@200;300;400&display=swap');
      .font-cinzel { font-family: 'Cinzel', serif; }
      .font-playfair { font-family: 'Playfair Display', serif; }
      .font-montserrat { font-family: 'Montserrat', sans-serif; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}
  </style>
);

// קטגוריות - אפשר להוסיף אייקונים אם רוצים בעתיד
const CATEGORIES = [
  { id: 'all', name: 'All Collection' }, // הוספתי את ה-ALL כאן לנוחות
  { id: 'flowers', name: 'Flowers' },
  { id: 'gifts', name: 'Gifts & Sets' },
  { id: 'dinnerware', name: 'Hosting' },
  { id: 'chocolate', name: 'Chocolate' },
  { id: 'decor', name: 'Home Decor' },
  { id: 'packages', name: 'Holiday Packages' }
];

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // טעינת מוצרים
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // שליפת כל המוצרים - הסינון יתבצע בצד לקוח (אלא אם יש לך המון מוצרים)
        const { data } = await api.get('/api/products');
        setProducts(data);

        // סנכרון עם ה-URL
        const categoryParam = searchParams.get('category');
        if (categoryParam) setSelectedCategory(categoryParam);

      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  // לוגיקת סינון חכמה
  const filteredProducts = products.filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      // חיפוש גם בשם וגם בתיאור (אם קיים)
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
  });

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setSearchParams({ category: catId === 'all' ? '' : catId });
  };

  return (
    <div className="bg-[#050505] min-h-screen w-full text-[#E5E5E5] selection:bg-[#D4AF37] selection:text-black font-montserrat overflow-x-hidden">
      <FontsInjection />
      
      {/* --- HERO SECTION --- */}
      <header className="relative w-full pt-40 pb-24 px-6 md:px-12 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* אפקט רקע עדין */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10"
        >
            <h2 className="text-[#D4AF37] text-xs md:text-sm font-cinzel tracking-[0.4em] uppercase mb-6">
                Est. 2024 • Ali Zahav
            </h2>
            <h1 className="font-playfair text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight drop-shadow-2xl">
                The Collection
            </h1>
            <div className="w-[1px] h-16 bg-gradient-to-b from-[#D4AF37] to-transparent mx-auto opacity-60"></div>
        </motion.div>
      </header>

      {/* --- STICKY FILTER BAR --- */}
      <div className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 w-full shadow-2xl shadow-black/50">
         <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* רשימת קטגוריות (גלילה אופקית במובייל) */}
            <div className="flex gap-8 overflow-x-auto no-scrollbar w-full md:w-auto items-center pb-2 md:pb-0 mask-image-fade">
               {CATEGORIES.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`whitespace-nowrap font-cinzel text-xs md:text-sm tracking-[0.15em] transition-all duration-300 relative py-2
                    ${selectedCategory === cat.id ? 'text-[#D4AF37] font-bold' : 'text-gray-500 hover:text-white'}`}
                  >
                    {cat.name}
                    {selectedCategory === cat.id && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-[1px] bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]" />
                    )}
                  </button>
               ))}
            </div>

            {/* חיפוש וסינון צדדי */}
            <div className="flex items-center gap-6 w-full md:w-auto">
               <div className="relative group w-full md:w-64">
                   <input 
                      type="text" 
                      placeholder="Search collection..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 pl-10 text-xs text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                   />
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-[#D4AF37]" />
               </div>
               
               <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 tracking-widest font-cinzel">
                   <span>{filteredProducts.length} ITEMS</span>
               </div>
            </div>
         </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      <section className="max-w-[1920px] mx-auto px-4 md:px-12 py-20 min-h-[60vh]">
        {loading ? (
            <div className="flex flex-col justify-center items-center h-[40vh] gap-4">
               <div className="w-12 h-12 border-t-2 border-b-2 border-[#D4AF37] rounded-full animate-spin"></div>
               <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-cinzel animate-pulse">LOADING LUXURY...</span>
            </div>
        ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-8 gap-y-20"
            >
              <AnimatePresence mode='popLayout'>
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group"
                  >
                      {/* עוטף את הכרטיס כדי לתת לו אפקט יוקרתי נוסף אם רוצים, או משאיר נקי */}
                      <ProductCard product={product} /> 
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
        )}

        {!loading && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center opacity-60">
               <h3 className="font-playfair text-3xl text-gray-500 mb-4 italic">No masterpieces found.</h3>
               <button 
                 onClick={() => { handleCategoryChange('all'); setSearchQuery(''); }}
                 className="text-[#D4AF37] border-b border-[#D4AF37] pb-1 hover:text-white hover:border-white transition-colors uppercase tracking-widest text-xs font-bold"
               >
                 View All Collection
               </button>
            </div>
        )}
      </section>

      {/* --- FOOTER DECORATION --- */}
      <div className="w-full py-24 flex flex-col items-center justify-center border-t border-white/5 bg-[#050505]">
         <h2 className="font-cinzel text-3xl md:text-5xl text-[#1a1a1a] font-bold select-none">ALI ZAHAV</h2>
         <div className="w-px h-12 bg-gradient-to-b from-transparent via-[#D4AF37]/50 to-transparent mt-8"></div>
      </div>
    </div>
  );
};

export default MenuPage;