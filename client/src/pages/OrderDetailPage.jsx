import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api';
import { LoaderCircle, Home, Phone, Calendar, ArrowRight, CheckCircle } from 'lucide-react';

const fetchOrderDetails = async (orderId) => {
    const { data } = await api.get(`/api/orders/${orderId}`, { withCredentials: true });
    return data;
};

// --- קומפוננטה ויזואלית למעקב אחר סטטוס ההזמנה ---
const OrderStatusTracker = ({ currentStatus }) => {
    const statuses = ['התקבלה', 'בטיפול המטבח', 'מוכנה למשלוח', 'בדרך ללקוח', 'נמסרה'];
    const currentIndex = statuses.indexOf(currentStatus);

    return (
        <div className="p-6 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">מעקב אחר הזמנה</h3>
            <div className="space-y-4">
                {statuses.map((status, index) => {
                    const isActive = index <= currentIndex;
                    return (
                        <div key={status} className="flex items-center">
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {isActive ? <CheckCircle size={18} /> : <div className="h-2 w-2 bg-gray-400 rounded-full" />}
                            </div>
                            <p className={`mr-4 text-sm font-medium ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>{status}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const OrderDetailPage = () => {
    const { id: orderId } = useParams();

    const { data: order, isLoading, isError } = useQuery({
        queryKey: ['orderDetails', orderId],
        queryFn: () => fetchOrderDetails(orderId),
    });

    if (isLoading) {
        return <div className="flex justify-center py-20"><LoaderCircle className="h-16 w-16 animate-spin text-blue-600" /></div>;
    }

    if (isError) {
        return (
             <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-red-600">שגיאה בטעינת פרטי ההזמנה</h1>
                <p className="mt-2 text-gray-600">לא הצלחנו למצוא את פרטי ההזמנה שלך או שאין לך הרשאה לצפות בה.</p>
             </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
             <div className="flex items-center mb-6">
                <Link to="/my-orders" className="p-2 rounded-md hover:bg-gray-100 flex items-center text-blue-600">
                    <ArrowRight className="h-5 w-5 ml-2" />
                    חזרה להיסטוריית ההזמנות
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- עמודה ראשית: פירוט ההזמנה --- */}
                <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-lg">
                    <div className="border-b pb-4 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">פרטי הזמנה #{orderId.substring(18).toUpperCase()}</h1>
                        <p className="mt-1 text-gray-500 text-sm">בוצעה בתאריך: {new Date(order.createdAt).toLocaleString('he-IL')}</p>
                    </div>

                    <h3 className="text-xl font-semibold mb-4">פירוט פריטים</h3>
                    <ul className="divide-y divide-gray-200 border-b mb-6">
                        {order.orderItems.map((item, index) => (
                            <li key={index} className="py-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-gray-800">{item.name}</p>
                                        <p className="text-sm text-gray-500">{item.itemType === 'MealPackage' ? 'חבילה' : `כמות: ${item.quantity}`}</p>
                                    </div>
                                    <span className="font-semibold text-gray-800">₪{item.price.toFixed(2)}</span>
                                </div>
                                {item.itemType === 'MealPackage' && (
                                    <div className="text-xs text-gray-600 mt-2 pl-4 space-y-1">
                                        {item.packageSelections.map(sel => (
                                            <div key={sel.category}>&bull; {sel.category}: {sel.selectedOptions.map(opt => opt.name).join(', ')}</div>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className="flex justify-end items-center">
                        <div className="text-right">
                            <p className="text-gray-600">סך הכל:</p>
                            <p className="text-3xl font-bold text-gray-900">₪{order.totalPrice.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* --- עמודת צד: פרטים נוספים ומעקב --- */}
                <div className="space-y-8">
                    <OrderStatusTracker currentStatus={order.status} />

                    <div className="p-6 bg-white rounded-lg shadow-lg border">
                        <h3 className="text-lg font-semibold mb-4">פרטי משלוח</h3>
                        <div className="space-y-3 text-gray-700">
                             <p className="flex items-start gap-3"><Home className="h-5 w-5 text-gray-400 mt-1" /> <span>{order.shippingDetails.streetAddress}, {order.shippingDetails.city}</span></p>
                             <p className="flex items-center gap-3"><Phone className="h-5 w-5 text-gray-400" /> {order.shippingDetails.phone}</p>
                             <p className="flex items-center gap-3 font-bold"><Calendar className="h-5 w-5 text-gray-400" /> {new Date(order.deliveryDate).toLocaleDateString('he-IL')}</p>
                        </div>
                    </div>
                    {order.notes && (
                         <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h3 className="font-semibold text-yellow-800">הערות שהשארת:</h3>
                            <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{order.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
