import { Link } from 'react-router-dom';
import { Store as StoreIcon } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import StoreCard from '../components/StoreCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { useEffect, useState } from 'react';
import { Store, Product } from '../lib/types';

export default function Stores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stores').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([s, p]) => {
      setStores(Array.isArray(s) ? s : []);
      setProducts(Array.isArray(p) ? p : []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <h1 className="text-xl font-bold text-[#212529] mb-1">All Stores</h1>
        <p className="text-sm text-[#6C757D] mb-6">Shop directly from {stores.length} local Nepali stores</p>
        {loading ? <Loading /> : stores.length === 0 ? (
          <EmptyState title="No stores yet" message="Be the first to open a store on Pasal Nepal." actionLabel="Start Selling" actionTo="/sell" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {stores.map(s => (
              <StoreCard key={s.id} store={s} productCount={products.filter(p => p.store_id === s.id).length} />
            ))}
          </div>
        )}
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
