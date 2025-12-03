import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/api';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { LoaderCircle, ArrowRight } from 'lucide-react';

const fetchCoupon = async (couponId) => {
  if (!couponId) return null;
  const { data } = await api.get(`/api/admin/coupons/${couponId}`, { withCredentials: true });
  return data;
};

const AdminCouponFormPage = () => {
  const { id: couponId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(couponId);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 0,
    isActive: true,
    expiryDate: '',
    maxUses: '',
    maxUsesPerUser: 1,
  });

  const { data: initialData, isLoading } = useQuery({
    queryKey: ['adminCoupon', couponId],
    queryFn: () => fetchCoupon(couponId),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        expiryDate: initialData.expiryDate ? initialData.expiryDate.split('T')[0] : '',
        maxUses: initialData.maxUses ?? '', // Handle null for empty input
        maxUsesPerUser: initialData.maxUsesPerUser ?? '',
      });
    }
  }, [initialData]);

  const mutation = useMutation({
    mutationFn: (couponData) => {
      const dataToSend = { ...couponData };
      if (dataToSend.maxUses === '') dataToSend.maxUses = null; // Convert empty string to null for API
      if (dataToSend.maxUsesPerUser === '') dataToSend.maxUsesPerUser = null;
      if (dataToSend.minPurchase === '') dataToSend.minPurchase = 0;


      return isEditMode
        ? api.put(`/api/admin/coupons/${couponId}`, dataToSend, { withCredentials: true })
        : api.post('/api/admin/coupons', dataToSend, { withCredentials: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      navigate('/admin/coupons');
    },
    onError: (error) => alert('שמירת הקופון נכשלה: ' + (error.response?.data?.message || 'שגיאה לא ידועה')),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };
  
  const generateRandomCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData(prev => ({...prev, code}));
  }

  if (isLoading && isEditMode) return <div className="flex justify-center"><LoaderCircle className="animate-spin h-12 w-12" /></div>;

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/admin/coupons" className="p-2 rounded-md hover:bg-gray-100"><ArrowRight className="h-6 w-6" /></Link>
        <h1 className="text-3xl font-bold mr-4">{isEditMode ? `עריכת קופון: ${formData.code}` : 'יצירת קופון חדש'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">קוד קופון</label>
            <div className="flex gap-2">
                <input type="text" name="code" value={formData.code} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md uppercase" />
                <Button type="button" variant="outline" onClick={generateRandomCode}>צור קוד</Button>
            </div>
          </div>
          <div className="flex items-center pt-6">
            <Switch id="isActive" name="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData(p => ({...p, isActive: checked}))} />
            <label htmlFor="isActive" className="mr-3 text-sm font-medium text-gray-900">קופון פעיל</label>
          </div>
        </div>

        <div className="p-4 border rounded-md bg-gray-50 space-y-4">
            <h3 className="text-lg font-medium text-gray-800">ערך ההנחה</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">סוג הנחה</label>
                    <select name="discountType" value={formData.discountType} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="percentage">אחוזים (%)</option>
                    <option value="fixed">סכום קבוע (₪)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ערך ההנחה</label>
                    <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} required min="0" step="0.01" className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
            </div>
        </div>

        <div className="p-4 border rounded-md bg-gray-50 space-y-4">
            <h3 className="text-lg font-medium text-gray-800">תנאים והגבלות</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">סכום הזמנה מינימלי (₪)</label>
                    <input type="number" name="minPurchase" value={formData.minPurchase} onChange={handleChange} min="0" placeholder="0" className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">מקסימום מימושים (כללי)</label>
                    <input type="number" name="maxUses" value={formData.maxUses} onChange={handleChange} min="0" placeholder="אין הגבלה" className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">מימושים ללקוח</label>
                    <input type="number" name="maxUsesPerUser" value={formData.maxUsesPerUser} onChange={handleChange} min="0" placeholder="1" className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">תאריך תפוגה (אופציונלי)</label>
                    <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
            </div>
        </div>


        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/coupons')}>ביטול</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <LoaderCircle className="animate-spin h-5 w-5 mr-2" />}
            {mutation.isPending ? 'שומר...' : 'שמור קופון'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminCouponFormPage;