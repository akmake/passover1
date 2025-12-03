// client/src/hooks/useCouponManager.js
import { useState, useMemo } from 'react';
import api from '@/api';

const verifyCouponCode = async (code) => {
  const { data } = await api.post('/api/coupons/verify', { code }, { withCredentials: true });
  return data;
};

export function useCouponManager(itemsPrice, isAuthenticated) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode) return;
    if (!isAuthenticated) {
      setCouponError('יש להתחבר לחשבון כדי להשתמש בקופון.');
      return;
    }

    setIsVerifying(true);
    try {
      const data = await verifyCouponCode(couponCode);
      if (itemsPrice < data.minPurchase) {
        setCouponError(`הקופון תקף להזמנות מעל ₪${data.minPurchase}`);
        setAppliedCoupon(null); // Make sure no coupon is applied if condition fails
      } else {
        setAppliedCoupon(data);
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'שגיאה באימות הקופון');
      setAppliedCoupon(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const discountAmount = useMemo(() => {
    if (!appliedCoupon || itemsPrice < appliedCoupon.minPurchase) return 0;
    const discount =
      appliedCoupon.discountType === 'percentage'
        ? (itemsPrice * appliedCoupon.discountValue) / 100
        : appliedCoupon.discountValue;
    return Math.min(discount, itemsPrice);
  }, [appliedCoupon, itemsPrice]);

  const resetCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  return {
    couponCode,
    setCouponCode,
    appliedCoupon,
    couponError,
    discountAmount,
    handleApplyCoupon,
    resetCoupon,
    isVerifying,
  };
}