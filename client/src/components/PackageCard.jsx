// client/src/components/PackageCard.jsx

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Box } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 1. ייבוא ה-hook של התרגום

const PackageCard = ({ mealPackage }) => {
  const { i18n } = useTranslation(); // 2. שימוש ב-hook כדי לקבל את השפה הנוכחית
  const currentLang = i18n.language; // 'he' or 'en'

  // 3. בחירה דינמית של הטקסט להצגה
  // אם התרגום בשפה הנוכחית קיים, נשתמש בו. אם לא, נחזור לעברית כברירת מחדל.
  const displayName = mealPackage.name?.[currentLang] || mealPackage.name?.he;
  const displayDescription = mealPackage.description?.[currentLang] || mealPackage.description?.he;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col">
      <div className="w-full h-56 bg-gray-100 flex items-center justify-center">
        {mealPackage.image ? (
            <img src={mealPackage.image} alt={displayName} className="w-full h-full object-cover" />
        ) : (
            <Box className="w-24 h-24 text-gray-300" />
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        {/* 4. שימוש במשתנים החדשים שמכילים את הטקסט המתורגם */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{displayName}</h3>
        <p className="text-gray-600 text-sm mb-4 flex-grow">{displayDescription}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-2xl font-semibold text-gray-800">₪{mealPackage.price}</span>
          <Button asChild size="sm">
            <Link to={`/package/${mealPackage._id}`}>פרטים והרכבה</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;