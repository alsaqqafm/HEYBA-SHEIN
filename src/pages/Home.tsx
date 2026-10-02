import React from 'react';
import { ArrowLeft, Sparkles, TrendingUp, Tag, Award } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../data/mockProducts';
import { ProductCard } from '../components/products/ProductCard';
import { useAuth } from '../context/AuthContext';

interface HomeProps {
  onNavigate: (path: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { user, points } = useAuth();

  const newArrivals = MOCK_PRODUCTS.filter((p) => p.is_new_arrival);
  const discountedProducts = MOCK_PRODUCTS.filter(
    (p) => p.old_price && p.old_price > p.price
  );

  return (
    <div className="space-y-8 sm:space-y-12 pb-16 overflow-x-hidden">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-brand-900 via-brand-700 to-brand-600 rounded-3xl text-white shadow-brand">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-400/20 via-transparent to-transparent opacity-60" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 sm:space-y-6 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-sky-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>تشكيلة الموسم الجديدة وصلت حديثاً</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
              أناقة استثنائية تناسب إطلالتك في <span className="text-sky-300">هيبة شي إن</span>
            </h1>

            <p className="text-sky-100 text-xs sm:text-base leading-relaxed max-w-lg">
              اكتشفي أرقى صيحات الأزياء والفساتين والحقائب بأسعار تنافسية، مع نظام مكافآت النقاط والدفع المباشر عبر محفظة جيب وحساب الكريمي.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('/products')}
                className="px-6 py-3 bg-white text-brand-900 hover:bg-sky-50 font-extrabold text-xs sm:text-sm rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                <span>تسوقي المجموعة الآن</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('/products?offers=true')}
                className="px-6 py-3 bg-brand-800/60 hover:bg-brand-800 border border-sky-400/30 text-white font-bold text-xs sm:text-sm rounded-full backdrop-blur-sm transition-all text-center"
              >
                تصفح العروض التخفيضات 🏷️
              </button>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
                alt="HEYBA Shein Fashion"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent flex items-end p-4 sm:p-6">
                <div>
                  <span className="text-[10px] sm:text-xs font-bold text-sky-300 uppercase tracking-widest block">HEYBA Shein Collection</span>
                  <h3 className="text-base sm:text-xl font-bold text-white mt-0.5">تصاميم عصرية تناسب كل الأذواق</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Points Widget Banner for Logged In Customer */}
      {user && (
        <section className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 text-right">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-lg">مرحبًا {user.name.split(' ')[0]}، لديك {points} نقطة مكافآت!</h3>
              <p className="text-[11px] sm:text-xs text-amber-100 mt-0.5">تكتسب المزيد من النقاط تلقائيًا فور اكتمال طلباتك المعتمدة.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/account')}
            className="w-full sm:w-auto px-5 py-2.5 bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs rounded-full shadow transition shrink-0 text-center"
          >
            عرض سجل النقاط
          </button>
        </section>
      )}

      {/* Categories Grid */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">التصنيفات الرئيسية</h2>
            <p className="text-xs text-slate-500 mt-0.5">تصفحي الأقسام المفضلة لديك بسهولة</p>
          </div>
          <button
            onClick={() => onNavigate('/products')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            عرض الكُل <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          {MOCK_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate(`/products?cat=${cat.slug}`)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-sm hover:shadow-brand transition-all cursor-pointer"
            >
              <img
                src={cat.image_url}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent flex items-end p-3 sm:p-4">
                <div>
                  <h3 className="text-white font-extrabold text-xs sm:text-base group-hover:text-sky-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-300 line-clamp-1 mt-0.5">{cat.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600" />
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">المنتجات الجديدة</h2>
              <p className="text-xs text-slate-500 mt-0.5">وصل حديثاً لمخازن هيبة شي إن</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/products')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            استعراض الجُميع <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* Discounts & Offers Banner Section */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">عروض الخصم الحصرية</h2>
              <p className="text-xs text-slate-500 mt-0.5">وفر أكثر على أرقى التشكيلات</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {discountedProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>
    </div>
  );
};
