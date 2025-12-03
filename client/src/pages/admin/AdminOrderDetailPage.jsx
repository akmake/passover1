import { useParams, Link } from 'react-router-dom';
import api from '@/api';
import { useQuery } from '@tanstack/react-query';
import { LoaderCircle, ArrowRight, User, Phone, Home, Printer } from 'lucide-react';

const fetchOrderDetails = async (orderId) => {
    const { data } = await api.get(`/api/admin/orders/${orderId}`, { withCredentials: true });
    return data;
};

const AdminOrderDetailPage = () => {
    const { id: orderId } = useParams();

    const { data: order, isLoading, isError, isSuccess } = useQuery({
        queryKey: ['adminOrderDetails', orderId],
        queryFn: () => fetchOrderDetails(orderId)
    });

    if (isLoading) {
        return <div className="flex justify-center"><LoaderCircle className="animate-spin h-12 w-12" /></div>;
    }

    if (isError) {
        return <p>שגיאה בטעינת פרטי ההזמנה.</p>;
    }
    
    // שימוש ב-isSuccess כדי להבטיח שה-order קיים לפני רינדור
    return isSuccess && (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
            {/* --- כותרת וכפתורי פעולה (יוסתר בהדפסה) --- */}
            <div className="flex justify-between items-center mb-8 print:hidden">
                <div className="flex items-center">
                    <Link to="/admin/orders" className="p-2 rounded-md hover:bg-gray-100"><ArrowRight className="h-6 w-6" /></Link>
                    <h1 className="text-2xl sm:text-3xl font-bold mr-4">פרטי הזמנה #{order._id.substring(18)}</h1>
                </div>
                <button 
                    onClick={() => window.print()} 
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Printer className="h-5 w-5" />
                    <span>הדפס</span>
                </button>
            </div>

            {/* --- פרטי הזמנה ולקוח --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b pb-6 mb-6">
                <div>
                    <h2 className="text-lg font-semibold mb-2">פרטי לקוח</h2>
                    {/* תיקון: שימוש ב-optional chaining */}
                    <p className="flex items-center gap-2 text-gray-700"><User className="h-4 w-4 text-gray-500" /> {order?.user?.name || 'לקוח אורח'}</p>
                    <p className="flex items-center gap-2 text-gray-700"><Phone className="h-4 w-4 text-gray-500" /> {order?.shippingDetails?.phone}</p>
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-2">פרטי משלוח</h2>
                    {/* תיקון: שימוש ב-optional chaining */}
                    <p className="flex items-center gap-2 text-gray-700">
                        <Home className="h-4 w-4 text-gray-500" /> 
                        {`${order?.shippingDetails?.streetAddress}, ${order?.shippingDetails?.city}`}
                    </p>
                    <p className="text-gray-700 ml-6">דירה: {order?.shippingDetails?.apartment || '-'}, קומה: {order?.shippingDetails?.floor || '-'}</p>
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-2">תאריכים וסכום</h2>
                    <p className="text-gray-700"><strong>תאריך הזמנה:</strong> {new Date(order.createdAt).toLocaleString('he-IL')}</p>
                    <p className="text-gray-700 font-bold"><strong>לתאריך משלוח:</strong> {new Date(order.deliveryDate).toLocaleDateString('he-IL')}</p>
                    <p className="text-xl font-bold mt-2">סה"כ: ₪{order.totalPrice.toFixed(2)}</p>
                </div>
            </div>

            {/* --- פירוט פריטים והערות --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">פירוט להכנה</h2>
                    <ul className="divide-y divide-gray-200">
                        {order.orderItems.map((item, index) => (
                            <li key={index} className="py-4">
                                <div className="font-bold text-lg">{item.quantity ? `${item.quantity} x ` : ''}{item.name}</div>
                                {item.itemType === 'MealPackage' && (
                                    <div className="text-sm text-gray-600 mt-2 pl-4 space-y-1">
                                        <div className="font-medium underline">בחירות הלקוח:</div>
                                        {item.packageSelections.map(sel => (
                                            <div key={sel.category}>&bull; {sel.category}: {sel.selectedOptions.map(opt => opt.name).join(', ')}</div>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                {order.notes && (
                    <div className="lg:col-span-1 bg-yellow-50 border-2 border-yellow-300 border-dashed p-4 rounded-lg">
                        <h2 className="text-xl font-bold mb-2 text-yellow-800">!!! הערות מהלקוח</h2>
                        <p className="text-gray-700 whitespace-pre-wrap font-mono">{order.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrderDetailPage;