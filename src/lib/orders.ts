import type { Order } from '../types';

const LOCAL_STORAGE_ORDERS_KEY = 'heyba_shein_orders_v1';

export const getStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored orders:', e);
    return [];
  }
};

export const saveOrderToStore = (order: Order): void => {
  try {
    const existing = getStoredOrders();
    // Prepend new order, avoiding duplicates by id or order_number
    const filtered = existing.filter(
      (o) => o.id !== order.id && o.order_number !== order.order_number
    );
    const updated = [order, ...filtered];
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving order to store:', e);
  }
};

export const getUserOrdersFromStore = (userId: string): Order[] => {
  const all = getStoredOrders();
  return all.filter((o) => o.user_id === userId);
};
