import React from 'react';
import { Phone, Mail, MapPin, Shield, Truck, RefreshCw, CreditCard } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-24 lg:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800 text-center">
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-800/40">
            <Truck className="w-8 h-8 text-brand-400" />
            <h4 className="font-bold text-white text-sm">توصيل سريع وموثوق</h4>
            <p className="text-xs text-slate-400">تغطية لكافة مدن ومحافظات اليمن</p>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-800/40">
            <Shield className="w-8 h-8 text-brand-400" />
            <h4 className="font-bold text-white text-sm">ضمان الجودة الأصلي</h4>
            <p className="text-xs text-slate-400">منتجات منقاة بعناية وأصالة 100%</p>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-800/40">
            <CreditCard className="w-8 h-8 text-jeeb" />
            <h4 className="font-bold text-white text-sm">دفع سهل وآمن</h4>
            <p className="text-xs text-slate-400">عبر محفظة جيب وحساب الكريمي</p>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-800/40">
            <RefreshCw className="w-8 h-8 text-amber-400" />
            <h4 className="font-bold text-white text-sm">نظام مكافآت النقاط</h4>
            <p className="text-xs text-slate-400">احصل على نقاط مع كل طلب مكتمل</p>
          </div>
        </div>

        {/* Footer Main Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                <img src="/favicon.svg" alt="HEYBA" className="w-6 h-6 filter brightness-0 invert" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-lg">هيبة شي إن</h3>
                <span className="text-xs text-brand-400 font-bold uppercase tracking-wider">HEYBA Shein</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              منصة التسوق الرائدة للأزياء والمنتجات الحديثة بلمسة عصرية ومبتكرة، توفر تجربة تسوق مريحة بأسعار منافسة وسرعة فائقة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">روابط سريعة</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => onNavigate('/')} className="hover:text-white transition">الرئيسية</button></li>
              <li><button onClick={() => onNavigate('/products')} className="hover:text-white transition">جميع المنتجات</button></li>
              <li><button onClick={() => onNavigate('/cart')} className="hover:text-white transition">سلة التسوق</button></li>
              <li><button onClick={() => onNavigate('/account')} className="hover:text-white transition">حسابي والطلبات</button></li>
              <li><button onClick={() => onNavigate('/admin')} className="hover:text-white transition text-purple-400">لوحة الإدارة</button></li>
            </ul>
          </div>

          {/* Supported Payments */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">طرق الدفع المعتمَدة في اليمن</h4>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-xs">
                  جيب
                </div>
                <div>
                  <h5 className="font-bold text-white text-xs">محفظة جيب (JEEB)</h5>
                  <p className="text-[10px] text-slate-400">تحويل سريع وآمن بدون عمولة</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center text-xs">
                  كريمي
                </div>
                <div>
                  <h5 className="font-bold text-white text-xs">حساب الكريمي (Kuraimi)</h5>
                  <p className="text-[10px] text-slate-400">إيداع وحوالات مميزة مباشرة</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">التواصل والدعم</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+967 770 000 000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>support@heybashein.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>الجمهورية اليمنية — صنعاء / عدن</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 HEYBA Shein | جميع الحقوق محفوظة لمنصة هيبة شي إن.</p>
          <p className="text-[11px]">تصميم وتطوير بهوية زرقاء مخصصة 100%.</p>
        </div>
      </div>
    </footer>
  );
};
