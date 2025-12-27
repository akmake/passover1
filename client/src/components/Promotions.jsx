import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api'; // החיבור הנכון לשרת
import { useCartStore } from '@/stores/cartStore'; // החנות האמיתית שלך
import { Loader2, ShoppingBag } from 'lucide-react';

const Promotions = () => {
  const addToCart = useCartStore((state) => state.addToCart);

  // שימוש ב-React Query לשליפה
  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ['publicPromotions'],
    queryFn: async () => (await api.get('/api/promotions')).data,
  });

  // פונקציית עזר לשמות (כמו שיש לך בשאר הקבצים)
  const getName = (nameObj) => {
    if (!nameObj) return '';
    if (typeof nameObj === 'string') return nameObj;
    return nameObj.he || nameObj.en || '';
  };

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#D4AF37]" /></div>;
  if (promotions.length === 0) return null;

  return (
    <div className="py-16 bg-[#F9F8F6]"> {/* צבע הרקע של האתר שלך */}
      <div className="max-w-[1600px] mx-auto px-6">
        
        <div className="text-center mb-12">
          <h2 className="font-cinzel text-4xl md:text-5xl text-[#1A1A1A] mb-4">Special Offers</h2>
          <div className="w-[1px] h-12 bg-[#D4AF37] mx-auto mb-4"></div>
          <p className="font-montserrat text-gray-500 tracking-[0.2em] uppercase text-sm">Limited Time Exclusives</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {promotions.map((promo) => {
            if (!promo.product) return null;
            const product = promo.product;
            const displayName = getName(product.name);

            // יצירת אובייקט מותאם לעגלה (המחיר החדש דורס את הישן)
            const handleAddToCart = () => {
                const productToCart = {
                    ...product,
                    price: promo.discountPrice, // המחיר הקובע
                    originalPrice: product.price,
                    isSaleItem: true
                };
                addToCart(productToCart); // הפונקציה האמיתית מה-Store שלך
            };

            return (
              <div key={promo._id} className="group relative bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col">
                
                {/* תגית הנחה יוקרתית */}
                <div className="absolute top-0 right-0 bg-[#D4AF37] text-white text-[10px] font-bold px-3 py-1 z-10 tracking-widest uppercase shadow-md">
                  Special Price
                </div>

                {/* תמונה */}
                <div className="h-[300px] w-full overflow-hidden relative bg-gray-50">
                  <img 
                    src={product.image || product.imageUrl} 
                    alt={displayName} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[1.5s] ease-in-out"
                  />
                  
                  {/* כפתור הוספה מהירה (כמו ב-ProductCard שלך) */}
                  <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                      <button
                        onClick={handleAddToCart}
                        className="w-full bg-white text-[#1A1A1A] font-bold text-xs uppercase tracking-widest py-3 hover:bg-[#D4AF37] hover:text-white transition-colors shadow-lg border border-gray-100 flex items-center justify-center gap-2"
                      >
                         <ShoppingBag size={14} />
                         ADD TO CART
                      </button>
                   </div>
                </div>

                {/* פרטים */}
                <div className="p-6 text-center flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-xl text-gray-900 mb-2 group-hover:text-[#D4AF37] transition-colors">
                      {displayName}
                    </h3>
                    <div className="w-8 h-[1px] bg-gray-200 mx-auto my-3"></div>
                  </div>

                  <div className="flex items-center justify-center gap-3 mt-2">
                    <span className="text-gray-400 line-through font-montserrat text-sm">₪{product.price}</span>
                    <span className="text-2xl font-cinzel text-[#1A1A1A] font-medium">₪{promo.discountPrice}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Promotions;