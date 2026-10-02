import React from 'react';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { ProductCard } from '../components/products/ProductCard';
import { Search as SearchIcon } from 'lucide-react';

interface SearchProps {
  onNavigate: (path: string) => void;
  query?: string;
}

export const Search: React.FC<SearchProps> = ({ onNavigate, query = '' }) => {
  const results = MOCK_PRODUCTS.filter((product) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      product.name.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q) ||
      product.category?.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 pb-16">
      <div className="bg-slate-900 rounded-3xl p-8 text-white">
        <h1 className="text-2xl font-black flex items-center gap-3">
          <SearchIcon className="w-6 h-6 text-brand-400" />
          <span>نتائج البحث عن: "{query}"</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">تم العثور على {results.length} منتج متطابق</p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
          <SearchIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">لم نجد أي نتائج تطابق "{query}"</h3>
          <p className="text-xs text-slate-500">يرجى التأكد من كتابة الكلمة بشكل صحيح أو البحث برمز آخر.</p>
          <button
            onClick={() => onNavigate('/products')}
            className="px-6 py-2.5 bg-brand-600 text-white rounded-full font-bold text-xs"
          >
            تصفح جميع المنتجات
          </button>
        </div>
      )}
    </div>
  );
};
