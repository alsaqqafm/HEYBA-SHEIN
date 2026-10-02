import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const sampleCustomers = [
    {
      id: 'cust-1',
      name: 'محمد علي أحمد',
      email: 'm.ali@example.com',
      phone: '+967 771 234 567',
      points: 250,
      ordersCount: 3,
      verified: true,
      joined: '2026-09-15',
    },
    {
      id: 'cust-2',
      name: 'فاطمة الزهراء',
      email: 'fatima.z@example.com',
      phone: '+967 773 999 888',
      points: 120,
      ordersCount: 1,
      verified: true,
      joined: '2026-09-28',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">إدارة حسابات العملاء</h1>
        <p className="text-xs text-slate-400 mt-1">مشاهدة العملاء المسجلين، حالة التوثيق وميزان النقاط لكل حساب</p>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-bold border-b border-slate-700">
              <tr>
                <th className="p-4">اسم العميل</th>
                <th className="p-4">البريد الإلكتروني</th>
                <th className="p-4">رقم الهاتف</th>
                <th className="p-4">حالة التوثيق</th>
                <th className="p-4">نقاط المكافآت</th>
                <th className="p-4">عدد الطلبات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-200">
              {sampleCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-700/30 transition">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-900 text-purple-200 font-bold flex items-center justify-center text-xs">
                      {c.name.charAt(0)}
                    </div>
                    <span>{c.name}</span>
                  </td>
                  <td className="p-4 text-slate-300 dir-ltr text-right">{c.email}</td>
                  <td className="p-4 text-slate-400 dir-ltr text-right">{c.phone}</td>
                  <td className="p-4">
                    {c.verified ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> موثق Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-800">
                        قيد التحقق
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="font-extrabold text-amber-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 fill-amber-400" /> {c.points} نقطة
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-300">{c.ordersCount} طلبات</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
