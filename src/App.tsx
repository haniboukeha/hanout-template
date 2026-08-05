import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

// Layouts
import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';

// Store Pages
import Home from './pages/store/Home';
import Shop from './pages/store/Shop';
import Cart from './pages/store/Cart';
import Login from './pages/store/Login';
import SignUp from './pages/store/SignUp';
import Account from './pages/store/Account';
import Orders from './pages/store/Orders';
import Wishlist from './pages/store/Wishlist';
import ProductDetail from './pages/store/ProductDetail';
import About from './pages/store/About';
import Contact from './pages/store/Contact';
import NotificationsPage from './pages/store/NotificationsPage';
import NotFound from './pages/store/NotFound';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ProductsManagement from './pages/admin/Products';
import OrdersManagement from './pages/admin/Orders';
import Customers from './pages/admin/Customers';
import Settings from './pages/admin/Settings';
import AdminNotifications from './pages/admin/Notifications';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';
import ToastContainer from './components/common/Toast';
import { useAuthStore } from './store/useAuthStore';
import { useProductStore } from './store/useProductStore';

const App = () => {
  const { checkSession } = useAuthStore();
  const { fetchProducts } = useProductStore();

  useEffect(() => {
    // Check auth session on app start
    checkSession();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Routes>
        {/* Public Store Routes */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="wishlist" element={<Wishlist />} />

          {/* Guest only */}
          <Route element={<ProtectedRoute guestOnly />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
          </Route>

          {/* Auth only */}
          <Route element={<ProtectedRoute authOnly />}>
            <Route path="account" element={<Account />} />
            <Route path="orders" element={<Orders />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsManagement />} />
            <Route path="orders" element={<OrdersManagement />} />
            <Route path="customers" element={<Customers />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>

      <ToastContainer />

      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-slate-900 text-white px-4 py-2 rounded-xl z-[100]">
        Skip to main content
      </a>
    </>
  );
};

export default App;
