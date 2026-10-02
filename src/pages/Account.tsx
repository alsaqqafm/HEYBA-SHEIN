import React from 'react';
import { User, Award, Package, FileText, CheckCircle2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateInvoicePDF } from '../lib/pdfGenerator';
import type { Order } from '../types';

interface AccountProps {
  onNavigate: (path: string) => void;
}

const SAMPLE_ORDERS: Order[] = [
  {
    id: 'ord-101',
    order_number: 'HEYBA-2026-000001',
    user_id: 'usr-cust-01',
    customer_name: 'محمد علي',
    customer_email: 'm.ali@example.com',
    customer_phone: '+967 771 234 567',
    delivery_address: 'صنعاء - شارع حوبان',
    subtotal: 27000,
    discount: 0,
    delivery_fee: 1500,
    total: 28500,
    payment_method: 'JEEB',
    payment_reference: '#REF-982312',
    status: 'COMPLETED',
    points_earned: 250,
    created_at: '2026-10-01T10:00:00.000Z',
    items: [
      {
        id: 'item-1',
        product_name: 'فستان أزرق ملكي فاخر للسهرات',
        price: 18500,
        quantity: 1,
        total: 18500,
      },
      {
        id: 'item-2',
        product_name: 'حقيبة يد نسائية فاخرة',
        price: 8500,
        quantity: 1,
        total: 8500,
      },
    ],
  },
];

export const Account: React.FC<AccountProps> = ({ onNavigate }) => {
  const { user, points, isEmailVerified, logout } = useAuth();

  if (!user) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4 max-w-md mx-auto my-12">
        <User className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">يرجى تسجيل الدخول للوصول لحسابك</h2>
        <button
          onClick={() => onNavigate('/login')}
          className="px-6 py-2.5 bg-brand-600 text-white rounded-full font-bold text-xs"
        >
          تسجيل الدخول
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-600 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-brand">
        <div className="flex items-center gap-4 text-right">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-extrabold flex items-center justify-center text-2xl shadow-inner">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">{user.name}</h1>
              {isEmailVerified ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> بريد موثق
                </span>
              ) : (
                <button
                  onClick={() => onNavigate('/verify-email')}
                  className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/30 hover:bg-amber-500/30 transition"
                >
                  وثق بريدك الآن ⚠️
                </button>
              )}
            </div>
            <p className="text-xs text-sky-200 mt-1">{user.email}</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[180px]">
          <div className="flex items-center justify-center gap-1.5 text-amber-300 mb-1">
            <Award className="w-5 h-5 fill-amber-300" />
            <span className="text-xs font-extrabold">ميزان النقاط:</span>
          </div>
          <span className="text-3xl font-black text-white">{points}</span>
          <span className="text-[10px] text-sky-200 block">نقطة مكافآت</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-brand-600" /> سجل الطلبات والفواتير
        </h2>

        {SAMPLE_ORDERS.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 hover:border-brand-200 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 block font-semibold">رقم الطلب:</span>
                <span className="font-extrabold text-slate-900 text-base">{order.order_number}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> طلب مكتمل معتمد
                </span>
                <button
                  onClick={() => generateInvoicePDF(order)}
                  className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <FileText className="w-4 h-4 text-brand-600" /> تنزيل فاتورة PDF
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">{item.product_name} x {item.quantity}</span>
                  <span className="font-semibold text-slate-600">{item.total.toLocaleString()} ر.ي</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>طريقة الدفع: {order.payment_method === 'JEEB' ? 'محفظة جيب' : 'حساب الكريمي'} ({order.payment_reference})</span>
              <span className="text-sm font-black text-brand-600">الإجمالي: {order.total.toLocaleString()} ر.ي</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 text-center">
        <button
          onClick={() => {
            logout();
            onNavigate('/');
          }}
          className="px-6 py-3 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-2xl font-bold text-xs inline-flex items-center gap-2 transition"
        >
          <LogOut className="w-4 h-4" /> تسجيل الخروج من الحساب
        </button>
      </div>
    </div>
  );
};
