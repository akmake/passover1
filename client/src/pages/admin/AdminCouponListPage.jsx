import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { LoaderCircle, Trash2, Edit } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';

const fetchCoupons = async () => {
  const { data } = await api.get('/api/admin/coupons', { withCredentials: true });
  return data;
};

const AdminCouponListPage = () => {
  const queryClient = useQueryClient();
  const { data: coupons = [], isLoading, isError } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: fetchCoupons,
  });

  const deleteMutation = useMutation({
    mutationFn: (couponId) => api.delete(`/api/admin/coupons/${couponId}`, { withCredentials: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
    },
    onError: (error) => alert('מחיקת הקופון נכשלה: ' + (error.response?.data?.message || 'שגיאה לא ידועה')),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ couponId, isActive }) => api.put(`/api/admin/coupons/${couponId}`, { isActive }, { withCredentials: true }),
    onSuccess: (updatedCoupon) => {
        queryClient.setQueryData(['adminCoupons'], (oldData) =>
            oldData.map((coupon) => (coupon._id === updatedCoupon.data._id ? updatedCoupon.data : coupon))
        );
    },
    onError: (error) => alert('עדכון סטטוס נכשל: ' + (error.response?.data?.message || 'שגיאה לא ידועה')),
  });

  const handleDelete = (couponId) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק קופון זה?')) {
      deleteMutation.mutate(couponId);
    }
  };

  if (isLoading) return <div className="flex justify-center"><LoaderCircle className="animate-spin h-12 w-12" /></div>;
  if (isError) return <p className="text-red-500">שגיאה בטעינת הקופונים.</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ניהול קופונים</h1>
        <Button asChild><Link to="/admin/coupons/new">צור קופון חדש</Link></Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">קוד</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">סוג</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ערך</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">שימוש</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">פעיל</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">פעולות</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.map(coupon => (
              <tr key={coupon._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{coupon.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{coupon.discountType === 'fixed' ? 'סכום קבוע' : 'אחוזים'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{coupon.discountType === 'fixed' ? `₪${coupon.discountValue}` : `${coupon.discountValue}%`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{coupon.usedCount} / {coupon.maxUses || '∞'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Switch
                    checked={coupon.isActive}
                    onCheckedChange={(checked) => updateStatusMutation.mutate({ couponId: coupon._id, isActive: checked })}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                  <Link to={`/admin/coupons/${coupon._id}/edit`} className="text-blue-600 hover:text-blue-900"><Edit size={16}/></Link>
                  <button onClick={() => handleDelete(coupon._id)} className="text-red-600 hover:text-red-900"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCouponListPage;