import React, { useState } from 'react';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../../data/mockProducts';
import type { Product } from '../../types';
import { useToast } from '../../context/ToastContext';
import { uploadProductImage } from '../../lib/supabase';

export const AdminProducts: React.FC = () => {
  const { showToast } = useToast();
  const [productsList, setProductsList] = useState<Product[]>(MOCK_PRODUCTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(10000);
  const [oldPrice, setOldPrice] = useState<number>(14000);
  const [stock, setStock] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80');
  const [isUploading, setIsUploading] = useState(false);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setPrice(10000);
    setOldPrice(14000);
    setStock(10);
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setPrice(p.price);
    setOldPrice(p.old_price || 0);
    setStock(p.stock_quantity);
    setDescription(p.description);
    setImageUrl(p.images?.[0]?.image_url || '');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadedUrl = await uploadProductImage(file);
    setIsUploading(false);

    if (uploadedUrl) {
      setImageUrl(uploadedUrl);
      showToast('تم رفع صورة المنتج بنجاح إلى Supabase Storage!');
    } else {
      showToast('تعذر رفع الصورة أو وضع بدون مفاتيح، تم استخدام رابط اختباري', 'info');
    }
  };

  const handleDelete = (id: string) => {
    setProductsList((prev) => prev.filter((p) => p.id !== id));
    showToast('تم حذف المنتج بنجاح من قاعدة البيانات', 'info');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProductsList((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name,
                price,
                old_price: oldPrice,
                stock_quantity: stock,
                status: stock > 0 ? 'active' : 'out_of_stock',
                description,
                images: [{ id: `img-${Date.now()}`, product_id: p.id, image_url: imageUrl, sort_order: 1 }],
              }
            : p
        )
      );
      showToast('تم تحديث بيانات المنتج وسعره ومخزونه وصورته بنجاح');
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name,
        description,
        category_id: MOCK_CATEGORIES[0].id,
        price,
        old_price: oldPrice,
        stock_quantity: stock,
        status: stock > 0 ? 'active' : 'out_of_stock',
        category: MOCK_CATEGORIES[0],
        images: [{ id: `img-${Date.now()}`, product_id: 'new', image_url: imageUrl, sort_order: 1 }],
      };
      setProductsList((prev) => [newProd, ...prev]);
      showToast('تم إضافة المنتج الجديد للمتجر بنجاح!');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة المنتجات والمخزون</h1>
          <p className="text-xs text-slate-400 mt-1">تعديل الأسعار والكميات وتفعيل/تعطيل المنتجات ورفع الصور</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-purple-600/30"
        >
          <Plus className="w-4 h-4" /> إضافة منتج جديد
        </button>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-bold border-b border-slate-700">
              <tr>
                <th className="p-4">المنتج</th>
                <th className="p-4">التصنيف</th>
                <th className="p-4">السعر الحسابي</th>
                <th className="p-4">المخزون المتوفر</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-200">
              {productsList.map((p) => (
                <tr key={p.id} className="hover:bg-slate-700/30 transition">
                  <td className="p-4 flex items-center gap-3">
                    <img src={p.images?.[0]?.image_url} alt="" className="w-10 h-12 rounded-lg object-cover bg-slate-900" />
                    <div>
                      <span className="font-bold text-white block max-w-xs truncate">{p.name}</span>
                      <span className="text-[10px] text-slate-400">ID: {p.id}</span>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-300">{p.category?.name || 'أزياء'}</td>
                  <td className="p-4">
                    <span className="font-bold text-emerald-400 block">{p.price.toLocaleString()} ر.ي</span>
                    {p.old_price && <span className="text-[10px] text-slate-500 line-through">{p.old_price.toLocaleString()} ر.ي</span>}
                  </td>
                  <td className="p-4">
                    <span className={`font-black px-2.5 py-1 rounded-full text-[11px] ${
                      p.stock_quantity > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {p.stock_quantity > 0 ? `${p.stock_quantity} قطعة` : 'نفذت الكمية'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-700 text-slate-300">
                      {p.status === 'active' ? 'مميّز / نشط' : 'غير متوفر'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 bg-slate-700 hover:bg-slate-600 text-purple-300 rounded-lg transition"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 bg-slate-700 hover:bg-rose-900/60 text-rose-400 rounded-lg transition"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold border-b border-slate-800 pb-3">
              {editingProduct ? 'تعديل بيانات المنتج والمخزون' : 'إضافة منتج جديد'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المنتج *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">صورة المنتج (Supabase Storage) *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                  <label className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1">
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'جاري...' : 'رفع'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">السعر (ر.ي) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">السعر السابق</label>
                  <input
                    type="number"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المخزون *</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الوصف التفصيلي</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 font-bold text-xs rounded-xl transition"
                >
                  حفظ البيانات
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 font-bold text-xs rounded-xl transition"
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
