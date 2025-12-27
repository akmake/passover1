import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api';
import { Button } from '@/components/ui/Button';
import { LoaderCircle, Trash2, Plus, Search, Tag } from 'lucide-react';

const AdminPromotions = () => {
  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. שליפת מוצרים (שימוש ב-api הקיים שלך כדי למנוע בעיות חיבור)
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await api.get('/api/products')).data,
  });

  // 2. שליפת מבצעים קיימים
  const { data: promotions = [], isLoading: isLoadingPromos } = useQuery({
    queryKey: ['promotions'],
    queryFn: async () => (await api.get('/api/promotions')).data,
  });

  // 3. הוספת מבצע (Mutation)
  const createMutation = useMutation({
    mutationFn: async (newPromo) => await api.post('/api/promotions', newPromo),
    onSuccess: () => {
      queryClient.invalidateQueries(['promotions']);
      alert('המבצע נוסף בהצלחה!');
      setDiscountPrice('');
      setSelectedProductId('');
    },
    onError: (err) => alert('שגיאה: ' + (err.response?.data?.message || err.message))
  });

  // 4. מחיקת מבצע
  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/api/promotions/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['promotions']),
  });

  // סינון מוצרים לחיפוש ב-Select
  const filteredProducts = products.filter(p => 
    (p.name?.he || p.name).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProductId || !discountPrice) return;
    createMutation.mutate({ productId: selectedProductId, discountPrice: Number(discountPrice) });
  };

  if (isLoadingProducts || isLoadingPromos) {
    return <div className="flex justify-center py-20"><LoaderCircle className="animate-spin h-10 w-10 text-[#D4AF37]" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans text-[#1A1A1A]">
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-serif font-bold tracking-wide">ניהול מבצעים חמים 🔥</h1>
        <span className="text-sm text-gray-500 font-bold tracking-wider">PROMOTIONS MANAGER</span>
      </div>

      {/* --- טופס הוספה מעוצב --- */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1 h-full bg-[#D4AF37]"></div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Tag className="text-[#D4AF37]" size={20} />
          הוסף מבצע חדש
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 mb-1">חפש ובחר מוצר</label>
            <select 
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-[#D4AF37] outline-none bg-white"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">-- בחר מוצר מהרשימה --</option>
              {filteredProducts.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name?.he || p.name} (מחיר רגיל: ₪{p.price})
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-40">
            <label className="block text-xs font-bold text-gray-500 mb-1">מחיר מבצע (₪)</label>
            <input 
              type="number" 
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-[#D4AF37] outline-none"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <Button type="submit" disabled={createMutation.isPending} className="w-full md:w-auto h-[42px] bg-black text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold tracking-widest">
            {createMutation.isPending ? <LoaderCircle className="animate-spin" /> : 'שמור מבצע'}
          </Button>
        </form>
      </div>

      {/* --- טבלת מבצעים --- */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <table className="w-full text-right">
          <thead className="bg-[#F9F9F9] border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="py-4 px-6 font-medium">מוצר</th>
              <th className="py-4 px-6 font-medium">מחיר מקורי</th>
              <th className="py-4 px-6 font-medium">מחיר מבצע</th>
              <th className="py-4 px-6 font-medium">הנחה</th>
              <th className="py-4 px-6 font-medium text-left">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {promotions.map((promo) => {
              if (!promo.product) return null;
              const discountPercent = Math.round(((promo.product.price - promo.discountPrice) / promo.product.price) * 100);
              
              return (
                <tr key={promo._id} className="hover:bg-[#FFFDF5] transition-colors group">
                  <td className="py-4 px-6 font-bold text-gray-800">
                    <div className="flex items-center gap-3">
                      {promo.product.image && (
                        <img src={promo.product.image} alt="" className="w-10 h-10 rounded-md object-cover border border-gray-200" />
                      )}
                      <span>{promo.product.name?.he || promo.product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-400 line-through">₪{promo.product.price}</td>
                  <td className="py-4 px-6 text-green-600 font-bold text-lg">₪{promo.discountPrice}</td>
                  <td className="py-4 px-6">
                    <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold border border-red-100">
                      -{discountPercent}%
                    </span>
                  </td>
                  <td className="py-4 px-6 text-left">
                    <button 
                      onClick={() => {
                        if(window.confirm('למחוק את המבצע?')) deleteMutation.mutate(promo._id);
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {promotions.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-400">
                  לא נמצאו מבצעים פעילים. הוסף את הראשון!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPromotions;