import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, Headphones, Tag } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import ProductCard from '../components/ProductCard';
import StoreCard from '../components/StoreCard';
import Loading from '../components/Loading';
import { Product, Store } from '../lib/types';

const CATEGORIES = [
  { name: 'Electronics', icon: '📱', color: '#1E88E5' },
  { name: 'Fashion', icon: '👗', color: '#E91E63' },
  { name: 'Groceries', icon: '🍚', color: '#28A745' },
  { name: 'Home & Living', icon: '🏠', color: '#FF6600' },
  { name: 'Beauty', icon: '💄', color: '#9C27B0' },
  { name: 'Accessories', icon: '⌚', color: '#5C2D91' },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/stores').then(r => r.json()),
    ]).then(([p, s]) => {
      setProducts(Array.isArray(p) ? p : []);
      setStores(Array.isArray(s) ? s : []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-br from-[#0F1B3D] to-[#1A2B5C] text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-block bg-[#FF6600]/20 text-[#FF6600] text-xs font-bold px-3 py-1 rounded-full mb-4">🇳🇵 Nepal's #1 Multi-Vendor Marketplace</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">Shop from thousands of local stores</h1>
            <p className="text-white/70 text-base md:text-lg mb-6 max-w-md">Pay with eSewa, Khalti, FonePay, IME Pay or Cash on Delivery. Fast delivery across all 7 provinces.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="bg-[#FF6600] hover:bg-[#e65c00] text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">Start Shopping <ArrowRight className="w-4 h-4" /></Link>
              <Link to="/sell" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3 rounded-lg transition-colors">Open a Store</Link>
            </div>
          </div>
          <div className="hidden md:block relative">
            <img src="/images/hero.jpg" alt="Nepal marketplace" className="rounded-2xl shadow-2xl w-full h-80 object-cover" />
          </div>
        </div>
      </section>

      <section className="border-b border-[#E9ECEF]">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Truck, title: 'Nationwide Delivery', sub: 'All 7 provinces' },
            { icon: ShieldCheck, title: 'Secure Payments', sub: 'eSewa, Khalti & more' },
            { icon: Headphones, title: 'Local Support', sub: 'Nepali & English' },
            { icon: Tag, title: 'Best Prices', sub: 'Direct from sellers' },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F8F9FA] flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-[#FF6600]" /></div>
              <div><p className="text-sm font-bold text-[#212529]">{title}</p><p className="text-xs text-[#6C757D]">{sub}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-[#212529] mb-4">Shop by Category</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map(c => (
            <Link key={c.name} to={`/products?category=${encodeURIComponent(c.name)}`} className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-[#E9ECEF] hover:border-[#FF6600] hover:shadow-md transition-all bg-white">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: `${c.color}15` }}>{c.icon}</div>
              <span className="text-xs font-semibold text-[#212529] group-hover:text-[#FF6600]">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#212529]">Featured Products</h2>
          <Link to="/products" className="text-sm font-semibold text-[#17A2B8] hover:underline flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        {loading ? <Loading /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {products.slice(0, 10).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#212529]">Top Stores</h2>
          <Link to="/stores" className="text-sm font-semibold text-[#17A2B8] hover:underline flex items-center gap-1">All stores <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        {loading ? <Loading /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stores.slice(0, 5).map(s => <StoreCard key={s.id} store={s} productCount={products.filter(p => p.store_id === s.id).length} />)}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-[#F8F9FA] rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#212529] mb-2">Start your online store in minutes</h2>
            <p className="text-[#6C757D] mb-4">No coding needed. Free plan available. Reach customers across Nepal.</p>
            <Link to="/sell" className="bg-[#FF6600] hover:bg-[#e65c00] text-white font-bold px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors">Become a Seller <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="flex gap-6 text-center">
            <div><p className="text-3xl font-extrabold text-[#FF6600]">Rs.0</p><p className="text-xs text-[#6C757D]">Start free</p></div>
            <div><p className="text-3xl font-extrabold text-[#28A745]">2%</p><p className="text-xs text-[#6C757D]">Commission</p></div>
          </div>
        </div>
      </section>

      <Footer />
      <BottomNav />
    </div>
  );
}
