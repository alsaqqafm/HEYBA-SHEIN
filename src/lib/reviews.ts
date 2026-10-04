import type { OrderReview } from '../types';
import { getStoredOrders, saveOrderToStore } from './orders';

const REVIEWS_STORAGE_KEY = 'heyba_order_reviews_v1';

export const getStoredReviews = (): Record<string, OrderReview> => {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Error loading reviews:', e);
    return {};
  }
};

export const getReviewByOrderId = (orderId: string): OrderReview | null => {
  const all = getStoredReviews();
  return all[orderId] || null;
};

export const getAllReviewsList = (): OrderReview[] => {
  const all = getStoredReviews();
  return Object.values(all).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

export const submitOrderReview = (
  orderId: string,
  userId: string,
  customerName: string,
  rating: number,
  comment: string,
  deliveryRating?: number
): OrderReview => {
  const newReview: OrderReview = {
    id: `rev-${Date.now()}`,
    order_id: orderId,
    user_id: userId,
    customer_name: customerName,
    rating: Math.max(1, Math.min(5, rating)),
    delivery_rating: deliveryRating ? Math.max(1, Math.min(5, deliveryRating)) : undefined,
    comment: comment.trim(),
    created_at: new Date().toISOString(),
  };

  const all = getStoredReviews();
  all[orderId] = newReview;
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(all));

  // Link to order object in orders store
  const orders = getStoredOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    const updatedOrder = { ...order, review: newReview };
    saveOrderToStore(updatedOrder);
  }

  return newReview;
};
