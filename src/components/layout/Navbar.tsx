import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Award, User, ShieldCheck, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, searchQuery = '', setSearchQuery }) => {
  const { user, points, isAdmin, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const categories = [
    { id: 'all', name: 'جميع المنتجات', path: '/products' },
    { id: 'dresses', name: 'أزياء وفساتين', path: '/products?cat=dresses' },
    { id: 'bags', name: 'حقائب وإكسسوارات', path: '/products?cat=bags' },
    { id: 'shoes', name: 'أحذية حديثة', path: '/products?cat=shoes' },
    { id: 'beauty', name: 'عناية وجمال', path: '/products?cat=beauty' },
    { id: 'offers', name: 'العروض التخفيضات', path: '/products?offers=true' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm transition-all duration-200">
      {/* Top Announcement Bar */}
      <div className="bg-brand-600 text-white text-xs font-medium py-1.5 px-4 text-center tracking-wide">
        <span>✨ أهلاً بكم في هيبة شي إن (HEYBA Shein) — شحن سريع وتوصيل لجميع مناطق اليمن!</span>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-3 text-right group focus:outline-none"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 p-2 shadow-brand flex items-center justify-center shrink-0 transform group-hover:scale-105 transition-transform">
                <img src="/favicon.svg" alt="HEYBA Shein" className="w-8 h-8 filter brightness-0 invert" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-brand-600 transition-colors">
                  هيبة شي إن
                </h1>
                <p className="text-[11px] font-semibold text-brand-600 tracking-wider uppercase mt-1">
                  HEYBA Shein
                </p>
              </div>
            </button>
          </div>

          {/* Search Bar Component */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-2 hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                placeholder="ابحث عن منتج، تصنيف، ملابس، أحذية..."
                className="w-full bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-900 pr-11 pl-20 py-2.5 rounded-full border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 text-sm transition-all duration-200 outline-none"
              />
              <button
                type="submit"
                className="absolute inset-y-1 right-1 px-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right Action Icons: User, Points, Cart, Admin */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Customer Name & Points Widget */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-full hover:bg-slate-100 border border-slate-200 text-slate-800 text-sm font-semibold transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="block text-xs font-bold text-slate-900">مرحبًا، {user.name.split(' ')[0]}</span>
                    <span className="block text-[10px] text-amber-600 font-extrabold flex items-center gap-1">
                      <Award className="w-3 h-3 inline fill-amber-400" /> النقاط: {points}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">مسجل كـ</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('/account');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-right px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-brand-600" /> حسابي الطلبات
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('/admin');
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full text-right px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 font-bold flex items-center gap-2 border-t border-slate-100"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" /> لوحة تحكم المدير
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                        onNavigate('/');
                      }}
                      className="w-full text-right px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" /> تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('/login')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
              >
                <User className="w-4 h-4 text-slate-600" />
                <span>تسجيل الدخول</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => onNavigate('/cart')}
              className="relative p-2.5 rounded-full bg-brand-50 hover:bg-brand-100 text-brand-700 transition-all focus:outline-none"
              title="السلة"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Category Navigation */}
        <nav className="hidden lg:flex items-center justify-between py-2.5 border-t border-slate-100 text-sm font-semibold">
          <div className="flex items-center gap-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onNavigate(cat.path)}
                className={`py-1 transition-colors relative ${
                  currentPath === cat.path
                    ? 'text-brand-600 font-bold'
                    : 'text-slate-600 hover:text-brand-600'
                }`}
              >
                {cat.name}
                {currentPath === cat.path && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>متوفر الآن: خصم 20% على المنتجات الجديدة</span>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="bg-white w-4/5 max-w-sm h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <img src="/favicon.svg" className="w-8 h-8" alt="HEYBA" />
                  <span className="font-extrabold text-slate-900">هيبة شي إن</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="mt-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                    placeholder="ابحث بالاسم أو الوصف..."
                    className="w-full bg-slate-100 pr-10 pl-4 py-2 rounded-xl text-sm outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </form>

              {/* Mobile Navigation Links */}
              <div className="mt-6 flex flex-col gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onNavigate(cat.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-right py-2 px-3 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              {isAdmin && (
                <button
                  onClick={() => {
                    onNavigate('/admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 bg-purple-600 text-white rounded-xl font-bold mb-3"
                >
                  لوحة تحكم المدير
                </button>
              )}
              <p className="text-xs text-center text-slate-400">HEYBA Shein | هيبة شي إن © 2026</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
