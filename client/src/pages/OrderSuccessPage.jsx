import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api';
import { CheckCircle, LoaderCircle, Home, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// פונקציה לשליפת פרטי ההזמנה
const fetchOrderDetails = async (orderId) => {
    const { data } = await api.get(`/api/orders/${orderId}`, { withCredentials: true });
    return data;
};

const OrderSuccessPage = () => {
    const { id: orderId } = useParams();

    const { data: order, isLoading, isError } = useQuery({
        queryKey: ['orderDetails', orderId],
        queryFn: () => fetchOrderDetails(orderId),
        retry: 1, // נסה פעם אחת נוספת במקרה של שגיאה
    });

    if (isLoading) {
        return <div className="flex justify-center py-20"><LoaderCircle className="h-16 w-16 animate-spin text-blue-600" /></div>;
    }

    if (isError) {
        return (
             <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-red-600">שגיאה בטעינת פרטי ההזמנה</h1>
                <p className="mt-2 text-gray-600">לא הצלחנו למצוא את פרטי ההזמנה שלך. אנא בדוק את אזור "ההזמנות שלי" או פנה לתמיכה.</p>
             </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center pt-8 pb-12">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h1 className="mt-4 text-3xl font-bold text-gray-900">הזמנתך הושלמה בהצלחה!</h1>
                <p className="mt-2 text-gray-600">אישור הזמנה עם הפרטים המלאים נשלח אליך למייל.</p>
                <p className="mt-1 text-gray-500 text-sm">מספר הזמנה: <span className="font-mono">{orderId}</span></p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 border-b pb-4">סיכום ההזמנה שלך</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">פרטי משלוח</h3>
                        <div className="space-y-2 text-gray-700">
                             <p className="flex items-center gap-2"><Home className="h-4 w-4 text-gray-500" /> {order.shippingDetails.streetAddress}, {order.shippingDetails.city}</p>
                             <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-500" /> {order.shippingDetails.phone}</p>
                             <p className="flex items-center gap-2 font-bold"><Calendar className="h-4 w-4 text-gray-500" /> {new Date(order.deliveryDate).toLocaleDateString('he-IL')}</p>
                        </div>
                    </div>
                    {order.notes && (
                         <div className="bg-yellow-50 p-4 rounded-md">
                            <h3 className="font-semibold text-yellow-800">הערות שהשארת:</h3>
                            <p className="text-sm text-gray-700 mt-1">{order.notes}</p>
                        </div>
                    )}
                </div>


                <h3 className="text-lg font-semibold mb-4">פירוט פריטים</h3>
                <ul className="divide-y divide-gray-200 border-b mb-6">
                    {order.orderItems.map((item, index) => (
                        <li key={index} className="py-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-800">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.itemType === 'MealPackage' ? 'חבילה' : `כמות: ${item.quantity}`}</p>
                            </div>
                            <span className="font-semibold">₪{item.price.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>

                <div className="flex justify-end items-center">
                    <div className="text-right">
                        <p className="text-gray-600">סך הכל:</p>
                        <p className="text-2xl font-bold">₪{order.totalPrice.toFixed(2)}</p>
                    </div>
                </div>
            </div>

             <div className="mt-10 flex justify-center gap-4">
                <Button asChild variant="outline"><Link to="/menu">חזרה לתפריט</Link></Button>
                <Button asChild><Link to="/my-orders">צפה בכל ההזמנות שלי</Link></Button>
            </div>
        </div>
    );
};

export default OrderSuccessPage;