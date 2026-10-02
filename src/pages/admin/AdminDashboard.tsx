import React from 'react';
import { Package, ShoppingBag, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../data/mockProducts';

export const AdminDashboard: React.FC = () => {
  const totalProducts = MOCK_PRODUCTS.length;
  const outOfStockCount = MOCK_PRODUCTS.filter((p) => p.stock_quantity <= 0).length;
  const inStockCount = totalProducts - outOfStockCount;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">لوحة تحكم وإحصائيات هيبة شي إن</h1>
        <p className="text-xs text-slate-400 mt-1">ملخص نشاط المتجر والمبيعات والمخزون الحي اليوم</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">إجمالي إيرادات المبيعات</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">1,428,500 <span className="text-xs font-normal text-slate-400">ر.ي</span></div>
          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.5% مقارنة بالشهر السابق
          </span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">إجمالي الطلبات</span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">142 <span className="text-xs font-normal text-slate-400">طلب</span></div>
          <span className="text-[11px] text-blue-400 font-bold">8 طلبات جديدة بانتظار الاعتماد</span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">إجمالي المنتجات في المتجر</span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{totalProducts} <span className="text-xs font-normal text-slate-400">منتج</span></div>
          <span className="text-[11px] text-purple-300 font-bold">{inStockCount} متوفر بالمخزون</span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">المنتجات المنتهية (نفذت)</span>
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400">{outOfStockCount} <span className="text-xs font-normal text-slate-400">منتجات</span></div>
          <span className="text-[11px] text-rose-300 font-bold">تحتاج إلى تزويد المخزون فوراً</span>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">المنتجات الأكثر طلبًا ومبيعات</h2>
        <div className="divide-y divide-slate-700/60">
          {MOCK_PRODUCTS.slice(0, 3).map((product) => (
            <div key={product.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img src={product.images?.[0]?.image_url} alt="" className="w-10 h-12 rounded-lg object-cover" />
                <div>
                  <span className="font-bold text-white block">{product.name}</span>
                  <span className="text-slate-400 text-[11px]">المخزون المتوفر: {product.stock_quantity} قطعة</span>
                </div>
              </div>
              <span className="font-black text-brand-400">{product.price.toLocaleString()} ر.ي</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
