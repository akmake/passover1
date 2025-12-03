import { useState } from 'react';
import api from '@/api';
import { Button } from '@/components/ui/Button';
import { Mail, LoaderCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError('');
        setMessage('');
        setIsSuccess(false);

        try {
            const { data } = await api.post('/api/auth/forgot-password', { email });
            setMessage(data.message);
            setIsSuccess(true);
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
                    <h1 className="text-2xl font-bold text-gray-900">איפוס סיסמה</h1>
                    <p className="text-gray-600">הזן את כתובת המייל שלך ונשלח אליך קישור לאיפוס.</p>
                </div>

                {isSuccess ? (
                    <div className="text-center p-4 bg-green-50 text-green-800 rounded-lg">
                         <CheckCircle className="mx-auto h-12 w-12 mb-4" />
                        <p>{message}</p>
                        <Link to="/login" className="font-medium text-blue-600 hover:underline mt-4 inline-block">חזרה להתחברות</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">כתובת אימייל</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3"><Mail className="h-5 w-5 text-gray-400" /></span>
                                <input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                        </div>

                        {error && (<div className="bg-red-50 text-red-700 p-3 rounded-md text-sm text-center">{error}</div>)}

                        <div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <LoaderCircle className="animate-spin h-5 w-5 mr-2" />}
                                {loading ? 'שולח...' : 'שלח קישור לאיפוס'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;