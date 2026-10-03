import React, { useState } from 'react';
import { Save, Wallet, CreditCard } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminPayments: React.FC = () => {
  const { showToast } = useToast();

  const [jeebAccount, setJeebAccount] = useState('772606709');
  const [jeebName, setJeebName] = useState('متجر هيبة شي إن الإلكتروني');
  const [kuraimiAccount, setKuraimiAccount] = useState('772606709');
  const [kuraimiName, setKuraimiName] = useState('شركة هيبة شي إن للتجارة');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('تم تحديث أرقام حسابات محفظة جيب والكريمي بنجاح!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">إدارة إعدادات طرق الدفع (اليمن)</h1>
        <p className="text-xs text-slate-400 mt-1">تعديل أرقام الحسابات والتعليمات الظاهرة للعملاء عند الشراء</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Jeeb Card */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <h2 className="font-extrabold text-white text-base">بيانات محفظة جيب (JEEB)</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">اسم الحساب *</label>
            <input
              type="text"
              required
              value={jeebName}
              onChange={(e) => setJeebName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">رقم المحفظة / رقم الهاتف *</label>
            <input
              type="text"
              required
              value={jeebAccount}
              onChange={(e) => setJeebAccount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none text-left dir-ltr"
            />
          </div>
        </div>

        {/* Kuraimi Card */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
            <CreditCard className="w-6 h-6 text-amber-400" />
            <h2 className="font-extrabold text-white text-base">بيانات حساب الكريمي (KURAIMI)</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">اسم الحساب في الكريمي *</label>
            <input
              type="text"
              required
              value={kuraimiName}
              onChange={(e) => setKuraimiName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">رقم الحساب المُميز *</label>
            <input
              type="text"
              required
              value={kuraimiAccount}
              onChange={(e) => setKuraimiAccount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none text-left dir-ltr"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> حفظ بيانات وسائل الدفع
          </button>
        </div>
      </form>
    </div>
  );
};
