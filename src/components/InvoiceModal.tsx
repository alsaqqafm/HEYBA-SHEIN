import React, { useState, useEffect } from 'react';
import { X, Printer, Download, MapPin, Phone, Mail, User, CreditCard, Award, Truck, UserCheck, Navigation, Star } from 'lucide-react';
import type { Order } from '../types';
import { printInvoice, generateInvoicePDF, PLATFORM_INFO } from '../lib/pdfGenerator';
import { getOrderStatusLabel } from '../lib/orderStatusConfig';
import { getTrackingInfoForOrder } from '../lib/tracking';
import { OrderTimeline } from './OrderTimeline';
import { OrderTrackingModal } from './OrderTrackingModal';
import { DeliveryConfirmationBox } from './DeliveryConfirmationBox';
import { OrderReviewModal } from './OrderReviewModal';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
  onOrderUpdated?: (updated: Order) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order: initialOrder, onClose, onOrderUpdated }) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(initialOrder);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    setCurrentOrder(initialOrder);
  }, [initialOrder]);

  // Lock background scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!currentOrder) return null;
  const order = currentOrder;

  const items = order.items || [];
  const trackingInfo = getTrackingInfoForOrder(order);

  return (
    <>
      {showTrackingModal && (
        <OrderTrackingModal order={order} onClose={() => setShowTrackingModal(false)} />
      )}

      {showReviewModal && (
        <OrderReviewModal
          order={order}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={(review) => {
            const updated = { ...order, review };
            setCurrentOrder(updated);
            onOrderUpdated?.(updated);
          }}
        />
      )}

      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-8 shadow-2xl border border-slate-100 my-auto relative space-y-6 animate-in fade-in zoom-in duration-200"
        >
        
        {/* Header Action Controls */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 no-print">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-brand-600 animate-pulse"></span>
            <h3 className="font-black text-slate-900 text-base sm:text-lg">معاينة الفاتورة والتسلسل الزمني للطلب</h3>
          </div>
          <div className="flex items-center gap-2">
            {(order.status === 'DELIVERED' || order.status === 'COMPLETED') && (
              <button
                onClick={() => setShowReviewModal(true)}
                className={`px-3 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 transition border cursor-pointer ${
                  order.review
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-sm'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${order.review ? 'text-amber-500 fill-amber-400' : 'fill-white'}`} />
                <span>{order.review ? 'تقييمك ⭐' : 'تقييم الطلب'}</span>
              </button>
            )}

            <button
              onClick={() => printInvoice(order)}
              className="px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition border border-brand-200 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-brand-600" />
              <span>طباعة</span>
            </button>
            <button
              onClick={() => generateInvoicePDF(order)}
              className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="space-y-6">
          
          {/* Brand & Store Contact Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-brand-900 to-brand-700 p-5 rounded-2xl text-white shadow-brand">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-white text-brand-700 font-black text-2xl rounded-2xl flex items-center justify-center shadow-md">
                H
              </div>
              <div>
                <h1 className="text-xl font-black">{PLATFORM_INFO.name}</h1>
                <p className="text-xs text-sky-200 mt-0.5">منصة الأزياء والتسوق الإلكتروني</p>
              </div>
            </div>
            <div className="text-xs space-y-1 text-sky-100 border-t sm:border-t-0 sm:border-r sm:border-white/20 pt-2 sm:pt-0 sm:pr-4">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-300" />
                <span>{PLATFORM_INFO.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-300" />
                <span>{PLATFORM_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-300" />
                <span>{PLATFORM_INFO.location}</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Order Details */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <div className="font-extrabold text-brand-700 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                <span>تفاصيل الطلب / Order Info</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">رقم الطلب:</span>
                <span className="font-black text-slate-900 font-mono">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">تاريخ الطلب:</span>
                <span className="font-bold text-slate-800">{new Date(order.created_at).toLocaleDateString('ar-YE')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">حالة الطلب:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                  {getOrderStatusLabel(order.status)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">طريقة الدفع:</span>
                <span className="font-bold text-slate-800">
                  {order.payment_method === 'JEEB' ? 'محفظة جيب' : 'حساب الكريمي'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">رقم الإشعار/المرجع:</span>
                <span className="font-mono font-bold text-slate-800">{order.payment_reference || 'غير مدخل'}</span>
              </div>
              {order.points_earned ? (
                <div className="flex justify-between text-emerald-700 bg-emerald-50 p-1.5 rounded-lg font-bold mt-1">
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> النقاط المكتسبة:
                  </span>
                  <span>+{order.points_earned} نقطة</span>
                </div>
              ) : null}
            </div>

            {/* Customer & Shipping Details */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <div className="font-extrabold text-brand-700 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>بيانات العميل والشحن / Customer Data</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">اسم العميل:</span>
                <span className="font-extrabold text-slate-900">{order.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">البريد الإلكتروني:</span>
                <span className="font-bold text-slate-800 dir-ltr">{order.customer_email || 'غير مدخل'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">رقم الهاتف:</span>
                <span className="font-bold text-slate-800 font-mono dir-ltr">{order.customer_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">عنوان التوصيل:</span>
                <span className="font-bold text-slate-800 text-left max-w-[180px]">{order.delivery_address}</span>
              </div>
              {order.shipping_company_name && (
                <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200 text-purple-900 space-y-1 mt-2">
                  <div className="flex items-center justify-between font-extrabold">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-purple-600" /> شركة التوصيل:
                    </span>
                    <span>{order.shipping_company_name}</span>
                  </div>
                  {order.shipping_company_phone && (
                    <div className="text-[11px] font-mono dir-ltr text-purple-700 text-left">
                      Phone: {order.shipping_company_phone}
                    </div>
                  )}
                  {order.shipping_company_address && (
                    <div className="text-[10px] text-purple-800 text-left truncate">
                      {order.shipping_company_address}
                    </div>
                  )}
                </div>
              )}
              {order.delivery_agent_name && (
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-emerald-900 space-y-1 mt-1.5">
                  <div className="flex items-center justify-between font-extrabold">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> مندوب التوصيل المكلف:
                    </span>
                    <span>{order.delivery_agent_name}</span>
                  </div>
                  {order.delivery_agent_phone && (
                    <div className="text-[11px] font-mono dir-ltr text-emerald-700 text-left">
                      Phone: {order.delivery_agent_phone}
                    </div>
                  )}
                </div>
              )}
              {order.shipping_company_name && (
                <div className="pt-1 no-print">
                  <button
                    onClick={() => setShowTrackingModal(true)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm ${
                      trackingInfo.isLocationAvailable
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                        : 'bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200'
                    }`}
                  >
                    <Navigation className="w-4 h-4" />
                    <span>متابعة موقع الطلب</span>
                    {!trackingInfo.isLocationAvailable && (
                      <span className="text-[10px] opacity-75 font-normal">
                        (الموقع المباشر غير متاح حاليًا)
                      </span>
                    )}
                  </button>
                </div>
              )}
              {order.payment_sender_name && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">اسم المحوّل:</span>
                  <span className="font-bold text-slate-800">{order.payment_sender_name}</span>
                </div>
              )}
              {order.notes && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">ملاحظات:</span>
                  <span className="font-medium text-slate-700">{order.notes}</span>
                </div>
              )}
            </div>

          </div>

          {/* Customer Delivery Confirmation Section (Phase 8) */}
          <div className="no-print">
            <DeliveryConfirmationBox
              order={currentOrder}
              onOrderUpdated={(updated) => {
                setCurrentOrder(updated);
                onOrderUpdated?.(updated);
              }}
            />
          </div>

          {/* Interactive Responsive Order Timeline Component */}
          <div className="no-print pt-2">
            <OrderTimeline order={currentOrder} />
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-brand-600 text-white font-extrabold">
                  <tr>
                    <th className="p-3 text-center w-10">#</th>
                    <th className="p-3">اسم المنتج / Product</th>
                    <th className="p-3 text-center w-16">الكمية</th>
                    <th className="p-3 text-left w-24">سعر الوحدة</th>
                    <th className="p-3 text-left w-20">الخصم</th>
                    <th className="p-3 text-left w-28">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
                  {items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50 transition">
                      <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          {item.product_image && (
                            <img
                              src={item.product_image}
                              alt=""
                              className="w-9 h-9 object-cover rounded-lg border border-slate-200 shadow-sm"
                            />
                          )}
                          <span>{item.product_name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center font-extrabold">{item.quantity}</td>
                      <td className="p-3 text-left font-mono font-semibold">{item.price.toLocaleString()} ر.ي</td>
                      <td className="p-3 text-left font-mono text-slate-400">0 ر.ي</td>
                      <td className="p-3 text-left font-mono font-black text-brand-700">{item.total.toLocaleString()} ر.ي</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end">
            <div className="w-full sm:w-72 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي:</span>
                <span className="font-bold">{order.subtotal.toLocaleString()} ر.ي</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>الخصم:</span>
                <span className="font-bold">{(order.discount || 0).toLocaleString()} ر.ي</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>رسوم التوصيل:</span>
                <span className="font-bold">{(order.delivery_fee || 0).toLocaleString()} ر.ي</span>
              </div>
              <div className="flex justify-between text-base font-black text-brand-700 pt-2 border-t border-slate-300">
                <span>الإجمالي النهائي:</span>
                <span>{order.total.toLocaleString()} ر.ي</span>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="text-center pt-3 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
            <p className="font-extrabold text-slate-700">شكراً لتسوقك من {PLATFORM_INFO.name}!</p>
            <p>لأي استفسارات يسعدنا خدمتكم عبر الرقم: {PLATFORM_INFO.phone}</p>
          </div>

        </div>

      </div>
    </div>
  </>
  );
};
