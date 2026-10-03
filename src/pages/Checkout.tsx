import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Copy, Wallet, CreditCard, ArrowLeft, AlertTriangle, MapPin, Truck, Phone, FileText } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiCreateOrderAtomic } from '../lib/supabase';
import type { Order, PaymentMethod } from '../types';
import { saveOrderToStore } from '../lib/orders';
import { InvoiceModal } from '../components/InvoiceModal';
import { YEMEN_GOVERNORATES } from '../data/yemenLocations';

interface CheckoutProps {
  onNavigate: (path: string) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ onNavigate }) => {
  const { items, subtotal, clearCart } = useCart();
  const { user, isEmailVerified } = useAuth();
  const { showToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('JEEB');
  
  // Delivery Location States (Yemen)
  const [governorate, setGovernorate] = useState(user?.governorate || 'إب');
  const [area, setArea] = useState(user?.area || 'الظهار');
  const [detailedAddress, setDetailedAddress] = useState(user?.address || 'شارع العدين - قرب مستشفى الثورة');
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '772606709');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Payment states
  const [senderName, setSenderName] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreatedId, setOrderCreatedId] = useState<string | null>(null);

  const [createdOrderObj, setCreatedOrderObj] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Dynamic Shipping Fee based on Selected Governorate
  const currentGovObj = YEMEN_GOVERNORATES.find((g) => g.name === governorate) || YEMEN_GOVERNORATES[0];
  const deliveryFee = subtotal > 0 ? currentGovObj.deliveryFee : 0;
  const grandTotal = subtotal + deliveryFee;

  // Requirement #2: Block checkout if account is unverified!
  if (user && !isEmailVerified) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-amber-200 space-y-4 max-w-lg mx-auto my-12 shadow-xl">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">يتطلب إتمام الطلب توثيق البريد الإلكتروني</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          عذراً، لحماية الحسابات والطلبات، لا يمكنك إتمام الشراء حتى تقوم بتأكيد رمز التحقق الخاص ببريدك: <strong>{user.email}</strong>.
        </p>
        <button
          onClick={() => onNavigate('/verify-email')}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-full font-bold text-xs shadow-lg transition"
        >
          الانتقال لتأكيد البريد الإلكتروني ✉️
        </button>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('تم نسخ رقم الحساب للحافظة');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      onNavigate('/login');
      return;
    }

    // Strict Delivery Details Validation
    if (!recipientName.trim()) {
      showToast('يرجى كتابة اسم المستلم الكامل', 'error');
      return;
    }

    if (!phone.trim() || phone.length < 6) {
      showToast('يرجى كتابة رقم هاتف صحبح للتواصل والواتساب', 'error');
      return;
    }

    if (!governorate.trim() || !area.trim() || !detailedAddress.trim()) {
      showToast('يرجى استكمال اختيار المحافظة والمنطقة والعنوان التفصيلي للتوصيل', 'error');
      return;
    }

    if (!paymentRef.trim()) {
      showToast('يرجى كتابة رقم العملية المرجعي أو إشعار التحويل لتأكيد الطلب', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullDeliveryAddress = `اليمن - محافظة ${governorate} - منطقة ${area} - ${detailedAddress} (المستلم: ${recipientName} - هاتف: ${phone})`;

      const payloadItems = items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const res: any = await apiCreateOrderAtomic({
        userId: user.id,
        customerName: recipientName,
        customerEmail: user.email,
        customerPhone: phone,
        deliveryAddress: fullDeliveryAddress,
        paymentMethod,
        paymentReference: paymentRef,
        paymentSenderName: senderName,
        items: payloadItems,
      });

      setIsSubmitting(false);
      if (res && (res.success || res.order_number)) {
        const orderNum = res.order_number || `HEYBA-2026-${Math.floor(100000 + Math.random() * 900000)}`;
        
        const newOrder: Order = {
          id: res.order_id || `ord-${Date.now()}`,
          order_number: orderNum,
          user_id: user.id,
          customer_name: recipientName,
          customer_email: user.email,
          customer_phone: phone,
          delivery_country: 'اليمن',
          delivery_governorate: governorate,
          delivery_area: area,
          delivery_address: fullDeliveryAddress,
          recipient_name: recipientName,
          notes: deliveryNotes,
          payment_method: paymentMethod,
          payment_reference: paymentRef,
          payment_sender_name: senderName,
          status: 'NEW',
          subtotal,
          discount: 0,
          delivery_fee: deliveryFee,
          total: grandTotal,
          points_earned: Math.floor(subtotal * 0.01),
          created_at: new Date().toISOString(),
          items: items.map((item, idx) => ({
            id: `item-${Date.now()}-${idx}`,
            product_id: item.product_id,
            product_name: item.product.name,
            product_image: item.product.images?.[0]?.image_url || '',
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
          })),
        };

        saveOrderToStore(newOrder);
        setCreatedOrderObj(newOrder);
        setOrderCreatedId(orderNum);
        clearCart();
        showToast('تم إرسال طلبك بنجاح! جاري مراجعة الدفع من قِبل الإدارة.', 'success');
      } else {
        showToast('فشل إنشاء الطلب. يرجى التحقق من توفر الكمية بالمخزون.', 'error');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      showToast(err.message || 'حدث خطأ أثناء معالجة الطلب بالمخزون', 'error');
    }
  };

  if (orderCreatedId) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-100 space-y-6 max-w-lg mx-auto my-8 shadow-xl">
        {showInvoiceModal && createdOrderObj && (
          <InvoiceModal order={createdOrderObj} onClose={() => setShowInvoiceModal(false)} />
        )}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">تم استلام طلبك بنجاح! 🎉</h2>
          <p className="text-xs text-slate-500 mt-2">رقم الطلب الخادمي المعتمد:</p>
          <span className="inline-block mt-2 px-4 py-2 bg-brand-50 text-brand-700 font-black text-lg rounded-xl border border-brand-200 font-mono">
            {orderCreatedId}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
          شكراً لك، {recipientName}. سيقوم فريق الإدارة بمراجعة تحويل ({paymentMethod === 'JEEB' ? 'محفظة جيب' : 'حساب الكريمي'}) والتوصيل إلى <strong>مواطن محافظة {governorate}</strong> فور الاعتماد.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {createdOrderObj && (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>عرض الفاتورة الآن</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('/account')}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs"
          >
            سجل طلباتي
          </button>
          <button
            onClick={() => onNavigate('/')}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
          >
            الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <h1 className="text-2xl font-black text-slate-900">إتمام الطلب الشراء والتوصيل</h1>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Delivery & Location Details */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h2 className="font-extrabold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-600" />
              <span>1. بيانات الشحن والتوصيل (داخل اليمن)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستلم الكامل *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="اسم الشخص المستلم للشحنة"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:bg-white focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف المستلم (للاتصال والواتساب) *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="مثال: 772606709"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:bg-white focus:border-brand-500 outline-none text-left dir-ltr"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الدولة *</label>
                <input
                  type="text"
                  readOnly
                  value="اليمن (Yemen)"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة / المدينة *</label>
                <select
                  value={governorate}
                  onChange={(e) => {
                    const govName = e.target.value;
                    setGovernorate(govName);
                    const found = YEMEN_GOVERNORATES.find((g) => g.name === govName);
                    if (found && found.popularAreas.length > 0) {
                      setArea(found.popularAreas[0]);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:bg-white focus:border-brand-500 outline-none cursor-pointer"
                >
                  {YEMEN_GOVERNORATES.map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.name} (رسوم التوصيل: {g.deliveryFee.toLocaleString()} ر.ي)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المنطقة / المديرية *</label>
                <input
                  type="text"
                  required
                  list="popular-areas-list"
                  placeholder="اسم المنطقة أو المديرية"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:bg-white focus:border-brand-500 outline-none"
                />
                <datalist id="popular-areas-list">
                  {currentGovObj.popularAreas.map((a, i) => (
                    <option key={i} value={a} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">العنوان التفصيلي الدقيق *</label>
              <textarea
                required
                rows={2}
                value={detailedAddress}
                onChange={(e) => setDetailedAddress(e.target.value)}
                placeholder="الشارع الرئيسي، اسم الحي، الدوار أو المعلم البارز، رقم المنزل أو البناية..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات التوصيل (اختياري)</label>
              <input
                type="text"
                placeholder="مثال: يرجى الاتصال قبل الوصول بـ 15 دقيقة / التسليم بالفترة المسائية..."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>

            {/* Delivery Location Summary Box */}
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs space-y-1.5 text-sky-900">
              <div className="font-extrabold flex items-center gap-1.5 text-sky-800">
                <MapPin className="w-4 h-4 text-sky-600" />
                <span>ملخص موقع الشحن والتوصيل المعتمد:</span>
              </div>
              <p>
                <strong>المستلم:</strong> {recipientName || 'لم يدخل بعد'} | <strong>هاتف:</strong> {phone}
              </p>
              <p>
                <strong>العنوان:</strong> اليمن - محافظة {governorate} - {area} - {detailedAddress}
              </p>
              <p className="text-sky-700 font-bold">
                🚚 رسوم الشحن لمحافظة ({governorate}): <strong>{deliveryFee.toLocaleString()} ر.ي</strong>
              </p>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h2 className="font-extrabold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-brand-600" />
              <span>2. اختيار طريقة الدفع وتأكيد التحويل</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setPaymentMethod('JEEB')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3 ${
                  paymentMethod === 'JEEB'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Wallet className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">محفظة جيب (JEEB)</h3>
                  <p className="text-[11px] text-slate-500">تحويل فوري بدون عمولات</p>
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('KURAIMI')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3 ${
                  paymentMethod === 'KURAIMI'
                    ? 'border-amber-500 bg-amber-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-8 h-8 text-amber-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">حساب الكريمي (Kuraimi)</h3>
                  <p className="text-[11px] text-slate-500">إيداع وحوالات حاسب</p>
                </div>
              </div>
            </div>

            {paymentMethod === 'JEEB' ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-emerald-800 font-bold block">رقم حساب محفظة جيب للمتجر:</span>
                    <span className="text-xl font-black text-emerald-900 tracking-wider font-mono">772606709</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('772606709')}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> نسخ
                  </button>
                </div>
                <p className="text-[11px] text-emerald-700">
                  اسم الحساب: متجر هيبة شي إن الإلكتروني. قم بتحويل الإجمالي <strong>({grandTotal.toLocaleString()} ر.ي)</strong> وأرفق رقم العملية المرجعي أدناه.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-amber-800 font-bold block">رقم حساب الكريمي المُميز:</span>
                    <span className="text-xl font-black text-amber-900 tracking-wider font-mono">772606709</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('772606709')}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> نسخ
                  </button>
                </div>
                <p className="text-[11px] text-amber-800">
                  اسم الحساب: شركة هيبة شي إن للتجارة. أودع الإجمالي <strong>({grandTotal.toLocaleString()} ر.ي)</strong> وأدخل رقم الإشعار المرجعي.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المحوّل / اسم الحساب Sender *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: محمد علي أحمد"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم العملية المرجعي / رقم الإشعار *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: #REF-982312"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none text-left dir-ltr font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Summary Sidebar */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-card space-y-6 h-fit">
          <h2 className="font-extrabold text-lg text-slate-900 pb-3 border-b border-slate-100">ملخص الشراء النهائي</h2>

          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between text-xs">
                <span className="truncate max-w-[160px] font-medium text-slate-700">{item.product.name} ({item.quantity}x)</span>
                <span className="font-bold text-slate-900">{(item.price * item.quantity).toLocaleString()} ر.ي</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs pt-3 border-t border-slate-100">
            <div className="flex justify-between text-slate-600">
              <span>مجموع المنتجات:</span>
              <span className="font-bold">{subtotal.toLocaleString()} ر.ي</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>شحن وتوصيل ({governorate}):</span>
              <span className="font-bold text-brand-600">{deliveryFee.toLocaleString()} ر.ي</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg">
              <span>نقاط تضاف لحسابك:</span>
              <span>+{Math.round(subtotal * 0.01)} نقطة</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="font-extrabold text-slate-900">الإجمالي النهائي:</span>
            <span className="text-xl font-black text-brand-600">{grandTotal.toLocaleString()} ر.ي</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-extrabold text-sm shadow-brand transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span>جاري التحقق وإرسال الطلب...</span>
            ) : (
              <>
                <span>تأكيد الطلب وإرسال الدفع</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>تأكيد الشحن لـ {governorate} وحماية بيانات العميل مفعّلة</span>
          </div>
        </div>

      </form>
    </div>
  );
};
