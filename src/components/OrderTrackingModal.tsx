import React, { useEffect, useRef } from 'react';
import { X, Navigation, Truck, UserCheck, MapPin, Clock, AlertCircle, ShieldCheck } from 'lucide-react';
import type { Order } from '../types';
import { getTrackingInfoForOrder } from '../lib/tracking';
import { getOrderStatusLabel } from '../lib/orderStatusConfig';

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, onClose }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  if (!order) return null;

  const trackingInfo = getTrackingInfoForOrder(order);
  const { tracking, isLocationAvailable, statusMessage, agentName, agentPhone, companyName } = trackingInfo;

  const lat = tracking?.latitude;
  const lng = tracking?.longitude;

  // Re-use OpenStreetMap Leaflet for rendering real coordinates if present
  useEffect(() => {
    if (!isLocationAvailable || typeof lat !== 'number' || typeof lng !== 'number') return;

    let isMounted = true;

    const loadLeaflet = async () => {
      if (!(window as any).L) {
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        if (!document.getElementById('leaflet-js')) {
          const script = document.createElement('script');
          script.id = 'leaflet-js';
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.async = true;
          document.body.appendChild(script);

          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }
      }

      if (isMounted && (window as any).L && mapContainerRef.current) {
        const L = (window as any).L;
        if (!leafletMapRef.current) {
          const map = L.map(mapContainerRef.current).setView([lat, lng], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap',
          }).addTo(map);

          L.marker([lat, lng]).addTo(map).bindPopup('موقع المندوب الحقيقي الحالي').openPopup();
          leafletMapRef.current = map;
        } else {
          leafletMapRef.current.setView([lat, lng], 15);
        }
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
    };
  }, [isLocationAvailable, lat, lng]);

  // Lock background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-auto relative space-y-6 animate-in fade-in zoom-in duration-200 text-right"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">تتبع موقع الطلب</h3>
              <p className="text-xs text-slate-400 font-mono">رقم الطلب: {order.order_number}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Order Status Banner */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">حالة الطلب:</span>
            <span className="font-bold text-sky-400">{getOrderStatusLabel(order.status)}</span>
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">{statusMessage}</p>
        </div>

        {/* Company & Agent Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {companyName && (
            <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-200 text-purple-900 space-y-1">
              <div className="font-extrabold flex items-center gap-1.5 text-purple-800">
                <Truck className="w-4 h-4 text-purple-600" />
                <span>شركة التوصيل:</span>
              </div>
              <p className="font-bold text-sm text-purple-950">{companyName}</p>
            </div>
          )}

          {agentName && (
            <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-emerald-900 space-y-1">
              <div className="font-extrabold flex items-center gap-1.5 text-emerald-800">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>مندوب التوصيل:</span>
              </div>
              <p className="font-bold text-sm text-emerald-950">{agentName}</p>
              {agentPhone && <p className="font-mono text-[11px] text-emerald-700 dir-ltr">{agentPhone}</p>}
            </div>
          )}
        </div>

        {/* Location Section: Real Map OR Clear Unavailable Notice */}
        {isLocationAvailable && typeof lat === 'number' && typeof lng === 'number' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-bold flex items-center gap-1">
                <MapPin className="w-4 h-4 text-brand-600" /> موقع المندوب على الخريطة
              </span>
              {tracking?.updated_at && (
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" /> آخر تحديث: {new Date(tracking.updated_at).toLocaleTimeString('ar-YE')}
                </span>
              )}
            </div>

            <div
              ref={mapContainerRef}
              className="w-full h-64 rounded-2xl border border-slate-200 overflow-hidden shadow-inner bg-slate-100"
            />
          </div>
        ) : (
          <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-2 text-center">
            <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
            <h4 className="font-extrabold text-sm text-amber-950">التتبع المباشر لموقع المندوب غير متاح حاليًا</h4>
            <p className="text-amber-800 text-[11px] leading-relaxed max-w-sm mx-auto">
              موقع المندوب غير متاح حاليًا، وسيظهر تلقائيًا عند توفر بيانات التتبع المباشرة من المندوب.
            </p>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> تتبع آمن لطلبك الخاص فقط
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
