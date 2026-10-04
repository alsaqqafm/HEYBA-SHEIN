import React, { useState, useEffect } from 'react';
import { FileText, Eye, Printer, UserCheck, CheckCircle2, AlertTriangle, Clock, Star } from 'lucide-react';
import type { Order, OrderStatus, ShippingCompany, DeliveryAgent } from '../../types';
import { generateInvoicePDF, printInvoice } from '../../lib/pdfGenerator';
import { apiUpdateOrderStatusAtomic } from '../../lib/supabase';
import { getStoredOrders, saveOrderToStore } from '../../lib/orders';
import { getStoredShippingCompanies } from '../../lib/shippingCompanies';
import { getStoredDeliveryAgents } from '../../lib/deliveryAgents';
import {
  validateStatusTransition,
  addStatusHistoryToOrder,
  getOrderStatusLabel,
} from '../../lib/orderStatusConfig';
import { InvoiceModal } from '../../components/InvoiceModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const INITIAL_ADMIN_ORDERS: Order[] = [
  {
    id: 'ord-101',
    order_number: 'HEYBA-2026-000001',
    user_id: 'usr-cust-01',
    customer_name: 'محمد علي أحمد',
    customer_email: 'm.ali@example.com',
    customer_phone: '771234567',
    delivery_address: 'اليمن - إب - شارع العدين - بجوار المستشفى',
    subtotal: 27000,
    discount: 0,
    delivery_fee: 1500,
    total: 28500,
    payment_method: 'JEEB',
    payment_reference: '#REF-982312',
    payment_sender_name: 'محمد علي',
    status: 'UNDER_REVIEW',
    points_earned: 270,
    created_at: '2026-10-02T12:00:00.000Z',
    items: [
      { id: '1', product_name: 'فستان أزرق ملكي فاخر للسهرات', price: 18500, quantity: 1, total: 18500 },
      { id: '2', product_name: 'حقيبة يد نسائية فاخرة', price: 8500, quantity: 1, total: 8500 },
    ],
  },
];

