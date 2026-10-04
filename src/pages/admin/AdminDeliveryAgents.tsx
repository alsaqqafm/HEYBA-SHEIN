import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit2, Trash2, Phone, MapPin, Search, MessageSquare, X, ShieldAlert, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { DeliveryAgent, DeliveryAgentStatus, ShippingCompany } from '../../types';
import {
  getStoredDeliveryAgents,
  addDeliveryAgent,
  updateDeliveryAgent,
  toggleDeliveryAgentStatus,
  deleteDeliveryAgent,
} from '../../lib/deliveryAgents';
import { getStoredShippingCompanies } from '../../lib/shippingCompanies';
import { useToast } from '../../context/ToastContext';
import { YEMEN_GOVERNORATES } from '../../data/yemenLocations';

export const AdminDeliveryAgents: React.FC = () => {
  const { showToast } = useToast();
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompany[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<DeliveryAgent | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [shippingCompanyId, setShippingCompanyId] = useState('');
  const [governorate, setGovernorate] = useState('إب');
  const [area, setArea] = useState('الظهار');
  const [status, setStatus] = useState<DeliveryAgentStatus>('available');
  const [notes, setNotes] = useState('');

  const loadData = () => {
    const activeCompanies = getStoredShippingCompanies().filter((c) => c.status === 'active');
    setShippingCompanies(activeCompanies);
    setAgents(getStoredDeliveryAgents());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    if (shippingCompanies.length === 0) {
      showToast('يرجى إضافة وتفعيل شركة توصيل واحدة على الأقل قبل إضافة المندوبين', 'error');
      return;
    }
    setEditingAgent(null);
    setName('');
    setPhone('');
    setWhatsapp('');
    setShippingCompanyId(shippingCompanies[0]?.id || '');
    setGovernorate('إب');
    setArea('الظهار');
    setStatus('available');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (agent: DeliveryAgent) => {
    setEditingAgent(agent);
    setName(agent.name);
    setPhone(agent.phone);
    setWhatsapp(agent.whatsapp || '');
    setShippingCompanyId(agent.shipping_company_id);
    setGovernorate(agent.governorate);
    setArea(agent.area);
    setStatus(agent.status);
    setNotes(agent.notes || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !shippingCompanyId) {
      showToast('يرجى اختيار شركة التوصيل وتعبئة الاسم ورقم الهاتف الأساسي', 'error');
      return;
    }

    const selectedCompany = shippingCompanies.find((c) => c.id === shippingCompanyId);
    if (!selectedCompany) {
      showToast('شركة التوصيل المختارة غير موجودة أو غير نشطة', 'error');
      return;
    }

    if (editingAgent) {
      updateDeliveryAgent(editingAgent.id, {
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || undefined,
        shipping_company_id: selectedCompany.id,
        shipping_company_name: selectedCompany.name,
        governorate,
        area: area.trim(),
        status,
        notes: notes.trim() || undefined,
      });
      showToast('تم تحديث بيانات مندوب التوصيل بنجاح');
    } else {
      addDeliveryAgent({
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || undefined,
        shipping_company_id: selectedCompany.id,
        shipping_company_name: selectedCompany.name,
        governorate,
        area: area.trim(),
        status,
        notes: notes.trim() || undefined,
      });
      showToast('تمت إضافة مندوب التوصيل الجديد بنجاح 🎉');
    }

    setShowModal(false);
    loadData();
  };

  const handleStatusChange = (agentId: string, newStatus: DeliveryAgentStatus) => {
    toggleDeliveryAgentStatus(agentId, newStatus);
    showToast('تم تغيير حالة المندوب');
    loadData();
  };

  const handleDelete = (agentId: string, name: string) => {
    if (confirm(`هل أنت تأكد من تعليق/حذف المندوب "${name}"؟ يُفضل تغيير حالته إلى (موقوف/غير متاح) للحفاظ على الطلبات المرتبطة به.`)) {
      deleteDeliveryAgent(agentId);
      showToast('تم حذف المندوب بنجاح');
      loadData();
    }
  };

  const filteredAgents = agents.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone.includes(searchTerm) ||
      a.shipping_company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = companyFilter ? a.shipping_company_id === companyFilter : true;
    return matchesSearch && matchesCompany;
  });

  const getStatusBadge = (st: DeliveryAgentStatus) => {
    switch (st) {
      case 'available':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> متاح لاستلام الطلبات
          </span>
        );
      case 'busy':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <Clock className="w-3 h-3" /> مشغول في جولة توصيل
          </span>
        );
      case 'unavailable':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> غير متاح حالياً
          </span>
        );
      case 'suspended':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> موقوف من الإدارة
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 text-right">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-3xl border border-slate-700/60 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-600/20 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/30">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">إدارة مندوبي التوصيل</h1>
            <p className="text-xs text-slate-400 mt-1">تجهيز المندوبين وربطهم بشركات التوصيل وتغيير حالة التوفر</p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مندوب توصيل جديد</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث باسم المندوب، الهواتف، أو شركة التوصيل..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none"
          />
        </div>

        <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50">
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-full bg-slate-900 text-xs text-white border border-slate-700 rounded-xl py-1.5 px-3 outline-none"
          >
            <option value="">كل شركات التوصيل ({shippingCompanies.length})</option>
            {shippingCompanies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Agents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700/60 shadow-lg space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600/30 text-purple-300 rounded-xl flex items-center justify-center font-black">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">{agent.name}</h3>
                    <span className="text-[11px] text-purple-400 font-bold block">{agent.shipping_company_name}</span>
                  </div>
                </div>

                {getStatusBadge(agent.status)}
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>هاتف المندوب: <strong className="text-white dir-ltr inline-block">{agent.phone}</strong></span>
                </div>
                {agent.whatsapp && (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>WhatsApp: <strong className="text-emerald-300 dir-ltr inline-block">{agent.whatsapp}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>منطقة التغطية: {agent.governorate} - {agent.area}</span>
                </div>
              </div>

              {agent.notes && (
                <p className="text-[11px] text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {agent.notes}
                </p>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-700/50">
              <select
                value={agent.status}
                onChange={(e) => handleStatusChange(agent.id, e.target.value as DeliveryAgentStatus)}
                className="bg-slate-900 border border-slate-700 text-[11px] font-bold rounded-xl px-2 py-1.5 text-slate-200 outline-none cursor-pointer"
              >
                <option value="available">1. متاح</option>
                <option value="busy">2. مشغول</option>
                <option value="unavailable">3. غير متاح</option>
                <option value="suspended">4. موقوف</option>
              </select>

              <div className="flex gap-1.5">
                <button
                  onClick={() => openEditModal(agent)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </button>

                <button
                  onClick={() => handleDelete(agent.id, agent.name)}
                  className="px-3 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </button>
              </div>
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
                {editingAgent ? 'تعديل بيانات المندوب' : 'إضافة مندوب توصيل جديد'}
              </h2>
              <p className="text-xs text-slate-400">ربط المندوب بشركة التوصيل وتحديد منطقة التغطية</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">اسم المندوب الكامل *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: الكابتن أحمد الخولاني"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">شركة التوصيل التابع لها المندوب *</label>
                <select
                  required
                  value={shippingCompanyId}
                  onChange={(e) => setShippingCompanyId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-white outline-none focus:border-purple-500"
                >
                  {shippingCompanies.map((co) => (
                    <option key={co.id} value={co.id}>
                      {co.name} ({co.governorate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">رقم الهاتف التواصل *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="770001122"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-white outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">رقم الواتساب (اختياري)</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="770001122"
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
                  <label className="block font-bold text-slate-300 mb-1">المنطقة / خط السير *</label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="مثال: الظهار والعدين"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">حالة المندوب بالمنصة</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DeliveryAgentStatus)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-white outline-none focus:border-purple-500"
                >
                  <option value="available">متاح (جاهز لاستلام الشحنات)</option>
                  <option value="busy">مشغول (في جولة توصيل حالياً)</option>
                  <option value="unavailable">غير متاح (خارج ساعات الدوام)</option>
                  <option value="suspended">موقوف (موقوف من الإدارة)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">ملاحظات الإدارة (اختياري)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي ملاحظات إضافية حول التغطية والمواعيد..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-white outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  {editingAgent ? 'حفظ التغييرات' : 'إضافة المندوب الآن'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
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
