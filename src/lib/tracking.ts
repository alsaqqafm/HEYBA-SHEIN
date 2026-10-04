import type { Order, OrderTracking } from '../types';

const TRACKING_STORAGE_KEY = 'heyba_order_trackings_v1';

export const getStoredOrderTrackings = (): Record<string, OrderTracking> => {
  try {
    const raw = localStorage.getItem(TRACKING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Error loading stored order trackings:', err);
    return {};
  }
};

export const getStoredOrderTrackingByOrderId = (orderId: string): OrderTracking | null => {
  const all = getStoredOrderTrackings();
  return all[orderId] || null;
};

export const saveOrderTrackingToStore = (tracking: OrderTracking): void => {
  try {
    const all = getStoredOrderTrackings();
    all[tracking.order_id] = tracking;
    localStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Error saving order tracking:', err);
  }
};

export interface OrderTrackingInfo {
  statusMessage: string;
  isLocationAvailable: boolean;
  tracking: OrderTracking | null;
  agentName?: string;
  agentPhone?: string;
  companyName?: string;
}

export const getTrackingInfoForOrder = (order: Order): OrderTrackingInfo => {
  const storedTracking = order.tracking || getStoredOrderTrackingByOrderId(order.id);

  const hasRealCoordinates =
    typeof storedTracking?.latitude === 'number' &&
    typeof storedTracking?.longitude === 'number' &&
    !isNaN(storedTracking.latitude) &&
    !isNaN(storedTracking.longitude);

  let statusMessage = '';
  let isLocationAvailable = false;

  switch (order.status) {
    case 'SENT_TO_SHIPPING':
      statusMessage = 'تم إرسال الطلب إلى شركة التوصيل، بانتظار استلامه من المندوب.';
      isLocationAvailable = hasRealCoordinates;
      break;

    case 'WITH_AGENT':
      if (hasRealCoordinates) {
        statusMessage = 'الطلب مع مندوب التوصيل - جاري الانتقال.';
        isLocationAvailable = true;
      } else {
        statusMessage = 'الطلب مع مندوب التوصيل (موقع المندوب غير متاح حالياً).';
        isLocationAvailable = false;
      }
      break;

    case 'IN_TRANSIT':
      if (hasRealCoordinates) {
        statusMessage = 'المندوب في الطريق إلى عنوان التوصيل المحدد.';
        isLocationAvailable = true;
      } else {
        statusMessage = 'الطلب في الطريق (موقع المندوب غير متاح حالياً).';
        isLocationAvailable = false;
      }
      break;

    case 'DELIVERED':
    case 'COMPLETED':
      statusMessage = 'تم تسليم الطلب بنجاح للعميل.';
      isLocationAvailable = false; // Closed tracking after delivery
      break;

    case 'CANCELLED':
    case 'REJECTED':
      statusMessage = 'تم إغلاق تتبع الطلب بسبب إلغاء أو رفض الطلب.';
      isLocationAvailable = false;
      break;

    default:
      statusMessage = 'الطلب قيد المعالجة والتجهيز قبل التسليم لشركة الشحن.';
      isLocationAvailable = false;
      break;
  }

  return {
    statusMessage,
    isLocationAvailable,
    tracking: storedTracking,
    agentName: order.delivery_agent_name,
    agentPhone: order.delivery_agent_phone,
    companyName: order.shipping_company_name,
  };
};
