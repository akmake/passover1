import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api'; // וודא שהנתיב ל-api נכון אצלך
import { 
  Loader2, Plus, Search, Edit, Trash2, Eye, EyeOff, Package 
} from 'lucide-react';

const AdminProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/admin/products', { withCredentials: true });
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק מוצר זה? הפעולה אינה הפיכה.')) {
      try {
        await api.delete(`/api/products/${productId}`, { withCredentials: true }); // שים לב לנתיב
        setProducts(products.filter((p) => p._id !== productId));
      } catch (error) {
        console.error('Failed to delete product', error);
        alert('מחיקת המוצר נכשלה.');
      }
    }
  };

  // פונקציה לשינוי סטטוס פעיל/לא פעיל ישירות מהרשימה
  const handleToggleActive = async (product) => {
    try {
        // עדכון אופטימי (מציג למשתמש מיד)
        const newStatus = !product.isActive;
        setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isActive: newStatus } : p));

        // שליחה לשרת
        await api.put(`/api/products/${product._id}`, { isActive: newStatus });
    } catch (error) {
        alert('שגיאה בעדכון סטטוס');
        fetchProducts(); // שחזור במקרה של שגיאה
    }
  };

  // --- פונקציות עזר למניעת קריסות ---
  
  // חילוץ שם בטוח
  const getName = (product) => {
    if (!product.name) return 'ללא שם';
    if (typeof product.name === 'string') return product.name;
    return product.name.he || product.name.en || 'ללא שם';
  };

  // חילוץ שם קטגוריה בטוח
  const getCategoryName = (category) => {
    if (!category) return 'ללא קטגוריה';
    // אם זה אובייקט עם שם
    if (typeof category === 'object') {
        return category.name?.he || category.name?.en || 'קטגוריה';
    }
    // אם זה רק ID או מחרוזת
    return 'קטגוריה כללית'; 
  };

  // סינון לפי חיפוש
  const filteredProducts = products.filter(p => 
    getName(p).toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-12 w-12 text-[#D4AF37]" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] p-6 md:p-12 font-sans text-slate-800" dir="rtl">
      
      {/* כותרת וכפתור הוספה */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">ניהול מוצרים</h1>
            <p className="text-gray-500 mt-1">{products.length} מוצרים בקטלוג</p>
        </div>
        
        <Link 
            to="/admin/products/new" 
            className="flex items-center gap-2 bg-[#1A1A1A] text-[#D4AF37] px-6 py-3 rounded-xl font-bold hover:bg-black hover:shadow-lg transition-all"
        >
            <Plus size={20} /> הוסף מוצר חדש
        </Link>
      </div>

      {/* תיבת חיפוש */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="relative">
            <Search className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="חפש לפי שם או מקט..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-4 pr-12 rounded-xl border border-gray-200 focus:border-[#D4AF37] outline-none shadow-sm"
            />
        </div>
      </div>

      {/* טבלה */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">תמונה</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">שם ומק"ט</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">קטגוריה</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">מחיר</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">סטטוס (לחץ לשינוי)</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">פעולות</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    
                    {/* תמונה */}
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                            {product.image ? (
                                <img src={product.image} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <Package className="h-full w-full p-2 text-gray-300" />
                            )}
                        </div>
                    </td>
                    
                    {/* שם ומק"ט */}
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{getName(product)}</div>
                        <div className="text-xs text-gray-400 font-mono">{product.sku || '---'}</div>
                    </td>

                    {/* קטגוריה */}
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-800 border border-blue-100">
                        {getCategoryName(product.category)}
                        </span>
                    </td>

                    {/* מחיר */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₪{product.price?.toLocaleString()}
                    </td>

                    {/* סטטוס פעיל (כפתור) */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button 
                            onClick={() => handleToggleActive(product)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                product.isActive ? 'bg-[#D4AF37]' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    product.isActive ? 'translate-x-1' : 'translate-x-6'
                                }`}
                            />
                        </button>
                        <div className="text-[10px] text-gray-400 mt-1">
                            {product.isActive ? 'מוצג באתר' : 'מוסתר'}
                        </div>
                    </td>

                    {/* פעולות */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-3">
                            <Link 
                                to={`/admin/products/${product._id}/edit`} 
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="ערוך"
                            >
                                <Edit size={18} />
                            </Link>
                            <button 
                                onClick={() => handleDelete(product._id)} 
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="מחק"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        
        {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
                לא נמצאו מוצרים.
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductListPage;