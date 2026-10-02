import React, { useState } from 'react';
import { Plus, Trash2, FolderTree } from 'lucide-react';
import { MOCK_CATEGORIES } from '../../data/mockProducts';
import type { Category } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminCategories: React.FC = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      status: 'active',
      description: 'تصنيف جديد تم إنشاؤه عبر لوحة الإدارة',
    };
    setCategories((prev) => [...prev, newCat]);
    setName('');
    setSlug('');
    showToast('تم إنشاء التصنيف الجديد بنجاح!');
  };

  const handleDelete = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('تم حذف التصنيف من القائمة', 'info');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">إدارة تصنيفات المنتجات</h1>
        <p className="text-xs text-slate-400 mt-1">إضافة، تعديل أو حذف الأقسام والتصنيفات الرئيسية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleAddCategory} className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 space-y-4 shadow-xl h-fit">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
            <FolderTree className="w-5 h-5 text-purple-400" />
            <h2 className="font-extrabold text-white text-sm">إضافة تصنيف جديد</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">اسم التصنيف بالعربية *</label>
            <input
              type="text"
              required
              placeholder="مثال: عبايات ومجوهرات"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">الرابط الإنجليزي (Slug)</label>
            <input
              type="text"
              placeholder="abayas"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none dir-ltr text-left"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> حفظ التصنيف
          </button>
        </form>

        <div className="md:col-span-2 bg-slate-800/80 border border-slate-700/60 rounded-3xl overflow-hidden shadow-xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-bold border-b border-slate-700">
              <tr>
                <th className="p-4">اسم التصنيف</th>
                <th className="p-4">الرابط Slug</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-200">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="p-4 font-bold text-white">{c.name}</td>
                  <td className="p-4 font-mono text-slate-400">{c.slug}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                      نشط Active
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 bg-slate-700 hover:bg-rose-900/60 text-rose-400 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
