import React, { useState } from 'react';
import { ShoppingBag, Eye, Star } from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (path: string) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80';

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addToCart } = useCart();
  const [imgSrc, setImgSrc] = useState(
    product.images && product.images.length > 0 ? product.images[0].image_url : FALLBACK_IMAGE
  );

  const isOutOfStock = product.stock_quantity <= 0 || product.status === 'out_of_stock';
  const discountPercent =
    product.old_price && product.old_price > product.price
      ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
      : null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-brand transition-all duration-300 overflow-hidden flex flex-col justify-between w-full max-w-full">
      {/* Image Container with strict Aspect Ratio & Fallback */}
      <div
        className="relative aspect-[3/4] bg-slate-100 overflow-hidden cursor-pointer w-full"
        onClick={() => onNavigate(`/product/${product.id}`)}
      >
        <img
          src={imgSrc}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end z-10">
          {discountPercent && (
            <span className="bg-rose-600 text-white text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-sm">
              خصم {discountPercent}%-
            </span>
          )}
          {product.is_new_arrival && !discountPercent && (
            <span className="bg-brand-600 text-white text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-sm">
              جديد
            </span>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-2 text-center z-10">
            <span className="bg-rose-600 text-white font-extrabold text-[11px] sm:text-xs px-3 py-1.5 rounded-full shadow-lg">
              غير متوفر حالياً
            </span>
          </div>
        )}

        {/* Quick View Button */}
        <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/product/${product.id}`);
            }}
            className="w-full py-1.5 sm:py-2 bg-white/95 backdrop-blur-md hover:bg-white text-slate-900 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition"
          >
            <Eye className="w-3.5 h-3.5 text-brand-600" /> عرض التفاصيل
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 gap-2.5">
        <div>
          {/* Category */}
          <span className="text-[10px] sm:text-[11px] font-bold text-brand-600 block mb-0.5 truncate">
            {product.category?.name || 'أزياء هيبة شي إن'}
          </span>

          {/* Title with strict line-clamp to prevent grid distortion on 320px screens */}
          <h3
            onClick={() => onNavigate(`/product/${product.id}`)}
            className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 hover:text-brand-600 transition cursor-pointer leading-snug break-words"
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-0.5 sm:gap-1 mt-1 text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" />
            <Star className="w-3 h-3 fill-amber-400" />
            <Star className="w-3 h-3 fill-amber-400" />
            <Star className="w-3 h-3 fill-amber-400" />
            <Star className="w-3 h-3 fill-amber-400" />
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold mr-1">(4.9)</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="font-black text-slate-900 text-sm sm:text-base truncate">
                {product.price.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-slate-500 shrink-0">ر.ي</span>
            </div>
            {product.old_price && product.old_price > product.price && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through block truncate">
                {product.old_price.toLocaleString()} ر.ي
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={isOutOfStock}
            className={`p-2 sm:p-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center shrink-0 ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 text-white hover:scale-105 active:scale-95'
            }`}
            title={isOutOfStock ? 'غير متوفر' : 'أضف للسلة'}
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
