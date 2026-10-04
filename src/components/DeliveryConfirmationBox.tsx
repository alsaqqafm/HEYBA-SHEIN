import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Send, ThumbsUp, ThumbsDown, Award, Clock } from 'lucide-react';
import type { Order } from '../types';
import { validateDeliveryNoteWordCount, submitCustomerDeliveryConfirmation } from '../lib/deliveryConfirmation';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface DeliveryConfirmationBoxProps {
  order: Order;
  onOrderUpdated?: (updatedOrder: Order) => void;
}

export const DeliveryConfirmationBox: React.FC<DeliveryConfirmationBoxProps> = ({
  order,
  onOrderUpdated,
}) => {
  const { user, refreshPoints } = useAuth();
  const { showToast } = useToast();

  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delivery confirmation is strictly for orders that reached DELIVERED or COMPLETED
  if (order.status !== 'DELIVERED' && order.status !== 'COMPLETED') {
    return null;
  }

  const wordValidation = validateDeliveryNoteWordCount(note);
  const isOverWordLimit = !wordValidation.valid;

  const handleConfirmReceived = async () => {
    if (!user) {
      showToast('يرجى تسجيل الدخول لتأكيد استلام الطلب', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitCustomerDeliveryConfirmation(order.id, user.id, true);
      if (res.success && res.order) {
        showToast('تم تأكيد استلام الطلب بنجاح! شكراً لك 🎉', 'success');
        if (res.pointsAwarded && res.pointsAwarded > 0) {
          showToast(`تم إضافة +${res.pointsAwarded} نقطة مكافآت لحسابك!`, 'success');
          await refreshPoints();
        }
        if (onOrderUpdated) {
          onOrderUpdated(res.order);
        }
      } else {
        showToast(res.error || 'تعذر تأكيد الاستلام', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء التأكيد', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportNotReceived = async () => {
    if (!user) {
      showToast('يرجى تسجيل الدخول', 'error');
      return;
    }

    if (isOverWordLimit) {
      showToast('الملاحظة يجب ألا تتجاوز 4 كلمات كحد أقصى', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitCustomerDeliveryConfirmation(order.id, user.id, false, note);
      if (res.success && res.order) {
        showToast('تم تسجيل بلاغك وسيتم مراجعته من الإدارة.', 'success');
        setShowNoteInput(false);
        if (onOrderUpdated) {
          onOrderUpdated(res.order);
        }
      } else {
        showToast(res.error || 'تعذر إرسال البلاغ', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء إرسال البلاغ', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Case 1: Already confirmed as received
  if (order.delivery_confirmed === true) {
    return (
      <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 text-right space-y-2 text-emerald-950">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-emerald-900">تم تأكيد استلام الطلب</h4>
            {order.delivery_confirmed_at && (
              <p className="text-[11px] text-emerald-700 font-mono mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> تم التأكيد بتاريخ: {new Date(order.delivery_confirmed_at).toLocaleString('ar-YE')}
              </p>
            )}
          </div>
        </div>

        {order.points_awarded && order.points_earned > 0 && (
          <div className="bg-white/80 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs font-bold text-emerald-800 mt-2">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500 fill-amber-400" /> النقاط المكتسبة المعتمدة:
            </span>
            <span className="font-extrabold font-mono">+{order.points_earned} نقطة</span>
          </div>
        )}
      </div>
    );
  }

  // Case 2: Already reported as not received
  if (order.delivery_confirmed === false) {
    return (
      <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 text-right space-y-2 text-amber-950">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-amber-900">تم تسجيل بلاغك وسيتم مراجعته من الإدارة.</h4>
            {order.delivery_confirmed_at && (
              <p className="text-[11px] text-amber-700 font-mono mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> وقت تسجيل البلاغ: {new Date(order.delivery_confirmed_at).toLocaleString('ar-YE')}
              </p>
            )}
          </div>
        </div>

        {order.delivery_confirmation_note && (
          <div className="bg-white/80 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900">
            <span className="font-bold text-amber-800 block text-[11px] mb-0.5">ملاحظة البلاغ:</span>
            <p className="font-medium font-mono">"{order.delivery_confirmation_note}"</p>
          </div>
        )}
      </div>
    );
  }

  // Case 3: Pending confirmation (shows question and choice buttons)
  return (
    <div className="bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white border border-brand-800/60 rounded-2xl p-5 shadow-lg space-y-4 text-right">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
          <h3 className="font-extrabold text-sm sm:text-base text-white">هل تم استلام طلبك؟</h3>
        </div>
        <span className="text-[11px] text-slate-300 font-mono bg-white/10 px-2.5 py-1 rounded-lg">
          مرحلة التسليم
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        وصل طلبك لمرحلة التسليم. يرجى تأكيد هل استلمت شحنتك فعلياً لتأكيد إغلاق الطلب واحتساب نقاط المكافآت.
      </p>

      {!showNoteInput ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Button: Yes, Received */}
          <button
            onClick={handleConfirmReceived}
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer disabled:opacity-50"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>نعم، تم استلام الطلب</span>
          </button>

          {/* Button: No, Not Received */}
          <button
            onClick={() => setShowNoteInput(true)}
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <ThumbsDown className="w-4 h-4 text-rose-400" />
            <span>لا، لم أستلم الطلب</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3 pt-2 bg-white/5 border border-white/10 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-amber-300">
              إضافة ملاحظة توضيحية (اختياري - 4 كلمات كحد أقصى):
            </label>
            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                isOverWordLimit
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                  : 'bg-white/10 text-slate-300'
              }`}
            >
              {wordValidation.wordCount} / 4 كلمات
            </span>
          </div>

          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="مثال: الطلب لم يصلني بعد"
            className={`w-full bg-slate-900 border text-xs text-white rounded-xl p-3 outline-none transition ${
              isOverWordLimit ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:border-brand-500'
            }`}
          />

          {isOverWordLimit && (
            <p className="text-[11px] text-rose-400 font-bold">
              {wordValidation.message}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => {
                setShowNoteInput(false);
                setNote('');
              }}
              disabled={isSubmitting}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              إلغاء
            </button>

            <button
              onClick={handleReportNotReceived}
              disabled={isSubmitting || isOverWordLimit}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 disabled:text-slate-400 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال البلاغ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
