// client/src/pages/admin/AdminProductListPage.jsx

import { useState, useEffect } from 'react';
import api from '@/api';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

const AdminProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        await api.delete(`/api/admin/products/${productId}`, { withCredentials: true });
        setProducts(products.filter((p) => p._id !== productId));
      } catch (error) {
        console.error('Failed to delete product', error);
        alert('מחיקת המוצר נכשלה.');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin h-12 w-12 text-blue-600" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ניהול מוצרים</h1>
        <Button asChild>
          <Link to="/admin/products/new">הוסף מוצר חדש</Link>
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תמונה</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">שם</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">קטגוריה</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">מחיר</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פעיל</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id}>
                <td className="px-6 py-4 whitespace-nowrap"><img src={product.image || 'https://via.placeholder.com/50'} alt={product.name?.he} className="h-10 w-10 rounded-full object-cover" /></td>
                
                {/* ======================= התיקון נמצא כאן ======================= */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {/* הקוד החדש בודק: אם 'name' הוא אובייקט, הצג את 'name.he'. 
                    אם הוא עדיין טקסט פשוט (ממוצר ישן), פשוט הצג אותו.
                    זה מונע קריסות משני הסוגים.
                  */}
                  {typeof product.name === 'object' ? product.name.he : product.name}
                </td>
                {/* ======================= סוף התיקון ======================= */}
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₪{product.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{product.isActive ? 'כן' : 'לא'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                  <Link to={`/admin/products/${product._id}/edit`} className="text-blue-600 hover:text-blue-900 ml-4">ערוך</Link>
                  <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900">
                    מחק
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductListPage;