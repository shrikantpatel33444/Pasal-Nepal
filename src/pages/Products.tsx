import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { Product } from '../lib/types';

const CATEGORIES = ['Electronics', 'Fashion', 'Groceries', 'Home & Living', 'Beauty', 'Accessories'];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    setLoading(true);
    fetch('/api/products').then(r => r.json()).then(data => {
      setProducts(Array.isArray(data) ? data : []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (category) list = list.filter(p => p.category === category);
    if (maxPrice) list = list.filter(p => Number(p.price) <= Number(maxPrice));
    if (sort === 'price-low') list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'price-high') list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === 'rating') list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    return list;
  }, [products, search, category, maxPrice, sort]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-sm text-[#212529] mb-3">Category</h3>
        <div className="space-y-2">
          {CATEGORIES.map(c => (
            <label key={c} className="flex items-center gap-2 cursor-pointer text-sm text-[#212529]">
              <input type="checkbox" checked={category === c} onChange={() => updateParam('category', category === c ? '' : c)} className="w-4 h-4 accent-[#FF6600]" />
              {c}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-bold text-sm text-[#212529] mb-3">Max Price</h3>
        <input type="range" min="0" max="50000" step="500" value={maxPrice || 50000} onChange={(e) => updateParam('maxPrice', e.target.value)} className="w-full accent-[#FF6600]" />
        <p className="text-xs text-[#6C757D] mt-1">Up to Rs. {Number(maxPrice || 50000).toLocaleString()}</p>
      </div>
      <div>
        <h3 className="font-bold text-sm text-[#212529] mb-3">Sort By</h3>
        <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="w-full border border-[#DEE2E6] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600]">
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>
      </div>
      <button onClick={() => setSearchParams(new URLSearchParams())} className="w-full text-sm text-[#DC3545] font-semibold hover:underline">Clear all filters</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[#212529]">
            {search ? `Results for "${search}"` : category ? category : 'All Products'}
            <span className="text-sm font-normal text-[#6C757D] ml-2">({filtered.length})</span>
          </h1>
          <button onClick={() => setShowFilters(true)} className="md:hidden flex items-center gap-1.5 text-sm font-semibold text-[#212529] border border-[#DEE2E6] px-3 py-2 rounded-md">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="flex gap-6">
          <aside className="hidden md:block w-60 shrink-0">
            <div className="bg-white border border-[#E9ECEF] rounded-lg p-4 sticky top-20">
              <FilterPanel />
            </div>
          </aside>

          <div className="flex-1">
            {loading ? <Loading /> : filtered.length === 0 ? (
              <EmptyState title="No products found" message="Try adjusting your filters or search terms." actionLabel="Clear filters" actionTo="/products" />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-4 overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#212529]">Filters</h2>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}

      <Footer />
      <BottomNav />
    </div>
  );
}
