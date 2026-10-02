import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminSettings: React.FC = () => {
  const { showToast } = useToast();

  const [appName, setAppName] = useState('HEYBA Shein | هيبة شي إن');
  const [phone, setPhone] = useState('+967 770 000 000');
  const [email, setEmail] = useState('support@heybashein.com');
  const [address, setAddress] = useState('صنعاء - شارع حوبان / عدن - المعلا');
  const [invoiceFooter, setInvoiceFooter] = useState('شكراً لتسوقك من HEYBA Shein - نتمنى لك تجربة أزياء استثنائية!');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('تم حفظ إعدادات المنصة وبيانات الفاتورة والتواصل بنجاح!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">إعدادات المنصة والفاتورة</h1>
        <p className="text-xs text-slate-400 mt-1">تعديل اسم المنصة والشعار ومعلومات التواصل وتذييل الفاتورة</p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 space-y-6 shadow-xl max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">اسم المنصة الظاهر للعملاء *</label>
            <input
              type="text"
              required
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف والتواصل *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none dir-ltr text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">البريد الإلكتروني للدعم *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none dir-ltr text-left"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">العنوان والمقر الرئيسي *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">ملاحظة شكر وتذييل فاتورة PDF</label>
            <textarea
              rows={3}
              value={invoiceFooter}
              onChange={(e) => setInvoiceFooter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> حفظ الإعدادات والتحديث
        </button>
      </form>
    </div>
  );
};
