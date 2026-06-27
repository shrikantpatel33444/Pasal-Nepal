import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Store as StoreIcon, MapPin } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { Store, Product } from '../lib/types';

export default function StorePage() {
  const { subdomain } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/stores').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([stores, prods]) => {
      const s = (Array.isArray(stores) ? stores : []).find((x: Store) => x.subdomain === subdomain);
      setStore(s || null);
      setProducts((Array.isArray(prods) ? prods : []).filter((p: Product) => p.store_id === s?.id));
    }).finally(() => setLoading(false));
  }, [subdomain]);

  if (loading) return <div className="min-h-screen bg-white"><Header /><Loading /><BottomNav /></div>;
  if (!store) return <div className="min-h-screen bg-white"><Header /><EmptyState title="Store not found" message="This store doesn't exist or has been removed." actionLabel="Browse stores" actionTo="/stores" /><BottomNav /></div>;

  const categories = [...new Set(products.map(p => p.category))];
  const filtered = category ? products.filter(p => p.category === category) : products;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Store banner */}
      <div className="h-32 md:h-48" style={{ background: `linear-gradient(135deg, ${store.primary_color || '#0F1B3D'}, ${store.primary_color || '#1A2B5C'}cc)` }}>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-end pb-4">
          <Link to="/stores" className="text-white/80 text-sm flex items-center gap-1 mb-2 hover:text-white"><ArrowLeft className="w-4 h-4" /> All stores</Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-xl shadow-md p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-3xl font-bold shrink-0" style={{ background: store.primary_color || '#0F1B3D' }}>
            {store.logo_url ? <img src={store.logo_url} className="w-full h-full rounded-xl object-cover" /> : store.name.charAt(0)}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold text-[#000000]">{store.name}</h1>
            <p className="text-sm text-[#6C757D] mt-1">{store.description || 'Welcome to our store'}</p>
            <div className="flex items-center gap-3 mt-2 justify-center sm:justify-start text-xs text-[#6C757D]">
              <span className="bg-[#F8F9FA] px-2 py-0.5 rounded-full capitalize">{store.plan} plan</span>
              {store.district && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {store.district}</span>}
              <span>{products.length} products</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {categories.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
            <button onClick={() => setCategory('')} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${!category ? 'bg-[#0F1B3D] text-white' : 'bg-[#F8F9FA] text-[#6C757D]'}`}>All</button>
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${category === c ? 'bg-[#0F1B3D] text-white' : 'bg-[#F8F9FA] text-[#6C757D]'}`}>{c}</button>
            ))}
          </div>
        )}
        {filtered.length === 0 ? (
          <EmptyState title="No products yet" message="This store hasn't added any products." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
