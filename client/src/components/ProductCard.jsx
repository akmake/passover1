import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../stores/cartStore'; // ייבוא ה-Store של העגלה
import { useAuthStore } from '../stores/authStore'; // ייבוא ה-Store של האימות

// אייקון עגלה
const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
);

const ProductCard = ({ product }) => {
  const { t, i18n } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  // שליפת הפונקציות והנתונים מה-Stores
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // פונקציה לטיפול בכתובת התמונה
  const getImageUrl = (imgStr) => {
    if (!imgStr) return 'https://via.placeholder.com/400x600?text=No+Image';
    if (imgStr.startsWith('http')) return imgStr; 
    return `https://localhost:5000${imgStr}`; 
  };

  const name = product.name[i18n.language] || product.name.he || product.name;
  const description = product.description?.[i18n.language] || product.description?.he || '';

  return (
    <div 
      className="group relative cursor-pointer flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* מסגרת התמונה */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#111] mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-500">
        
        {/* תגית פופולרי */}
        {product.isPopular && (
           <div className="absolute top-0 left-0 bg-[#d4af37] text-black text-[10px] uppercase font-bold tracking-widest px-3 py-1 z-20">
              Best Seller
           </div>
        )}

        {/* התמונה עצמה */}
        <img 
           src={getImageUrl(product.image)}
           alt={name}
           className="w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
        
        {/* שכבת כהות עדינה + כפתור הוספה */}
        <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
           <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
              <button 
                className="w-full bg-white text-black font-medium text-xs uppercase tracking-widest py-4 hover:bg-[#d4af37] hover:text-white transition-colors shadow-xl flex items-center justify-center gap-2"
                onClick={(e) => {
                   e.stopPropagation();
                   // --- הלוגיקה המתוקנת ---
                   addToCart(product, isAuthenticated); // הוספה לעגלה
                   toggleCart(); // פתיחת העגלה כדי לתת חיווי למשתמש
                }}
              >
                 <CartIcon /> {t('addToCart', 'Add to Cart')} — ₪{product.price}
              </button>
           </div>
        </div>
      </div>

      {/* פרטי מוצר */}
      <div className="text-center w-full px-2">
         <h3 className="font-serif text-xl text-white group-hover:text-[#d4af37] transition-colors duration-300">
            {name}
         </h3>
         {description && (
            <p className="text-gray-500 text-xs mt-1 line-clamp-1 font-light tracking-wide">
               {description}
            </p>
         )}
         <div className="mt-2 text-[#d4af37] font-medium tracking-wider">
            ₪{product.price}
         </div>
      </div>
    </div>
  );
};

export default ProductCard;