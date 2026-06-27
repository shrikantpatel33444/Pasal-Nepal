import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function BottomNav() {
  const { totalItems } = useCart();
  const location = useLocation();

  const items = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/products', icon: Search, label: 'Browse' },
    { to: '/cart', icon: ShoppingBag, label: 'Cart', badge: totalItems },
    { to: '/sell', icon: User, label: 'Sell' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#DEE2E6] z-40 grid grid-cols-4">
      {items.map(({ to, icon: Icon, label, badge }) => {
        const active = location.pathname === to || (to === '/products' && location.pathname.startsWith('/product'));
        return (
          <Link key={to} to={to} className={`flex flex-col items-center justify-center py-2 gap-0.5 ${active ? 'text-[#FF6600]' : 'text-[#6C757D]'}`}>
            <div className="relative">
              <Icon className="w-5 h-5" />
              {badge ? <span className="absolute -top-1.5 -right-2 bg-[#FF6600] text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">{badge}</span> : null}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
