import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/api';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';

const PackageBuilderPage = () => {
    const { id: packageId } = useParams();
    const navigate = useNavigate();
    const [pkg, setPackage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selections, setSelections] = useState({});
    const addPackageToCart = useCartStore((state) => state.addPackageToCart);

    useEffect(() => {
        const fetchPackage = async () => {
            try {
                // שימוש בנתיב ה-API הציבורי החדש
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
        setSelections(prev => {
            const currentSelections = [...(prev[ruleIndex] || [])];
            const isSelected = currentSelections.includes(optionId);

            if (quantityToChoose === 1) {
                return { ...prev, [ruleIndex]: [optionId] };
            }

            if (isSelected) {
                return { ...prev, [ruleIndex]: currentSelections.filter(id => id !== optionId) };
            } else if (currentSelections.length < quantityToChoose) {
                return { ...prev, [ruleIndex]: [...currentSelections, optionId] };
            }
            return prev; // אם הגענו למכסה, אל תשנה כלום
        });
    };
    
    const handleAddToCart = () => {
        // ולידציה - בדיקה אם כל הבחירות בוצעו
        for (const rule of pkg.choiceRules) {
            const ruleIndex = pkg.choiceRules.indexOf(rule);
            if (selections[ruleIndex].length !== rule.quantityToChoose) {
                alert(`אנא בצע ${rule.quantityToChoose} בחירות עבור קטגוריית "${rule.category}"`);
                return;
            }
        }

        // בניית אובייקט החבילה המלא להוספה לעגלה
        const userChoices = Object.entries(selections).map(([ruleIndex, optionIds]) => {
            const rule = pkg.choiceRules[ruleIndex];
            const options = rule.options.filter(opt => optionIds.includes(opt._id));
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
        navigate('/menu'); // או לעגלה /checkout
    };

    if (loading) return <div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin h-12 w-12 text-blue-600" /></div>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!pkg) return <p className="text-center">החבילה לא נמצאה.</p>;

    return (
        <div>
            <h1 className="text-4xl font-bold mb-2">{pkg.name}</h1>
            <p className="text-xl text-gray-600 mb-6">{pkg.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">פריטים קבועים בחבילה</h2>
                        <ul className="list-disc list-inside space-y-2">
                            {pkg.fixedItems.map(item => (
                                <li key={item.product._id}>{item.quantity} x {item.product.name}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">הבחירות שלך</h2>
                        {pkg.choiceRules.map((rule, index) => {
                            const selectedCount = selections[index]?.length || 0;
                            const isMaxed = selectedCount >= rule.quantityToChoose;
                            return (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg mb-6">
                                <h3 className="text-lg font-medium">יש לבחור {rule.quantityToChoose} מתוך {rule.options.length} ({selectedCount}/{rule.quantityToChoose} נבחרו)</h3>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {rule.options.map(option => {
                                        const isSelected = selections[index]?.includes(option._id);
                                        const isDisabled = !isSelected && isMaxed;
                                        return (
                                            <label key={option._id} className={`flex items-center p-3 border rounded-md cursor-pointer transition-all ${isSelected ? 'bg-blue-100 border-blue-500' : 'bg-white'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}`}>
                                                <input
                                                    type={rule.quantityToChoose === 1 ? 'radio' : 'checkbox'}
                                                    name={`rule-${index}`}
                                                    checked={isSelected}
                                                    disabled={isDisabled}
                                                    onChange={() => handleSelectionChange(index, option._id, rule.quantityToChoose)}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <span className="mr-3 text-sm font-medium text-gray-900">{option.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )})}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow h-fit top-24 sticky">
                     <h2 className="text-2xl font-bold mb-4">מחיר החבילה</h2>
                     <p className="text-4xl font-bold text-gray-800 mb-6">₪{pkg.price.toFixed(2)}</p>
                     <Button className="w-full" onClick={handleAddToCart}>הוסף חבילה לעגלה</Button>
                </div>
            </div>
        </div>
    );
};

export default PackageBuilderPage;