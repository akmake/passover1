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

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 text-white selection:bg-[#d4af37] selection:text-black">
      
      {/* כותרת מינימליסטית */}
      <div className="px-8 md:px-16 mb-16 flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-8">
        <div>
          <h1 className="text-5xl md:text-8xl font-serif text-white mb-2 tracking-tight">
            Shop
          </h1>
          <p className="text-gray-500 text-xs tracking-[0.3em] uppercase">
            {filteredProducts.length} Premium Objects
          </p>
        </div>
        
        {/* פילטרים טקסטואליים */}
        <div className="flex flex-wrap gap-6 mt-8 md:mt-0">
          <button onClick={() => setActiveCategory('all')} className={`text-xs uppercase tracking-widest transition-all ${activeCategory === 'all' ? 'text-white border-b border-white' : 'text-gray-600 hover:text-white'}`}>All</button>
          {Object.values(PRODUCT_CATEGORIES).map((catKey) => {
            const details = CATEGORY_DETAILS[catKey];
            if (!details) return null;
            return (
              <button key={catKey} onClick={() => setActiveCategory(catKey)} className={`text-xs uppercase tracking-widest transition-all ${activeCategory === catKey ? 'text-white border-b border-white' : 'text-gray-600 hover:text-white'}`}>
                {details.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* גריד MASONRY (כמו פינטרסט) */}
      <div className="px-4 md:px-16">
        {loading ? (
          <div className="text-center py-20 tracking-widest text-xs animate-pulse">LOADING COLLECTION...</div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
            <AnimatePresence mode="wait">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className="break-inside-avoid mb-8"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;