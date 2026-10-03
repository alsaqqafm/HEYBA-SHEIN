import React, { useState } from 'react';
import { User, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface LoginProps {
  onNavigate: (path: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      showToast('تم تسجيل الدخول بنجاح! مرحباً بك في هيبة شي إن.');
      if (email.trim().toLowerCase() === 'mohammed.f.saqqaf@gmail.com') {
        onNavigate('/admin');
      } else {
        onNavigate('/');
      }
    } else {
      showToast(res.message || 'خطأ في بيانات الدخول', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 pb-16">
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <User className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">تسجيل الدخول</h1>
          <p className="text-xs text-slate-500">أدخل معلومات حسابك للوصول لمنتجاتك وطلبك</p>
        </div>

        <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-[11px] text-purple-900 leading-relaxed text-right">
          💡 <strong>حساب الإدارة المصرح:</strong> <code>mohammed.f.saqqaf@gmail.com</code>
        </div>

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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-3 text-xs font-bold focus:bg-white focus:border-brand-500 outline-none dir-ltr text-left"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">كلمة المرور *</label>
              <button
                type="button"
                onClick={() => onNavigate('/forgot-password')}
                className="text-[11px] font-bold text-brand-600 hover:underline"
              >
                نسيت كلمة المرور؟
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-3 text-xs font-bold focus:bg-white focus:border-brand-500 outline-none dir-ltr text-left"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-2xl shadow-brand transition flex items-center justify-center gap-2"
          >
            {loading ? <span>جاري التحقق...</span> : <span>تسجيل الدخول</span>}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          ليس لديك حساب بعد؟{' '}
          <button
            onClick={() => onNavigate('/register')}
            className="font-bold text-brand-600 hover:underline"
          >
            إنشاء حساب جديد
          </button>
        </div>
      </div>
    </div>
  );
};
