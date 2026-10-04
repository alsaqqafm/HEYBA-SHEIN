import React from 'react';
import {
  CheckCircle2,
  Clock,
  Box,
  PackageCheck,
  Package,
  Truck,
  UserCheck,
  Navigation,
  ShieldCheck,
  Award,
  XCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import type { Order, OrderStatusHistoryItem } from '../types';
import { MAIN_STATUS_STEPS, getOrderStatusInfo, SPECIAL_STATUSES } from '../lib/orderStatusConfig';

interface OrderTimelineProps {
  order: Order;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const statusInfo = getOrderStatusInfo(order.status);
  const isSpecial = order.status === 'REJECTED' || order.status === 'CANCELLED';

  const history = order.order_status_history || order.status_history || [];

  const renderStatusIcon = (stKey: string) => {
    switch (stKey) {
      case 'NEW':
        return <PackageCheck className="w-4 h-4" />;
      case 'UNDER_REVIEW':
      case 'PENDING_PAYMENT':
        return <Clock className="w-4 h-4" />;
      case 'CONFIRMED':
      case 'PAYMENT_CONFIRMED':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'PREPARING':
        return <Box className="w-4 h-4" />;
      case 'PREPARED':
      case 'READY':
        return <Package className="w-4 h-4" />;
      case 'SENT_TO_SHIPPING':
        return <Truck className="w-4 h-4" />;
      case 'WITH_AGENT':
        return <UserCheck className="w-4 h-4" />;
      case 'IN_TRANSIT':
        return <Navigation className="w-4 h-4" />;
      case 'DELIVERED':
        return <ShieldCheck className="w-4 h-4" />;
      case 'COMPLETED':
        return <Award className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-card space-y-6 text-right">
      {/* Current Active Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isSpecial
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-gradient-to-r from-slate-900 to-brand-900 text-white border-slate-800 shadow-md'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${
              isSpecial ? 'bg-rose-200 text-rose-700' : 'bg-brand-600 text-white shadow-sm'
            }`}
          >
            {renderStatusIcon(order.status)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-sky-300">حالة الطلب الحالية:</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black mt-0.5">{statusInfo.label}</h2>
            <p className={`text-xs mt-0.5 ${isSpecial ? 'text-rose-700' : 'text-slate-300'}`}>{statusInfo.desc}</p>
          </div>
        </div>

        {!isSpecial && (
          <div className="text-xs bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-sm border border-white/10 self-end sm:self-center font-mono">
            المرحلة {statusInfo.stepNumber} من 10
          </div>
        )}
      </div>

      {/* Special Warning Banner for Rejected or Cancelled Orders */}
      {isSpecial && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs flex items-start gap-2.5">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-sm">تم {SPECIAL_STATUSES[order.status]?.label || 'إغلاق'} الطلب</h4>
            <p className="mt-1 leading-relaxed">{SPECIAL_STATUSES[order.status]?.desc}</p>
          </div>
        </div>
      )}

      {/* Visual Timeline Steps Progress (Normal Active Orders) */}
      {!isSpecial && (
        <div className="space-y-4 pt-2">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" />
            <span>التسلسل الزمني لخطوات التوصيل والطلب</span>
          </h3>

          {/* Timeline Step Items Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {MAIN_STATUS_STEPS.map((step) => {
              const isCompleted = statusInfo.stepNumber > step.stepNumber;
              const isCurrent = statusInfo.stepNumber === step.stepNumber;

              return (
                <div
                  key={step.key}
                  className={`p-3.5 rounded-2xl border transition relative flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-brand-50/80 border-brand-300 shadow-sm ring-2 ring-brand-500/20'
                      : isCompleted
                      ? 'bg-slate-50/80 border-slate-200 text-slate-700'
                      : 'bg-white border-slate-100 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-brand-600 text-white animate-pulse'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? '✓' : step.stepNumber}
                    </span>

                    <div
                      className={`${
                        isCurrent
                          ? 'text-brand-600'
                          : isCompleted
                          ? 'text-emerald-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {renderStatusIcon(step.key)}
                    </div>
                  </div>

                  <div>
                    <h4
                      className={`text-xs font-black leading-snug ${
                        isCurrent ? 'text-brand-900' : isCompleted ? 'text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status History Audit Log Table */}
      {history.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="font-extrabold text-xs text-slate-700">سجل التغييرات الزمنية للحالة (Audit Log)</h4>
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden">
            <div className="divide-y divide-slate-200 text-xs">
              {history.map((hItem: OrderStatusHistoryItem) => (
                <div key={hItem.id} className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-600 shrink-0"></div>
                    <div>
                      <span className="font-extrabold text-slate-900">{hItem.status_label}</span>
                      <span className="text-[11px] text-slate-500 block">{hItem.notes}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono dir-ltr self-end sm:self-auto">
                    {new Date(hItem.created_at).toLocaleString('ar-YE')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
