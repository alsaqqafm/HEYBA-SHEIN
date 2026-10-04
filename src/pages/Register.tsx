import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface RegisterProps {
  onNavigate: (path: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const { signup } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signup(name, email, password);
    setLoading(false);

    if (res.success) {
      showToast(res.message || 'تم التقديم بنجاح! أرسلنا رابط/رمز التحقق للبريد.');
      onNavigate('/verify-email');
    } else {
      showToast(res.message || 'فشل إنشاء الحساب', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 pb-16">
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-card space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <UserPlus className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">إنشاء حساب جديد</h1>
          <p className="text-xs text-slate-500">حساب بسيط يتطلب فقط الاسم والبريد وكلمة السر</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1">أولاً: الاسم الكامل / Full Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم بالعربي / Full Name"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-3 text-xs font-bold focus:bg-white focus:border-brand-500 outline-none"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1">ثانياً: البريد الإلكتروني أو رقم الجوال / Email or Phone *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني أو رقم الجوال / Email or Phone"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-3 text-xs font-bold focus:bg-white focus:border-brand-500 outline-none text-right"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1">ثالثاً: كلمة المرور / Password (8 خانات على الأقل) *</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (8 خانات على الأقل)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-3 text-xs font-bold focus:bg-white focus:border-brand-500 outline-none tracking-widest text-left dir-ltr"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-2xl shadow-brand transition flex items-center justify-center gap-2"
          >
            {loading ? <span>جاري الإنشاء...</span> : <span>إنشاء الحساب والتحقق</span>}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          لديك حساب بالفعل؟{' '}
          <button
            onClick={() => onNavigate('/login')}
            className="font-bold text-brand-600 hover:underline"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  );
};
