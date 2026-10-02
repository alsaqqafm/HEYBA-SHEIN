import React, { useState } from 'react';
import { MailCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface VerifyEmailProps {
  onNavigate: (path: string) => void;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ onNavigate }) => {
  const { user, verifyEmail } = useAuth();
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [isVerified, setIsVerified] = useState(user?.email_verified || false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 4) {
      showToast('أدخل الرمز المكون من 6 أرقام المرسل لبريدك', 'error');
      return;
    }

    verifyEmail();
    setIsVerified(true);
    showToast('تم تأكيد البريد الإلكتروني بنجاح! اكتمل تفعيل الحساب.');
  };

  return (
    <div className="max-w-md mx-auto my-12 pb-16">
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-card space-y-6 text-center">
        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <MailCheck className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900">التحقق من البريد الإلكتروني</h1>
          <p className="text-xs text-slate-500 mt-1">
            لقد أرسلنا رمز التحقق إلى بريدك الإلكتروني: <br />
            <strong className="text-slate-800 dir-ltr inline-block mt-1">{user?.email || 'بريدك الإلكتروني'}</strong>
          </p>
        </div>

        {isVerified ? (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold">الحساب مكتمل ومفعل بالكامل!</p>
            <button
              onClick={() => onNavigate('/')}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              الانتقال للرئيسية والتسوق
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">أدخل رمز التحقق (OTP)</label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 text-center text-lg font-black tracking-widest text-slate-900 outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-2xl shadow-brand transition"
            >
              تأكيد وتفعيل الحساب
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
