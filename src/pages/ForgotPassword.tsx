import React, { useState } from 'react';
import { KeyRound, Mail, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ForgotPasswordProps {
  onNavigate: (path: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    showToast('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.');
  };

  return (
    <div className="max-w-md mx-auto my-12 pb-16">
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">استعادة كلمة المرور</h1>
          <p className="text-xs text-slate-500">أدخل بريدك وسيصلك رابط التعيين فوراً</p>
        </div>

        {sent ? (
          <div className="p-4 rounded-2xl bg-sky-50 text-sky-900 border border-sky-200 text-center space-y-3">
            <p className="text-xs font-bold">تفقد صندوق الوارد في بريدك الآن لتحديد كلمة مرور جديدة.</p>
            <button
              onClick={() => onNavigate('/login')}
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              العودة لتسجيل الدخول
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-3 text-xs font-bold outline-none text-left dir-ltr"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-2xl shadow-brand transition"
            >
              إرسال رابط إعادة التعيين
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 text-center">
          <button
            onClick={() => onNavigate('/login')}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
          >
            <ArrowRight className="w-3.5 h-3.5" /> تذكرت كلمة المرور؟ تسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  );
};
