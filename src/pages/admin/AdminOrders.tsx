import React, { useState, useEffect } from 'react';
import { FileText, Eye, Printer } from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import { generateInvoicePDF, printInvoice } from '../../lib/pdfGenerator';
import { apiUpdateOrderStatusAtomic } from '../../lib/supabase';
import { getStoredOrders } from '../../lib/orders';
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
    status: 'PENDING_PAYMENT',
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
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    const stored = getStoredOrders();
    const existingIds = new Set(stored.map((o) => o.id));
    const merged = [...stored, ...INITIAL_ADMIN_ORDERS.filter((o) => !existingIds.has(o.id))];
    setOrdersList(merged);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await apiUpdateOrderStatusAtomic(
        orderId,
        newStatus,
        `تحديث الحالة يدويًا من قِبل المدير إلى ${newStatus}`,
        user?.id || 'admin'
      );

      setOrdersList((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            const updated = { ...ord, status: newStatus };
            if (newStatus === 'COMPLETED') {
              showToast(`تم قبول وتأكيد الطلب ${ord.order_number}! تم إضافة ${ord.points_earned} نقطة لحساب العميل بشكل غير مكرر (Idempotent).`, 'success');
            } else {
              showToast(`تم تغيير حالة الطلب ${ord.order_number} إلى ${newStatus}`);
            }
            return updated;
          }
          return ord;
        })
      );
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء تحديث حالة الطلب', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {selectedInvoiceOrder && (
        <InvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}

      <div>
        <h1 className="text-2xl font-black text-white">إدارة الطلبات والتحقق من الدفع</h1>
        <p className="text-xs text-slate-400 mt-1">مراجعة التحويلات عبر محفظة جيب وحساب الكريمي وتغيير حالة الطلب</p>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-bold border-b border-slate-700">
              <tr>
                <th className="p-4">رقم الطلب</th>
                <th className="p-4">العميل والتواصل</th>
                <th className="p-4">طريقة ومستند الدفع</th>
                <th className="p-4">الإجمالي النهائي</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">الفاتورة والطباعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-200">
              {ordersList.map((order) => (
                <tr key={order.id} className="hover:bg-slate-700/30 transition">
                  <td className="p-4">
                    <span className="font-extrabold text-white block font-mono">{order.order_number}</span>
                    <span className="text-[10px] text-slate-400">{new Date(order.created_at).toLocaleDateString('ar-YE')}</span>
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-white block">{order.customer_name}</span>
                    <span className="text-[10px] text-slate-400 block font-mono dir-ltr">{order.customer_phone}</span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-xs">{order.customer_email}</span>
                    <span className="text-[10px] text-slate-500 block truncate max-w-xs">{order.delivery_address}</span>
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

                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="bg-slate-900 border border-slate-700 text-xs font-bold rounded-lg px-2 py-1 text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="NEW">1. جديد (NEW)</option>
                      <option value="PENDING_PAYMENT">2. بانتظار التحقق من الدفع</option>
                      <option value="PAYMENT_CONFIRMED">3. تم تأكيد الدفع</option>
                      <option value="PREPARING">4. قيد التجهيز</option>
                      <option value="READY">5. جاهز للتسليم</option>
                      <option value="COMPLETED">6. مكتمل (تضاف النقاط تلقائياً مرة واحدة)</option>
                      <option value="REJECTED">7. مرفوض</option>
                      <option value="CANCELLED">8. ملغي</option>
                    </select>
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        title="معاينة الفاتورة"
                        className="p-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" /> الفاتورة
                      </button>
                      <button
                        onClick={() => printInvoice(order)}
                        title="طباعة الفاتورة"
                        className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => generateInvoicePDF(order)}
                        title="تحميل PDF"
                        className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" /> PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

