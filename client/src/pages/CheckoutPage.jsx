// client/src/pages/CheckoutPage.jsx

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import api from '@/api';
import { useTranslation } from 'react-i18next'; // ייבוא ספריית התרגום
import {
  LoaderCircle,
  Truck,
  Package,
  Tag,
  CheckCircle,
  Star,
  MapPin,
  Calendar,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useDeliveryCalculator } from '@/hooks/useDeliveryCalculator';
import { useCouponManager } from '@/hooks/useCouponManager';

// --- API ---
const fetchDeliveryOptions = async () => (await api.get('/api/delivery-options')).data;
const fetchPublicDates = async () => (await api.get('/api/delivery-options/dates')).data;
const fetchPublicSettings = async () => (await api.get('/api/settings/public')).data;

const CheckoutPage = () => {
  const { t } = useTranslation(); // הפעלת פונקציית התרגום
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user, updateUser, isAuthenticated } = useAuthStore();

  // --- Queries ---
  const { data: deliveryOptions = [], isLoading: isLoadingOptions } = useQuery({
    queryKey: ['deliveryOptions'],
    queryFn: fetchDeliveryOptions,
  });
  const { data: globalAvailableDates = [], isLoading: isLoadingDates } = useQuery({
    queryKey: ['publicDeliveryDates'],
    queryFn: fetchPublicDates,
  });
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: fetchPublicSettings,
  });

  // --- Form State ---
  const [fulfillmentMethod, setFulfillmentMethod] = useState('');
  const [shippingDetails, setShippingDetails] = useState({
    customerName: '',
    phone: '',
    email: '',
    city: '',
    streetAddress: '',
    apartment: '',
    floor: '',
  });
  const [selectedPickupId, setSelectedPickupId] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // --- User Details Effect ---
  useEffect(() => {
    if (user) {
      setShippingDetails((prev) => ({
        ...prev,
        customerName: user.name || '',
        email: user.email || '',
        ...(user.shippingDetails || {}),
      }));
    }
  }, [user]);

  // --- Derived Data ---
  const itemsPrice = useMemo(() => items.reduce((total, item) => total + item.price * (item.quantity || 1), 0), [items]);

  const { pickupLocations, deliveryZones, specialZone } = useMemo(() => {
    const activeOptions = deliveryOptions.filter((opt) => opt.isActive);
    return {
      pickupLocations: activeOptions.filter((opt) => opt.type === 'Pickup'),
      deliveryZones: activeOptions.filter((opt) => opt.type === 'DeliveryZone'),
      specialZone: activeOptions.find((opt) => opt.name === 'אזורים נבחרים'),
    };
  }, [deliveryOptions]);

  const mainPickupPoint = useMemo(() => pickupLocations[0], [pickupLocations]);

  useEffect(() => {
    if (fulfillmentMethod === 'pickup' && mainPickupPoint) {
      setSelectedPickupId(mainPickupPoint._id);
    }
  }, [fulfillmentMethod, mainPickupPoint]);

  const isSpecialZone = useMemo(() => {
      if (fulfillmentMethod === 'delivery' && shippingDetails.city && specialZone?.cities.length) {
        return specialZone.cities.some(
          (city) => city.trim() !== '' && shippingDetails.city.trim().toLowerCase().includes(city.trim().toLowerCase())
        );
      }
      return false;
  }, [shippingDetails.city, specialZone, fulfillmentMethod]);

  const availableDates = useMemo(() => {
    if (fulfillmentMethod === 'delivery') return globalAvailableDates;
    if (fulfillmentMethod === 'pickup' && selectedPickupId) {
      const point = pickupLocations.find((p) => p._id === selectedPickupId);
      return point?.availableDates || [];
    }
    return [];
  }, [fulfillmentMethod, selectedPickupId, globalAvailableDates, pickupLocations]);
  
  useEffect(() => {
    if (!deliveryDate) return;
    if (fulfillmentMethod === 'delivery' && !globalAvailableDates.includes(deliveryDate)) {
      setDeliveryDate('');
    }
    if (fulfillmentMethod === 'pickup' && selectedPickupId) {
      const point = pickupLocations.find((p) => p._id === selectedPickupId);
      const pointDates = point?.availableDates || [];
      if (!pointDates.includes(deliveryDate)) setDeliveryDate('');
    }
  }, [fulfillmentMethod, selectedPickupId, globalAvailableDates, pickupLocations, deliveryDate]);

  // --- Custom Hooks for Business Logic ---
  const shippingCost = useDeliveryCalculator(fulfillmentMethod, itemsPrice, deliveryZones, specialZone, selectedZoneId, isSpecialZone, settings);
  const {
    couponCode,
    setCouponCode,
    appliedCoupon,
    couponError,
    discountAmount,
    handleApplyCoupon,
    resetCoupon,
    isVerifying,
  } = useCouponManager(itemsPrice, isAuthenticated);
  
  const totalPrice = itemsPrice - discountAmount + shippingCost;

  // --- Handlers ---
  const placeOrderHandler = async () => {
    setError('');
    if (!fulfillmentMethod) {
      setError(t('checkout.errors.chooseMethod'));
      return;
    }
    if (!deliveryDate) {
      setError(t('checkout.errors.chooseDate'));
      return;
    }
    if (!shippingDetails.customerName || !shippingDetails.phone || !shippingDetails.email) {
      setError(t('checkout.errors.fillDetails'));
      return;
    }
    if (fulfillmentMethod === 'delivery') {
      const hasZone = isSpecialZone || !!selectedZoneId;
      if (!hasZone || !shippingDetails.city || !shippingDetails.streetAddress) {
        setError(t('checkout.errors.fillAddress'));
        return;
      }
    }
    if (fulfillmentMethod === 'pickup' && !selectedPickupId) {
      setError(t('checkout.errors.choosePickupPoint'));
      return;
    }

    try {
      const orderData = {
        orderItems: items,
        itemsPrice,
        shippingPrice: shippingCost,
        discountAmount,
        couponCode: appliedCoupon?.code,
        totalPrice,
        shippingDetails,
        deliveryDate,
        notes,
        fulfillmentType: fulfillmentMethod === 'delivery' ? 'Delivery' : 'Pickup',
        fulfillmentDetails:
          fulfillmentMethod === 'delivery'
            ? deliveryZones.find((z) => z._id === selectedZoneId)?.name ||
              (isSpecialZone ? 'אזורים נבחרים' : 'לא ידוע')
            : pickupLocations.find((p) => p._id === selectedPickupId)?.name,
      };

      const { data: createdOrder } = await api.post('/api/orders', orderData, {
        withCredentials: true,
      });

      const { customerName, email, ...addressDetails } = shippingDetails;
      updateUser({ shippingDetails: addressDetails });

      clearCart();
      navigate(`/order-success/${createdOrder._id}`);
    } catch (err) {
      setError(err.response?.data?.message || t('checkout.errors.orderFailed'));
    }
  };

  const isLoading = isLoadingOptions || isLoadingDates || isLoadingSettings;

  // --- UI ---
  if (isLoading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="relative">
          <LoaderCircle className="h-16 w-16 animate-spin text-blue-600" />
          <div className="absolute inset-0 rounded-full bg-blue-600/10 blur-xl" />
        </div>
      </div>
    );

  const freeShippingThreshold = settings?.freeShippingThreshold || 999999;
  const showFreeShip = fulfillmentMethod === 'delivery' && itemsPrice >= freeShippingThreshold;
  const mustChooseZonePrice = fulfillmentMethod === 'delivery' && !isSpecialZone && !selectedZoneId && !showFreeShip;

  const progress =
    !fulfillmentMethod ? 10 : !deliveryDate ? 40 : fulfillmentMethod === 'delivery'
      ? (!shippingDetails.city || (!isSpecialZone && !selectedZoneId) ? 70 : 85)
      : 85;

  return (
    <div className="relative">
      {/* Hero Header */}
      <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-tr from-gray-900 via-slate-800 to-blue-900 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">{t('checkout.title')}</h1>
            <p className="mt-1 text-sm text-blue-200">
              {t('checkout.secure')}{' '}
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" /> TLS
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 opacity-80" />
            <span className="opacity-90">
              {deliveryDate
                ? new Date(deliveryDate).toLocaleDateString('he-IL', { timeZone: 'UTC' })
                : t('checkout.noDateSelected')}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5 h-2 rounded-full bg-white/15">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_380px]">
        {/* Left - Form */}
        <div className="space-y-8">
          {/* Step 1: Fulfillment */}
          <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold">{t('checkout.fulfillmentMethod')}</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFulfillmentMethod('delivery')}
                className={`group rounded-xl border-2 p-5 transition-all ${
                  fulfillmentMethod === 'delivery'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Truck className="mx-auto mb-2 h-7 w-7 text-blue-700" />
                <div className="text-center font-medium">{t('checkout.delivery')}</div>
                <div className="mt-1 text-center text-xs text-slate-500">{t('checkout.toYourDoor')}</div>
              </button>
              <button
                onClick={() => setFulfillmentMethod('pickup')}
                className={`group rounded-xl border-2 p-5 transition-all ${
                  fulfillmentMethod === 'pickup'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Package className="mx-auto mb-2 h-7 w-7 text-blue-700" />
                <div className="text-center font-medium">{t('checkout.pickup')}</div>
                <div className="mt-1 text-center text-xs text-slate-500">{t('checkout.fromPickupPoint')}</div>
              </button>
            </div>
          </section>

          {/* Step 2: Date */}
          {fulfillmentMethod && (
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t('checkout.selectDate')}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {availableDates.length === 0 && (
                  <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-4 text-center text-slate-500">
                    {t('checkout.noDatesAvailable')}
                  </div>
                )}
                {availableDates.map((d) => {
                  const label = new Date(d).toLocaleDateString('he-IL', { timeZone: 'UTC' });
                  const active = deliveryDate === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setDeliveryDate(d)}
                      className={`rounded-xl border p-3 transition-all ${
                        active
                          ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm font-medium">{label}</div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Step 3: Details */}
          {fulfillmentMethod && (
            <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-lg font-semibold">{t('checkout.details.title')}</h2>
              </div>

              {fulfillmentMethod === 'delivery' ? (
                <>
                  <div className="mb-6 rounded-2xl border-2 border-blue-600/30 bg-blue-50/50 p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-700" />
                        <div className="text-base font-semibold text-slate-800">{t('checkout.details.deliveryZone')}</div>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 ring-1 ring-blue-200">
                          {t('checkout.details.required')}
                        </span>
                        {isSpecialZone && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80">
                            <Star className="h-3.5 w-3.5" />
                            {t('checkout.details.specialZone')}
                          </span>
                        )}
                      </div>
                    </div>

                    {!isSpecialZone && (
                      <>
                        {deliveryZones.filter((z) => z.name !== 'אזורים נבחרים').length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-slate-500">
                            {t('checkout.details.noZonesAvailable')}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {deliveryZones
                              .filter((z) => z.name !== 'אזורים נבחרים')
                              .map((z) => {
                                const active = selectedZoneId === z._id;
                                return (
                                  <button
                                    key={z._id}
                                    onClick={() => setSelectedZoneId(z._id)}
                                    className={`rounded-full px-4 py-2 text-sm ring-1 transition-all ${
                                      active
                                        ? 'bg-blue-600 text-white ring-blue-600'
                                        : 'bg-white text-slate-700 ring-slate-200 hover:ring-slate-300'
                                    }`}
                                  >
                                    {z.name}
                                  </button>
                                );
                              })}
                          </div>
                        )}
                        {!selectedZoneId && !showFreeShip && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-amber-700">
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input label={t('form.fullName')} value={shippingDetails.customerName} onChange={(v) => setShippingDetails((p) => ({ ...p, customerName: v }))}/>
                    <Input label={t('form.phone')} value={shippingDetails.phone} onChange={(v) => setShippingDetails((p) => ({ ...p, phone: v }))}/>
                    <Input label={t('form.email')} type="email" className="sm:col-span-2" value={shippingDetails.email} onChange={(v) => setShippingDetails((p) => ({ ...p, email: v }))}/>
                    <Input label={t('form.city')} value={shippingDetails.city} onChange={(v) => setShippingDetails((p) => ({ ...p, city: v }))}/>
                    <Input label={t('form.streetAddress')} value={shippingDetails.streetAddress} onChange={(v) => setShippingDetails((p) => ({ ...p, streetAddress: v }))}/>
                    <Input label={t('form.apartment')} value={shippingDetails.apartment} onChange={(v) => setShippingDetails((p) => ({ ...p, apartment: v }))}/>
                    <Input label={t('form.floor')} value={shippingDetails.floor} onChange={(v) => setShippingDetails((p) => ({ ...p, floor: v }))}/>
                    <Textarea label={t('form.deliveryNotes')} className="sm:col-span-2" placeholder={t('form.deliveryNotesPlaceholder')} value={notes} onChange={(v) => setNotes(v)}/>
                  </div>
                </>
              ) : (
                <>
                  {mainPickupPoint && (
                    <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="mb-1 text-sm font-semibold text-slate-800">{t('checkout.details.pickupPoint')}</div>
                      <div className="text-sm text-slate-700">{mainPickupPoint.name}</div>
                      {mainPickupPoint.address && (
                        <div className="text-xs text-slate-500">{mainPickupPoint.address}</div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input label={t('form.fullName')} value={shippingDetails.customerName} onChange={(v) => setShippingDetails((p) => ({ ...p, customerName: v }))}/>
                    <Input label={t('form.phone')} value={shippingDetails.phone} onChange={(v) => setShippingDetails((p) => ({ ...p, phone: v }))}/>
                    <Input label={t('form.email')} type="email" className="sm:col-span-2" value={shippingDetails.email} onChange={(v) => setShippingDetails((p) => ({ ...p, email: v }))}/>
                    <Textarea label={t('form.pickupNotes')} className="sm:col-span-2" placeholder={t('form.pickupNotesPlaceholder')} value={notes} onChange={(v) => setNotes(v)}/>
                  </div>
                </>
              )}
            </section>
          )}
        </div>

        {/* Right - Summary */}
        <aside className="h-fit space-y-4 md:sticky md:top-6">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold">{t('checkout.summary.title')}</h2>

            {isSpecialZone && fulfillmentMethod === 'delivery' && (
              <div className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-center font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4" /> {t('checkout.details.specialZone')}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Row label={t('checkout.summary.itemsPrice')} value={`₪${itemsPrice.toFixed(2)}`} />
              {discountAmount > 0 && (
                <Row
                  label={t('checkout.summary.couponDiscount')}
                  value={`- ₪${discountAmount.toFixed(2)}`}
                  className="text-emerald-700"
                />
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{t('checkout.summary.shippingCost')}</span>
                {showFreeShip ? (
                  <span className="font-bold text-emerald-700">{t('checkout.summary.free')}</span>
                ) : mustChooseZonePrice ? (
                  <span className="text-slate-400">—</span>
                ) : (
                  <span className="text-slate-700">₪{shippingCost.toFixed(2)}</span>
                )}
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Tag className="h-4 w-4 text-blue-700" />
                {t('checkout.coupon.title')}
              </h3>
              <div className="flex flex-col gap-2 sm:flex-row">
                {appliedCoupon ? (
                  <div className="flex w-full items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-200">
                    <span className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-bold">{t('checkout.coupon.applied', { code: appliedCoupon.code })}</span>
                    </span>
                    <button
                      onClick={resetCoupon}
                      className="text-sm text-red-600 hover:underline"
                    >
                      {t('checkout.coupon.remove')}
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder={t('checkout.coupon.placeholder')}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 transition focus:border-blue-500"
                    />
                    <Button onClick={handleApplyCoupon} variant="outline" disabled={isVerifying}>
                      {isVerifying ? <LoaderCircle className="animate-spin h-4 w-4" /> : t('checkout.coupon.apply')}
                    </Button>
                  </>
                )}
              </div>
              {couponError && <p className="mt-1 text-xs text-red-600">{couponError}</p>}
              {!!appliedCoupon && itemsPrice < appliedCoupon.minPurchase && (
                <p className="mt-1 text-xs text-amber-600">
                  {t('checkout.errors.minPurchaseRequired', { amount: appliedCoupon.minPurchase })}
                </p>
              )}
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between text-base font-bold">
                <span>{t('checkout.summary.total')}</span>
                <span>₪{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}

            <Button
              className="mt-4 w-full"
              onClick={placeOrderHandler}
              disabled={items.length === 0}
            >
              {t('checkout.payment.submit')}
            </Button>

            <div className="mt-3 text-center text-xs text-slate-500">
              {t('checkout.payment.secureNote')}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// --- Small UI helpers (Tailwind only) ---
const Row = ({ label, value, className = '' }) => (
  <div className={`flex items-center justify-between text-sm ${className}`}>
    <span className="text-slate-600">{label}</span>
    <span className="text-slate-700">{value}</span>
  </div>
);
const Input = ({ label, className = '', type = 'text', value, onChange }) => (
  <label className={`flex flex-col gap-1 ${className}`}>
    <span className="text-xs font-medium text-slate-600">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
    />
  </label>
);
const Textarea = ({ label, className = '', value, onChange, placeholder }) => (
  <label className={`flex flex-col gap-1 ${className}`}>
    <span className="text-xs font-medium text-slate-600">{label}</span>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
    />
  </label>
);

export default CheckoutPage;