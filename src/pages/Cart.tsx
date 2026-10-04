import React from 'react';
import { Trash2, ArrowLeft, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartProps {
  onNavigate: (path: string) => void;
}

export const Cart: React.FC<CartProps> = ({ onNavigate }) => {
  const { items, updateQuantity, removeFromCart, subtotal, deliveryFee, grandTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4 max-w-md mx-auto my-12">
        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">سلة التسوق فارغة حالياً</h2>
        <p className="text-xs text-slate-500">لم تقم بإضافة أي منتجات للسلة بعد. تصفح أحدث الأزياء والمنتجات الآن!</p>
        <button
          onClick={() => onNavigate('/products')}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-full font-bold text-xs shadow-lg transition"
        >
          ابدئي التسوق الآن
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <h1 className="text-2xl font-black text-slate-900">سلة التسوق ({items.length} منتجات)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-brand-200 transition-colors"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                <img
                  src={item.product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'}
                  alt={item.product.name}
                  className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-xl bg-slate-100 shrink-0 border border-slate-100"
                />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-brand-600 block">{item.product.category?.name || 'أزياء'}</span>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug break-words">{item.product.name}</h3>
                  <div className="text-xs font-extrabold text-slate-800 pt-0.5">
                    {item.price.toLocaleString()} ر.ي <span className="text-[10px] text-slate-400 font-normal">لكل قطعة</span>
                  </div>
                </div>
              </div>

              {/* Quantity Controls, Total & Delete Action */}
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm transition"
                    title="إنقاص"
                  >
                    -
                  </button>
                  <span className="w-9 text-center font-extrabold text-slate-900 text-xs">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm transition"
                    title="زيادة"
                  >
                    +
                  </button>
                </div>

                <div className="text-left dir-ltr sm:text-right sm:dir-rtl">
                  <span className="text-[10px] text-slate-400 block font-semibold">الإجمالي</span>
                  <span className="font-black text-brand-600 text-base sm:text-lg">
                    {(item.price * item.quantity).toLocaleString()} ر.ي
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.product_id)}
                  className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition shrink-0"
                  title="حذف المنتج من السلة"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-card space-y-6 h-fit">
          <h2 className="font-extrabold text-lg text-slate-900 pb-3 border-b border-slate-100">ملخص الطلب</h2>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>مجموع المنتجات:</span>
              <span className="font-bold text-slate-900">{subtotal.toLocaleString()} ر.ي</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>رسوم التوصيل الشحن:</span>
              <span className="font-bold text-slate-900">{deliveryFee.toLocaleString()} ر.ي</span>
            </div>
            <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
              <span>نقاط المكافآت المكتسبة:</span>
              <span>+{Math.round(subtotal * 0.1)} نقطة</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="font-extrabold text-slate-900">الإجمالي النهائي:</span>
            <span className="text-2xl font-black text-brand-600">{grandTotal.toLocaleString()} ر.ي</span>
          </div>

          <button
            onClick={() => onNavigate('/checkout')}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-extrabold text-sm shadow-brand hover:scale-[1.01] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>إتمام الطلب الشراء</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>دفع آمن 100% عبر جيب أو الكريمي</span>
          </div>
        </div>
      </div>
    </div>
  );
};
