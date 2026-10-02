import React, { useState } from 'react';
import { Award, Plus, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminPoints: React.FC = () => {
  const { showToast } = useToast();

  const [pointsPer1000, setPointsPer1000] = useState(10);
  const [minOrder, setMinOrder] = useState(1000);

  const [manualUserEmail, setManualUserEmail] = useState('');
  const [manualAmount, setManualAmount] = useState(50);
  const [manualNote, setManualNote] = useState('إضافة نقاط مكافأة تشجيعية من الإدارة');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('تم حفظ قواعد احتساب النقاط بنجاح!');
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`تم تعديل النقاط بمقدار ${manualAmount} للعميل ${manualUserEmail}`);
    setManualUserEmail('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">إدارة نظام النقاط والمكافآت</h1>
        <p className="text-xs text-slate-400 mt-1">التحكم في نقاط الشراء وإمكانية إضافة أو خصم نقاط يدويًا للعملاء</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={handleSaveConfig} className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
            <Award className="w-6 h-6 text-amber-400" />
            <h2 className="font-extrabold text-white text-base">قواعد الاحتساب التلقائي</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">عدد النقاط لكل 1,000 ريال يمني</label>
            <input
              type="number"
              value={pointsPer1000}
              onChange={(e) => setPointsPer1000(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">الحد الأدنى لقيمة الطلب لاحتساب النقاط (ر.ي)</label>
            <input
              type="number"
              value={minOrder}
              onChange={(e) => setMinOrder(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 font-bold text-xs text-white rounded-xl transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> حفظ قواعد النقاط
          </button>
        </form>

        <form onSubmit={handleAddManual} className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
            <Plus className="w-6 h-6 text-emerald-400" />
            <h2 className="font-extrabold text-white text-base">إضافة أو خصم نقاط يدويًا لعميل</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">بريد العميل *</label>
            <input
              type="email"
              required
              placeholder="customer@example.com"
              value={manualUserEmail}
              onChange={(e) => setManualUserEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none dir-ltr text-left"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">عدد النقاط (موجب للإضافة، سالب للخصم) *</label>
            <input
              type="number"
              required
              value={manualAmount}
              onChange={(e) => setManualAmount(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">السبب / الملاحظة *</label>
            <input
              type="text"
              required
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl transition flex items-center gap-2"
          >
            تحديث نقاط العميل
          </button>
        </form>
      </div>
    </div>
  );
};
