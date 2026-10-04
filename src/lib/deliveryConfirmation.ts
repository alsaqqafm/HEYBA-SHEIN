import type { Order, OrderStatusHistoryItem } from '../types';
import { getStoredOrders, saveOrderToStore } from './orders';
import { apiAddPointsTransaction } from './supabase';

export interface WordCountResult {
  valid: boolean;
  wordCount: number;
  message?: string;
}

/**
 * Counts words by trimming and splitting across whitespace tokens
 * Strict 4-words maximum rule for customer delivery report note
 */
export const countWords = (text: string): number => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
};

export const validateDeliveryNoteWordCount = (note: string): WordCountResult => {
  const count = countWords(note);
  if (count > 4) {
    return {
      valid: false,
      wordCount: count,
      message: `⚠️ تم تجاوز الحد المسموح به للملاحظة (${count}/4 كلمات). الحد الأقصى 4 كلمات فقط.`,
    };
  }
  return {
    valid: true,
    wordCount: count,
  };
};

export interface DeliveryConfirmationSubmissionResult {
  success: boolean;
  order?: Order;
  error?: string;
  pointsAwarded?: number;
}

/**
 * Handles customer delivery confirmation / report
 * Rules:
 * - Only the owner user can submit
 * - Order must be in DELIVERED or COMPLETED state
 * - Cannot submit more than once
 * - Word count strictly capped at 4 words
 * - Audit log recorded in order_status_history
 * - Points credited only on confirmed=true, exactly once
 */
export const submitCustomerDeliveryConfirmation = async (
  orderId: string,
  userId: string,
  confirmed: boolean,
  note?: string
): Promise<DeliveryConfirmationSubmissionResult> => {
  const orders = getStoredOrders();
  const targetOrder = orders.find((o) => o.id === orderId);

  if (!targetOrder) {
    return { success: false, error: 'الطلب غير موجود في النظام.' };
  }

  // Security Ownership Check
  if (targetOrder.user_id !== userId) {
    return { success: false, error: 'عذراً، لا تملك الصلاحية لتأكيد استلام هذا الطلب.' };
  }

  // Check state eligibility
  if (targetOrder.status !== 'DELIVERED' && targetOrder.status !== 'COMPLETED') {
    return {
      success: false,
      error: 'تأكيد الاستلام متاح فقط عند وصول حالة الطلب إلى مرحلة التسليم (تم التسليم).',
    };
  }

  // Prevent duplicate confirmation submissions
  if (targetOrder.delivery_confirmed !== undefined) {
    return {
      success: false,
      error: 'تم تسجيل حالة تأكيد الاستلام لهذا الطلب مسبقاً ولا يمكن إعادة التأكيد.',
    };
  }

  // Validate Note word count
  const cleanNote = note?.trim() || '';
  if (cleanNote) {
    const wordValidation = validateDeliveryNoteWordCount(cleanNote);
    if (!wordValidation.valid) {
      return { success: false, error: wordValidation.message };
    }
  }

  const now = new Date().toISOString();

  // Create audit history entry in order_status_history
  const historyItem: OrderStatusHistoryItem = {
    id: `sth-confirm-${Date.now()}`,
    order_id: targetOrder.id,
    status: targetOrder.status,
    status_label: confirmed ? 'تأكيد استلام الطلب' : 'بلاغ عدم استلام الطلب',
    notes: confirmed
      ? 'أكد العميل استلام الشحنة بنجاح.'
      : `أبلغ العميل بعدم استلام الشحنة.${cleanNote ? ` (الملاحظة: ${cleanNote})` : ''}`,
    created_by: targetOrder.customer_name || 'العميل',
    created_at: now,
  };

  const existingHistory = targetOrder.order_status_history || targetOrder.status_history || [];
  const updatedHistory = [...existingHistory, historyItem];

  let shouldAwardPoints = false;
  let pointsAwarded = 0;

  // Points Eligibility Condition:
  // 1. Order reached DELIVERED / COMPLETED
  // 2. Customer confirmed: confirmed = true
  // 3. Points not already awarded (prevent double counting)
  if (confirmed && !targetOrder.points_awarded && targetOrder.points_earned > 0) {
    shouldAwardPoints = true;
    pointsAwarded = targetOrder.points_earned;
  }

  const updatedOrder: Order = {
    ...targetOrder,
    delivery_confirmed: confirmed,
    delivery_confirmed_at: now,
    delivery_confirmation_note: cleanNote || undefined,
    delivery_confirmation_user_id: userId,
    points_awarded: shouldAwardPoints ? true : targetOrder.points_awarded,
    order_status_history: updatedHistory,
    status_history: updatedHistory,
    updated_at: now,
  };

  // Save to persistent storage
  saveOrderToStore(updatedOrder);

  // If points awarded, record in points audit ledger if Supabase is active
  if (shouldAwardPoints) {
    try {
      await apiAddPointsTransaction(
        userId,
        pointsAwarded,
        'EARNED_ORDER',
        `نقاط مكتسبة عن تأكيد استلام الطلب ${targetOrder.order_number}`,
        targetOrder.id
      );
    } catch (e) {
      console.warn('Local points transaction recorded (Supabase offline/mock)');
    }
  }

  return {
    success: true,
    order: updatedOrder,
    pointsAwarded: shouldAwardPoints ? pointsAwarded : 0,
  };
};
