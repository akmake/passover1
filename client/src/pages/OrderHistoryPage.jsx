import { useQuery } from '@tanstack/react-query';
import api from '@/api';
import { Link } from 'react-router-dom';
import { LoaderCircle, ShoppingCart, ChevronLeft } from 'lucide-react';

// פונקציה לשליפת היסטוריית ההזמנות
const fetchMyOrders = async () => {
    const { data } = await api.get('/api/orders/myorders', { withCredentials: true });
    return data;
};

// קומפוננטה קטנה לעיצוב הסטטוס
const StatusBadge = ({ status }) => {
    const statusStyles = {
        'התקבלה': 'bg-blue-100 text-blue-800',
        'בטיפול המטבח': 'bg-yellow-100 text-yellow-800',
        'מוכנה למשלוח': 'bg-purple-100 text-purple-800',
        'בדרך ללקוח': 'bg-indigo-100 text-indigo-800',
        'נמסרה': 'bg-green-100 text-green-800',
        'בוטלה': 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};


const OrderHistoryPage = () => {
    const { data: orders, isLoading, isError } = useQuery({
        queryKey: ['myOrders'],
        queryFn: fetchMyOrders,
    });

    if (isLoading) {
        return <div className="flex justify-center py-20"><LoaderCircle className="h-12 w-12 animate-spin text-blue-600" /></div>;
    }

    if (isError) {
        return <p className="text-center text-red-500">שגיאה בטעינת היסטוריית ההזמנות.</p>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">ההזמנות שלי</h1>
            <div className="space-y-4">
                {orders.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 bg-white rounded-lg shadow-sm">
                        <ShoppingCart className="mx-auto h-12 w-12" />
                        <p className="mt-4">עדיין לא ביצעת הזמנות.</p>
                        <Link to="/menu" className="text-blue-600 hover:underline mt-2 inline-block">להרכבת ההזמנה הראשונה שלך</Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {orders.map(order => (
                                <li key={order._id}>
                                    <Link to={`/my-orders/${order._id}`} className="block hover:bg-gray-50 transition-colors duration-200">
                                        <div className="p-4 sm:p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="truncate">
                                                    <p className="text-sm font-medium text-blue-600 truncate">הזמנה #{order._id.substring(18).toUpperCase()}</p>
                                                    <p className="text-gray-500 text-sm mt-1">בוצעה ב: {new Date(order.createdAt).toLocaleDateString('he-IL')}</p>
                                                </div>
                                                <div className="ml-2 flex-shrink-0 flex">
                                                    <ChevronLeft className="h-5 w-5 text-gray-400" />
                                                </div>
                                            </div>
                                            <div className="mt-4 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-700"><strong>סה"כ:</strong>&nbsp;₪{order.totalPrice.toFixed(2)}</p>
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-gray-700 sm:mt-0">
                                                    <StatusBadge status={order.status} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistoryPage;
