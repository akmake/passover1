import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts } from '../api'; // וודא שהנתיב נכון לקובץ ה-API שלך
import { CATEGORY_DETAILS, PRODUCT_CATEGORIES } from '../config/constants';
import ProductCard from '../components/ProductCard';

const MenuPage = () => {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

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

  // סינון מוצרים
  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  // קטגוריות לתצוגה
  const categoriesToShow = Object.values(PRODUCT_CATEGORIES);

  // אנימציית כניסה לגריד
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1 // כל מוצר נכנס בדיליי קטן אחרי הקודם
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] pt-20 pb-20">
      
      {/* Header אלגנטי */}
      <div className="text-center py-16 px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-serif text-[#0a0a0a] mb-4 tracking-wider"
        >
          THE COLLECTION
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[#888] tracking-[0.2em] uppercase text-sm"
        >
          Timeless Luxury & Design
        </motion.p>
      </div>

      {/* סרגל קטגוריות מינימליסטי */}
      <div className="sticky top-16 z-30 bg-[#f9f9f9]/90 backdrop-blur-md border-b border-gray-200 mb-12 py-4">
        <div className="flex justify-center flex-wrap gap-6 md:gap-12 px-4 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`text-sm tracking-widest uppercase pb-1 transition-all duration-300 ${
              activeCategory === 'all' 
                ? 'text-[#d4af37] border-b border-[#d4af37]' 
                : 'text-gray-500 hover:text-black border-b border-transparent'
            }`}
          >
            הכל
          </button>
          
          {categoriesToShow.map((catKey) => {
            const details = CATEGORY_DETAILS[catKey];
            if (!details) return null;
            return (
              <button
                key={catKey}
                onClick={() => setActiveCategory(catKey)}
                className={`text-sm tracking-widest uppercase pb-1 transition-all duration-300 whitespace-nowrap ${
                  activeCategory === catKey 
                    ? 'text-[#d4af37] border-b border-[#d4af37]' 
                    : 'text-gray-500 hover:text-black border-b border-transparent'
                }`}
              >
                {details.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* גריד המוצרים */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4af37]"></div>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-8"
          >
            <AnimatePresence mode="wait">
              {filteredProducts.map((product) => (
                <motion.div key={product._id} variants={itemVariants} layout>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 text-gray-400 font-light">
            לא נמצאו פריטים בקטגוריה זו.
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;