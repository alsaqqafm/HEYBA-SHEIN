import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, Calendar, User, Search, Filter } from 'lucide-react';
import { getAllReviewsList } from '../../lib/reviews';
import type { OrderReview } from '../../types';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<OrderReview[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    setReviews(getAllReviewsList());
  }, []);

  const filteredReviews = reviews.filter((rev) => {
    const matchesSearch =
      rev.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.comment.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = ratingFilter === 'all' || rev.rating === ratingFilter;

    return matchesSearch && matchesRating;
  });

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6 text-right">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة ومراجعة تقييمات العملاء</h1>
          <p className="text-xs text-slate-400 mt-1">آراء العملاء وتقييمات جودة المنتجات وسرعة المندوبين</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 px-4 py-2.5 rounded-2xl flex items-center gap-3 self-start sm:self-auto">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">متوسط التقييم العام:</span>
            <span className="text-lg font-black text-white font-mono">{averageRating} / 5.0</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث باسم العميل، رقم الطلب، أو التعليق..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 font-bold">تصفية بالنجوم:</span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-200 outline-none cursor-pointer focus:border-purple-500"
          >
            <option value="all">الكل ({reviews.length})</option>
            <option value="5">5 نجوم ⭐⭐⭐⭐⭐</option>
            <option value="4">4 نجوم ⭐⭐⭐⭐</option>
            <option value="3">3 نجوم ⭐⭐⭐</option>
            <option value="2">نجمتان ⭐⭐</option>
            <option value="1">نجمة واحدة ⭐</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-slate-800/60 border border-slate-700/60 p-12 rounded-3xl text-center space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-bold text-white text-base">لا توجد تقييمات مطابقة حالياً</h3>
            <p className="text-xs text-slate-400">ستظهر تقييمات العملاء فور إرسالها بعد استلام الطلبات.</p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-5 sm:p-6 space-y-3 shadow-md hover:border-slate-600 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-900/60 text-purple-300 font-bold flex items-center justify-center border border-purple-700/40">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">{rev.customer_name}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">الطلب: {rev.order_id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs self-end sm:self-auto">
                  <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-800/40 px-3 py-1.5 rounded-xl">
                    <span className="text-amber-400 font-bold ml-1">جودة المنتج:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>

                  {rev.delivery_rating && (
                    <div className="flex items-center gap-1 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-xl">
                      <span className="text-emerald-400 font-bold ml-1">التوصيل:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.delivery_rating!
                              ? 'text-emerald-400 fill-emerald-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-1">
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/40 font-mono">
                  "{rev.comment}"
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(rev.created_at).toLocaleString('ar-YE')}
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" /> تم التحقق من شراء العميل
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
