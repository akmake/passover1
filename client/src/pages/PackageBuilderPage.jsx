// client/src/pages/PackageBuilderPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/api';
import { LoaderCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from 'react-i18next';

const PackageBuilderPage = () => {
    const { id: packageId } = useParams();
    const navigate = useNavigate();
    const [pkg, setPackage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selections, setSelections] = useState({});
    const addPackageToCart = useCartStore((state) => state.addPackageToCart);
    
    // תרגום
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    useEffect(() => {
        const fetchPackage = async () => {
            try {
                const { data } = await api.get(`/api/packages/${packageId}`);
                setPackage(data);
                // אתחול אובייקט הבחירות
                const initialSelections = {};
                data.choiceRules.forEach((_, index) => {
                    initialSelections[index] = [];
                });
                setSelections(initialSelections);
            } catch (err) {
                setError('לא ניתן היה לטעון את פרטי החבילה.');
            } finally {
                setLoading(false);
            }
        };
        fetchPackage();
    }, [packageId]);

    const handleSelectionChange = (ruleIndex, optionId, quantityToChoose) => {
        // המרה למספר כדי למנוע באגים של טיפוסים
        const limit = Number(quantityToChoose);
        
        setSelections(prev => {
            const currentSelections = [...(prev[ruleIndex] || [])];
            const isSelected = currentSelections.includes(optionId);

            // אם הבחירה היא פריט בודד (רדיו)
            if (limit === 1) {
                return { ...prev, [ruleIndex]: [optionId] };
            }

            // אם זה צ'קבוקס (מרובה)
            if (isSelected) {
                // הסרה אם כבר נבחר
                return { ...prev, [ruleIndex]: currentSelections.filter(id => id !== optionId) };
            } else if (currentSelections.length < limit) {
                // הוספה אם טרם הגענו למגבלה
                return { ...prev, [ruleIndex]: [...currentSelections, optionId] };
            }
            
            // אם הגענו למכסה, לא עושים כלום
            return prev; 
        });
    };

    const handleAddToCart = () => {
        // ולידציה - בדיקה אם כל הבחירות בוצעו
        for (const rule of pkg.choiceRules) {
            const ruleIndex = pkg.choiceRules.indexOf(rule);
            const currentCount = selections[ruleIndex]?.length || 0;
            const requiredCount = Number(rule.quantityToChoose);

            if (currentCount !== requiredCount) {
                alert(`אנא בחר בדיוק ${requiredCount} פריטים מקטגוריית "${rule.category}"`);
                return;
            }
        }

        // בניית אובייקט החבילה המלא להוספה לעגלה
        const userChoices = Object.entries(selections).map(([ruleIndex, optionIds]) => {
            const rule = pkg.choiceRules[ruleIndex];
            
            // תיקון קריטי: השוואה בטוחה בין מחרוזות (ID)
            const options = rule.options.filter(opt => optionIds.includes(opt._id.toString()));
            
            return {
                category: rule.category,
                selectedOptions: options,
            };
        });

        const packageForCart = {
            _id: pkg._id,
            name: pkg.name, // מגיע כבר מתורגם מהשרת (מהתיקון בקונטרולר)
            price: pkg.price,
            fixedItems: pkg.fixedItems,
            userChoices: userChoices,
        };

        addPackageToCart(packageForCart);
        navigate('/menu');
    };

    if (loading) return <div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin h-12 w-12 text-blue-600" /></div>;
    if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
    if (!pkg) return <p className="text-center mt-10">החבילה לא נמצאה.</p>;

    // שם ותיאור (במידה והם אובייקטים, בוחרים שפה, אחרת מציגים כטקסט)
    const pkgName = pkg.name?.[currentLang] || pkg.name?.he || pkg.name;
    const pkgDesc = pkg.description?.[currentLang] || pkg.description?.he || pkg.description;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">{pkgName}</h1>
            <p className="text-lg text-gray-600 mb-8">{pkgDesc}</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* פריטים קבועים */}
                    {pkg.fixedItems && pkg.fixedItems.length > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold border-b pb-3 mb-4 text-gray-800">החבילה כוללת (קבוע):</h2>
                            <ul className="space-y-3">
                                {pkg.fixedItems.map(item => {
                                    const prodName = item.product?.name?.[currentLang] || item.product?.name?.he || item.product?.name;
                                    return (
                                        <li key={item._id} className="flex items-center text-gray-700">
                                            <span className="bg-green-100 text-green-700 p-1 rounded-full ml-3">
                                                <Check size={14} />
                                            </span>
                                            <span className="font-medium ml-2">{item.quantity} x</span> 
                                            {prodName}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {/* בחירות המשתמש */}
                    <div>
                        <h2 className="text-2xl font-bold pb-2 mb-4 text-gray-800">הרכב את החבילה שלך:</h2>
                        {pkg.choiceRules.map((rule, index) => {
                            const selectedCount = selections[index]?.length || 0;
                            const limit = Number(rule.quantityToChoose);
                            const isMaxed = selectedCount >= limit;
                            const isFulfilled = selectedCount === limit;

                            return (
                                <div key={index} className={`mb-6 p-5 rounded-xl border-2 transition-all ${isFulfilled ? 'border-green-200 bg-green-50/30' : 'border-blue-100 bg-white'}`}>
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-lg font-bold text-gray-800">{rule.category}</h3>
                                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isFulfilled ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            נבחרו {selectedCount} מתוך {limit}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {rule.options.map(option => {
                                            const optionId = option._id.toString();
                                            const isSelected = selections[index]?.includes(optionId);
                                            // מבטל את האפשרות אם לא נבחרה וגם הגענו למקסימום
                                            const isDisabled = !isSelected && isMaxed && limit > 1; 
                                            const optName = option.name?.[currentLang] || option.name?.he || option.name;

                                            return (
                                                <label 
                                                    key={optionId} 
                                                    className={`
                                                        relative flex items-center p-3 border rounded-lg cursor-pointer transition-all select-none
                                                        ${isSelected 
                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                                                            : 'bg-white border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-gray-50'}
                                                        ${isDisabled ? 'opacity-40 cursor-not-allowed grayscale' : ''}
                                                    `}
                                                >
                                                    <input
                                                        type={limit === 1 ? 'radio' : 'checkbox'}
                                                        name={`rule-${index}`}
                                                        checked={isSelected}
                                                        disabled={isDisabled}
                                                        onChange={() => handleSelectionChange(index, optionId, limit)}
                                                        className="sr-only" // הסתרת האינפוט המקורי לעיצוב נקי
                                                    />
                                                    <div className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center transition-colors ${limit === 1 ? 'rounded-full' : 'rounded'} ${isSelected ? 'border-white bg-white/20' : 'border-gray-300'}`}>
                                                        {isSelected && <div className={`bg-white ${limit === 1 ? 'rounded-full w-2.5 h-2.5' : 'w-3 h-3 rounded-sm'}`} />}
                                                    </div>
                                                    <span className="font-medium mr-2">{optName}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* סיכום צד (סטיקי) */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-4">סיכום חבילה</h2>
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-600 font-medium">מחיר כולל:</span>
                            <span className="text-4xl font-extrabold text-blue-600">₪{pkg.price.toFixed(2)}</span>
                        </div>
                        <Button className="w-full h-12 text-lg shadow-blue-200 shadow-lg hover:shadow-blue-300 transition-all" onClick={handleAddToCart}>
                            הוסף חבילה לעגלה
                        </Button>
                        <p className="text-xs text-center text-gray-400 mt-4">
                            ודא שסיימת לבחור את כל הפריטים לפני ההוספה.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackageBuilderPage;