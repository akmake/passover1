import React from 'react';
import { useCartStore } from '../stores/cartStore';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();
  const { i18n } = useTranslation();
  
  // תמיכה בשמות בשתי שפות
  const name = typeof product.name === 'object' 
    ? product.name[i18n.language] || product.name['he'] 
    : product.name;

  const description = typeof product.description === 'object'
    ? product.description[i18n.language] || product.description['he']
    : product.description;

  return (
    <div className="group relative">
      {/* תמונה עם אפקט זום עדין וכהות */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
        <Link to={`/product/${product._id}`}> {/* אם יש לך דף מוצר, אחרת הסר את הלינק */}
            <img
              src={product.image}
              alt={name}
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
            />
            {/* שכבה כהה שמופיעה בהובר */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
        
        {/* כפתור הוספה לעגלה שצץ מלמטה */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
           <button
            onClick={() => addToCart(product)}
            className="w-full bg-white text-black py-3 uppercase tracking-widest text-xs font-medium hover:bg-[#d4af37] hover:text-white transition-colors shadow-lg"
          >
            הוסף לסל
          </button>
        </div>
      </div>

      {/* פרטי מוצר */}
      <div className="text-center">
        <h3 className="text-lg font-serif text-gray-900 group-hover:text-[#d4af37] transition-colors">
          <Link to={`/product/${product._id}`}>
            {name}
          </Link>
        </h3>
        {product.isPopular && (
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] border border-[#d4af37] text-[#d4af37] uppercase tracking-widest">
                Best Seller
            </span>
        )}
        <p className="mt-2 text-sm text-gray-500 font-light line-clamp-2 px-2">
            {description}
        </p>
        <p className="mt-3 text-base font-medium text-gray-900">
          ₪{product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;