import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Store, Menu, X, User, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { isLowDataMode, setLowDataMode } from '../lib/imageOptimization';
import OTPLogin from './OTPLogin';

export default function Header() {
  const { totalItems } = useCart();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [lowData, setLowData] = useState(false);

  useEffect(() => {
    setLowData(isLowDataMode());
  }, []);

  const goSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/products?search=${encodeURIComponent(search)}`;
  };

  const toggleLowData = () => {
    const next = !lowData;
    setLowData(next);
    setLowDataMode(next);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0F1B3D] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-[#FF6600] flex items-center justify-center font-extrabold text-white text-lg">P</div>
              <span className="font-extrabold text-xl tracking-tight hidden sm:block">Pasal<span className="text-[#FF6600]">Nepal</span></span>
            </Link>

            <form onSubmit={goSearch} className="flex-1 max-w-2xl hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products, brands and more..."
                  className="w-full h-10 pl-11 pr-4 rounded-lg bg-white text-[#212529] text-sm placeholder:text-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#FF6600]"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6C757D]" />
              </div>
            </form>

            <div className="flex items-center gap-1 sm:gap-3 ml-auto">
              {/* Low Data Mode Toggle */}
              <button
                onClick={toggleLowData}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-bold transition-colors ${lowData ? 'bg-[#28A745] text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                title={lowData ? 'Low Data Mode ON — images compressed to save mobile data' : 'Enable Low Data Mode to save mobile data'}
              >
                {lowData ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
                <span className="hidden lg:inline">{lowData ? 'Data Saver' : 'Data'}</span>
              </button>

              <Link to="/products" className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium hover:text-[#FF6600] transition-colors">
                <Search className="w-4 h-4" /> Browse
              </Link>
              <Link to="/stores" className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium hover:text-[#FF6600] transition-colors">
                <Store className="w-4 h-4" /> Stores
              </Link>

              {/* OTP Login button */}
              <button
                onClick={() => setShowOTP(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium hover:text-[#FF6600] transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </button>

              <Link to="/cart" className="relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium hover:text-[#FF6600] transition-colors">
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#FF6600] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{totalItems}</span>
                  )}
                </div>
                <span className="hidden sm:block">Cart</span>
              </Link>
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <form onSubmit={goSearch} className="md:hidden pb-3">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full h-10 pl-11 pr-4 rounded-lg bg-white text-[#212529] text-sm placeholder:text-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#FF6600]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6C757D]" />
            </div>
          </form>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-[#0F1B3D] border-t border-white/10 px-4 py-3 space-y-1">
            <Link to="/products" onClick={() => setMenuOpen(false)} className="block py-2 text-sm hover:text-[#FF6600]">Browse Products</Link>
            <Link to="/stores" onClick={() => setMenuOpen(false)} className="block py-2 text-sm hover:text-[#FF6600]">All Stores</Link>
            <Link to="/sell" onClick={() => setMenuOpen(false)} className="block py-2 text-sm hover:text-[#FF6600]">Sell on Pasal</Link>
            <Link to="/merchant" onClick={() => setMenuOpen(false)} className="block py-2 text-sm hover:text-[#FF6600]">Merchant Login</Link>
            <Link to="/admin" onClick={() => setMenuOpen(false)} className="block py-2 text-sm hover:text-[#FF6600]">Super Admin</Link>
            <Link to="/return-policy" onClick={() => setMenuOpen(false)} className="block py-2 text-sm hover:text-[#FF6600]">Return & Refund Policy</Link>
          </div>
        )}
      </header>

      {showOTP && <OTPLogin onClose={() => setShowOTP(false)} onSuccess={() => setShowOTP(false)} />}
    </>
  );
}
