import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../stores/cartStore'; // ודא שהנתיב נכון ל-store שלך

const ProductDrawer = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addToCart); // שימוש ב-Zustand

  if (!product) return null;

  // --- תיקון קריטי: פונקציית חילוץ שם גם כאן ---
  const getName = (nameObj) => {
      if (!nameObj) return '';
      if (typeof nameObj === 'string') return nameObj;
      return nameObj.he || nameObj.en || nameObj.name || '';
  };

  const getImageUrl = (imgStr) => {
    if (!imgStr) return 'https://via.placeholder.com/400x600?text=No+Image';
    if (imgStr.startsWith('http')) return imgStr; 
    return `http://localhost:5000${imgStr}`; 
  };

  const displayName = getName(product.name);
  const displayDescription = getName(product.description);

  const handleAddToCart = () => {
    // הוספה לעגלה - הנחה שהפונקציה ב-Store שלך מקבלת את המוצר והכמות
    // אם ה-addToCart שלך מצפה רק למוצר, תתאים את זה.
    // בדרך כלל ב-Zustand מעבירים (product) וזה מוסיף 1, או שצריך לעדכן את ה-Store.
    // כאן אני מניח שאתה מוסיף בלולאה או שיש לך פונקציה תומכת כמות.
    // לצורך פשטות, נפעיל את ההוספה כמספר הפעמים שנבחר:
    for(let i=0; i<quantity; i++) {
        addToCart(product); 
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-[#FDFCFB] z-[70] shadow-2xl border-l border-[#D4AF37]/20 flex flex-col font-sans"
            dir="rtl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 left-6 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition-colors text-gray-500 hover:text-black shadow-sm"
            >
              <X size={24} />
            </button>

            {/* תמונה */}
            <div className="h-[45%] w-full relative bg-gray-100">
              <img 
                src={getImageUrl(product.image || product.imageUrl)} 
                alt={displayName} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* פרטים */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                {/* שימוש ב-displayName הבטוח */}
                <h2 className="text-3xl font-serif text-[#1A1A1A] leading-tight">{displayName}</h2>
                <span className="text-2xl font-serif text-[#D4AF37]">₪{product.price}</span>
              </div>

              <div className="w-12 h-[2px] bg-[#D4AF37] mb-6"></div>

              <p className="text-gray-600 leading-relaxed mb-8 text-lg font-light">
                {displayDescription || 'תיאור המוצר יופיע כאן. פריט זה נבחר בקפידה לקולקציית היוקרה שלנו.'}
              </p>
            </div>

            {/* תחתית: כמות והוספה */}
            <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-6 mb-6">
                <span className="text-gray-500 font-bold text-sm">כמות:</span>
                <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 gap-6">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-400 hover:text-black"><Minus size={18}/></button>
                  <span className="font-bold text-lg w-4 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="text-gray-400 hover:text-black"><Plus size={18}/></button>
                </div>
              </div>

              <button 
                onClick={handleAddToCart}
                className="w-full bg-[#1A1A1A] text-[#D4AF37] py-4 text-lg font-serif tracking-widest hover:bg-[#D4AF37] hover:text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
              >
                <ShoppingBag size={20} />
                הוסף לסל - ₪{product.price * quantity}
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductDrawer;