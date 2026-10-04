import React, { useState, useEffect } from 'react';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { ProductCard } from '../components/products/ProductCard';
import { Search as SearchIcon, Sparkles, Package } from 'lucide-react';

interface SearchProps {
  onNavigate: (path: string) => void;
  query?: string;
}

export const Search: React.FC<SearchProps> = ({ onNavigate, query = '' }) => {
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  const cleanTerm = searchTerm.toLowerCase().trim();

  // 1. Matching Products
  const matchingProducts = MOCK_PRODUCTS.filter((product) => {
    if (!cleanTerm) return true;
    return (
      product.name.toLowerCase().includes(cleanTerm) ||
      product.description.toLowerCase().includes(cleanTerm) ||
      product.category?.name.toLowerCase().includes(cleanTerm)
    );
  });

  // 2. Remaining Products in Store (excluding matching ones)
  const remainingProducts = cleanTerm
    ? MOCK_PRODUCTS.filter((product) => !matchingProducts.some((m) => m.id === product.id))
    : [];

  return (
    <div className="space-y-10 pb-16">
      {/* Live Auto-Search Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2.5">
              <SearchIcon className="w-6 h-6 text-brand-400" />
              <span>البحث الذكي الفوري في هيبة شي إن</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              {cleanTerm
                ? `نتائج البحث عن "${searchTerm}" (${matchingProducts.length} منتج متطابق)`
                : 'تصفح وابحث عن أي منتج أو تصنيف مباشرة'}
            </p>
          </div>
        </div>

        {/* Live Search Input Box */}
        <div className="relative max-w-2xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث فوراً بالاسم، الفستان، الحقيبة، الأحذية، العطور..."
            className="w-full bg-white/10 backdrop-blur-md text-white placeholder:text-slate-400 pr-5 pl-12 py-3 rounded-2xl border border-white/20 focus:bg-white focus:text-slate-900 focus:border-brand-500 text-xs sm:text-sm font-bold outline-none transition"
          />
          <SearchIcon className="w-5 h-5 text-brand-300 absolute left-4 top-3.5" />
        </div>
      </div>

      {/* 1. Matching Products Section */}
      {matchingProducts.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>المنتجات المطابقة لبحثك ({matchingProducts.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {matchingProducts.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-100 space-y-3">
          <SearchIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            لم نجد نتائج مطابقة تماماً لكلمة "{searchTerm}"
          </h3>
          <p className="text-xs text-slate-500">
            شاهد باقي المنتجات المميزة المتاحة في المتجر أدناه:
          </p>
        </div>
      )}

      {/* 2. Remaining Products in Store (Shown after search results) */}
      {(remainingProducts.length > 0 || matchingProducts.length === 0) && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-600" />
              <span>باقي المنتجات في المتجر لتصفح المزيد</span>
            </h2>
            <span className="text-xs font-bold text-slate-500">
              ({(remainingProducts.length > 0 ? remainingProducts : MOCK_PRODUCTS).length} منتج)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {(remainingProducts.length > 0 ? remainingProducts : MOCK_PRODUCTS).map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
