import React, { useState, useEffect } from 'react';
import { Truck, Plus, Edit2, Power, Trash2, Phone, MapPin, CheckCircle2, XCircle, Search, MessageSquare, X } from 'lucide-react';
import type { ShippingCompany } from '../../types';
import {
  getStoredShippingCompanies,
  addShippingCompany,
  updateShippingCompany,
  toggleShippingCompanyStatus,
  deleteShippingCompany,
} from '../../lib/shippingCompanies';
import { useToast } from '../../context/ToastContext';
import { YEMEN_GOVERNORATES } from '../../data/yemenLocations';

export const AdminShippingCompanies: React.FC = () => {
  const { showToast } = useToast();
  const [companies, setCompanies] = useState<ShippingCompany[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<ShippingCompany | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [governorate, setGovernorate] = useState('إب');
  const [area, setArea] = useState('الظهار');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const loadData = () => {
    setCompanies(getStoredShippingCompanies());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingCompany(null);
    setName('');
    setPhone('');
    setWhatsapp('');
    setGovernorate('إب');
    setArea('الظهار');
    setAddress('');
    setNotes('');
    setStatus('active');
    setShowModal(true);
  };

  const openEditModal = (co: ShippingCompany) => {
    setEditingCompany(co);
    setName(co.name);
    setPhone(co.phone);
    setWhatsapp(co.whatsapp || '');
    setGovernorate(co.governorate);
    setArea(co.area);
    setAddress(co.address);
    setNotes(co.notes || '');
    setStatus(co.status);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      showToast('يرجى ملء جميع الحقول الأساسية (الاسم، الهاتف، العنوان)', 'error');
      return;
    }

    if (editingCompany) {
      updateShippingCompany(editingCompany.id, {
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || undefined,
        governorate,
        area,
        address: address.trim(),
        notes: notes.trim() || undefined,
        status,
      });
      showToast('تم تحديث بيانات شركة التوصيل بنجاح');
    } else {
      addShippingCompany({
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || undefined,
        governorate,
        area,
        address: address.trim(),
        notes: notes.trim() || undefined,
        status,
      });
      showToast('تمت إضافة شركة التوصيل الجديدة بنجاح 🎉');
    }

    setShowModal(false);
    loadData();
  };

  const handleToggleStatus = (id: string) => {
    toggleShippingCompanyStatus(id);
    showToast('تم تغيير حالة شركة التوصيل');
    loadData();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`هل أنت تأكد من إلغاء/حذف شركة التوصيل "${name}"؟ يُفضل تعطيلها بدلاً من الحذف لضمان سلامة الطلبات القديمة.`)) {
      deleteShippingCompany(id);
      showToast('تم حذف الشركة بنجاح');
      loadData();
    }
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.governorate.includes(searchTerm)
  );

  return (
    <div className="space-y-6 pb-12 text-right">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-3xl border border-slate-700/60 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-600/20 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/30">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">إدارة شركات التوصيل</h1>
            <p className="text-xs text-slate-400 mt-1">تأسيس وإدارة شركات الشحن والتوصيل المعتمدة لتغطية المحافظات</p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة شركة توصيل جديدة</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="البحث باسم الشركة، رقم الهاتف، أو المحافظة..."
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none"
        />
      </div>

      {/* Companies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCompanies.map((co) => (
          <div
            key={co.id}
            className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700/60 shadow-lg space-y-4 relative flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-700 text-purple-400 rounded-xl flex items-center justify-center font-black">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">{co.name}</h3>
                    <span className="text-[10px] text-slate-400 block font-mono">ID: {co.id}</span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    co.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {co.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span>{co.status === 'active' ? 'نشطة ومتوفرة' : 'غير نشطة'}</span>
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>الهاتف: <strong className="text-white dir-ltr inline-block">{co.phone}</strong></span>
                </div>
                {co.whatsapp && (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>WhatsApp: <strong className="text-emerald-300 dir-ltr inline-block">{co.whatsapp}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>العنوان: {co.address}</span>
                </div>
              </div>

              {co.notes && (
                <p className="text-[11px] text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {co.notes}
                </p>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700/50">
              <button
                onClick={() => handleToggleStatus(co.id)}
                title={co.status === 'active' ? 'تعطيل الشركة' : 'تفعيل الشركة'}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  co.status === 'active'
                    ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{co.status === 'active' ? 'تعطيل' : 'تفعيل'}</span>
              </button>

              <button
                onClick={() => openEditModal(co)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>

              <button
                onClick={() => handleDelete(co.id, co.name)}
                className="px-3 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-800 relative space-y-6 my-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute left-4 top-4 w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-white">
                {editingCompany ? 'تعديل شركة التوصيل' : 'إضافة شركة توصيل جديدة'}
              </h2>
              <p className="text-xs text-slate-400">سجل بيانات شركة الشحن لاعتمادها بالمنصة</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">اسم شركة التوصيل *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: شركة هيبة اكسبريس"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">رقم الهاتف التواصل *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="772606709"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-white outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">رقم الواتساب (اختياري)</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="772606709"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-white outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">المحافظة *</label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-white outline-none focus:border-purple-500"
                  >
                    {YEMEN_GOVERNORATES.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">المنطقة / المديرية *</label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="مثال: الظهار"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">العنوان التفصيلي ومقرات الشركة *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="شارع العدين - قرب مستشفى الثورة"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">حالة الشركة بالمنصة</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-white outline-none focus:border-purple-500"
                >
                  <option value="active">نشطة (متاحة لتعيين الطلبات)</option>
                  <option value="inactive">غير نشطة (معطلة)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">ملاحظات إضافية (اختياري)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي ملاحظات حول نطاق التغطية أو أوقات الدوام..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-white outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-lg shadow-purple-600/30"
                >
                  {editingCompany ? 'حفظ التغييرات' : 'إضافة الشركة الآن'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
