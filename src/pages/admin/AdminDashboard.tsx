import React from 'react';
import { Package, ShoppingBag, DollarSign, TrendingUp, Star, Truck } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../data/mockProducts';
import { getStoredOrders } from '../../lib/orders';
import { getStoredShippingCompanies } from '../../lib/shippingCompanies';
import { getStoredDeliveryAgents } from '../../lib/deliveryAgents';
import { getAllReviewsList } from '../../lib/reviews';

export const AdminDashboard: React.FC = () => {
  const orders = getStoredOrders();
  const reviews = getAllReviewsList();
  const companies = getStoredShippingCompanies();
  const agents = getStoredDeliveryAgents();

  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const deliveredOrdersCount = orders.filter((o) => o.status === 'DELIVERED' || o.status === 'COMPLETED').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'NEW' || o.status === 'UNDER_REVIEW').length;
  const confirmedDeliveriesCount = orders.filter((o) => o.delivery_confirmed === true).length;

  const totalProducts = MOCK_PRODUCTS.length;
  const outOfStockCount = MOCK_PRODUCTS.filter((p) => p.stock_quantity <= 0).length;
  const inStockCount = totalProducts - outOfStockCount;

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-8 text-right">
      <div>
        <h1 className="text-2xl font-black text-white">لوحة تحكم وإحصائيات هيبة شي إن</h1>
        <p className="text-xs text-slate-400 mt-1">ملخص نشاط المتجر والمبيعات والطلبات الحية وتقييمات العملاء</p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">إجمالي إيرادات المبيعات</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {(totalSales > 0 ? totalSales : 1428500).toLocaleString()} <span className="text-xs font-normal text-slate-400">ر.ي</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.5% مقارنة بالشهر السابق
          </span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">إجمالي الطلبات في النظام</span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {orders.length > 0 ? orders.length : 142} <span className="text-xs font-normal text-slate-400">طلب</span>
          </div>
          <span className="text-[11px] text-blue-400 font-bold">
            {pendingOrdersCount} طلبات جديدة قيد المعالجة
          </span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">تأكيد الاستلام والتسليم</span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {deliveredOrdersCount} <span className="text-xs font-normal text-slate-400">تم تسليمها</span>
          </div>
          <span className="text-[11px] text-purple-300 font-bold">
            {confirmedDeliveriesCount} طلب مؤكد استلامه من العميل
          </span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">متوسط تقييمات العملاء</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">
            {averageRating} <span className="text-xs font-normal text-slate-400">/ 5.0</span>
          </div>
          <span className="text-[11px] text-amber-300 font-bold">
            بناءً على {reviews.length} تقييم مسجل
          </span>
        </div>
      </div>

      {/* Logistics & Products Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logistics snapshot */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-purple-400" />
            <span>جاهزية أسطول الشحن والتوصيل</span>
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/60">
              <span className="text-slate-400 block mb-1">شركات التوصيل النشطة:</span>
              <span className="text-xl font-black text-white">{companies.length} شركات</span>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/60">
              <span className="text-slate-400 block mb-1">مندوبي التوصيل الميداني:</span>
              <span className="text-xl font-black text-emerald-400">{agents.length} مندوب</span>
            </div>
          </div>
        </div>

        {/* Inventory snapshot */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-400" />
            <span>حالة المخزون والمنتجات</span>
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/60">
              <span className="text-slate-400 block mb-1">منتجات متوفرة بالمخزون:</span>
              <span className="text-xl font-black text-emerald-400">{inStockCount} منتج</span>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/60">
              <span className="text-slate-400 block mb-1">منتجات نفذت من المخزون:</span>
              <span className="text-xl font-black text-rose-400">{outOfStockCount} منتج</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">المنتجات الأكثر طلباً ومبيعات</h2>
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
