import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react'; 
import api from '../api';
import ProductCard from '../components/ProductCard'; 
import ProductDrawer from '../components/ProductDrawer';

// פונקציית עזר לחילוץ טקסט
const getText = (field) => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field.he || field.en || '';
};

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // במקום סינון, נשתמש בזה כדי לדעת איזה כפתור להאיר למעלה
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // רפרנסים לכל המקטעים בדף כדי שנוכל לגלול אליהם
  const sectionRefs = useRef({});
  // רפרנס כדי למנוע לולאת גלילה בעת לחיצה
  const isClickingRef = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. קטגוריות
        const catsRes = await api.get('/api/categories'); 
        // אנו לא צריכים את "הכל" ברשימה למטה, אבל כן בתפריט למעלה ככפתור לראש הדף
        setCategories(catsRes.data);

        // 2. מוצרים
        const prodRes = await api.get('/api/products');
        setProducts(prodRes.data);

      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- מנגנון Scroll Spy (זיהוי מיקום בגלילה) ---
  useEffect(() => {
    const handleScroll = () => {
      if (isClickingRef.current) return; // אם הגלילה נובעת לחיצה, אל תשנה סטייט

      const scrollPosition = window.scrollY + 200; // אופסט כדי שהזיהוי יקרה קצת לפני שמגיעים
      
      // בדיקה איזה סקשן הכי קרוב
      let currentSection = 'all';
      
      // אם אנחנו ממש למעלה - סמן את הכל
      if (window.scrollY < 100) {
        setActiveCategory('all');
        return;
      }

      categories.forEach((cat) => {
        const element = sectionRefs.current[cat._id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            currentSection = cat._id;
          }
        }
      });

      if (currentSection !== activeCategory) {
        setActiveCategory(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories, activeCategory]);


  // פונקציה לגלילה חלקה בעת לחיצה על כפתור
  const scrollToCategory = (catId) => {
    isClickingRef.current = true;
    setActiveCategory(catId);
    setSearchParams({ category: catId === 'all' ? '' : catId });

    if (catId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = sectionRefs.current[catId];
      if (element) {
        // קיזוז של הגובה של ההדר (בערך 180 פיקסלים)
        const headerOffset = 180;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }

    // שחרור הנעילה אחרי סיום הגלילה (בערך)
    setTimeout(() => {
      isClickingRef.current = false;
    }, 1000);
  };

  // קיבוץ מוצרים לפי קטגוריות
  // אנו מסננים קודם לפי חיפוש, ואז מציגים את התוצאות בתוך הקטגוריות שלהן
  const getProductsByCategory = (catId) => {
    return products.filter(p => {
      const pCatId = typeof p.category === 'object' ? p.category?._id : p.category;
      
      // התאמה לקטגוריה
      const matchCat = pCatId === catId;
      
      // התאמה לחיפוש
      const matchSearch = getText(p.name).toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchCat && matchSearch;
    });
  };

  return (
    <div className="bg-[#F9F8F6] min-h-screen w-full text-[#1A1A1A] font-sans" dir="rtl">
      
      <ProductDrawer 
        product={selectedProduct} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
      
      {/* HEADER ראשית - תמיד למעלה */}
      <header className="pt-12 pb-6 text-center bg-[#F9F8F6]">
          <h1 className="text-4xl md:text-5xl text-[#1A1A1A] tracking-wider font-serif font-bold">
            ALI ZAHAV
          </h1>
          <p className="text-[#8A8A8A] text-xs tracking-[0.3em] mt-3 uppercase">
            Luxury Home Collection
          </p>
      </header>

      {/* STICKY NAV BAR - הפס שיורד איתך */}
      <div className="sticky top-0 z-40 bg-[#F9F8F6]/95 backdrop-blur-md border-b border-[#E5E5E5] py-4 shadow-sm transition-all duration-300">
          <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* רשימת קטגוריות - גלילה אופקית */}
            <div className="flex gap-8 overflow-x-auto hide-scrollbar w-full md:w-auto justify-center md:justify-start px-2">
                {/* כפתור "הכל" שגולל למעלה */}
                <button 
                    onClick={() => scrollToCategory('all')}
                    className={`relative pb-2 text-sm transition-all duration-300 whitespace-nowrap tracking-wide
                    ${activeCategory === 'all' ? 'text-[#D4AF37] font-bold' : 'text-[#5A5A5A] hover:text-[#1A1A1A]'}`}
                >
                    כל הקולקציה
                    {activeCategory === 'all' && (
                        <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
                    )}
                </button>

                {categories.map((cat) => {
                    const isActive = activeCategory === cat._id;
                    const catName = getText(cat.name);
                    
                    return (
                        <button 
                            key={cat._id}
                            onClick={() => scrollToCategory(cat._id)}
                            className={`relative pb-2 text-sm transition-all duration-300 whitespace-nowrap tracking-wide
                            ${isActive ? 'text-[#D4AF37] font-bold' : 'text-[#5A5A5A] hover:text-[#1A1A1A]'}`}
                        >
                            {catName}
                            {isActive && (
                                <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* חיפוש */}
            <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="חיפוש פריט..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#E0E0E0] rounded-sm px-4 py-2 pl-10 text-sm focus:outline-none focus:border-[#D4AF37]"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] w-4 h-4" />
            </div>
          </div>
      </div>

      {/* MAIN CONTENT - רשימה ארוכה לפי קטגוריות */}
      <main className="max-w-[1600px] mx-auto px-6 pb-24">
        {loading ? (
            <div className="flex justify-center items-center h-[50vh]">
               <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
            </div>
        ) : (
            <div className="space-y-20 mt-12"> 
              {/* לולאה שעוברת על כל הקטגוריות ומציגה אותן אחת אחרי השניה */}
              {categories.map((cat) => {
                const catProducts = getProductsByCategory(cat._id);
                
                // אם אין מוצרים בקטגוריה (בגלל חיפוש או ריק), לא מציגים את הסקשן
                if (catProducts.length === 0) return null;

                return (
                  <section 
                    key={cat._id} 
                    id={cat._id}
                    ref={(el) => (sectionRefs.current[cat._id] = el)} // חיבור לרפרנס לגלילה
                    className="scroll-mt-40" // מרווח לגלילה
                  >
                    {/* כותרת ומפריד לכל קטגוריה */}
                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-[1px] bg-[#D4AF37]/30 flex-grow"></div>
                        <h2 className="text-3xl font-serif text-[#1A1A1A] px-4 min-w-fit">
                            {getText(cat.name)}
                        </h2>
                        <div className="h-[1px] bg-[#D4AF37]/30 flex-grow"></div>
                    </div>

                    {/* גריד המוצרים של הקטגוריה הזו */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                        {catProducts.map((product) => (
                          <ProductCard 
                            key={product._id} 
                            product={product} 
                            onClick={() => {
                                setSelectedProduct(product);
                                setIsDrawerOpen(true);
                            }} 
                          />
                        ))}
                    </div>
                  </section>
                );
              })}
            </div>
        )}

        {!loading && products.length === 0 && (
            <div className="text-center py-24 opacity-50">
               <h3 className="text-2xl font-serif text-[#1A1A1A]">לא נמצאו פריטים</h3>
            </div>
        )}
      </main>
    </div>
  );
};

export default MenuPage;