export const AdminOrders: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompany[]>([]);
  const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    const stored = getStoredOrders();
    const existingIds = new Set(stored.map((o) => o.id));
    const merged = [...stored, ...INITIAL_ADMIN_ORDERS.filter((o) => !existingIds.has(o.id))];
    setOrdersList(merged);
    setShippingCompanies(getStoredShippingCompanies());
    setDeliveryAgents(getStoredDeliveryAgents());
  }, []);

  const handleAssignShippingCompany = (orderId: string, companyId: string) => {
    const company = shippingCompanies.find((c) => c.id === companyId);
    setOrdersList((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated: Order = {
            ...ord,
            shipping_company_id: companyId || undefined,
            shipping_company_name: company?.name || undefined,
            shipping_company_phone: company?.phone || undefined,
            shipping_company_whatsapp: company?.whatsapp || undefined,
            shipping_company_address: company?.address || undefined,
            delivery_agent_id: undefined,
            delivery_agent_name: undefined,
            delivery_agent_phone: undefined,
            delivery_agent_whatsapp: undefined,
          };
          saveOrderToStore(updated);
          if (company) {
            showToast(`تم تعيين شركة التوصيل (${company.name}) للطلب بنجاح 🎉`);
          } else {
            showToast(`تم إزالة تعيين شركة التوصيل والمندوب من الطلب`);
          }
          return updated;
        }
        return ord;
      })
    );
  };

  const handleAssignDeliveryAgent = (orderId: string, agentId: string) => {
    const agent = deliveryAgents.find((a) => a.id === agentId);
    setOrdersList((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated: Order = {
            ...ord,
            delivery_agent_id: agentId || undefined,
            delivery_agent_name: agent?.name || undefined,
            delivery_agent_phone: agent?.phone || undefined,
            delivery_agent_whatsapp: agent?.whatsapp || undefined,
          };
          saveOrderToStore(updated);
          if (agent) {
            showToast(`تم تعيين المندوب (${agent.name}) للطلب بنجاح 🛵`);
          } else {
            showToast(`تم إزالة تعيين المندوب من الطلب`);
          }
          return updated;
        }
        return ord;
      })
    );
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const targetOrder = ordersList.find((o) => o.id === orderId);
    if (!targetOrder) return;

    // Strict Status Validation Guards (Rule A & Rule B & Rule C)
    const validation = validateStatusTransition(targetOrder, newStatus);
    if (!validation.allowed) {
      showToast(validation.reason || 'تغيير الحالة غير مسموح به في المرحلة الحالية', 'error');
      return;
    }

    try {
      await apiUpdateOrderStatusAtomic(
        orderId,
        newStatus,
        `تحديث الحالة إلى ${getOrderStatusLabel(newStatus)}`,
        user?.id || 'admin'
      );

      const updated = addStatusHistoryToOrder(
        targetOrder,
        newStatus,
        `تغيرت الحالة إلى: ${getOrderStatusLabel(newStatus)}`,
        user?.name || 'المدير'
      );

      saveOrderToStore(updated);

      setOrdersList((prev) => prev.map((ord) => (ord.id === orderId ? updated : ord)));

      if (newStatus === 'COMPLETED') {
        showToast(`تم إغلاق واكتمال الطلب ${targetOrder.order_number}! تم منح ${targetOrder.points_earned} نقطة للعميل.`, 'success');
      } else {
        showToast(`تم تحديث حالة الطلب إلى: (${getOrderStatusLabel(newStatus)})`);
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء تحديث حالة الطلب', 'error');
    }
  };

  return (
    <div className="space-y-6 text-right">
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          onOrderUpdated={(updated) => {
            setSelectedInvoiceOrder(updated);
            setOrdersList((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
          }}
        />
      )}

      <div>
        <h1 className="text-2xl font-black text-white">إدارة الطلبات والشركات والمندوبين</h1>
        <p className="text-xs text-slate-400 mt-1">تعيين شركات الشحن ومندوبي التوصيل ومراجعة التحويلات المالية</p>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-bold border-b border-slate-700">
              <tr>
                <th className="p-4">رقم الطلب</th>
                <th className="p-4">العميل والتواصل</th>
                <th className="p-4">شركة التوصيل والمندوب</th>
                <th className="p-4">طريقة ومستند الدفع</th>
                <th className="p-4">الإجمالي النهائي</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">الفاتورة والطباعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-200">
              {ordersList.map((order) => {
                const availableAgentsForCompany = deliveryAgents.filter(
                  (a) => a.shipping_company_id === order.shipping_company_id
                );

                return (
                  <tr key={order.id} className="hover:bg-slate-700/30 transition">
                    <td className="p-4">
                      <span className="font-extrabold text-white block font-mono">{order.order_number}</span>
                      <span className="text-[10px] text-slate-400">{new Date(order.created_at).toLocaleDateString('ar-YE')}</span>
                      {order.review && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60 w-fit">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>تقييم: {order.review.rating}/5</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-white block">{order.customer_name}</span>
                      <span className="text-[10px] text-slate-400 block font-mono dir-ltr">{order.customer_phone}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-xs">{order.customer_email}</span>
                      <span className="text-[10px] text-slate-500 block truncate max-w-xs">{order.delivery_address}</span>
                    </td>

                    <td className="p-4 space-y-2">
                      {/* Step 1: Select Shipping Company */}
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block mb-0.5">1. شركة التوصيل:</span>
                        <select
                          value={order.shipping_company_id || ''}
                          onChange={(e) => handleAssignShippingCompany(order.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-[11px] font-bold rounded-lg px-2 py-1 text-purple-300 outline-none cursor-pointer w-full focus:border-purple-500"
                        >
                          <option value="">-- اختر شركة التوصيل --</option>
                          {shippingCompanies.map((co) => (
                            <option key={co.id} value={co.id}>
                              {co.name} ({co.governorate})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Step 2: Select Delivery Agent filtered by selected company */}
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block mb-0.5">2. مندوب التوصيل:</span>
                        <select
                          disabled={!order.shipping_company_id}
                          value={order.delivery_agent_id || ''}
                          onChange={(e) => handleAssignDeliveryAgent(order.id, e.target.value)}
                          className={`bg-slate-900 border border-slate-700 text-[11px] font-bold rounded-lg px-2 py-1 outline-none w-full ${
                            !order.shipping_company_id
                              ? 'opacity-50 text-slate-500 cursor-not-allowed'
                              : 'text-emerald-300 cursor-pointer focus:border-emerald-500'
                          }`}
                        >
                          <option value="">
                            {!order.shipping_company_id
                              ? 'اختر شركة التوصيل أولاً'
                              : '-- اختر مندوب التوصيل --'}
                          </option>
                          {availableAgentsForCompany.map((ag) => (
                            <option key={ag.id} value={ag.id}>
                              {ag.name} ({ag.phone}) - [{ag.status === 'available' ? 'متاح' : ag.status}]
                            </option>
                          ))}
                        </select>
                      </div>

                      {order.delivery_agent_name && (
                        <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-800/40">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>المندوب: {order.delivery_agent_name} ({order.delivery_agent_phone})</span>
                        </div>
                      )}
                    </td>

                  <td className="p-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      order.payment_method === 'JEEB' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {order.payment_method === 'JEEB' ? 'محفظة جيب' : 'حساب الكريمي'}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-300 block mt-1">
                      Ref: {order.payment_reference || 'غير مدخل'}
                    </span>
                    {order.payment_sender_name && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        المحوّل: {order.payment_sender_name}
                      </span>
                    )}
                  </td>

                  <td className="p-4 font-black text-emerald-400 text-sm">
                    {order.total.toLocaleString()} ر.ي
                  </td>

                  <td className="p-4 space-y-1.5 min-w-[190px]">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="bg-slate-900 border border-slate-700 text-xs font-bold rounded-lg px-2 py-1.5 text-slate-200 outline-none cursor-pointer focus:border-purple-500 w-full"
                    >
                      <option value="NEW">1. تم استلام الطلب</option>
                      <option value="UNDER_REVIEW">2. جارٍ التحقق / قيد المراجعة</option>
                      <option value="CONFIRMED">3. تم تأكيد الطلب</option>
                      <option value="PREPARING">4. جاري التجهيز</option>
                      <option value="PREPARED">5. تم تجهيز الطلب</option>
                      <option value="SENT_TO_SHIPPING">6. تم إرساله إلى شركة التوصيل 🚚</option>
                      <option value="WITH_AGENT">7. مع مندوب التوصيل 🛵</option>
                      <option value="IN_TRANSIT">8. في الطريق إلى العميل 📍</option>
                      <option value="DELIVERED">9. تم التسليم 🎉</option>
                      <option value="COMPLETED">10. مكتمل (إغلاق الطلب والنقاط)</option>
                      <option value="REJECTED">11. مرفوض ❌</option>
                      <option value="CANCELLED">12. ملغي 🛑</option>
                    </select>

                    {/* Delivery Confirmation Status for Admin (Phase 8) */}
                    {order.delivery_confirmed === true && (
                      <div className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 p-1.5 rounded-lg border border-emerald-800/60 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>تم تأكيد الاستلام من العميل</span>
                      </div>
                    )}

                    {order.delivery_confirmed === false && (
                      <div className="text-[10px] text-amber-300 font-bold bg-amber-950/60 p-1.5 rounded-lg border border-amber-800/60 space-y-0.5">
                        <div className="flex items-center gap-1 text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>العميل أبلغ بعدم الاستلام!</span>
                        </div>
                        {order.delivery_confirmation_note && (
                          <div className="text-[10px] text-slate-300 font-mono">
                            الملاحظة: "{order.delivery_confirmation_note}"
                          </div>
                        )}
                      </div>
                    )}

                    {(order.status === 'DELIVERED' || order.status === 'COMPLETED') &&
                      order.delivery_confirmed === undefined && (
                        <div className="text-[10px] text-slate-400 font-bold bg-slate-900/60 p-1.5 rounded-lg border border-slate-700/60 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>بانتظار تأكيد العميل</span>
                        </div>
                      )}
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        title="معاينة الفاتورة"
                        className="p-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition shadow-sm cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> الفاتورة
                      </button>
                      <button
                        onClick={() => printInvoice(order)}
                        title="طباعة الفاتورة"
                        className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => generateInvoicePDF(order)}
                        title="تحميل PDF"
                        className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition shadow-sm cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" /> PDF
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

