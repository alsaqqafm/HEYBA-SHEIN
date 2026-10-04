import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface LocationPickerModalProps {
  initialLat?: number;
  initialLng?: number;
  governorate?: string;
  onConfirmLocation: (lat: number, lng: number) => void;
  onSkipLocation: () => void;
  onClose: () => void;
}

// Default Yemen Coordinates (Ibb City center fallback)
const DEFAULT_YEMEN_LAT = 13.9667;
const DEFAULT_YEMEN_LNG = 44.1833;

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  initialLat,
  initialLng,
  governorate,
  onConfirmLocation,
  onSkipLocation,
  onClose,
}) => {
  const { showToast } = useToast();

  const [lat, setLat] = useState<number>(initialLat || DEFAULT_YEMEN_LAT);
  const [lng, setLng] = useState<number>(initialLng || DEFAULT_YEMEN_LNG);

  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(!!initialLat);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'gps' | 'map'>('gps');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Load Leaflet dynamically without any external paid packages
  useEffect(() => {
    if (activeTab !== 'map') return;

    let isMounted = true;

    const loadLeaflet = async () => {
      if (!(window as any).L) {
        // Load CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Load JS script
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
          const map = L.map(mapContainerRef.current).setView([lat, lng], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap',
          }).addTo(map);

          const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            setLat(pos.lat);
            setLng(pos.lng);
            setLocationSuccess(true);
          });

          map.on('click', (e: any) => {
            marker.setLatLng(e.latlng);
            setLat(e.latlng.lat);
            setLng(e.latlng.lng);
            setLocationSuccess(true);
          });

          leafletMapRef.current = map;
          markerRef.current = marker;
        } else {
          leafletMapRef.current.setView([lat, lng], 13);
          markerRef.current.setLatLng([lat, lng]);
        }
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  // Handle Current Location Geolocation Request (Only when user explicitly clicks!)
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('متصفحك لا يدعم خاصية تحديد الموقع الجغرافي تلقائياً.');
      showToast('المتصفح لا يدعم تحديد الموقع', 'error');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        setLat(userLat);
        setLng(userLng);
        setLocationSuccess(true);
        setIsLocating(false);
        showToast('تم التقاط موقعك الجغرافي بنجاح! 🎉');

        if (leafletMapRef.current && markerRef.current) {
          leafletMapRef.current.setView([userLat, userLng], 15);
          markerRef.current.setLatLng([userLat, userLng]);
        }
      },
      (error) => {
        setIsLocating(false);
        let errMsg = 'تعذر الحصول على صلاحية الموقع الجغرافي.';
        if (error.code === error.PERMISSION_DENIED) {
          errMsg = 'تم رفض إذن الوصول للموقع. يمكنك التحديد يدويًا على الخريطة أو المتابعة بالعنوان النصي.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errMsg = 'الموقع الجغرافي غير متوفر حالياً. يرجى تجربة التحديد يدويًا.';
        } else if (error.code === error.TIMEOUT) {
          errMsg = 'انتهت مهلة الحصول على الموقع الجغرافي.';
        }
        setGeoError(errMsg);
        showToast(errMsg, 'error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleConfirm = () => {
    onConfirmLocation(lat, lng);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-auto relative space-y-6 animate-in fade-in zoom-in duration-200 text-right">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <MapPin className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            تحديد موقع التسليم بدقة
          </h2>
          <p className="text-xs text-slate-500">
            حدد موقع استلام الشحنة لضمان وسرعة وصول المندوب لمحافظة <strong>{governorate || 'إب'}</strong>
          </p>
        </div>

        {/* Tab Selection: Automatic GPS vs Manual Map */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('gps')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'gps' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>1. موقعي الحالي (GPS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'map' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>2. الخريطة التفاعلية</span>
          </button>
        </div>

        {/* Option 1: Automatic Location via GPS */}
        {activeTab === 'gps' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                عند اضغط على الزر أدناه، سيطلب المتصفح إذن الوصول للموقع الجغرافي لمرة واحدة لتسجيل إحداثيات الشحنة.
              </p>

              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-2xl shadow-brand transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'جاري تحديد موقعك الجغرافي...' : 'استخدام موقعي الحالي تلقائياً'}</span>
              </button>
            </div>

            {geoError && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{geoError}</span>
              </div>
            )}

            {locationSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تم التقاط إحداثيات موقعك بنجاح!</span>
                </div>
                <p className="text-xs font-mono dir-ltr text-emerald-800">
                  Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Option 2: Manual Interactive OpenStreetMap Selection */}
        {activeTab === 'map' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 text-center">
              اسحب الدبوس أو انقر على أي نقطة على الخريطة لتحديد عنوان التسليم:
            </p>
            <div
              ref={mapContainerRef}
              className="w-full h-64 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative shadow-inner z-10"
            />
            {locationSuccess && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-700 font-mono dir-ltr">
                  الإحداثيات المختارة: {lat.toFixed(5)}, {lng.toFixed(5)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>تأكيد واعتماد هذا الموقع</span>
          </button>

          <button
            type="button"
            onClick={onSkipLocation}
            className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition"
          >
            متابعة بالعنوان النصي فقط
          </button>
        </div>
      </div>
    </div>
  );
};
