import React, { useState } from 'react';
import { Star, X, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import type { Order, OrderReview } from '../types';
import { submitOrderReview, getReviewByOrderId } from '../lib/reviews';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface OrderReviewModalProps {
  order: Order;
  onClose: () => void;
  onReviewSubmitted?: (review: OrderReview) => void;
}

export const OrderReviewModal: React.FC<OrderReviewModalProps> = ({
  order,
  onClose,
  onReviewSubmitted,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const existingReview = order.review || getReviewByOrderId(order.id);

  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [deliveryRating, setDeliveryRating] = useState<number>(existingReview?.delivery_rating || 5);
  const [comment, setComment] = useState<string>(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('يرجى تسجيل الدخول أولاً', 'error');
      return;
    }

    if (!comment.trim()) {
      showToast('يرجى كتابة تعليقك أو انطباعك عن الطلب', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const review = submitOrderReview(
        order.id,
        user.id,
        order.customer_name || user.name,
        rating,
        comment,
        deliveryRating
      );
      showToast('شكراً لك! تم إرسال تقييمك بنجاح ⭐', 'success');
      onReviewSubmitted?.(review);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء إرسال التقييم', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-auto relative space-y-5 animate-in fade-in zoom-in duration-200 text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">تقييم تجربة الطلب والتوصيل</h3>
              <p className="text-xs text-slate-400 font-mono">رقم الطلب: {order.order_number}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {existingReview ? (
          /* View mode if already reviewed */
          <div className="space-y-4 bg-slate-50 border border-slate-200 p-5 rounded-2xl">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>لقد قمت بتقييم هذا الطلب مسبقاً</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-600 font-bold">تقييم المنتجات:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= existingReview.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {existingReview.delivery_rating && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-bold">تقييم التوصيل والمندوب:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= existingReview.delivery_rating!
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-bold block mb-1">تعليقك:</span>
              <p className="text-xs text-slate-800 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed font-mono">
                "{existingReview.comment}"
              </p>
            </div>
          </div>
        ) : (
          /* Submit review form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 block">
                1. تقييم المنتجات وجودتها:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-500 mr-2">
                  {rating === 5 ? 'ممتاز ⭐⭐⭐⭐⭐' : rating >= 4 ? 'جيد جداً' : rating >= 3 ? 'جيد' : 'يحتاج تحسين'}
                </span>
              </div>
            </div>

            {/* Delivery Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 block">
                2. تقييم سرعة التوصيل والمندوب:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setDeliveryRating(star)}
                    className="p-1 hover:scale-110 transition cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= deliveryRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-500 mr-2">
                  {deliveryRating === 5 ? 'سريع وممتاز 🚀' : deliveryRating >= 4 ? 'جيد جداً' : 'متوسط'}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                <span>3. اكتب تعليقك وانطباعك:</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="اكتب رأيك الصريح لمساعدتنا في تحسين التجربة وخدمتكم بشكل أفضل..."
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 outline-none focus:border-brand-500 text-slate-800 transition leading-relaxed"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
