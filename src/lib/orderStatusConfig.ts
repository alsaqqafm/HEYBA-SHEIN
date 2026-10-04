import type { Order, OrderStatus, OrderStatusHistoryItem } from '../types';

export interface StatusConfig {
  key: OrderStatus;
  label: string;
  desc: string;
  color: string;
  stepNumber: number; // For progression tracking
}

export const MAIN_STATUS_STEPS: StatusConfig[] = [
  { key: 'NEW', label: 'تم استلام الطلب', desc: 'تم استلام طلبك وجاري إدارته في النظام', color: 'sky', stepNumber: 1 },
  { key: 'UNDER_REVIEW', label: 'جارٍ التحقق / قيد المراجعة', desc: 'جاري مراجعة التحويل المالي وتأكيد بيانات التوصيل', color: 'amber', stepNumber: 2 },
  { key: 'CONFIRMED', label: 'تم تأكيد الطلب', desc: 'تم تأكيد دفع الفاتورة واعتماد الطلب رسمياً', color: 'emerald', stepNumber: 3 },
  { key: 'PREPARING', label: 'جاري التجهيز', desc: 'جاري جهيز الشحنة وتغليف المنتجات بالمركز', color: 'indigo', stepNumber: 4 },
  { key: 'PREPARED', label: 'تم تجهيز الطلب', desc: 'المنتجات جاهزة للتسليم لشركة الشحن', color: 'purple', stepNumber: 5 },
  { key: 'SENT_TO_SHIPPING', label: 'تم إرساله إلى شركة التوصيل', desc: 'تم تسليم الشحنة لمقر شركة التوصيل', color: 'violet', stepNumber: 6 },
  { key: 'WITH_AGENT', label: 'مع مندوب التوصيل', desc: 'الشحنة مع مندوب التوصيل الميداني', color: 'blue', stepNumber: 7 },
  { key: 'IN_TRANSIT', label: 'في الطريق إلى العميل', desc: 'المندوب في الطريق للوصول إلى عنوان التسليم', color: 'amber', stepNumber: 8 },
  { key: 'DELIVERED', label: 'تم التسليم', desc: 'تم تسليم الطلب بنجاح للعميل', color: 'emerald', stepNumber: 9 },
  { key: 'COMPLETED', label: 'تم إغلاق الطلب / مكتمل', desc: 'اكتملت جميع المراحل وتم منح النقاط المكتسبة', color: 'emerald', stepNumber: 10 },
];

export const SPECIAL_STATUSES: Record<string, { label: string; desc: string; color: string }> = {
  REJECTED: { label: 'مرفوض', desc: 'تم رفض الطلب لعدم صحة المستند أو انعدام الكمية', color: 'rose' },
  CANCELLED: { label: 'ملغي', desc: 'تم إلغاء الطلب من قِبل العميل أو الإدارة', color: 'rose' },
};

// Normalized Map for Status Resolution
export const getOrderStatusInfo = (status: OrderStatus): { label: string; desc: string; color: string; stepNumber: number } => {
  // Alias normalize
  let normalized: OrderStatus = status;
  if (status === ('PENDING_PAYMENT' as any)) normalized = 'UNDER_REVIEW';
  if (status === ('PAYMENT_CONFIRMED' as any)) normalized = 'CONFIRMED';
  if (status === ('READY' as any)) normalized = 'PREPARED';

  const step = MAIN_STATUS_STEPS.find((s) => s.key === normalized);
  if (step) return step;

  const special = SPECIAL_STATUSES[normalized];
  if (special) return { ...special, stepNumber: -1 };

  return { label: status, desc: '', color: 'slate', stepNumber: 0 };
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
  return getOrderStatusInfo(status).label;
};

// Strict Status Transition Guard Validation (Rules 1-10)
export const validateStatusTransition = (
  order: Order,
  newStatus: OrderStatus
): { allowed: boolean; reason?: string } => {
  let normalizedCurrent: OrderStatus = order.status;
  if (order.status === ('PENDING_PAYMENT' as any)) normalizedCurrent = 'UNDER_REVIEW';
  if (order.status === ('PAYMENT_CONFIRMED' as any)) normalizedCurrent = 'CONFIRMED';
  if (order.status === ('READY' as any)) normalizedCurrent = 'PREPARED';

  let normalizedNew: OrderStatus = newStatus;
  if (newStatus === ('PENDING_PAYMENT' as any)) normalizedNew = 'UNDER_REVIEW';
  if (newStatus === ('PAYMENT_CONFIRMED' as any)) normalizedNew = 'CONFIRMED';
  if (newStatus === ('READY' as any)) normalizedNew = 'PREPARED';

  const currentStep = getOrderStatusInfo(normalizedCurrent);
  const targetStep = getOrderStatusInfo(normalizedNew);

  // Rule 1: Strict Sequential Step Progression for main 10 steps
  if (currentStep.stepNumber > 0 && targetStep.stepNumber > 0) {
    if (targetStep.stepNumber > currentStep.stepNumber + 1) {
      const nextExpected = MAIN_STATUS_STEPS.find((s) => s.stepNumber === currentStep.stepNumber + 1);
      return {
        allowed: false,
        reason: `❌ لا يمكن القفز فوق المراحل! المرحلة التالية المسموحة بعد (${currentStep.label}) هي (${nextExpected?.label || ''}).`,
      };
    }
  }

  // Rule 2: Cannot change status to SENT_TO_SHIPPING without an assigned shipping company!
  if (normalizedNew === 'SENT_TO_SHIPPING' && !order.shipping_company_id) {
    return {
      allowed: false,
      reason: '⚠️ لا يمكن الانتقال إلى (تم إرساله إلى شركة التوصيل) بدون تعيين شركة توصيل أولاً.',
    };
  }

  // Rule 3: Cannot change status to WITH_AGENT or IN_TRANSIT without an assigned delivery agent!
  if ((normalizedNew === 'WITH_AGENT' || normalizedNew === 'IN_TRANSIT') && !order.delivery_agent_id) {
    return {
      allowed: false,
      reason: `⚠️ لا يمكن الانتقال إلى (${targetStep.label}) بدون تعيين مندوب توصيل أولاً.`,
    };
  }

  // Rule 4: Cannot transition from CANCELLED/REJECTED directly to active delivery/operational steps
  if (
    (normalizedCurrent === 'CANCELLED' || normalizedCurrent === 'REJECTED') &&
    ['PREPARING', 'PREPARED', 'SENT_TO_SHIPPING', 'WITH_AGENT', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(normalizedNew)
  ) {
    return {
      allowed: false,
      reason: '⚠️ لا يمكن تحويل طلب (ملغي) أو (مرفوض) مباشرة إلى مراحل التجهيز أو الشحن أو التوصيل.',
    };
  }

  return { allowed: true };
};

// Append Status Change Record to Order History using order_status_history
export const addStatusHistoryToOrder = (
  order: Order,
  newStatus: OrderStatus,
  notes?: string,
  createdBy?: string
): Order => {
  const currentHistory = order.order_status_history || order.status_history || [];
  const label = getOrderStatusLabel(newStatus);

  const historyItem: OrderStatusHistoryItem = {
    id: `sth-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    order_id: order.id,
    status: newStatus,
    status_label: label,
    notes: notes || `تغيير حالة الطلب إلى ${label}`,
    created_by: createdBy || 'الإدارة',
    created_at: new Date().toISOString(),
  };

  const updatedHistory = [...currentHistory, historyItem];

  return {
    ...order,
    status: newStatus,
    order_status_history: updatedHistory,
    status_history: updatedHistory, // Backward compatible alias
    updated_at: new Date().toISOString(),
  };
};
