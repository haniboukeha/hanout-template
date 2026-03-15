import { Routes, Route } from 'react-router-dom';

// Layouts
import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';

// Store Pages
import Home from './pages/store/Home';
import Shop from './pages/store/Shop';
import Cart from './pages/store/Cart';
import Login from './pages/store/Login';
import SignUp from './pages/store/SignUp';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ProductsManagement from './pages/admin/Products';
import OrdersManagement from './pages/admin/Orders';
import Customers from './pages/admin/Customers';
import Settings from './pages/admin/Settings';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      {/* Store Routes */}
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsManagement />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="customers" element={<Customers />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
