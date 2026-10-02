import React from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Award,
  Wallet,
  Settings,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  currentTab: string;
  onNavigateTab: (tab: string) => void;
  onNavigateHome: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onNavigateTab,
  onNavigateHome,
  children,
}) => {
  const { isAdmin, user } = useAuth();

  // Strict Protection Check: Non-admins are denied access!
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white rounded-3xl p-8 text-center border border-rose-200 shadow-xl space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">غير مصرح بالوصول إلى لوحة الإدارة</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          هذه الصفحة مخصصة فقط لمدير المنصة الحاصل على الصلاحيات الكاملة. لا يحق للعملاء الوصول إليها.
        </p>
        <button
          onClick={() => onNavigateHome('/')}
          className="px-6 py-2.5 bg-brand-600 text-white rounded-full font-bold text-xs"
        >
          العودة للواجهة الرئيسية
        </button>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية والإحصائيات', icon: LayoutDashboard },
    { id: 'products', label: 'إدارة المنتجات والمخزون', icon: Package },
    { id: 'categories', label: 'التصنيفات', icon: FolderTree },
    { id: 'orders', label: 'الطلبات والدفع', icon: ShoppingBag },
    { id: 'customers', label: 'العملاء', icon: Users },
    { id: 'points', label: 'نظام النقاط', icon: Award },
    { id: 'payments', label: 'إعدادات الدفع (جيب/كريمي)', icon: Wallet },
    { id: 'settings', label: 'إعدادات المنصة', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl my-4">
      {/* Admin Sidebar */}
      <aside className="w-full lg:w-64 bg-slate-950 p-6 border-b lg:border-b-0 lg:border-l border-slate-800 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                <img src="/favicon.svg" alt="Admin" className="w-6 h-6 filter brightness-0 invert" />
              </div>
              <div>
                <h2 className="font-extrabold text-white text-base">لوحة الإدارة</h2>
                <span className="text-[10px] text-purple-400 font-bold uppercase">HEYBA Admin Control</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-xs">
            <span className="text-slate-400 block">المدير الحالي:</span>
            <span className="font-bold text-white truncate block">{user?.name}</span>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateTab(item.id)}
                  className={`w-full text-right px-4 py-3 rounded-xl text-xs font-bold transition flex items-center gap-3 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <button
            onClick={() => onNavigateHome('/')}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <ArrowRight className="w-4 h-4" /> العودة لموقع المتجر
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 bg-slate-900 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
