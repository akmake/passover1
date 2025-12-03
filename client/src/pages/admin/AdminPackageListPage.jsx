import { useState, useEffect } from 'react';
import api from '@/api';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

const AdminPackageListPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/admin/packages', { withCredentials: true });
      setPackages(data);
    } catch (error) {
      console.error('Failed to fetch packages', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (packageId) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק חבילה זו?')) {
      try {
        await api.delete(`/api/admin/packages/${packageId}`, { withCredentials: true });
        fetchPackages(); // רענון הרשימה
      } catch (error) {
        alert('מחיקת החבילה נכשלה.');
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin h-12 w-12 text-blue-600" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ניהול חבילות</h1>
        <Button asChild><Link to="/admin/packages/new">הוסף חבילה חדשה</Link></Button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">שם החבילה</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">מחיר</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">פעיל</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {packages.map((pkg) => (
              <tr key={pkg._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pkg.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₪{pkg.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{pkg.isActive ? 'כן' : 'לא'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                  {/* --- תיקון הכפתור --- */}
                  <Link to={`/admin/packages/${pkg._id}/edit`} className="text-blue-600 hover:text-blue-900 ml-4">ערוך</Link>
                  <button onClick={() => handleDelete(pkg._id)} className="text-red-600 hover:text-red-900">מחק</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPackageListPage;