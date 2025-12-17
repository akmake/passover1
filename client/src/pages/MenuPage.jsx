import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts } from '../api';
import { CATEGORY_DETAILS, PRODUCT_CATEGORIES } from '../config/constants';
import ProductCard from '../components/ProductCard';

const MenuPage = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  // --- תיקון אגרסיבי לרקע הלבן ---
  // הקוד הזה רץ כשהדף עולה ומכריח את הדפדפן להיות שחור
  useEffect(() => {
    document.body.style.backgroundColor = '#050505';
    document.documentElement.style.backgroundColor = '#050505';
    
    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, []);

  // שליפת מוצרים
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#050505] text-white w-full overflow-x-hidden">
      
      {/* 1. HERO SECTION - שלא יראה קצר וריק */}
      <div className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden">
        {/* תמונת רקע כהה ואווירתית */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/60 z-10" /> {/* שכבה כהה מעל התמונה */}
            <img 
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000" 
                alt="Collection Header" 
                className="w-full h-full object-cover"
            />
        </div>
        
        {/* טקסט כותרת */}
        <div className="relative z-20 text-center px-4">
            <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="block text-[#d4af37] text-xs md:text-sm tracking-[0.4em] uppercase mb-4"
            >
                Spring / Summer 2025
            </motion.span>
            <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="text-6xl md:text-8xl font-serif text-white tracking-wide"
            >
                THE ATELIER
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-gray-300 font-light text-lg max-w-lg mx-auto"
            >
                Curated design objects for the modern sanctuary.
            </motion.p>
        </div>
      </div>

      {/* 2. STICKY FILTER BAR - נשאר למעלה בגלילה */}
      <div className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-y border-white/5 py-6">
        <div className="flex justify-center flex-wrap gap-8 px-6 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`text-xs uppercase tracking-[0.2em] transition-all duration-300 pb-1 ${
              activeCategory === 'all' 
                ? 'text-[#d4af37] border-b border-[#d4af37]' 
                : 'text-gray-400 hover:text-white border-b border-transparent'
            }`}
          >
            All Collection
          </button>
          
          {Object.values(PRODUCT_CATEGORIES).map((catKey) => {
            const details = CATEGORY_DETAILS[catKey];
            if (!details) return null;
            return (
              <button
                key={catKey}
                onClick={() => setActiveCategory(catKey)}
                className={`text-xs uppercase tracking-[0.2em] transition-all duration-300 pb-1 whitespace-nowrap ${
                  activeCategory === catKey 
                    ? 'text-[#d4af37] border-b border-[#d4af37]' 
                    : 'text-gray-400 hover:text-white border-b border-transparent'
                }`}
              >
                {details.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. PRODUCT GRID - מרווח ומרשים */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-12 py-16">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-1 h-12 bg-[#d4af37] animate-pulse"></div>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16"
          >
            <AnimatePresence mode="wait">
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
          <div className="text-center py-32">
            <h3 className="text-2xl font-serif text-white/50 italic">No items found in this category.</h3>
          </div>
        )}
      </div>
      
      {/* 4. FOOTER SPACER - כדי שהדף לא ייחתך בסוף */}
      <div className="py-20 text-center border-t border-white/5 bg-[#080808]">
         <p className="text-xs text-gray-600 tracking-widest uppercase">Maison De Luxe • 2025</p>
      </div>

    </div>
  );
};

export default MenuPage;