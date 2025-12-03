import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, CheckCircle } from 'lucide-react';
import api from '../api.js';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const login = useAuthStore((state) => state.login);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await api.post('/api/auth/login', { email, password });
            login(response.data);
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            window.location.href = response.data.role === 'admin' ? '/admin/dashboard' : '/';
        } catch (error) {
            const message = error.response?.data?.message || 'שגיאה בהתחברות';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 via-yellow-100 to-purple-200"
            style={{
                backgroundImage: `url('/images/passover-table.jpg')`, // תמונת רקע של שולחן פסח
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundBlendMode: 'overlay',
            }}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="bg-white bg-opacity-80 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-full max-w-sm"
            >
                <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
                    התחבר לחגיגה של קייטרינג פסח
                </h2>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mb-4 p-4 bg-red-500 text-white rounded-lg text-sm flex items-center justify-center"
                        >
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative group">
                        <motion.div
                            className="absolute right-3 top-3 text-gray-500 group-focus-within:text-yellow-600"
                            animate={email ? { scale: 1.2 } : { scale: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Mail className="h-5 w-5" />
                        </motion.div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="כתובת אימייל"
                            className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-right"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <motion.div
                            className="absolute right-3 top-3 text-gray-500 group-focus-within:text-yellow-600"
                            animate={password ? { scale: 1.2 } : { scale: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Lock className="h-5 w-5" />
                        </motion.div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="סיסמה"
                            className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-right"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 space-x-reverse">
                            <motion.div
                                animate={rememberMe ? { rotate: 360 } : { rotate: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <CheckCircle
                                    className={`h-5 w-5 ${rememberMe ? 'text-yellow-600' : 'text-gray-400'}`}
                                />
                            </motion.div>
                            <span className="text-sm text-gray-600">זכור אותי</span>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="hidden"
                            />
                        </label>
                        <Link
                            to="/forgot-password"
                            className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
                        >
                            שכחת סיסמה?
                        </Link>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(234, 179, 8, 0.5)' }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full py-3 rounded-lg text-white font-semibold ${
                            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'
                        } transition-colors`}
                    >
                        {isLoading ? 'טוען...' : 'התחבר לחג'}
                    </motion.button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    אין לך חשבון?{' '}
                    <Link
                        to="/register"
                        className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                    >
                        הירשם עכשיו
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}