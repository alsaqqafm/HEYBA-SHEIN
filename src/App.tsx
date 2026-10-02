import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';

// Pages Import
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Search } from './pages/Search';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { Account } from './pages/Account';

// Admin Imports
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminPoints } from './pages/admin/AdminPoints';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminSettings } from './pages/admin/AdminSettings';

export function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  const handleNavigate = (path: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPath(path);
  };

  // Extract query parameters if path contains query string
  const isProductsCat = currentPath.startsWith('/products?cat=');
  const catSlug = isProductsCat ? currentPath.split('=')[1] : '';
  const isOffers = currentPath.includes('offers=true');
  const isProductDetail = currentPath.startsWith('/product/');
  const productId = isProductDetail ? currentPath.split('/product/')[1] : '';
  const isSearch = currentPath.startsWith('/search');
  const searchQ = isSearch ? (currentPath.includes('q=') ? decodeURIComponent(currentPath.split('q=')[1]) : searchQuery) : '';

  // Render Admin View if path is /admin
  if (currentPath === '/admin' || currentPath.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-slate-950 p-2 sm:p-4">
        <AdminLayout
          currentTab={adminTab}
          onNavigateTab={(tab) => setAdminTab(tab)}
          onNavigateHome={handleNavigate}
        >
          {adminTab === 'dashboard' && <AdminDashboard />}
          {adminTab === 'products' && <AdminProducts />}
          {adminTab === 'categories' && <AdminCategories />}
          {adminTab === 'orders' && <AdminOrders />}
          {adminTab === 'customers' && <AdminCustomers />}
          {adminTab === 'points' && <AdminPoints />}
          {adminTab === 'payments' && <AdminPayments />}
          {adminTab === 'settings' && <AdminSettings />}
        </AdminLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-brand-600 selection:text-white">
      {/* Header Navigation */}
      <Navbar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentPath === '/' && <Home onNavigate={handleNavigate} />}
        {(currentPath === '/products' || isProductsCat || isOffers) && (
          <Products
            onNavigate={handleNavigate}
            selectedCategorySlug={catSlug}
            offersOnly={isOffers}
          />
        )}
        {isProductDetail && <ProductDetail productId={productId} onNavigate={handleNavigate} />}
        {isSearch && <Search query={searchQ} onNavigate={handleNavigate} />}
        {currentPath === '/cart' && <Cart onNavigate={handleNavigate} />}
        {currentPath === '/checkout' && <Checkout onNavigate={handleNavigate} />}
        {currentPath === '/login' && <Login onNavigate={handleNavigate} />}
        {currentPath === '/register' && <Register onNavigate={handleNavigate} />}
        {currentPath === '/verify-email' && <VerifyEmail onNavigate={handleNavigate} />}
        {currentPath === '/forgot-password' && <ForgotPassword onNavigate={handleNavigate} />}
        {currentPath === '/account' && <Account onNavigate={handleNavigate} />}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Touch Bottom Nav */}
      <MobileNav currentPath={currentPath} onNavigate={handleNavigate} />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
