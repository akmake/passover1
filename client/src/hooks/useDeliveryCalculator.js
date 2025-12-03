// client/src/hooks/useDeliveryCalculator.js
import { useState, useEffect } from 'react';

export function useDeliveryCalculator(
  fulfillmentMethod,
  itemsPrice,
  deliveryZones,
  specialZone,
  selectedZoneId,
  isSpecialZone,
  settings
) {
  const [shippingCost, setShippingCost] = useState(0);

  useEffect(() => {
    if (fulfillmentMethod !== 'delivery') {
      setShippingCost(0);
      return;
    }

    const freeShippingThreshold = settings?.freeShippingThreshold || 999999;
    if (itemsPrice >= freeShippingThreshold) {
      setShippingCost(0);
      return;
    }

    let zoneForPrice = deliveryZones.find((z) => z._id === selectedZoneId);
    if (isSpecialZone) {
      zoneForPrice = specialZone;
    }

    setShippingCost(zoneForPrice ? zoneForPrice.price : 0);
  }, [
    fulfillmentMethod,
    selectedZoneId,
    isSpecialZone,
    itemsPrice,
    deliveryZones,
    specialZone,
    settings,
  ]);

  return shippingCost;
}