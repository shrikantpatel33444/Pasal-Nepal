import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0F1B3D] text-white/80 mt-16 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF6600] flex items-center justify-center font-extrabold text-white">P</div>
            <span className="font-extrabold text-lg text-white">Pasal<span className="text-[#FF6600]">Nepal</span></span>
          </div>
          <p className="text-sm text-white/60">Nepal's multi-vendor marketplace. Start selling or shop from thousands of local stores.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white text-sm mb-3">Sell</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/sell" className="hover:text-[#FF6600]">Start Selling</Link></li>
            <li><Link to="/merchant" className="hover:text-[#FF6600]">Merchant Login</Link></li>
            <li><Link to="/pricing" className="hover:text-[#FF6600]">Pricing Plans</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white text-sm mb-3">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-[#FF6600]">All Products</Link></li>
            <li><Link to="/stores" className="hover:text-[#FF6600]">All Stores</Link></li>
            <li><Link to="/cart" className="hover:text-[#FF6600]">Your Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white text-sm mb-3">Legal & Compliance</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/return-policy" className="hover:text-[#FF6600]">Return & Refund Policy</Link></li>
            <li><Link to="/sell" className="hover:text-[#FF6600]">IRD Compliance</Link></li>
            <li><span className="text-white/40">VAT: 13% (IRD Nepal)</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Pasal Nepal. Built for Nepal 🇳🇵 | Prices in NPR | UTC+5:45
      </div>
    </footer>
  );
}
