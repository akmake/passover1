// client/src/components/ProductCard.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag } from 'lucide-react'; 
import { toAbsoluteUrl } from '../utils/url';
import LazyImage from './LazyImage';

const ProductCard = ({ product, onClick }) => {
  const { t, i18n } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  // --- פונקציית עזר למניעת קריסות שמות ---
  const getName = (nameObj) => {
      if (!nameObj) return '';
      if (typeof nameObj === 'string') return nameObj;
      // בדיקה לפי השפה הנוכחית
      return i18n.language === 'he' 
        ? (nameObj.he || nameObj.en || nameObj.name || '')
        : (nameObj.en || nameObj.he || nameObj.name || '');
  };

  // --- פונקציית עזר לתמונות ---
  const getImageUrl = (imgStr) => {
    if (!imgStr) return 'https://via.placeholder.com/400x600?text=No+Image';
    return toAbsoluteUrl(imgStr);
  };

  const name = getName(product.name);

  // הגנה מפני קריסה אם לא הועברה פונקציה
  const handleClick = (e) => {
      if (e) e.stopPropagation();
      if (typeof onClick === 'function') {
          onClick(product);
      }
  };

  // --- לוגיקה: בדיקת מבצע ---
  const isSale = product.originalPrice && product.originalPrice > product.price;

  return (
    <div
      className="group relative cursor-pointer flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => handleClick()} 
    >
      {/* מסגרת התמונה */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-white mb-3 shadow-sm group-hover:shadow-xl transition-all duration-500 border border-gray-100">

        {/* תגית פופולרי */}
        {product.isPopular && !isSale && (
           <div className="absolute top-0 left-0 bg-[#D4AF37] text-white text-[10px] uppercase font-bold tracking-widest px-2 py-1 z-20 shadow-md">
              {t('product.best_seller') || 'BEST SELLER'}
           </div>
        )}

        {/* תגית SALE */}
        {isSale && (
           <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-1 z-20 shadow-md animate-pulse">
               {t('menu.sale') || 'SALE'}
           </div>
        )}

        {/* התמונה עם lazy loading */}
        <LazyImage
           src={getImageUrl(product.image || product.imageUrl)}
           alt={name}
           className="w-full h-full transition-transform duration-[1.5s] ease-in-out group-hover:scale-110"
        />

        {/* שכבת כהות + כפתור הוספה (הוקטן מעט) */}
        <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
           <div className="absolute bottom-0 left-0 w-full p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
              <button
                className="w-full bg-white text-[#1A1A1A] font-bold text-[10px] uppercase tracking-widest py-3 hover:bg-[#D4AF37] hover:text-white transition-colors shadow-xl flex items-center justify-center gap-2 border border-gray-200"
                onClick={handleClick}
              >
                 <ShoppingBag size={14} />
                 {/* שימוש בתרגום עם Fallback */}
                 {isSale 
                    ? (t('product.add_sale') || 'הוסף במבצע') 
                    : (t('menu.quick_view') || 'צפייה מהירה')}
              </button>
           </div>
        </div>
      </div>

      {/* פרטי מוצר */}
      <div className="text-center w-full px-2">
         {/* כותרת - הוקטנה מ-xl ל-lg */}
         <h3 className="font-serif text-lg text-gray-900 group-hover:text-[#d4af37] transition-colors duration-300 line-clamp-1">
            {name}
         </h3>

         {/* מחיר - הוקטן מעט */}
         <div className="mt-1 font-medium tracking-wider flex items-center justify-center gap-2 text-sm">
            {isSale ? (
                <>
                    <span className="text-gray-400 line-through text-xs">₪{product.originalPrice}</span>
                    <span className="text-red-600 font-bold text-base">₪{product.price}</span>
                </>
            ) : (
                <span className="text-[#d4af37] text-base">₪{product.price}</span>
            )}
         </div>
      </div>
    </div>
  );
};

export default ProductCard;