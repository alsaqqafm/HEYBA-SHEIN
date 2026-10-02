import React, { useState, useMemo } from 'react';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../data/mockProducts';
import { ProductCard } from '../components/products/ProductCard';
import { Filter, SlidersHorizontal } from 'lucide-react';

interface ProductsProps {
  onNavigate: (path: string) => void;
  selectedCategorySlug?: string;
  offersOnly?: boolean;
}

export const Products: React.FC<ProductsProps> = ({
  onNavigate,
  selectedCategorySlug = '',
  offersOnly = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(selectedCategorySlug);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'newest'>('default');
  const [stockOnly, setStockOnly] = useState<boolean>(false);

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      if (selectedCategory && product.category?.slug !== selectedCategory) {
        return false;
      }
      if (offersOnly && (!product.old_price || product.old_price <= product.price)) {
        return false;
      }
      if (stockOnly && product.stock_quantity <= 0) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [selectedCategory, offersOnly, stockOnly, sortBy]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-black">كاتالوج جميع المنتجات</h1>
          <p className="text-sm text-slate-300 mt-2">
            تصفحي تشكيلة هيبة شي إن المتاحة، واستخدمي التصفية حسب الأقسام أو التخفيضات.
          </p>
        </div>
      </div>

      {/* Category Pills & Sorting Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
              !selectedCategory
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            الكل ({MOCK_PRODUCTS.length})
          </button>

          {MOCK_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.slug
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Filters and Sorting */}
        <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          
          {/* In Stock Only Checkbox */}
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={stockOnly}
              onChange={(e) => setStockOnly(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
            />
            <span>المتوفر فقط في المخزون</span>
          </label>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="default">الترتيب الافتراضي</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
          <Filter className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">لا توجد منتجات تطابق خيارات البحث والتصفية</h3>
          <p className="text-xs text-slate-500">جرب إزالة بعض الفلاتر أو تصفح الأقسام الأخرى.</p>
          <button
            onClick={() => {
              setSelectedCategory('');
              setStockOnly(false);
            }}
            className="px-6 py-2.5 bg-brand-600 text-white rounded-full font-bold text-xs"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      )}
    </div>
  );
};
