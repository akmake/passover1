import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '@/api';
import { Button } from '@/components/ui/Button';
import { LoaderCircle, ArrowRight, Plus, Trash2, Search, Check, Upload, ImageIcon } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import Modal from '@/components/ui/Modal';

// מילון קטגוריות לעברית
const CATEGORY_LABELS = {
    'salad': 'סלטים',
    'fish': 'דגים',
    'appetizer': 'מנות ביניים',
    'soup': 'מרקים',
    'main_course': 'מנות עיקריות',
    'side_dish': 'תוספות',
    'dairy': 'חלבי',
    'dessert': 'קינוחים',
    'drink': 'שתייה',
    'seder_plate': 'קערת ליל הסדר'
};

const AdminPackageEditPage = () => {
    const { id: packageId } = useParams();
    const navigate = useNavigate();

    // State
    const [name, setName] = useState({ he: '', en: '' });
    const [description, setDescription] = useState({ he: '', en: '' });
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [fixedItems, setFixedItems] = useState([]);
    const [choiceRules, setChoiceRules] = useState([]);

    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [activeLang, setActiveLang] = useState('he');

    // Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productSearch, setProductSearch] = useState('');

    // --- התיקון "אחת ולתמיד": פונקציית חילוץ שם בטוחה ---
    const getProductName = (product) => {
        if (!product) return 'מוצר לא נמצא';
        
        const val = product.name;

        // 1. אם השם הוא מחרוזת רגילה
        if (typeof val === 'string') return val;

        // 2. אם השם הוא אובייקט (גם אם יש לו _id בטעות)
        if (val && typeof val === 'object') {
            // שולפים את הטקסט לפי השפה, או עברית, או אנגלית, או מחרוזת ריקה
            const text = val[activeLang] || val.he || val.en || '';
            return String(text); // המרה מפורשת ל-String מונעת את הקריסה
        }

        return 'שם לא תקין';
    };

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, packageRes] = await Promise.all([
                    api.get('/api/admin/products', { withCredentials: true }),
                    api.get(`/api/admin/packages/${packageId}`, { withCredentials: true })
                ]);

                setAllProducts(productsRes.data);
                const pkg = packageRes.data;

                // נרמול נתונים - שימוש בבדיקות בטיחות
                setName(pkg.name && typeof pkg.name === 'object' ? pkg.name : { he: pkg.name, en: '' });
                setDescription(pkg.description && typeof pkg.description === 'object' ? pkg.description : { he: pkg.description || '', en: '' });
                setPrice(pkg.price);
                setIsActive(pkg.isActive);
                setImage(pkg.image || '');

                if (pkg.fixedItems) {
                    setFixedItems(pkg.fixedItems.map(item => ({
                        product: item.product._id || item.product,
                        quantity: item.quantity,
                        _productDetails: item.product // שומרים את פרטי המוצר המלאים
                    })));
                }

                if (pkg.choiceRules) {
                    setChoiceRules(pkg.choiceRules.map(rule => ({
                        ...rule,
                        options: rule.options.map(opt => opt._id || opt)
                    })));
                }

            } catch (err) {
                setError('לא ניתן לטעון את נתוני החבילה');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [packageId]);

    // --- Helpers for Grouping ---
    const productsByCategory = useMemo(() => {
        const groups = {};
        allProducts.forEach(p => {
            const cat = p.category || 'other';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(p);
        });
        return groups;
    }, [allProducts]);

    const categoriesList = useMemo(() => {
        return Object.keys(productsByCategory).sort((a, b) => {
            return (CATEGORY_LABELS[a] || a).localeCompare(CATEGORY_LABELS[b] || b, 'he');
        });
    }, [productsByCategory]);

    // --- Image Upload ---
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const uploadFormData = new FormData();
        uploadFormData.append('images', file);
        try {
            const { data } = await api.post('/api/upload', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            setImage(data.images[0]);
        } catch (error) {
            alert('העלאת התמונה נכשלה');
        }
    };

    // --- Fixed Items Logic ---
    const handleAddFixedItem = (product) => {
        const exists = fixedItems.find(item => item.product === product._id);
        if (exists) {
            setFixedItems(prev => prev.map(item => item.product === product._id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setFixedItems([...fixedItems, { product: product._id, quantity: 1, _productDetails: product }]);
        }
        setIsProductModalOpen(false);
    };

    const removeFixedItem = (index) => setFixedItems(fixedItems.filter((_, i) => i !== index));
    const updateFixedItemQty = (index, newQty) => {
        const updated = [...fixedItems];
        updated[index].quantity = Number(newQty);
        setFixedItems(updated);
    };

    // --- Choice Rules Logic ---
    const addChoiceRule = () => setChoiceRules([...choiceRules, { category: 'קטגוריה חדשה', quantityToChoose: 1, options: [] }]);
    const removeChoiceRule = (index) => setChoiceRules(choiceRules.filter((_, i) => i !== index));
    const updateChoiceRule = (index, field, value) => {
        const updated = [...choiceRules];
        updated[index][field] = value;
        setChoiceRules(updated);
    };

    const toggleProductInRule = (ruleIndex, productId) => {
        const updatedRules = [...choiceRules];
        const currentOptions = updatedRules[ruleIndex].options;
        if (currentOptions.includes(productId)) {
            updatedRules[ruleIndex].options = currentOptions.filter(id => id !== productId);
        } else {
            updatedRules[ruleIndex].options = [...currentOptions, productId];
        }
        setChoiceRules(updatedRules);
    };

    const toggleCategoryInRule = (ruleIndex, categoryKey) => {
        const productsInCat = productsByCategory[categoryKey] || [];
        const idsInCat = productsInCat.map(p => p._id);
        const updatedRules = [...choiceRules];
        const currentOptions = updatedRules[ruleIndex].options;
        const allSelected = idsInCat.every(id => currentOptions.includes(id));

        if (allSelected) {
            updatedRules[ruleIndex].options = currentOptions.filter(id => !idsInCat.includes(id));
        } else {
            const newOptions = new Set([...currentOptions, ...idsInCat]);
            updatedRules[ruleIndex].options = Array.from(newOptions);
        }
        setChoiceRules(updatedRules);
    };

    // --- Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const validFixedItems = fixedItems.filter(item => item.product);
            const sanitizedRules = choiceRules.map(rule => ({
                ...rule,
                quantityToChoose: Number(rule.quantityToChoose)
            }));

            const packageData = {
                name,
                price: Number(price),
                description,
                image,
                isActive,
                fixedItems: validFixedItems,
                choiceRules: sanitizedRules
            };

            await api.put(`/api/admin/packages/${packageId}`, packageData, { withCredentials: true });
            navigate('/admin/packages');
        } catch (err) {
            setError(err.response?.data?.message || "עדכון החבילה נכשל");
        } finally {
            setSubmitting(false);
        }
    };

    const handleNameChange = (val) => setName(prev => ({ ...prev, [activeLang]: val }));
    const handleDescChange = (val) => setDescription(prev => ({ ...prev, [activeLang]: val }));

    if (loading) return <div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin text-blue-600 h-12 w-12" /></div>;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center mb-6 gap-4">
                <Link to="/admin/packages" className="p-2 rounded-full hover:bg-gray-100 transition"><ArrowRight className="h-6 w-6 text-gray-600"/></Link>
                <h1 className="text-3xl font-bold text-gray-800">עריכת חבילה</h1>
            </div>

            {/* Language Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button type="button" onClick={() => setActiveLang('he')} className={`px-6 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeLang === 'he' ? 'bg-white border border-b-0 border-gray-200 text-blue-600 shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>עברית</button>
                <button type="button" onClick={() => setActiveLang('en')} className={`px-6 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeLang === 'en' ? 'bg-white border border-b-0 border-gray-200 text-blue-600 shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>English</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* 1. Basic Info & Image */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                        פרטי החבילה
                    </h2>

                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">תמונת חבילה</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center h-48 bg-gray-50 hover:bg-gray-100 transition relative overflow-hidden">
                                {image ? (
                                    <img src={image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <div className="text-gray-400 flex flex-col items-center">
                                        <ImageIcon className="h-10 w-10 mb-2" />
                                        <span className="text-xs">לחץ להעלאה</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                            {image && <Button type="button" variant="ghost" size="sm" onClick={() => setImage('')} className="w-full mt-2 text-red-500">הסר תמונה</Button>}
                        </div>

                        <div className="w-full md:w-2/3 grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">שם החבילה ({activeLang === 'he' ? 'עברית' : 'אנגלית'})</label>
                                <input type="text" value={name[activeLang]} onChange={(e) => handleNameChange(e.target.value)} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">תיאור ({activeLang === 'he' ? 'עברית' : 'אנגלית'})</label>
                                <textarea value={description[activeLang]} onChange={(e) => handleDescChange(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">מחיר כולל (₪)</label>
                                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>

                            <div className="flex items-center gap-3">
                                <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">החבילה פעילה</label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Fixed Items */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                            פריטים קבועים
                        </h2>
                        <Button type="button" onClick={() => setIsProductModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white gap-2 rounded-full px-6">
                            <Plus size={18} /> הוסף מוצר
                        </Button>
                    </div>

                    {fixedItems.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-gray-400">
                            לא נבחרו פריטים קבועים עדיין.
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {fixedItems.map((item, index) => {
                                // שימוש בפונקציה הבטוחה
                                let prodName = 'טוען...';
                                if (item._productDetails) {
                                    prodName = getProductName(item._productDetails);
                                } else {
                                    const p = allProducts.find(p => p._id === item.product);
                                    if (p) prodName = getProductName(p);
                                }

                                return (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg group hover:border-blue-300 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-gray-500 border border-gray-200">{index + 1}</div>
                                            {/* עטיפה נוספת ב-String ליתר ביטחון */}
                                            <span className="font-medium text-gray-800">{String(prodName)}</span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-gray-200">
                                                <span className="text-xs text-gray-500">כמות:</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateFixedItemQty(index, e.target.value)}
                                                    className="w-12 text-center outline-none font-bold"
                                                />
                                            </div>
                                            <button type="button" onClick={() => removeFixedItem(index)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* 3. Choice Rules */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                            חוקי בחירה
                        </h2>
                        <Button type="button" onClick={addChoiceRule} className="bg-purple-600 hover:bg-purple-700 text-white gap-2 rounded-full px-6">
                            <Plus size={18} /> הוסף קטגוריית בחירה
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {choiceRules.map((rule, ruleIndex) => (
                            <div key={ruleIndex} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                {/* Rule Header */}
                                <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
                                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">כותרת הקטגוריה</label>
                                            <input
                                                type="text"
                                                value={rule.category}
                                                onChange={(e) => updateChoiceRule(ruleIndex, 'category', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded bg-white focus:border-purple-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">כמות לבחירה</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={rule.quantityToChoose}
                                                onChange={(e) => updateChoiceRule(ruleIndex, 'quantityToChoose', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded bg-white focus:border-purple-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeChoiceRule(ruleIndex)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition flex items-center gap-1 text-sm font-medium">
                                        <Trash2 size={16} /> הסר חוק
                                    </button>
                                </div>

                                {/* Product Selection Area */}
                                <div className="p-4 bg-white">
                                    <p className="text-sm font-medium text-gray-700 mb-3">סמן את המוצרים שהלקוח יכול לבחור בקטגוריה זו:</p>

                                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                        {categoriesList.map(catKey => {
                                            const productsInThisCat = productsByCategory[catKey];
                                            if (!productsInThisCat) return null;

                                            const allSelected = productsInThisCat.every(p => rule.options.includes(p._id));

                                            return (
                                                <div key={catKey} className="border border-gray-100 rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-50">
                                                        <h4 className="font-bold text-gray-700">{CATEGORY_LABELS[catKey] || catKey}</h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCategoryInRule(ruleIndex, catKey)}
                                                            className={`text-xs font-medium px-2 py-1 rounded transition-colors ${allSelected ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                                        >
                                                            {allSelected ? 'הסר הכל' : 'בחר הכל בקטגוריה'}
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                        {productsInThisCat.map(product => {
                                                            const isSelected = rule.options.includes(product._id);
                                                            // שימוש בפונקציה הבטוחה
                                                            const prodName = getProductName(product);

                                                            return (
                                                                <label
                                                                    key={product._id}
                                                                    className={`flex items-center p-2 rounded cursor-pointer transition-all border ${isSelected ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}`}
                                                                >
                                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2 transition-colors ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white'}`}>
                                                                        {isSelected && <Check size={10} className="text-white" />}
                                                                    </div>
                                                                    <input
                                                                        type="checkbox"
                                                                        className="hidden"
                                                                        checked={isSelected}
                                                                        onChange={() => toggleProductInRule(ruleIndex, product._id)}
                                                                    />
                                                                    {/* עטיפה קריטית ב-String */}
                                                                    <span className="text-sm truncate select-none" title={String(prodName)}>
                                                                        {String(prodName)}
                                                                    </span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/packages')}>ביטול</Button>
                    <Button type="submit" disabled={submitting} className="px-8 text-lg">{submitting ? <LoaderCircle className="animate-spin" /> : 'שמור שינויים'}</Button>
                </div>
            </form>

            {/* --- Modal for Selecting Fixed Items --- */}
            <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="בחר מוצר להוספה">
                <div className="mb-4 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="חפש מוצר..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="max-h-[60vh] overflow-y-auto space-y-6">
                    {categoriesList.map(catKey => {
                        const filteredProducts = (productsByCategory[catKey] || []).filter(p => {
                            const name = getProductName(p);
                            return name.toLowerCase().includes(productSearch.toLowerCase());
                        });
                        if (filteredProducts.length === 0) return null;

                        return (
                            <div key={catKey}>
                                <h3 className="font-bold text-gray-800 bg-gray-100 p-2 rounded mb-2 sticky top-0">{CATEGORY_LABELS[catKey] || catKey}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {filteredProducts.map(product => (
                                        <button
                                            key={product._id}
                                            onClick={() => handleAddFixedItem(product)}
                                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition text-right group"
                                        >
                                            <span className="font-medium text-gray-700 group-hover:text-blue-600">{String(getProductName(product))}</span>
                                            <span className="text-sm text-gray-400">₪{product.price}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Modal>
        </div>
    );
};

export default AdminPackageEditPage;