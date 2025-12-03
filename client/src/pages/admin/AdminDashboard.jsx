import { useState, useEffect } from 'react';
import api from '@/api';
import { LoaderCircle, Users, Package, ShoppingCart } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/admin/stats', { withCredentials: true });
        setStats(data);
      } catch (error) { console.error('Failed to fetch stats', error); } 
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin h-12 w-12 text-blue-600" /></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">לוח בקרה</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500 mr-4" />
            <div><p className="text-sm text-gray-500">סה"כ משתמשים</p><p className="text-2xl font-bold">{stats?.users}</p></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-500 mr-4" />
            <div><p className="text-sm text-gray-500">סה"כ מוצרים</p><p className="text-2xl font-bold">{stats?.products}</p></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-yellow-500 mr-4" />
            <div><p className="text-sm text-gray-500">סה"כ הזמנות</p><p className="text-2xl font-bold">{stats?.orders}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;