import React from 'react';
import { useCartStore } from '../stores/cartStore';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();
  const { i18n } = useTranslation();
  
  const name = typeof product.name === 'object' 
    ? product.name[i18n.language] || product.name['he'] 
    : product.name;

  return (
    <div className="group relative block w-full">
      {/* מיכל התמונה - יחס גבוה יותר לאלגנטיות */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1a1a1a] mb-6">
        
        {/* התמונה עצמה */}
        <Link to={`/product/${product._id}`}>
            <img
              src={product.image}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
            />
        </Link>

        {/* תגית פופולרי - עדינה ומוזהבת */}
        {product.isPopular && (
            <div className="absolute top-4 right-4 z-10">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37] border border-[#d4af37]/50 px-3 py-1 bg-black/50 backdrop-blur-sm">
                    Exclusive
                </span>
            </div>
        )}

        {/* כפתור הוספה לעגלה - מופיע רק בהובר */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20">
           <button
            onClick={(e) => {
                e.preventDefault();
                addToCart(product);
            }}
            className="w-full bg-[#d4af37] text-black py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-white transition-colors"
          >
            Add to Bag
          </button>
        </div>
        
        {/* Overlay כהה עדין שמופיע בהובר כדי להבליט את הכפתור */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* פרטי המוצר - טקסט לבן נקי */}
      <div className="text-center">
        <h3 className="text-lg md:text-xl font-serif text-white mb-2 group-hover:text-[#d4af37] transition-colors duration-300">
          <Link to={`/product/${product._id}`}>
            {name}
          </Link>
        </h3>
        
        <div className="flex justify-center items-center gap-2">
            <span className="text-sm font-light tracking-widest text-gray-400">
                ₪{product.price.toLocaleString()}
            </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;