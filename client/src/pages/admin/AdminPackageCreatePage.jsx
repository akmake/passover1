import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/api';
import { Button } from '@/components/ui/Button';
import { LoaderCircle, ArrowRight, PlusCircle, XCircle } from 'lucide-react';

const AdminPackageCreatePage = () => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [fixedItems, setFixedItems] = useState([]);
    const [choiceRules, setChoiceRules] = useState([]);

    const [allProducts, setAllProducts] = useState([]);
    const [productCategories, setProductCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await api.get('/api/admin/products', { withCredentials: true });
            setAllProducts(data);
            // חילוץ דינמי של הקטגוריות הקיימות
            const categories = [...new Set(data.map(p => p.category))];
            setProductCategories(categories);
        };
        fetchProducts();
    }, []);
    // --- לוגיקה לניהול פריטים קבועים ---
    const addFixedItem = () => setFixedItems([...fixedItems, { product: '', quantity: 1 }]);
    const removeFixedItem = (index) => setFixedItems(fixedItems.filter((_, i) => i !== index));
    const handleFixedItemChange = (index, field, value) => {
        const updated = [...fixedItems];
        updated[index][field] = value;
        setFixedItems(updated);
    };

    // --- לוגיקה משודרגת לניהול חוקי בחירה ---
    const addChoiceRule = () => setChoiceRules([...choiceRules, { category: '', quantityToChoose: 1, options: [] }]);
    const removeChoiceRule = (index) => setChoiceRules(choiceRules.filter((_, i) => i !== index));
    const handleChoiceRuleChange = (index, field, value) => {
        const updated = [...choiceRules];
        updated[index][field] = value;
        setChoiceRules(updated);
    };

    const handleOptionToggle = (ruleIndex, optionId) => {
        const updatedRules = [...choiceRules];
        const currentOptions = new Set(updatedRules[ruleIndex].options);
        if (currentOptions.has(optionId)) {
            currentOptions.delete(optionId);
        } else {
            currentOptions.add(optionId);
        }
        updatedRules[ruleIndex].options = Array.from(currentOptions);
        setChoiceRules(updatedRules);
    };

    const handleSelectCategory = (ruleIndex, category) => {
        const productIdsInCategory = allProducts.filter(p => p.category === category).map(p => p._id);
        const updatedRules = [...choiceRules];
        const currentOptions = new Set(updatedRules[ruleIndex].options);
        productIdsInCategory.forEach(id => currentOptions.add(id));
        // הוספה, לא החלפה
        updatedRules[ruleIndex].options = Array.from(currentOptions);
        setChoiceRules(updatedRules);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const validFixedItems = fixedItems.filter(item => item.product);
            await api.post('/api/admin/packages', { name, price, description, isActive, fixedItems: validFixedItems, choiceRules }, { withCredentials: true });
            navigate('/admin/packages');
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create package");
            console.error("Failed to create package", error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            <div className="flex items-center mb-6"><Link to="/admin/packages"><ArrowRight/></Link><h1 className="text-3xl font-bold mr-4">הוספת חבילה חדשה</h1></div>
            <form onSubmit={handleSubmit} className="space-y-8">


                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">פרטים בסיסיים</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div>
                            <label>שם החבילה</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label>מחיר (₪)</label>
                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full mt-1 p-2 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">פריטים קבועים</h2>
                        <Button type="button" variant="ghost" onClick={addFixedItem}><PlusCircle className="mr-2"/>הוסף פריט קבוע</Button>
                    </div>
                    <div className="space-y-4">
                        {fixedItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <select value={item.product} onChange={(e) => handleFixedItemChange(index, 'product', e.target.value)} className="flex-grow p-2 border rounded-md">
                                    <option value="">בחר מוצר...</option>
                                    {allProducts.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                                <input type="number" value={item.quantity} onChange={(e) => handleFixedItemChange(index, 'quantity', e.target.value)} min="1" className="w-20 p-2 border rounded-md" />
                                <Button type="button" variant="destructive" size="sm" onClick={() => removeFixedItem(index)}><XCircle/></Button>
                            </div>
                        ))}
                    </div>
                </div>


                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">חוקי בחירה</h2>
                        <Button type="button" variant="ghost" onClick={addChoiceRule}><PlusCircle className="mr-2"/>הוסף חוק בחירה</Button>
                    </div>
                    <div className="space-y-6">
                        {choiceRules.map((rule, index) => (
                            <div key={index} className="border p-4 rounded-lg bg-gray-50">
                                <div className="flex justify-end mb-2">
                                    <Button type="button" variant="destructive" size="sm" onClick={() => removeChoiceRule(index)}>הסר חוק</Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input type="text" placeholder="שם הקטגוריה (לדוג': מנה עיקרית)" value={rule.category} onChange={(e) => handleChoiceRuleChange(index, 'category', e.target.value)} className="p-2 border rounded-md" />
                                    <input type="number" placeholder="כמות לבחירה" value={rule.quantityToChoose} onChange={(e) => handleChoiceRuleChange(index, 'quantityToChoose', e.target.value)} min="1" className="p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">מוצרים אפשריים לבחירה:</label>

                                    {/* --- שיפור: כפתורים לבחירה מהירה --- */}
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {productCategories.map(cat => (
                                            <Button type="button" variant="outline" size="sm" key={cat} onClick={() => handleSelectCategory(index, cat)}>
                                                הוסף הכל מ"{cat}"
                                            </Button>
                                        ))}
                                    </div>

                                    {/* --- שיפור: רשימת Checkboxes --- */}
                                    <div className="w-full h-48 p-2 border rounded-md overflow-y-auto bg-white">
                                        {allProducts.map(p => (
                                            <label key={p._id} className="flex items-center p-1 hover:bg-gray-100 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={rule.options.includes(p._id)}
                                                    onChange={() => handleOptionToggle(index, p._id)}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="mr-2 text-sm">{p.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/packages')}>ביטול</Button>
                    <Button type="submit" disabled={loading}>{loading ?
                        'שומר...' : 'שמור חבילה'}</Button>
                </div>
            </form>
        </div>
    );
};

export default AdminPackageCreatePage;