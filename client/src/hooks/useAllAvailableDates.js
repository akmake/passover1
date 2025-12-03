import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import api from '@/api';

// פונקציות API לשליפת שני סוגי התאריכים מהנתיבים הציבוריים
const fetchDeliveryOptions = async () => (await api.get('/api/delivery-options')).data;
const fetchPublicDates = async () => (await api.get('/api/delivery-options/dates')).data;

export function useAllAvailableDates() {
  const { data: deliveryOptions = [], isLoading: isLoadingOptions } = useQuery({
    queryKey: ['allDeliveryOptionsForHook'],
    queryFn: fetchDeliveryOptions,
  });

  const { data: globalDates = [], isLoading: isLoadingGlobal } = useQuery({
    queryKey: ['publicDeliveryDatesForHook'],
    queryFn: fetchPublicDates,
  });

  const availableDates = useMemo(() => {
    // 1. איסוף תאריכים מנקודות איסוף
    const centerDates = deliveryOptions.flatMap(option => option.availableDates);
    
    // 2. איחוד עם התאריכים הגלובליים
    const allDates = [...globalDates, ...centerDates];

    // 3. סינון כפילויות ומיון
    const uniqueDates = [...new Set(allDates)];
    return uniqueDates.sort((a, b) => new Date(a) - new Date(b));
  }, [deliveryOptions, globalDates]);

  return {
    availableDates,
    isLoading: isLoadingOptions || isLoadingGlobal,
  };
}