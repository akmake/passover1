// client/src/pages/admin/AdminOrderListPage.jsx

import { useState, useMemo } from 'react';
import api from '@/api';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle, Printer } from 'lucide-react';
import { useAllAvailableDates } from '@/hooks/useAllAvailableDates';

// פונקציה לשליפת הזמנות
const fetchOrders = async () => {
    const { data } = await api.get('/api/admin/orders', { withCredentials: true });
    return data;
};

// פונקציה לעדכון סטטוס הזמנה
const updateOrderStatus = async ({ orderId, status }) => {
    const { data } = await api.put(`/api/admin/orders/${orderId}/status`, { status }, { withCredentials: true });
    return data;
};

const ORDER_STATUSES = ['התקבלה', 'בטיפול המטבח', 'מוכנה למשלוח', 'בדרך ללקוח', 'נמסרה', 'בוטלה'];

const AdminOrderListPage = () => {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const { data: orders = [], isLoading, isError } = useQuery({
        queryKey: ['adminOrders'],
        queryFn: fetchOrders
    });

    const { availableDates, isLoading: isLoadingDates } = useAllAvailableDates();

    const mutation = useMutation({
        mutationFn: updateOrderStatus,
        onSuccess: (updatedOrder) => {
            queryClient.setQueryData(['adminOrders'], (oldData) =>
                oldData.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
            );
        },
        onError: (error) => {
            alert('עדכון הסטטוס נכשל: ' + (error.response?.data?.message || error.message));
        }
    });

    const handleStatusChange = (orderId, newStatus) => {
        mutation.mutate({ orderId, status: newStatus });
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const statusMatch = statusFilter ? order.status === statusFilter : true;
            // --- התיקון ---
            // הוספת בדיקה ש-order.deliveryDate קיים לפני השימוש ב-startsWith
            const dateMatch = dateFilter ? (order.deliveryDate && order.deliveryDate.startsWith(dateFilter)) : true;
            return statusMatch && dateMatch;
        });
    }, [orders, statusFilter, dateFilter]);

    if (isLoading) return <div className="flex justify-center"><LoaderCircle className="animate-spin h-12 w-12" /></div>;
    if (isError) return <div className="text-center text-red-500">שגיאה בטעינת ההזמנות.</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">ניהול הזמנות</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-lg shadow">
                <div>
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">סינון לפי סטטוס</label>
                    <select
                        id="statusFilter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">כל הסטטוסים</option>
                        {ORDER_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">סינון לפי תאריך משלוח</label>
                    <select
                        id="dateFilter"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        disabled={isLoadingDates}
                    >
                        <option value="">כל התאריכים</option>
                        {isLoadingDates ? (
                            <option disabled>טוען תאריכים...</option>
                        ) : (
                            availableDates.map(date => (
                                <option key={date} value={date}>
                                    {new Date(date).toLocaleDateString('he-IL', { timeZone: 'UTC' })}
                                </option>
                            ))
                        )}
                    </select>
                </div>
                <div className="flex items-end">
                    <button onClick={() => { setStatusFilter(''); setDateFilter(''); }} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-md">נקה סינונים</button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">מספר הזמנה</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">לקוח</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">תאריך משלוח</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">סך הכל</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">סטטוס</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">פעולות</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.map(order => (
                            <tr key={order._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{order._id.substring(18)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{order.user?.name || 'לקוח אורח'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{new Date(order.deliveryDate).toLocaleDateString('he-IL')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">₪{order.totalPrice.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        className="p-1 border border-gray-300 rounded-md"
                                        disabled={mutation.isPending && mutation.variables?.orderId === order._id}
                                    >
                                        {ORDER_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <Link to={`/admin/orders/${order._id}`} title="צפה ופירוט והדפסה" className="text-gray-600 hover:text-blue-600 p-2 rounded-full inline-block">
                                        <Printer className="h-5 w-5" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrderListPage;