import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/api';
import { Button } from '@/components/ui/Button';
import { Lock, LoaderCircle, CheckCircle } from 'lucide-react';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('הסיסמאות אינן תואמות.');
            return;
        }
        if (loading) return;

        setLoading(true);
        setError('');
        setMessage('');
        setIsSuccess(false);

        try {
            const { data } = await api.put(`/api/auth/reset-password/${token}`, { password });
            setMessage(data.message);
            setIsSuccess(true);
            setTimeout(() => navigate('/login'), 5000); // Redirect to login after 5 seconds
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
                    <h1 className="text-2xl font-bold text-gray-900">קביעת סיסמה חדשה</h1>
                </div>

                {isSuccess ? (
                     <div className="text-center p-4 bg-green-50 text-green-800 rounded-lg">
                         <CheckCircle className="mx-auto h-12 w-12 mb-4" />
                        <p>{message}</p>
                        <p className="mt-2 text-sm">מיד תועבר לעמוד ההתחברות...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">סיסמה חדשה</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3"><Lock className="h-5 w-5 text-gray-400" /></span>
                                <input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">אימות סיסמה חדשה</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3"><Lock className="h-5 w-5 text-gray-400" /></span>
                                <input id="confirmPassword" type="password" placeholder="••••••••" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                        </div>

                        {error && (<div className="bg-red-50 text-red-700 p-3 rounded-md text-sm text-center">{error}</div>)}

                        <div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <LoaderCircle className="animate-spin h-5 w-5 mr-2" />}
                                {loading ? 'מאפס סיסמה...' : 'אפס סיסמה'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;