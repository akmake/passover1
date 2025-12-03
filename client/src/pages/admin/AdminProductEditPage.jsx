// client/src/pages/admin/AdminProductEditPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '@/api';
import { Button } from '@/components/ui/Button';
import { LoaderCircle, ArrowRight, Upload, ImageIcon } from 'lucide-react';
import { Switch } from '@/components/ui/Switch'; // נוסיף ייבוא לרכיב המתג

const AdminProductEditPage = () => {
    const { id: productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [activeLang, setActiveLang] = useState('he');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/api/admin/products/${productId}`, { withCredentials: true });
                const sanitizedProduct = {
                    ...data,
                    name: typeof data.name === 'string' ? { he: data.name, en: '' } : data.name,
                    description: typeof data.description === 'string' ? { he: data.description, en: '' } : (data.description || { he: '', en: '' }),
                };
                setProduct(sanitizedProduct);
            } catch (err) {
                setError('לא ניתן היה לטעון את המוצר.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // פונקציה מיוחדת לעדכון המתג (Switch)
    const handleSwitchChange = (checked) => {
        setProduct(prev => ({ ...prev, isActive: checked }));
    };

    const handleLocalizedChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                [activeLang]: value
            }
        }));
    };

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
            setProduct(prev => ({...prev, image: data.images[0]}));
        } catch (error) {
            alert('העלאת התמונה נכשלה: ' + (error.response?.data?.message || 'שגיאה לא ידועה'));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await api.put(`/api/admin/products/${productId}`, product, { withCredentials: true });
            navigate('/admin/products');
        } catch (err) {
            setError(err.response?.data?.message || 'עדכון המוצר נכשל.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center"><LoaderCircle className="animate-spin h-12 w-12" /></div>;
    if (error || !product) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <div>
            <div className="flex items-center mb-6">
                <Link to="/admin/products" className="p-2 rounded-md hover:bg-gray-100"><ArrowRight className="h-6 w-6" /></Link>
                <h1 className="text-3xl font-bold mr-4">עריכת מוצר: {product.name?.he}</h1>
            </div>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
                <div className="flex border-b mb-4">
                    <button type="button" onClick={() => setActiveLang('he')} className={`px-4 py-2 text-sm font-medium ${activeLang === 'he' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
                        עברית
                    </button>
                    <button type="button" onClick={() => setActiveLang('en')} className={`px-4 py-2 text-sm font-medium ${activeLang === 'en' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
                        English
                    </button>
                </div>

                {/* --- כל השדות, כולל אלו שהחסרתי, נמצאים כאן --- */}
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">תמונת מוצר</label>
                    <div className="flex items-center gap-4">
                        {product.image ? (
                            <img src={product.image} alt={product.name?.he} className="w-32 h-32 object-cover rounded-md bg-gray-100" />
                        ) : (
                            <div className="w-32 h-32 rounded-md bg-gray-100 flex items-center justify-center"><ImageIcon className="text-gray-400 h-12 w-12" /></div>
                        )}
                        <label className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 bg-white border border-gray-300 hover:bg-gray-100 cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            העלה/החלף תמונה
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">שם המוצר</label>
                        <input type="text" name="name" value={product.name?.[activeLang] || ''} onChange={handleLocalizedChange} required className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">מחיר (₪)</label>
                        <input type="number" name="price" id="price" value={product.price} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
                    <textarea name="description" value={product.description?.[activeLang] || ''} onChange={handleLocalizedChange} rows="4" className="w-full p-2 border border-gray-300 rounded-md"></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
                    <select name="category" id="category" value={product.category} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="salad">סלטים</option>
                        <option value="fish">דגים</option>
                        <option value="appetizer">ביניים</option>
                        <option value="soup">מרק</option>
                        <option value="main_course">עיקריות</option>
                        <option value="side_dish">תוספות</option>
                        <option value="dairy">חלבי</option>
                        <option value="dessert">קינוחים ועוגות</option>
                        <option value="drink">שתיה</option>
                        <option value="seder plate">קערת ליל סדר</option>
                    </select>
                    </div>
                    <div><label htmlFor="kashrut" className="block text-sm font-medium text-gray-700 mb-1">כשרות</label><select name="kashrut" id="kashrut" value={product.kashrut} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md"><option value="parve">פרווה</option><option value="dairy">חלבי</option><option value="meat">בשרי</option></select></div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="unitType" className="block text-sm font-medium text-gray-700 mb-1">סוג יחידה</label>
                        <select name="unitType" id="unitType" value={product.unitType} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
                            <option value="יחידה">יחידה</option>
                            <option value="גרם">גרם</option>
                            <option value='ק"ג'>ק"ג</option>
                            <option value='מ"ל'>מ"ל</option>
                            <option value="ליטר">ליטר</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="unitAmount" className="block text-sm font-medium text-gray-700 mb-1">כמות (אופציונלי)</label>
                        <input type="number" name="unitAmount" id="unitAmount" value={product.unitAmount || ''} onChange={handleChange} placeholder="לדוגמה: 250" className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">מק"ט (SKU)</label>
                        <input type="text" name="sku" id="sku" value={product.sku || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="flex items-center pt-6">
                        <Switch id="isActive" checked={product.isActive} onCheckedChange={handleSwitchChange} />
                        <label htmlFor="isActive" className="mr-3 block text-sm font-medium text-gray-900">מוצר פעיל (יוצג בתפריט)</label>
                    </div>
                </div>

                {error && <div className="text-red-500 bg-red-50 p-3 rounded-md text-center text-sm">{error}</div>}
                
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>ביטול</Button>
                    <Button type="submit" disabled={submitting}>
                        {submitting && <LoaderCircle className="animate-spin h-5 w-5 mr-2" />}
                        {submitting ? 'מעדכן...' : 'שמור שינויים'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminProductEditPage;