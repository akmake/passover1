import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts } from '../api';
import { CATEGORY_DETAILS, PRODUCT_CATEGORIES } from '../config/constants';
import ProductCard from '../components/ProductCard';

const MenuPage = () => {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

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

  const categoriesToShow = Object.values(PRODUCT_CATEGORIES);

  return (
    // שינוי לרקע כהה (#0a0a0a) כדי להתאים לדף הבית
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-20 text-white selection:bg-[#d4af37] selection:text-black">
      
      {/* כותרת ראשית דרמטית */}
      <div className="text-center py-16 px-4 relative overflow-hidden">
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.1 }} 
            className="absolute top-0 left-1/2 -translate-x-1/2 text-[10rem] md:text-[15rem] font-serif text-white whitespace-nowrap pointer-events-none select-none"
        >
            LUXURY
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative text-5xl md:text-7xl font-serif text-white mb-6 tracking-wider z-10"
        >
          The Collection
        </motion.h1>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100px" }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-[1px] bg-[#d4af37] mx-auto mb-6"
        />
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[#888] tracking-[0.3em] uppercase text-xs md:text-sm font-light z-10"
        >
          Curated for the Exceptional
        </motion.p>
      </div>

      {/* פילטרים בסגנון טאבים מינימליסטיים */}
      <div className="sticky top-20 z-40 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/10 mb-16 py-6">
        <div className="flex justify-center flex-wrap gap-8 md:gap-12 px-6 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`text-sm tracking-[0.2em] uppercase transition-all duration-300 relative group ${
              activeCategory === 'all' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            All Items
            {activeCategory === 'all' && (
                <motion.div layoutId="activeTab" className="absolute -bottom-2 left-0 right-0 h-[1px] bg-[#d4af37]" />
            )}
          </button>
          
          {categoriesToShow.map((catKey) => {
            const details = CATEGORY_DETAILS[catKey];
            if (!details) return null;
            return (
              <button
                key={catKey}
                onClick={() => setActiveCategory(catKey)}
                className={`text-sm tracking-[0.2em] uppercase transition-all duration-300 relative group whitespace-nowrap ${
                  activeCategory === catKey ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {details.title}
                {activeCategory === catKey && (
                    <motion.div layoutId="activeTab" className="absolute -bottom-2 left-0 right-0 h-[1px] bg-[#d4af37]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* גריד המוצרים */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#d4af37]"></div>
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16"
          >
            <AnimatePresence mode="wait">
              {filteredProducts.map((product) => (
                <motion.div 
                    key={product._id} 
                    layout
                    variants={{
                        hidden: { opacity: 0, y: 50 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
                    }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-32">
            <h3 className="text-2xl font-serif text-white/50">קולקציה זו תתעדכן בקרוב.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;