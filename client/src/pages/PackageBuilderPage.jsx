import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/api';
import { LoaderCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from 'react-i18next';
import { CATEGORY_DETAILS } from '@/config/constants';
import { toAbsoluteUrl } from '@/utils/url';

const PackageBuilderPage = () => {
    const { id: packageId } = useParams();
    const navigate = useNavigate();
    const [pkg, setPackage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selections, setSelections] = useState({});
    const addPackageToCart = useCartStore((state) => state.addPackageToCart);
    
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;

    // --- פונקציית עזר למניעת קריסות (התיקון!) ---
    const getSafeText = (field) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        return field[currentLang] || field.he || '';
    };

    useEffect(() => {
        const fetchPackage = async () => {
            try {
                const { data } = await api.get(`/api/packages/${packageId}`);
                setPackage(data);
                const initialSelections = {};
                data.choiceRules.forEach((_, index) => {
                    initialSelections[index] = [];
                });
                setSelections(initialSelections);
            } catch (err) {
                setError(t('common.errorLoading') || 'שגיאה בטעינת הנתונים');
            } finally {
                setLoading(false);
            }
        };
        fetchPackage();
    }, [packageId, t]);

    const handleSelectionChange = (ruleIndex, optionId, quantityToChoose) => {
        const limit = Number(quantityToChoose);
        setSelections(prev => {
            const currentSelections = [...(prev[ruleIndex] || [])];
            const isSelected = currentSelections.includes(optionId);

            if (limit === 1) {
                return { ...prev, [ruleIndex]: [optionId] };
            }

            if (isSelected) {
                return { ...prev, [ruleIndex]: currentSelections.filter(id => id !== optionId) };
            } else if (currentSelections.length < limit) {
                return { ...prev, [ruleIndex]: [...currentSelections, optionId] };
            }

            return prev;
        });
    };

    const handleAddToCart = () => {
        for (const rule of pkg.choiceRules) {
            const ruleIndex = pkg.choiceRules.indexOf(rule);
            const currentCount = selections[ruleIndex]?.length || 0;
            const requiredCount = Number(rule.quantityToChoose);
            if (currentCount !== requiredCount) {
                alert(t('packageBuilder.alertSelectionMissing', { count: requiredCount, category: rule.category }));
                return;
            }
        }

        const userChoices = Object.entries(selections).map(([ruleIndex, optionIds]) => {
            const rule = pkg.choiceRules[ruleIndex];
            const options = rule.options.filter(opt => optionIds.includes(opt._id.toString()));

            return {
                category: rule.category,
                selectedOptions: options,
            };
        });

        const packageForCart = {
            _id: pkg._id,
            name: pkg.name, 
            price: pkg.price,
            fixedItems: pkg.fixedItems,
            userChoices: userChoices,
        };

        addPackageToCart(packageForCart);
        navigate('/menu');
    };

    const getGroupedOptions = (options) => {
        const grouped = options.reduce((acc, opt) => {
            const cat = opt.category || 'other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(opt);
            return acc;
        }, {});

        const sortedKeys = Object.keys(grouped).sort((a, b) => {
            const orderA = CATEGORY_DETAILS[a]?.order ?? 999;
            const orderB = CATEGORY_DETAILS[b]?.order ?? 999;
            return orderA - orderB;
        });

        return { grouped, sortedKeys };
    };

    if (loading) return <div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin h-12 w-12 text-blue-600" /></div>;
    if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
    if (!pkg) return <p className="text-center mt-10">החבילה לא נמצאה.</p>;

    // שימוש בפונקציה הבטוחה
    const pkgName = getSafeText(pkg.name);
    const pkgDesc = getSafeText(pkg.description);
    const pkgImage = toAbsoluteUrl(pkg.image);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                {pkgImage && (
                    <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden mb-6 shadow-md">
                        <img src={pkgImage} alt={pkgName} className="w-full h-full object-cover" />
                    </div>
                )}
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">{pkgName}</h1>
                <p className="text-lg text-gray-600">{pkgDesc}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">

                    {/* פריטים קבועים */}
                    {pkg.fixedItems && pkg.fixedItems.length > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold border-b pb-3 mb-4 text-gray-800">{t('packageBuilder.fixedItemsTitle')}</h2>
                            <ul className="space-y-3">
                                {pkg.fixedItems.map(item => {
                                    // תיקון קריטי: שימוש ב-getSafeText
                                    const prodName = getSafeText(item.product?.name) || 'מוצר לא נמצא';
                                    
                                    return (
                                        <li key={item._id} className="flex items-center text-gray-700">
                                            <span className="bg-green-100 text-green-700 p-1 rounded-full ml-3 rtl:ml-3 ltr:mr-3">
                                                <Check size={14} />
                                            </span>
                                            <span className="font-medium mx-2">{item.quantity} x</span>
                                            {prodName}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {/* בחירות המשתמש */}
                    <div>
                        <h2 className="text-2xl font-bold pb-2 mb-4 text-gray-800">{t('packageBuilder.composeTitle')}</h2>
                        {pkg.choiceRules.map((rule, index) => {
                            const selectedCount = selections[index]?.length || 0;
                            const limit = Number(rule.quantityToChoose);
                            const isFulfilled = selectedCount === limit;
                            const { grouped, sortedKeys } = getGroupedOptions(rule.options);

                            return (
                                <div key={index} className={`mb-6 p-5 rounded-xl border-2 transition-all ${isFulfilled ? 'border-green-200 bg-green-50/30' : 'border-blue-100 bg-white'}`}>
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-lg font-bold text-gray-800">{rule.category}</h3>
                                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isFulfilled ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {t('packageBuilder.selectedCount', { count: selectedCount, limit: limit })}
                                        </span>
                                    </div>

                                    <div className="space-y-6">
                                        {sortedKeys.map(catKey => (
                                            <div key={catKey}>
                                                {sortedKeys.length > 0 && (
                                                    <h4 className="text-sm font-semibold text-gray-500 mb-3 border-b border-gray-200 pb-1">
                                                        {t(`categories.${catKey}`)}
                                                    </h4>
                                                )}
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {grouped[catKey].map(option => {
                                                        const optionId = option._id.toString();
                                                        const isSelected = selections[index]?.includes(optionId);
                                                        const isMaxed = selectedCount >= limit;
                                                        const isDisabled = !isSelected && isMaxed && limit > 1;
                                                        // תיקון קריטי: שימוש ב-getSafeText
                                                        const optName = getSafeText(option.name);

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
                                                                    className="sr-only"
                                                                />

                                                                <div className={`w-5 h-5 border-2 rounded mx-3 flex items-center justify-center transition-colors ${limit === 1 ? 'rounded-full' : 'rounded'} ${isSelected ? 'border-white bg-white/20' : 'border-gray-300'}`}>
                                                                    {isSelected && <div className={`bg-white ${limit === 1 ? 'rounded-full w-2.5 h-2.5' : 'w-3 h-3 rounded-sm'}`} />}
                                                                </div>
                                                                <span className="font-medium">{optName}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-4">{t('packageBuilder.summaryTitle')}</h2>
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-600 font-medium">{t('packageBuilder.totalPrice')}</span>
                            <span className="text-4xl font-extrabold text-blue-600">₪{pkg.price.toFixed(2)}</span>
                        </div>
                        <Button className="w-full h-12 text-lg shadow-blue-200 shadow-lg hover:shadow-blue-300 transition-all" onClick={handleAddToCart}>
                            {t('packageBuilder.addToCart')}
                        </Button>
                        <p className="text-xs text-center text-gray-400 mt-4">
                            {t('packageBuilder.warningSelectAll')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackageBuilderPage;