import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag } from 'lucide-react'; // אייקון מודרני

const ProductCard = ({ product, onClick }) => {
  const { i18n } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  // --- פונקציית עזר למניעת קריסות שמות ---
  const getName = (nameObj) => {
      if (!nameObj) return '';
      if (typeof nameObj === 'string') return nameObj;
      return nameObj[i18n.language] || nameObj.he || nameObj.en || '';
  };

  // --- פונקציית עזר לתמונות ---
  const getImageUrl = (imgStr) => {
    if (!imgStr) return 'https://via.placeholder.com/400x600?text=No+Image';
    if (imgStr.startsWith('http')) return imgStr; 
    return `http://localhost:5000${imgStr}`; 
  };

  const name = getName(product.name);

  // הגנה מפני קריסה אם לא הועברה פונקציה
  const handleClick = (e) => {
      if (e) e.stopPropagation();
      if (typeof onClick === 'function') {
          onClick(product);
      }
  };

  return (
    <div 
      className="group relative cursor-pointer flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => handleClick()} // לחיצה על כל הכרטיס
    >
      {/* מסגרת התמונה - שמרנו על aspect-[3/4] ועיצוב נקי */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-white mb-4 shadow-sm group-hover:shadow-2xl transition-all duration-500 border border-gray-100">
        
        {/* תגית פופולרי */}
        {product.isPopular && (
           <div className="absolute top-0 left-0 bg-[#D4AF37] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 z-20 shadow-md">
              Best Seller
           </div>
        )}

        {/* התמונה עצמה */}
        <img 
           src={getImageUrl(product.image || product.imageUrl)}
           alt={name}
           className="w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-110 opacity-100"
        />
        
        {/* שכבת כהות עדינה + כפתור הוספה (בעיצוב המקורי שביקשת) */}
        <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
           <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
              <button 
                className="w-full bg-white text-[#1A1A1A] font-bold text-xs uppercase tracking-widest py-4 hover:bg-[#D4AF37] hover:text-white transition-colors shadow-xl flex items-center justify-center gap-2 border border-gray-200"
                onClick={handleClick}
              >
                 <ShoppingBag size={16} /> 
                 צפייה מהירה
              </button>
           </div>
        </div>
      </div>

      {/* פרטי מוצר - נקי, בלי תיאור */}
      <div className="text-center w-full px-2">
         {/* כותרת */}
         <h3 className="font-serif text-xl text-gray-900 group-hover:text-[#d4af37] transition-colors duration-300">
            {name}
         </h3>
         
         {/* מחיר */}
         <div className="mt-2 text-[#d4af37] font-medium tracking-wider">
            ₪{product.price}
         </div>
      </div>
    </div>
  );
};

export default ProductCard;