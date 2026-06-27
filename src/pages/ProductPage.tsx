import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart, Truck, ShieldCheck, RotateCcw, Minus, Plus, Check, MessageSquare, Camera } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import Loading from '../components/Loading';
import ProductCard from '../components/ProductCard';
import ReviewSection, { Review } from '../components/ReviewSection';
import ReviewForm from '../components/ReviewForm';
import { useCart } from '../contexts/CartContext';
import { Product, Store, formatNPR } from '../lib/types';

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/stores').then(r => r.json()),
    ]).then(([prods, stores]) => {
      const p = (Array.isArray(prods) ? prods : []).find((x: Product) => String(x.id) === String(id));
      if (p) {
        setProduct(p);
        const s = (Array.isArray(stores) ? stores : []).find((x: Store) => x.id === p.store_id);
        setStore(s || null);
        setRelated((Array.isArray(prods) ? prods : []).filter((x: Product) => x.category === p.category && x.id !== p.id).slice(0, 5));
        // Load reviews
        fetch(`/api/reviews?product_id=${p.id}`).then(r => r.json()).then(rv => setReviews(Array.isArray(rv) ? rv : []));
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="min-h-screen bg-white"><Header /><Loading /><BottomNav /></div>;
  if (!product) return <div className="min-h-screen bg-white"><Header /><div className="text-center py-20"><p className="text-[#6C757D]">Product not found.</p><Link to="/products" className="text-[#17A2B8] font-semibold">Browse products</Link></div><BottomNav /></div>;

  const discount = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <nav className="text-xs text-[#6C757D] mb-4">
          <Link to="/" className="hover:text-[#FF6600]">Home</Link> / <Link to={`/products?category=${product.category}`} className="hover:text-[#FF6600]">{product.category}</Link> / <span className="text-[#212529]">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#F8F9FA] rounded-xl p-4 flex items-center justify-center">
            <img src={product.image_url} alt={product.name} className="max-h-96 w-auto object-contain rounded-lg" />
          </div>

          <div>
            {store && (
              <Link to={`/store/${store.subdomain}`} className="inline-flex items-center gap-2 mb-3 text-sm text-[#17A2B8] hover:underline">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: store.primary_color || '#0F1B3D' }}>{store.name.charAt(0)}</div>
                Visit {store.name}
              </Link>
            )}
            <h1 className="text-2xl font-bold text-[#000000] mb-2">{product.name}</h1>
            {product.rating != null && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.rating!) ? 'fill-[#FFD814] text-[#FFD814]' : 'text-[#DEE2E6]'}`} />)}
                </div>
                <span className="text-sm font-semibold text-[#212529]">{Number(product.rating).toFixed(1)}</span>
                <span className="text-sm text-[#6C757D]">({product.reviews_count || 0} reviews)</span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-extrabold text-[#000000]">{formatNPR(Number(product.price))}</span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-base text-[#6C757D] line-through">{formatNPR(Number(product.mrp))}</span>
              )}
              {discount > 0 && <span className="text-sm font-bold text-[#28A745]">{discount}% off</span>}
            </div>
            <p className="text-xs text-[#6C757D] mb-4">Inclusive of all taxes</p>

            <div className="mb-4">
              {outOfStock ? (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#DC3545]"><span className="w-2 h-2 rounded-full bg-[#DC3545]" /> Out of Stock</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#28A745]"><Check className="w-4 h-4" /> In Stock ({product.stock} available)</span>
              )}
            </div>

            {product.description && <p className="text-sm text-[#6C757D] mb-6 leading-relaxed">{product.description}</p>}

            {!outOfStock && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-[#DEE2E6] rounded-md">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-[#F8F9FA]"><Minus className="w-4 h-4" /></button>
                  <span className="px-4 font-semibold">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="p-2 hover:bg-[#F8F9FA]"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            )}

            <div className="flex gap-3 mb-6">
              <button onClick={handleAdd} disabled={outOfStock} className="flex-1 bg-[#FF6600] hover:bg-[#e65c00] disabled:bg-[#DEE2E6] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                {added ? <><Check className="w-5 h-5" /> Added!</> : <><ShoppingBag className="w-5 h-5" /> Add to Cart</>}
              </button>
              <button onClick={() => setWished(!wished)} className={`px-4 border rounded-lg ${wished ? 'border-[#DC3545] text-[#DC3545]' : 'border-[#DEE2E6] text-[#6C757D]'}`}>
                <Heart className={`w-5 h-5 ${wished ? 'fill-[#DC3545]' : ''}`} />
              </button>
            </div>

            {/* Social Share */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-[#6C757D] mb-2">Share & get a discount coupon!</p>
              <div className="flex gap-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(`Check out ${product.name} on Pasal Nepal! ${window.location.href}`)}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-colors" style={{ background: '#25D366' }}>💬 WhatsApp</a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-colors" style={{ background: '#1877F2' }}>📘 Facebook</a>
                <button onClick={() => { navigator.clipboard?.writeText(window.location.href); alert('Link copied! Share it on Viber to get a discount coupon.'); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-colors" style={{ background: '#7360F2' }}>📞 Viber</button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E9ECEF]">
              {[
                { icon: Truck, label: 'Free Delivery' },
                { icon: ShieldCheck, label: 'Secure Pay' },
                { icon: RotateCcw, label: '7-Day Returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1">
                  <Icon className="w-5 h-5 text-[#17A2B8]" />
                  <span className="text-[11px] text-[#6C757D]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#212529] flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#FF6600]" /> Customer Reviews ({reviews.length})</h2>
            <button onClick={() => setShowReviewForm(true)} className="bg-[#FF6600] hover:bg-[#e65c00] text-white text-sm font-bold px-4 py-2 rounded-md flex items-center gap-1.5">
              <Camera className="w-4 h-4" /> Write Review
            </button>
          </div>
          <div className="bg-white rounded-lg p-5">
            <ReviewSection
              reviews={reviews}
              avgRating={product.rating ? Number(product.rating) : 0}
              reviewCount={product.reviews_count || reviews.length}
            />
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-[#212529] mb-4">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
      {showReviewForm && product && (
        <ReviewForm
          product={product}
          onClose={() => setShowReviewForm(false)}
          onSubmitted={() => {
            fetch(`/api/reviews?product_id=${product.id}`).then(r => r.json()).then(rv => setReviews(Array.isArray(rv) ? rv : []));
          }}
        />
      )}
      <Footer />
      <BottomNav />
    </div>
  );
}
