// client/src/pages/admin/AdminProductCreatePage.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/api';
import { Button } from '@/components/ui/Button';
import { LoaderCircle, ArrowRight, Upload, ImageIcon } from 'lucide-react';

const AdminProductCreatePage = () => {
    // 1. עדכנו את המצב ההתחלתי כך שיכיל את מבנה השפות וגם את כל שאר השדות
    const [product, setProduct] = useState({
      name: { he: '', en: '' },
      description: { he: '', en: '' },
      price: '',
      image: '',
      category: 'main_course',
      kashrut: 'parve',
      unitType: 'יחידה',
      unitAmount: '',
      sku: '',
      isActive: true,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [activeLang, setActiveLang] = useState('he');

    // פונקציה זו מטפלת בשדות רגילים שאינם דורשים תרגום (מחיר, קטגוריה וכו')
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setProduct(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    };

    // פונקציה זו מטפלת רק בשדות שדורשים תרגום (שם ותיאור)
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

    // לוגיקת העלאת תמונה - נשארה ללא שינוי
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

    // לוגיקת שליחת הטופס - נשארה ללא שינוי
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      try {
        await api.post('/api/admin/products', product, { withCredentials: true });
        navigate('/admin/products');
      } catch (err) {
        setError(err.response?.data?.message || 'יצירת המוצר נכשלה. אנא בדוק את הנתונים ונסה שוב.');
        console.error('Failed to create product', err);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div>
        <div className="flex items-center mb-6">
          <Link to="/admin/products" className="p-2 rounded-md hover:bg-gray-100"><ArrowRight className="h-6 w-6" /></Link>
          <h1 className="text-3xl font-bold mr-4">הוספת מוצר חדש</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
          
          {/* לשוניות לבחירת שפה */}
          <div className="flex border-b">
              <button type="button" onClick={() => setActiveLang('he')} className={`px-4 py-2 text-sm font-medium ${activeLang === 'he' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
                  עברית
              </button>
              <button type="button" onClick={() => setActiveLang('en')} className={`px-4 py-2 text-sm font-medium ${activeLang === 'en' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
                  English
              </button>
          </div>

          {/* ##### כל השדות הישנים נשמרו כאן ##### */}

          {/* העלאת תמונה */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">תמונת מוצר</label>
            <div className="flex items-center gap-4">
              {product.image ? (
                <img src={product.image} alt="תצוגה מקדימה" className="w-32 h-32 object-cover rounded-md bg-gray-100" />
              ) : (
                <div className="w-32 h-32 rounded-md bg-gray-100 flex items-center justify-center"><ImageIcon className="text-gray-400 h-12 w-12" /></div>
              )}
              <label className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 bg-white border border-gray-300 hover:bg-gray-100 cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                העלה תמונה
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
          
          {/* שם (דו-לשוני) ומחיר (רגיל) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">שם המוצר</label>
                <input 
                    type="text" 
                    name="name" 
                    value={product.name[activeLang]} 
                    onChange={handleLocalizedChange} 
                    required 
                    className="w-full p-2 border border-gray-300 rounded-md" 
                />
            </div>
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">מחיר (₪)</label>
                <input type="number" name="price" id="price" value={product.price} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
          </div>
          
          {/* תיאור (דו-לשוני) */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
            <textarea 
                name="description" 
                value={product.description[activeLang]} 
                onChange={handleLocalizedChange} 
                rows="4" 
                className="w-full p-2 border border-gray-300 rounded-md"
            ></textarea>
          </div>

          {/* קטגוריה וכשרות */}
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
          <div><label htmlFor="kashrut" className="block text-sm font-medium text-gray-700 mb-1">כשרות</label><select name="kashrut" id="kashrut" value={product.kashrut} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md"><option value="parve">פרווה</option><option value="dairy">חלבי</option><option value="meat">בשרי</option></select></div></div>

          {/* יחידת מידה וכמות */}
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
              <input type="number" name="unitAmount" id="unitAmount" value={product.unitAmount} onChange={handleChange} placeholder="לדוגמה: 250" className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
          </div>

          {/* מק"ט ופעיל/לא פעיל */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div><label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">מק"ט (SKU)</label><input type="text" name="sku" id="sku" value={product.sku} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" /></div>
            <div className="flex items-center pt-6"><input type="checkbox" name="isActive" id="isActive" checked={product.isActive} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">מוצר פעיל (יוצג בתפריט)</label></div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>ביטול</Button>
              <Button type="submit" disabled={loading}>
                  {loading ? <LoaderCircle className="animate-spin h-5 w-5 mr-2" /> : null}
                  {loading ? 'שומר...' : 'שמור מוצר'}
              </Button>
          </div>
        </form>
      </div>
    );
};

export default AdminProductCreatePage;