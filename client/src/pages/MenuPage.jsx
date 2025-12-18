import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../api';

// --- הגדרות עיצוב יוקרתיות (LIGHT VERSION) ---
const LUXURY_GOLD = "#D4AF37";

const FontsInjection = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Montserrat:wght@200;300;400;500&display=swap');
      .font-cinzel { font-family: 'Cinzel', serif; }
      .font-playfair { font-family: 'Playfair Display', serif; }
      .font-montserrat { font-family: 'Montserrat', sans-serif; }
      html { scroll-behavior: smooth; }
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}
  </style>
);

// --- קטגוריות התואמות בדיוק ל-Seeder ולמודל בשרת ---
const STATIC_CATEGORIES = [
  { id: 'flowers', name: 'פרחים' },
  { id: 'gifts', name: 'מתנות ומארזים' },
  { id: 'dinnerware', name: 'כלי אירוח' },
  { id: 'chocolate', name: 'שוקולד' },
  { id: 'decor', name: 'עיצוב הבית' },
  { id: 'packages', name: 'חבילות' }
];

const MenuPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredProduct, setHoveredProduct] = useState(null);

  // --- שליפת נתונים ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching products...");
        const { data } = await api.get('/products');
        console.log("Products fetched:", data); // לוג לבדיקה בקונסול
        setProducts(data);
        
        // בדיקת URL לקטגוריה
        const categoryParam = searchParams.get('category');
        if (categoryParam) setSelectedCategory(categoryParam);
        
      } catch (error) {
        console.error("Error fetching menu data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  // --- פונקציית עזר לתיקון כתובת התמונה ---
  const getImageUrl = (imgStr) => {
    if (!imgStr) return "https://via.placeholder.com/400x600?text=No+Image";
    if (imgStr.startsWith('http')) return imgStr; // אם זה קישור חיצוני (Unsplash)
    return `http://localhost:5000${imgStr}`; // אם זה קובץ מקומי
  };

  // סינון מוצרים (לפי המחרוזת המדויקת מה-Seeder)
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setSearchParams({ category: catId === 'all' ? '' : catId });
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen w-full overflow-x-hidden text-[#1A1A1A]">
      <FontsInjection />

      {/* --- HEADER --- */}
      <header className="relative w-full pt-32 pb-16 px-6 md:px-12 flex flex-col items-center justify-center text-center bg-white">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
            <h2 className="font-cinzel text-[#D4AF37] text-sm tracking-[0.4em] uppercase mb-4">
                The Collection
            </h2>
            <h1 className="font-playfair text-5xl md:text-7xl text-black font-medium tracking-tight">
                {selectedCategory === 'all' ? 'Our Menu' : STATIC_CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </h1>
            <div className="w-[1px] h-12 bg-[#D4AF37] mx-auto mt-8"></div>
        </motion.div>
      </header>

      {/* --- FILTER BAR --- */}
      <div className="sticky top-0 z-40 bg-[#FAFAFA]/95 backdrop-blur-md border-y border-[#E5E5E5] w-full shadow-sm">
         <div className="w-full px-4 md:px-10 py-4 flex items-center justify-between">
            <div className="flex gap-8 overflow-x-auto hide-scrollbar w-full md:w-auto items-center">
               <button 
                  onClick={() => handleCategoryChange('all')}
                  className={`whitespace-nowrap font-montserrat text-xs uppercase tracking-[0.2em] transition-all duration-300 relative px-2 py-1
                  ${selectedCategory === 'all' ? 'text-black font-bold' : 'text-gray-400 hover:text-black'}`}
               >
                  All Items
                  {selectedCategory === 'all' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-[1px] bg-[#D4AF37]" />}
               </button>

               {STATIC_CATEGORIES.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`whitespace-nowrap font-montserrat text-xs uppercase tracking-[0.2em] transition-all duration-300 relative px-2 py-1
                    ${selectedCategory === cat.id ? 'text-black font-bold' : 'text-gray-400 hover:text-black'}`}
                  >
                    {cat.name}
                    {selectedCategory === cat.id && <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-[1px] bg-[#D4AF37]" />}
                  </button>
               ))}
            </div>

            <div className="hidden md:block font-cinzel text-xs text-[#D4AF37]">
               {filteredProducts.length} CREATIONS
            </div>
         </div>
      </div>

      {/* --- GRID --- */}
      <section className="w-full px-4 md:px-8 py-12">
        {loading ? (
            <div className="flex justify-center items-center h-[50vh]">
               <div className="w-12 h-12 border-t-2 border-b-2 border-[#D4AF37] rounded-full animate-spin"></div>
            </div>
        ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-16"
            >
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    layout
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group relative cursor-pointer flex flex-col items-center"
                    onMouseEnter={() => setHoveredProduct(product._id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                     <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100 mb-6 shadow-sm group-hover:shadow-xl transition-shadow duration-500">
                        {product.isPopular && (
                           <div className="absolute top-0 left-0 bg-[#D4AF37] text-white text-[10px] uppercase tracking-widest px-3 py-1 z-20">
                              Best Seller
                           </div>
                        )}

                        {/* שימוש בפונקציית העזר לתמונה */}
                        <img 
                           src={getImageUrl(product.image)}
                           alt={product.name?.he || 'Product'}
                           className="w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-110"
                        />
                        
                        <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${hoveredProduct === product._id ? 'opacity-100' : 'opacity-0'}`}>
                           <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                              <button 
                                className="w-full bg-white text-black font-montserrat text-xs uppercase tracking-widest py-4 hover:bg-[#D4AF37] hover:text-white transition-colors shadow-xl"
                                onClick={(e) => {
                                   e.stopPropagation();
                                   alert(`הוספת לסל: ${product.name?.he}`); 
                                }}
                              >
                                 Add to Cart — ₪{product.price}
                              </button>
                           </div>
                        </div>
                     </div>

                     <div className="text-center w-full px-2">
                        <h3 className="font-playfair text-lg text-black group-hover:text-[#D4AF37] transition-colors duration-300">
                           {product.name?.he || 'שם מוצר חסר'}
                        </h3>
                        {product.description?.he && (
                           <p className="font-montserrat text-gray-400 text-xs mt-1 line-clamp-1">
                              {product.description.he}
                           </p>
                        )}
                        <div className="mt-2 font-cinzel text-sm text-[#1A1A1A]">
                           ₪{product.price}
                        </div>
                     </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
        )}

        {!loading && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
               <h3 className="font-playfair text-3xl text-gray-300 italic mb-4">לא נמצאו מוצרים בקטגוריה זו</h3>
               <button onClick={() => handleCategoryChange('all')} className="text-[#D4AF37] border-b border-[#D4AF37] font-montserrat text-sm tracking-widest uppercase pb-1 hover:text-black hover:border-black transition-all">
                  חזרה לכל הפריטים
               </button>
            </div>
        )}
      </section>
      
      <div className="w-full py-12 flex justify-center">
         <div className="w-2 h-2 bg-[#D4AF37] rounded-full opacity-50"></div>
      </div>
    </div>
  );
};

export default MenuPage;