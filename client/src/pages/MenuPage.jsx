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
    <div className="min-h-screen bg-[#050505] pt-28 pb-20 text-white selection:bg-white selection:text-black">
      
      {/* HEADER SECTION */}
      <div className="px-6 md:px-12 mb-16 flex flex-col md:flex-row justify-between items-end">
        <div>
          <h1 className="text-6xl md:text-8xl font-serif text-white mb-2 leading-none tracking-tighter">
            Object<span className="italic text-[#888]">s</span>
          </h1>
          <p className="text-xs tracking-[0.3em] uppercase text-gray-400 ml-1">
            Curated Home Collection
          </p>
        </div>
        
        {/* CATEGORY FILTER - TEXT BASED */}
        <div className="flex flex-wrap gap-x-8 gap-y-2 mt-8 md:mt-0 justify-end max-w-2xl">
          <button
            onClick={() => setActiveCategory('all')}
            className={`text-xs uppercase tracking-widest transition-colors duration-300 ${
              activeCategory === 'all' ? 'text-white border-b border-white' : 'text-gray-600 hover:text-white'
            }`}
          >
            View All
          </button>
          {Object.values(PRODUCT_CATEGORIES).map((catKey) => {
            const details = CATEGORY_DETAILS[catKey];
            if (!details) return null;
            return (
              <button
                key={catKey}
                onClick={() => setActiveCategory(catKey)}
                className={`text-xs uppercase tracking-widest transition-colors duration-300 ${
                  activeCategory === catKey ? 'text-white border-b border-white' : 'text-gray-600 hover:text-white'
                }`}
              >
                {details.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* MASONRY GALLERY LAYOUT */}
      <div className="px-4 md:px-8">
        {loading ? (
          <div className="flex justify-center h-40 items-center">
             <span className="text-xs tracking-widest animate-pulse">LOADING COLLECTION...</span>
          </div>
        ) : (
          /* שימוש ב-Columns ליצירת אפקט גלריה אמיתי */
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            <AnimatePresence mode="wait">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="break-inside-avoid mb-6"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {!loading && filteredProducts.length === 0 && (
          <div className="h-[50vh] flex items-center justify-center text-gray-500 font-serif italic text-xl">
            No items found in this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;