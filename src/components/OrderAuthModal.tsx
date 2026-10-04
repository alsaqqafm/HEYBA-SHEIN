import React, { useState } from 'react';
import { X, Mail, Phone, Lock, User, UserPlus, LogIn, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface OrderAuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const OrderAuthModal: React.FC<OrderAuthModalProps> = ({ onSuccess, onClose }) => {
  const { login, signup, loginWithWhatsApp } = useAuth();
  const { showToast } = useToast();

  const [authMethod, setAuthMethod] = useState<'email' | 'whatsapp'>('email');
  const [isSignup, setIsSignup] = useState<boolean>(false);

  // Form Fields - Name MUST be first when creating an account!
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (authMethod === 'email') {
        if (isSignup) {
          if (!name.trim()) {
            showToast('يرجى كتابة الاسم الكامل أولاً', 'error');
            setIsSubmitting(false);
            return;
          }
          const res = await signup(name, email, password || '123456');
          if (res.success) {
            showToast(`أهلاً بك يا ${name}! تم إنشاء حسابك بنجاح.`);
            onSuccess();
          } else {
            showToast(res.message || 'فشل إنشاء الحساب', 'error');
          }
        } else {
          const res = await login(email, password || '123456');
          if (res.success) {
            showToast('تم تسجيل الدخول بنجاح! يمكنك الآن متابعة الطلب.');
            onSuccess();
          } else {
            showToast(res.message || 'خطأ في بيانات تسجيل الدخول', 'error');
          }
        }
      } else {
        // WhatsApp Provider Flow
        if (isSignup && !name.trim()) {
          showToast('يرجى كتابة الاسم الكامل أولاً قبل التسجيل برقم الواتساب', 'error');
          setIsSubmitting(false);
          return;
        }

        const res = await loginWithWhatsApp(name, whatsapp, password || '123456', isSignup);
        if (res.success) {
          showToast(`أهلاً بك! تم التسجيل/الدخول برقم الواتساب بنجاح.`);
          onSuccess();
        } else {
          showToast(res.message || 'فشل تسجيل الدخول بالواتساب', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ في النظام', 'error');
    } finally {
      setIsSubmitting(false);
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
            {isSignup ? <UserPlus className="w-7 h-7" /> : <LogIn className="w-7 h-7" />}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            لإكمال طلبك، يرجى تسجيل الدخول أو إنشاء حساب
          </h2>
          <p className="text-xs text-slate-500">
            احتفظ بسلتك ومنتجاتك وتابع الفاتورة والنقاط بكل سهولة
          </p>
        </div>

        {/* Method Toggle Tabs: Email vs WhatsApp */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              authMethod === 'email' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>البريد الإلكتروني</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMethod('whatsapp')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              authMethod === 'whatsapp' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>رقم WhatsApp</span>
          </button>
        </div>

        {/* Login Mode vs Register Mode Toggle */}
        <div className="flex items-center justify-center gap-4 text-xs font-extrabold border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setIsSignup(false)}
            className={`pb-1 transition cursor-pointer ${
              !isSignup ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            تسجيل الدخول
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => setIsSignup(true)}
            className={`pb-1 transition cursor-pointer ${
              isSignup ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            إنشاء حساب جديد
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* REQUIREMENT #3: Name field MUST BE FIRST when creating an account! */}
          {isSignup && (
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                أولاً: الاسم الكامل *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: محمد علي أحمد"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-xs font-bold focus:bg-white focus:border-brand-500 outline-none"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>
          )}

          {authMethod === 'email' ? (
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                {isSignup ? 'ثانياً: البريد الإلكتروني *' : 'البريد الإلكتروني *'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-xs font-bold focus:bg-white focus:border-brand-500 outline-none dir-ltr text-left"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                {isSignup ? 'ثانياً: رقم الواتساب (WhatsApp) *' : 'رقم الواتساب (WhatsApp) *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="مثال: 772606709"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-xs font-bold focus:bg-white focus:border-brand-500 outline-none dir-ltr text-left font-mono"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1">
              {isSignup ? 'ثالثاً: كلمة المرور *' : 'كلمة المرور *'}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-xs font-bold focus:bg-white focus:border-brand-500 outline-none dir-ltr text-left"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-2xl shadow-brand transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <span>جاري المعالجة...</span>
            ) : (
              <span>{isSignup ? 'إنشاء الحساب ومتابعة الطلب' : 'تسجيل الدخول ومتابعة الطلب'}</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
