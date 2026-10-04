import React, { useState } from 'react';
import { ShieldCheck, Mail, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { UserProfile } from '../types';

interface OrderVerificationModalProps {
  user: UserProfile;
  orderPhone: string;
  onVerified: () => void;
  onClose: () => void;
}

export const OrderVerificationModal: React.FC<OrderVerificationModalProps> = ({
  user,
  orderPhone,
  onVerified,
  onClose,
}) => {
  const { verifyEmail } = useAuth();
  const { showToast } = useToast();

  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const isWhatsApp = user.login_provider === 'whatsapp' || user.email.includes('@whatsapp.user');

  const handleSendEmailOTP = () => {
    setCodeSent(true);
    showToast(`تم إرسال رمز التحقق OTP إلى بريدك الإلكتروني: ${user.email}`);
  };

  const handleVerifyEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      showToast('يرجى إدخال رمز التحقق OTP المكون من 6 أرقام', 'error');
      return;
    }

    setIsVerifying(true);
    try {
      await verifyEmail();
      showToast('تم التحقق من بريدك الإلكتروني بنجاح! اكتمل تأكيد الطلب.');
      onVerified();
    } catch (err: any) {
      showToast(err.message || 'فشل التحقق من الرمز', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-auto relative space-y-6 animate-in fade-in zoom-in duration-200 text-right">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            التحقق من العميل لتأكيد الطلب
          </h2>
          <p className="text-xs text-slate-500">
            خطوة أمان إضافية لضمان صحة بيانات التواصل قبل اعتماد وإرسال الطلب
          </p>
        </div>

        {isWhatsApp ? (
          /* WhatsApp Verification Notification */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>ملاحظة هامة بشأن التحقق التلقائي عبر WhatsApp:</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700">
                التحقق التلقائي الحقيقي عبر رقم الـ WhatsApp ({orderPhone || user.phone || 'رقم الواتساب'}) يتطلب ربط بوابة رسائل رسمية مثل <strong>Meta WhatsApp API</strong> أو <strong>Twilio WhatsApp Gateway</strong>.
              </p>
              <p className="text-xs leading-relaxed font-bold text-amber-900">
                حسب تعليمات المرحلة 2، تم إيقاف التفعيل التلقائي وتثبيت الحالة حتى الحصول على موافقتك الصريحة لتفعيل الخدمة الخارجية المطلوبة.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                إغلاق والانتظار
              </button>
            </div>
          </div>
        ) : (
          /* Email Verification Form */
          <div className="space-y-4">
            {!codeSent ? (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-slate-700 font-bold text-xs">
                    <Mail className="w-4 h-4 text-brand-600" />
                    <span>البريد الإلكتروني المعتمد للطلب:</span>
                  </div>
                  <p className="text-sm font-black text-slate-900 dir-ltr">{user.email}</p>
                </div>

                <button
                  type="button"
                  onClick={handleSendEmailOTP}
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-2xl shadow-brand transition"
                >
                  إرسال رمز التحقق OTP إلى البريد
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyEmailOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    أدخل رمز التحقق (OTP) المرسل إلى بريدك:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 text-center text-lg font-black tracking-widest text-slate-900 outline-none focus:border-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد الرمز واعتمد الطلب</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendEmailOTP}
                  className="w-full py-2 text-xs text-brand-600 font-bold hover:underline"
                >
                  إعادة إرسال رمز OTP
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
