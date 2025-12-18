import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../api';
import ProductCard from '../components/ProductCard';

// הגדרת קטגוריות
const CATEGORIES = [
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
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // טעינת מוצרים
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/products');
        setProducts(data);

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

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setSearchParams({ category: catId === 'all' ? '' : catId });
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen w-full text-[#1A1A1A] selection:bg-[#D4AF37] selection:text-white font-sans">
      
      {/* --- HERO SECTION: LIGHT & AIRY --- */}
      <header className="relative w-full pt-32 pb-20 px-6 md:px-12 flex flex-col items-center justify-center text-center bg-white border-b border-gray-100">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
            <h2 className="text-[#D4AF37] text-sm font-serif tracking-[0.3em] uppercase mb-4">
                The Collection 2025
            </h2>
            <h1 className="font-serif text-5xl md:text-7xl text-[#1A1A1A] tracking-tight mb-6">
                {selectedCategory === 'all' ? 'Signature Menu' : CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </h1>
            <div className="w-[1px] h-12 bg-[#D4AF37] mx-auto opacity-60"></div>
        </motion.div>
      </header>

      {/* --- STICKY FILTER BAR (LIGHT) --- */}
      <div className="sticky top-0 z-40 bg-[#FAFAFA]/95 backdrop-blur-md border-b border-[#E5E5E5] w-full shadow-sm">
         <div className="max-w-[1800px] mx-auto px-6 py-5 flex items-center justify-between">
            
            {/* רשימת קטגוריות */}
            <div className="flex gap-8 overflow-x-auto hide-scrollbar w-full md:w-auto items-center">
               <button 
                  onClick={() => handleCategoryChange('all')}
                  className={`whitespace-nowrap font-serif text-sm uppercase tracking-[0.15em] transition-all duration-300 relative px-2 py-1
                  ${selectedCategory === 'all' ? 'text-black font-bold' : 'text-gray-400 hover:text-black'}`}
               >
                  All Items
                  {selectedCategory === 'all' && (
                    <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-[1px] bg-[#D4AF37]" />
                  )}
               </button>

               {CATEGORIES.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`whitespace-nowrap font-serif text-sm uppercase tracking-[0.15em] transition-all duration-300 relative px-2 py-1
                    ${selectedCategory === cat.id ? 'text-black font-bold' : 'text-gray-400 hover:text-black'}`}
                  >
                    {cat.name}
                    {selectedCategory === cat.id && (
                      <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-[1px] bg-[#D4AF37]" />
                    )}
                  </button>
               ))}
            </div>

            {/* מונה פריטים */}
            <div className="hidden md:block text-[#D4AF37] font-serif text-xs tracking-widest">
               {filteredProducts.length} CREATIONS
            </div>
         </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      <section className="max-w-[1800px] mx-auto px-4 md:px-12 py-16">
        {loading ? (
            <div className="flex justify-center items-center h-[40vh]">
               <div className="w-12 h-12 border-t-2 border-b-2 border-[#D4AF37] rounded-full animate-spin"></div>
            </div>
        ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16"
            >
              <AnimatePresence>
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                     <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
        )}

        {!loading && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center opacity-60">
               <h3 className="font-serif text-3xl text-gray-400 mb-4 italic">No items found.</h3>
               <button 
                 onClick={() => handleCategoryChange('all')} 
                 className="text-[#D4AF37] border-b border-[#D4AF37] pb-1 hover:text-black hover:border-black transition-colors uppercase tracking-widest text-sm"
               >
                  Return to Collection
               </button>
            </div>
        )}
      </section>

      {/* --- FOOTER SEPARATOR --- */}
      <div className="w-full py-16 flex justify-center border-t border-gray-100">
         <div className="w-2 h-2 bg-[#D4AF37] rounded-full opacity-50"></div>
      </div>
    </div>
  );
};

export default MenuPage;