import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/api';
import { useAuthStore } from '@/stores/authStore.js';
import { Button } from '@/components/ui/Button.jsx';
import { Mail, Lock, User, LoaderCircle } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      // FIX: Changed URL to be relative to use the proxy
      const { data: registeredUser } = await api.post('/api/auth/register', { name, email, password }, { withCredentials: true });
      login(registeredUser);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'אירעה שגיאה. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">יצירת חשבון חדש</h1>
          <p className="text-gray-600">זה מהיר וקל.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3"><User className="h-5 w-5 text-gray-400" /></span>
              <input id="name" type="text" placeholder="ישראל ישראלי" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">כתובת אימייל</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3"><Mail className="h-5 w-5 text-gray-400" /></span>
              <input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3"><Lock className="h-5 w-5 text-gray-400" /></span>
              <input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <p className="mt-1 text-xs text-gray-500">לפחות 8 תווים, אות גדולה, קטנה, מספר ותו מיוחד.</p>
          </div>
          {error && (<div className="bg-red-50 text-red-700 p-3 rounded-md text-sm text-center">{error}</div>)}
          <div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <LoaderCircle className="animate-spin h-5 w-5 mr-2" /> : null}
              {loading ? 'יוצר חשבון...' : 'צור חשבון'}
            </Button>
          </div>
        </form>
        <div className="text-sm text-center text-gray-600">
          <p>כבר יש לך חשבון?{' '}<Link to="/login" className="font-medium text-blue-600 hover:underline">התחבר כאן</Link></p>
        </div>
      </div>
    </div>
  );
}