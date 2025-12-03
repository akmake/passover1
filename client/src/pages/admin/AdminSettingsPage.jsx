import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { LoaderCircle, Trash2, PlusCircle, Truck, Package } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';

// --- API Functions ---
const fetchSettings = async () => {
    const general = await api.get('/api/admin/settings/general', { withCredentials: true });
    const dates = await api.get('/api/admin/settings/delivery-dates', { withCredentials: true });
    const centers = await api.get('/api/admin/settings/delivery-centers', { withCredentials: true });
    return { general: general.data, dates: dates.data, centers: centers.data };
};

const AdminSettingsPage = () => {
    const queryClient = useQueryClient();
    const [freeShipping, setFreeShipping] = useState('');
    const [newGlobalDate, setNewGlobalDate] = useState('');
    const [pickupName, setPickupName] = useState('');
    const [pickupAddress, setPickupAddress] = useState('');
    const [centerEdits, setCenterEdits] = useState({});

    const { data, isLoading, isError } = useQuery({
        queryKey: ['adminSettings'],
        queryFn: fetchSettings,
    });

    // --- THIS IS THE MAIN FIX ---
    // This useEffect synchronizes the server state (from useQuery) with our local form state.
    useEffect(() => {
        if (data) {
            // Populate free shipping form
            setFreeShipping(data.general.freeShippingThreshold);

            // Populate forms for all delivery centers (zones and pickups)
            const edits = {};
            data.centers.forEach(c => {
                edits[c._id] = { 
                    price: c.price ?? '', 
                    cities: c.cities?.join(', ') || '',
                    availableDates: c.availableDates || [],
                    newDate: '',
                };
            });
            setCenterEdits(edits);
        }
    }, [data]); // This effect runs whenever 'data' is fetched or updated.

    // --- Mutations ---
    const updateSettingsMutation = useMutation({
        mutationFn: (threshold) => api.put('/api/admin/settings/general', { freeShippingThreshold: threshold }, { withCredentials: true }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminSettings'] }),
    });
    const addDateMutation = useMutation({
        mutationFn: (date) => api.post('/api/admin/settings/delivery-dates', { date }, { withCredentials: true }),
        onSuccess: () => { setNewGlobalDate(''); queryClient.invalidateQueries({ queryKey: ['adminSettings'] }); }
    });
    const deleteDateMutation = useMutation({
        mutationFn: (id) => api.delete(`/api/admin/settings/delivery-dates/${id}`, { withCredentials: true }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminSettings'] }),
    });
    const addPickupMutation = useMutation({
        mutationFn: (pickupData) => api.post('/api/admin/settings/delivery-centers', pickupData, { withCredentials: true }),
        onSuccess: () => { setPickupName(''); setPickupAddress(''); queryClient.invalidateQueries({ queryKey: ['adminSettings'] }); }
    });
    const updateCenterMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/api/admin/settings/delivery-centers/${id}`, data, { withCredentials: true }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminSettings'] }),
    });
    const deletePickupMutation = useMutation({
        mutationFn: (id) => api.delete(`/api/admin/settings/delivery-centers/${id}`, { withCredentials: true }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminSettings'] }),
    });

    // --- Handlers ---
    const handleCenterChange = (id, field, value) => setCenterEdits(prev => ({...prev, [id]: {...(prev[id] || {}), [field]: value}}));
    const handleSaveZone = (id) => {
        const center = data?.centers.find(c => c._id === id);
        if(!center) return;
        
        const dataToSend = {
            price: centerEdits[id].price,
            cities: center.name === 'אזורים נבחרים' ? (centerEdits[id].cities || '').split(',').map(c=>c.trim()).filter(Boolean) : undefined,
        };
        updateCenterMutation.mutate({ id, data: dataToSend });
    };
    const handleAddPickupDate = (id) => {
        const newDate = centerEdits[id]?.newDate;
        if (!newDate) return;
        const currentDates = centerEdits[id]?.availableDates || [];
        const updatedDates = [...new Set([...currentDates, newDate])].sort();
        updateCenterMutation.mutate({ id, data: { availableDates: updatedDates } });
        handleCenterChange(id, 'newDate', '');
    };
    const handleRemovePickupDate = (id, dateToRemove) => {
        const currentDates = centerEdits[id]?.availableDates || [];
        const updatedDates = currentDates.filter(d => d !== dateToRemove);
        updateCenterMutation.mutate({ id, data: { availableDates: updatedDates } });
    };

    if (isLoading) return <div className="flex justify-center"><LoaderCircle className="h-12 w-12 animate-spin" /></div>;
    if (isError) return <div className="text-center text-red-500 p-8">שגיאה חמורה בטעינת ההגדרות. ודא שהשרת פועל והפעל מחדש את הדף.</div>;

    const deliveryZones = data?.centers.filter(c => c.type === 'DeliveryZone');
    const pickupPoints = data?.centers.filter(c => c.type === 'Pickup');

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">הגדרות מערכת</h1>

            {/* General Settings */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">הגדרות כלליות</h2>
                <div className="flex items-end gap-4">
                    <div>
                        <label className="block text-sm font-medium">סף למשלוח חינם (₪)</label>
                        <input type="number" value={freeShipping} onChange={(e) => setFreeShipping(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                    <Button onClick={() => updateSettingsMutation.mutate(freeShipping)} disabled={updateSettingsMutation.isPending}>
                        {updateSettingsMutation.isPending ? <LoaderCircle className="animate-spin h-5 w-5"/> : 'שמור'}
                    </Button>
                </div>
            </div>

            {/* Global DELIVERY Dates */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">ניהול תאריכי משלוחים (גלובלי)</h2>
                <div className="flex items-end gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium">הוסף תאריך חדש</label>
                        <input type="date" value={newGlobalDate} onChange={(e) => setNewGlobalDate(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                    <Button onClick={() => addDateMutation.mutate(newGlobalDate)} disabled={!newGlobalDate || addDateMutation.isPending}>הוסף</Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {data?.dates.map(d => (
                        <div key={d._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-mono">{new Date(d.date).toLocaleDateString('he-IL', { timeZone: 'UTC' })}</span>
                            <button onClick={() => deleteDateMutation.mutate(d._id)} className="text-red-500"><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Delivery Zones */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">ניהול אזורי משלוח</h2>
                <div className="space-y-4">
                    {deliveryZones?.map(zone => (
                         <div key={zone._id} className="p-4 border rounded-md">
                            <h3 className="font-bold flex items-center gap-2"><Truck size={20}/> {zone.name}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mt-2">
                                <div>
                                    <label className="block text-sm font-medium">מחיר משלוח (₪)</label>
                                    <input type="number" value={centerEdits[zone._id]?.price ?? ''} onChange={e => handleCenterChange(zone._id, 'price', e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
                                </div>
                                {zone.name === 'אזורים נבחרים' && (
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium">ערים זכאיות (מופרד בפסיק)</label>
                                        <input type="text" value={centerEdits[zone._id]?.cities ?? ''} onChange={e => handleCenterChange(zone._id, 'cities', e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
                                    </div>
                                )}
                                <div className={zone.name === 'אזורים נבחרים' ? '' : "md:col-start-3"}>
                                    <Button onClick={() => handleSaveZone(zone._id)} disabled={updateCenterMutation.isPending && updateCenterMutation.variables?.id === zone._id}>
                                        {updateCenterMutation.isPending && updateCenterMutation.variables?.id === zone._id ? <LoaderCircle className="animate-spin"/> : 'שמור שינויים'}
                                    </Button>
                                </div>
                            </div>
                         </div>
                    ))}
                </div>
            </div>

            {/* Pickup Points */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">ניהול נקודות איסוף</h2>
                <div className="p-4 border-dashed border-2 rounded-md space-y-3 mb-6">
                     <h3 className="font-medium">הוספת נקודה חדשה</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" value={pickupName} onChange={e => setPickupName(e.target.value)} placeholder="שם הנקודה" className="w-full p-2 border rounded-md" />
                        <input type="text" value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} placeholder="כתובת מלאה" className="w-full p-2 border rounded-md md:col-span-2" />
                     </div>
                     <Button onClick={() => addPickupMutation.mutate({ name: pickupName, address: pickupAddress, type: 'Pickup' })} disabled={!pickupName || !pickupAddress || addPickupMutation.isPending}>
                        <PlusCircle size={16} className="ml-2"/> הוסף נקודה
                     </Button>
                </div>
                <div className="space-y-4 mt-6">
                    {pickupPoints?.map(point => (
                        <div key={point._id} className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold flex items-center gap-2"><Package size={16}/> {point.name}</p>
                                    <p className="text-sm text-gray-600 pr-6">{point.address}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Switch checked={point.isActive} onCheckedChange={checked => updateCenterMutation.mutate({id: point._id, data: { isActive: checked }})}/>
                                    <button onClick={() => deletePickupMutation.mutate(point._id)} className="text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <h4 className="text-sm font-medium mb-2">תאריכים זמינים לאיסוף מנקודה זו:</h4>
                                <div className="flex items-end gap-2 mb-2">
                                    <input 
                                        type="date" 
                                        value={centerEdits[point._id]?.newDate || ''}
                                        onChange={e => handleCenterChange(point._id, 'newDate', e.target.value)}
                                        className="w-full mt-1 p-2 border rounded-md" 
                                    />
                                    <Button size="sm" onClick={() => handleAddPickupDate(point._id)}>הוסף תאריך</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(centerEdits[point._id]?.availableDates || []).map(date => (
                                        <div key={date} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1.5 rounded-full flex items-center">
                                            {new Date(date).toLocaleDateString('he-IL', { timeZone: 'UTC' })}
                                            <button onClick={() => handleRemovePickupDate(point._id, date)} className="mr-2 text-blue-600 hover:text-blue-800">&times;</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsPage;