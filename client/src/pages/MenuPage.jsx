import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react'; 
import api from '../api';
import ProductCard from '../components/ProductCard'; 
import ProductDrawer from '../components/ProductDrawer'; // ייבוא המגירה הצדדית

// --- 1. פונקציית עזר למניעת קריסה ---
const getName = (nameObj) => {
  if (!nameObj) return '';
  if (typeof nameObj === 'string') return nameObj;
  return nameObj.he || nameObj.en || nameObj.name || '';
};

// --- 2. הזרקת פונטים איכותיים לעברית ---
const FontsInjection = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700&family=Frank+Ruhl+Libre:wght@400;500;700&display=swap');
      
      .font-hebrew-title { font-family: 'Frank Ruhl Libre', serif; }
      .font-hebrew-text { font-family: 'Assistant', sans-serif; }
      
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}
  </style>
);

const CATEGORIES = [
  { id: 'all', name: 'הכל' },
  { id: 'flowers', name: 'פרחים' },
  { id: 'gifts', name: 'מארזים' },
  { id: 'dinnerware', name: 'אירוח' },
  { id: 'chocolate', name: 'שוקולד' },
  { id: 'decor', name: 'עיצוב' },
  { id: 'packages', name: 'חבילות חג' }
];

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // סטייט למגירה הצדדית
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/products');
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

  const filteredProducts = products.filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const productName = getName(p.name).toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = productName.includes(query);
      return matchesCategory && matchesSearch;
  });

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setSearchParams({ category: catId === 'all' ? '' : catId });
  };

  // פונקציה לפתיחת המגירה
  const openDrawer = (product) => {
      setSelectedProduct(product);
      setIsDrawerOpen(true);
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen w-full text-[#2D2D2D] selection:bg-[#D4AF37] selection:text-white font-hebrew-text" dir="rtl">
      <FontsInjection />
      
      {/* --- מגירה צדדית --- */}
      <ProductDrawer 
        product={selectedProduct} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
      
      {/* --- HERO SECTION: מצומצם וקומפקטי --- */}
      <header className="relative w-full pt-12 pb-4 px-6 flex flex-col items-center justify-center text-center bg-white border-b border-gray-100">
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
            <h2 className="text-[#D4AF37] text-xs font-bold tracking-[0.2em] mb-1">
                ALI ZAHAV • COLLECTION
            </h2>
            <h1 className="font-hebrew-title text-3xl md:text-4xl text-[#1A1A1A] mb-2 leading-tight font-medium">
                {selectedCategory === 'all' ? 'הקולקציה שלנו' : CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </h1>
            {/* קו מפריד קצר ועדין */}
            <div className="w-[1px] h-4 bg-[#D4AF37] mx-auto opacity-50"></div>
        </motion.div>
      </header>

      {/* --- STICKY FILTER BAR --- */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 w-full shadow-sm">
         <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* קטגוריות */}
            <div className="flex gap-1 overflow-x-auto hide-scrollbar w-full md:w-auto items-center pb-1 md:pb-0">
               {CATEGORIES.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold transition-all duration-200
                    ${selectedCategory === cat.id 
                        ? 'bg-[#1A1A1A] text-[#D4AF37] shadow-sm' 
                        : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}
                  >
                    {cat.name}
                  </button>
               ))}
            </div>

            {/* חיפוש */}
            <div className="relative w-full md:w-56 group">
               <input 
                  type="text" 
                  placeholder="חיפוש..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 pr-8 text-xs focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-all"
               />
               <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
            </div>
         </div>
      </div>

      {/* --- GRID מוצרים --- */}
      <section className="max-w-[1800px] mx-auto px-4 py-10 min-h-[60vh]">
        {loading ? (
            <div className="flex flex-col justify-center items-center h-[30vh] gap-4">
               <div className="w-8 h-8 border-2 border-gray-100 border-t-[#D4AF37] rounded-full animate-spin"></div>
            </div>
        ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10"
            >
              <AnimatePresence mode='popLayout'>
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                      {/* העברת פונקציית הפתיחה לכרטיס */}
                      <ProductCard 
                        product={product} 
                        onClick={openDrawer}
                      /> 
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
        )}

        {!loading && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
               <h3 className="font-hebrew-title text-xl text-gray-400 mb-2">לא נמצאו פריטים</h3>
               <button 
                 onClick={() => { handleCategoryChange('all'); setSearchQuery(''); }}
                 className="text-[#D4AF37] font-bold text-xs border-b border-[#D4AF37] pb-1 hover:text-black hover:border-black transition-colors"
               >
                 חזרה לכל הקולקציה
               </button>
            </div>
        )}
      </section>

      {/* --- FOOTER DECORATION --- */}
      <div className="w-full py-12 flex flex-col items-center justify-center bg-white border-t border-gray-100 mt-auto">
         <h2 className="font-hebrew-title text-xl text-gray-900 tracking-wider font-bold">ALI ZAHAV</h2>
         <p className="text-[10px] text-gray-400 mt-1 tracking-[0.2em] uppercase font-bold">Luxury Events & Styling</p>
      </div>
    </div>
  );
};

export default MenuPage;