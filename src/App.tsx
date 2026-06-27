import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccess from './pages/OrderSuccess';
import Stores from './pages/Stores';
import StorePage from './pages/StorePage';
import Sell from './pages/Sell';
import MerchantLogin from './pages/MerchantLogin';
import MerchantDashboard from './pages/MerchantDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import ReturnRefundPolicy from './pages/ReturnRefundPolicy';
import SupportWidget from './components/SupportWidget';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<><Home /><SupportWidget /></>} />
            <Route path="/products" element={<><Products /><SupportWidget /></>} />
            <Route path="/product/:id" element={<><ProductPage /><SupportWidget /></>} />
            <Route path="/cart" element={<><CartPage /><SupportWidget /></>} />
            <Route path="/checkout" element={<><CheckoutPage /><SupportWidget /></>} />
            <Route path="/order-success" element={<><OrderSuccess /><SupportWidget /></>} />
            <Route path="/stores" element={<><Stores /><SupportWidget /></>} />
            <Route path="/store/:subdomain" element={<><StorePage /><SupportWidget /></>} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/merchant" element={<MerchantLogin />} />
            <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/panel" element={<AdminPanel />} />
            <Route path="/return-policy" element={<ReturnRefundPolicy />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
