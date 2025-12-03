// client/src/components/ProductCard.jsx

import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from 'react-i18next';

// פונקציית עזר קטנה למפות את הערכים מה-DB למפתחות תרגום
const getUnitKey = (unitType) => {
  switch (unitType) {
    case 'יחידה': return 'unit';
    case 'גרם': return 'g';
    case 'ק"ג': return 'kg';
    case 'מ"ל': return 'ml';
    case 'ליטר': return 'l';
    default: return unitType; // החזר את הערך המקורי אם אין התאמה
  }
};

const ProductCard = ({ product }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const displayName = product.name?.[currentLang] || product.name?.he;
  const displayDescription = product.description?.[currentLang] || product.description?.he;

  // תרגום דינמי של התוויות
  const categoryDisplay = t(`categories.${product.category}`, product.category);
  const kashrutDisplay = t(`kashrut.${product.kashrut}`, product.kashrut);
  
  // ======================= התיקון נמצא כאן =======================
  const unitKey = getUnitKey(product.unitType);
  const translatedUnit = t(`units.${unitKey}`, product.unitType);
  const unitDisplay = product.unitAmount ? `${product.unitAmount} ${translatedUnit}` : translatedUnit;
  // ======================= סוף התיקון =======================
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col">
      <img className="w-full h-56 object-cover" src={product.image || 'https://via.placeholder.com/400x300'} alt={displayName} />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{displayName}</h3>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">
            {categoryDisplay}
          </span>
          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">
            {kashrutDisplay}
          </span>
          <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">
            {unitDisplay}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 flex-grow">{displayDescription}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-2xl font-semibold text-gray-800">₪{product.price}</span>
          <Button size="sm" onClick={() => addToCart(product, isAuthenticated)}>{t('product.addToCart')}</Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;