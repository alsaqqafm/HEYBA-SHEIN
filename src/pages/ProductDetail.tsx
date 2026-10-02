import React, { useState } from 'react';
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, RefreshCw, Star, CheckCircle, AlertTriangle } from 'lucide-react';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { useCart } from '../context/CartContext';

interface ProductDetailProps {
  productId: string;
  onNavigate: (path: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onNavigate }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = MOCK_PRODUCTS.find((p) => p.id === productId) || MOCK_PRODUCTS[0];
  const [activeImage, setActiveImage] = useState(
    product.images && product.images.length > 0 ? product.images[0].image_url : ''
  );

  const isOutOfStock = product.stock_quantity <= 0 || product.status === 'out_of_stock';
  const discountPercent =
    product.old_price && product.old_price > product.price
      ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
      : null;

  return (
    <div className="space-y-8 pb-16">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('/products')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition"
      >
        <ArrowRight className="w-4 h-4" /> العودة إلى المنتجات
      </button>

      {/* Main Grid */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Gallery Column */}
        <div className="space-y-4">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={activeImage || product.images?.[0]?.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`w-20 aspect-square rounded-xl overflow-hidden border-2 transition ${
                    activeImage === img.image_url ? 'border-brand-600 ring-2 ring-brand-100' : 'border-slate-200'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Column */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category Pill */}
            <span className="inline-block px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full">
              {product.category?.name || 'أزياء هيبة شي إن'}
            </span>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-600">4.9 من 5</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">تم تقييمه بواسطة 128 عميلاً</span>
            </div>

            {/* Price Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-bold block mb-1">السعر الحالي:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-brand-600">{product.price.toLocaleString()}</span>
                  <span className="text-sm font-bold text-slate-600">ريال يمني</span>
                </div>
              </div>

              {product.old_price && product.old_price > product.price && (
                <div className="text-left">
                  <span className="text-xs text-slate-400 line-through block">
                    {product.old_price.toLocaleString()} ر.ي
                  </span>
                  {discountPercent && (
                    <span className="inline-block bg-rose-600 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full mt-1">
                      خصم {discountPercent}%-
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Stock Availability */}
            <div>
              {isOutOfStock ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>عذراً، هذا المنتج غير متوفر حالياً بالمخزون</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>متوفر بالمخزون (الكمية المتاحة: {product.stock_quantity} قطعة)</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">وصف المنتج:</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{product.description}</p>
            </div>
          </div>

          {/* Quantity & Action Controls */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700">الكمية:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-extrabold text-slate-900 text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={isOutOfStock}
                className={`flex-1 py-4 rounded-2xl font-extrabold text-sm transition-all shadow-brand flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-brand-600 hover:bg-brand-700 text-white hover:scale-[1.01]'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{isOutOfStock ? 'غير متوفر حالياً' : 'إضافة إلى سلة التسوق'}</span>
              </button>
            </div>

            {/* Guarantee Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-500">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-brand-600" />
                <span>شحن سريع لجميع المدن</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>دفع آمن بالتحويل</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw className="w-4 h-4 text-brand-600" />
                <span>نقاط مكافآت مضمونة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
