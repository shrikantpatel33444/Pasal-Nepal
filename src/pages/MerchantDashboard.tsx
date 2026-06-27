import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Tag, Palette, CreditCard, LogOut, Plus, Pencil, Trash2, X, TrendingUp, DollarSign, Store, ExternalLink, Loader2, Check, Shield, FileText, Upload, Building2, Banknote, Smartphone, Globe, MessageSquare, Phone, Megaphone, Gift, Share2, Users, Clock, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../lib/supabase';
import { Store as StoreType, Product, Order, Coupon, PLANS, formatNPR } from '../lib/types';
import { validatePAN, COMPLIANCE_CHECKLIST, getComplianceScore, ComplianceStatus } from '../lib/tax';
import { t, Lang, ALL_BANKS, ORDER_SOURCES, SMS_PROVIDERS } from '../lib/i18n';
import { FESTIVALS, SOCIAL_PLATFORMS, INFLUENCER_PLATFORMS, TIERED_DISCOUNT_TYPES, generateRewardCode, getDaysUntil } from '../lib/marketing';
import InvoiceModal from '../components/InvoiceModal';

const PRESET_IMAGES = ['/images/headphones.jpg','/images/sneakers.jpg','/images/watch.jpg','/images/backpack.jpg','/images/phone.jpg','/images/rice.jpg','/images/dress.jpg','/images/lamp.jpg','/images/mug.jpg','/images/sunglasses.jpg','/images/cosmetics.jpg','/images/laptop.jpg','/images/bottle.jpg','/images/pashmina.jpg'];
const CATEGORIES = ['Electronics','Fashion','Groceries','Home & Living','Beauty','Accessories'];
const COLORS = ['#0F1B3D','#FF6600','#28A745','#DC3545','#5C2D91','#17A2B8','#E91E63','#1E88E5'];

export default function MerchantDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreType | null>(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('pasal_lang') as Lang) || 'en');

  const toggleLang = () => {
    const next = lang === 'en' ? 'np' : 'en';
    setLang(next);
    localStorage.setItem('pasal_lang', next);
  };

  const loadAll = async (storeEmail: string) => {
    const storesRes = await fetch('/api/stores').then(r => r.json());
    const s = (Array.isArray(storesRes) ? storesRes : []).find((x: StoreType) => x.owner_email === storeEmail);
    setStore(s || null);
    if (s) {
      const [prods, ords, cps] = await Promise.all([
        fetch(`/api/products?store_id=${s.id}`).then(r => r.json()),
        fetch(`/api/orders?store_id=${s.id}`).then(r => r.json()),
        fetch(`/api/coupons?store_id=${s.id}`).then(r => r.json()),
      ]);
      setProducts(Array.isArray(prods) ? prods : []);
      setOrders(Array.isArray(ords) ? ords : []);
      setCoupons(Array.isArray(cps) ? cps : []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/merchant'); return; }
    loadAll(user.email || '');
  }, [user, authLoading]);

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="w-8 h-8 animate-spin text-[#FF6600]" /></div>;

  if (!store) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
        <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-sm">
          <Store className="w-12 h-12 text-[#FF6600] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#212529] mb-2">No store found</h1>
          <p className="text-sm text-[#6C757D] mb-6">You're signed in but don't have a store yet. Create one to start selling.</p>
          <Link to="/sell" className="bg-[#FF6600] hover:bg-[#e65c00] text-white font-bold px-6 py-3 rounded-lg inline-block">Create Your Store</Link>
          <button onClick={() => supabase.auth.signOut().then(() => navigate('/'))} className="block mx-auto mt-4 text-sm text-[#6C757D] hover:text-[#DC3545]">Sign out</button>
        </div>
      </div>
    );
  }

  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const signOut = async () => { await supabase.auth.signOut(); navigate('/'); };

  const navItems = [
    { id: 'overview', label: t('overview', lang), icon: LayoutDashboard },
    { id: 'products', label: t('products', lang), icon: Package },
    { id: 'orders', label: t('orders', lang), icon: ShoppingCart },
    { id: 'offline', label: t('offline_orders', lang), icon: Smartphone },
    { id: 'coupons', label: t('coupons', lang), icon: Tag },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'payouts', label: t('payouts', lang), icon: Banknote },
    { id: 'compliance', label: t('compliance', lang), icon: Shield },
    { id: 'appearance', label: t('appearance', lang), icon: Palette },
    { id: 'subscription', label: t('subscription', lang), icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Top bar */}
      <div className="bg-[#0F1B3D] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded bg-[#FF6600] flex items-center justify-center font-extrabold text-sm">P</div>
              <span className="font-bold hidden sm:block">Pasal Nepal</span>
            </Link>
            <span className="text-white/30 hidden sm:inline">/</span>
            <span className="text-sm font-medium truncate">{store.name}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button onClick={toggleLang} className="flex items-center gap-1 text-xs font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-md transition-colors">
              <Globe className="w-3.5 h-3.5" /> {lang === 'en' ? 'नेपाली' : 'EN'}
            </button>
            <Link to={`/store/${store.subdomain}`} target="_blank" className="text-sm text-white/70 hover:text-[#FF6600] flex items-center gap-1"><ExternalLink className="w-4 h-4" /> <span className="hidden lg:inline">{t('view_store', lang)}</span></Link>
            <button onClick={signOut} className="text-sm text-white/70 hover:text-[#DC3545] flex items-center gap-1"><LogOut className="w-4 h-4" /> <span className="hidden lg:inline">{t('sign_out', lang)}</span></button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 flex flex-col md:flex-row gap-4 sm:gap-6">
        {/* Sidebar */}
        <aside className="md:w-56 shrink-0">
          {/* Mobile: horizontal scroll nav */}
          <div className="md:hidden flex gap-1.5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
            {navItems.map(n => {
              const Icon = n.icon;
              return <button key={n.id} onClick={() => setTab(n.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${tab === n.id ? 'bg-[#FF6600] text-white' : 'bg-white text-[#212529]'}`}><Icon className="w-3.5 h-3.5" />{n.label}</button>;
            })}
          </div>
          {/* Desktop: vertical nav */}
          <nav className="hidden md:flex flex-col gap-1 bg-white rounded-lg p-2">
            {navItems.map(n => {
              const Icon = n.icon;
              return <button key={n.id} onClick={() => setTab(n.id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${tab === n.id ? 'bg-[#FF6600] text-white' : 'text-[#212529] hover:bg-[#F8F9FA]'}`}><Icon className="w-4 h-4" />{n.label}</button>;
            })}
          </nav>
          <div className="hidden md:block bg-white rounded-lg p-4 mt-4">
            <p className="text-xs text-[#6C757D]">{t('current_plan', lang)}</p>
            <p className="font-bold text-[#212529] capitalize">{store.plan}</p>
            <button onClick={() => setTab('subscription')} className="text-xs text-[#17A2B8] font-semibold mt-1">{t('manage', lang)} →</button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {tab === 'overview' && <Overview store={store} products={products} orders={orders} revenue={revenue} pendingOrders={pendingOrders} lang={lang} />}
          {tab === 'products' && <ProductsTab store={store} products={products} setProducts={setProducts} lang={lang} />}
          {tab === 'orders' && <OrdersTab orders={orders} setOrders={setOrders} storeId={store.id} lang={lang} />}
          {tab === 'offline' && <OfflineOrderTab store={store} products={products} onOrderCreated={() => loadAll(user.email || '')} lang={lang} />}
          {tab === 'coupons' && <CouponsTab store={store} coupons={coupons} setCoupons={setCoupons} lang={lang} />}
          {tab === 'marketing' && <MarketingTab store={store} orders={orders} />}
          {tab === 'payouts' && <PayoutsTab store={store} lang={lang} />}
          {tab === 'compliance' && <ComplianceTab store={store} />}
          {tab === 'appearance' && <AppearanceTab store={store} setStore={setStore} />}
          {tab === 'subscription' && <SubscriptionTab store={store} setStore={setStore} />}
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-lg p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15` }}><Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} /></div>
      <div className="min-w-0"><p className="text-[10px] sm:text-xs text-[#6C757D] truncate">{label}</p><p className="text-base sm:text-xl font-extrabold text-[#212529] truncate">{value}</p></div>
    </div>
  );
}

function Overview({ store, products, orders, revenue, pendingOrders, lang }: any) {
  const recent = orders.slice(0, 5);
  return (
    <div className="space-y-4 sm:space-y-6">
      <div><h1 className="text-lg sm:text-xl font-bold text-[#212529]">{t('welcome_back', lang)}, {store.owner_name} 👋</h1><p className="text-sm text-[#6C757D]">{t('store_performance', lang)}</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <StatCard icon={DollarSign} label={t('total_revenue', lang)} value={formatNPR(revenue)} color="#28A745" />
        <StatCard icon={ShoppingCart} label={t('total_orders', lang)} value={orders.length} color="#17A2B8" />
        <StatCard icon={Package} label={t('products', lang)} value={products.length} color="#FF6600" />
        <StatCard icon={TrendingUp} label={t('pending_orders', lang)} value={pendingOrders} color="#DC3545" />
      </div>
      <div className="bg-white rounded-lg p-4 sm:p-5">
        <h2 className="font-bold text-[#212529] mb-4">{t('recent_orders', lang)}</h2>
        {recent.length === 0 ? <p className="text-sm text-[#6C757D] py-6 text-center">{t('no_orders_yet', lang)}</p> : (
          <div className="space-y-2">
            {recent.map((o: Order) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-[#E9ECEF] last:border-0">
                <div className="min-w-0"><p className="text-sm font-semibold text-[#212529] truncate">{o.order_number}</p><p className="text-xs text-[#6C757D] truncate">{o.customer_name} • {o.customer_phone}</p></div>
                <div className="text-right shrink-0 ml-2"><p className="text-sm font-bold text-[#000000]">{formatNPR(Number(o.total))}</p><StatusBadge status={o.status} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-[#FF6600]/5 border border-[#FF6600]/20 rounded-lg p-4 flex items-center gap-3">
        <ExternalLink className="w-5 h-5 text-[#FF6600] shrink-0" />
        <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[#212529]">{t('store_is_live', lang)}</p><p className="text-xs text-[#6C757D] truncate">{store.subdomain}.pasalnepal.com</p></div>
        <Link to={`/store/${store.subdomain}`} target="_blank" className="text-sm text-[#FF6600] font-bold shrink-0">{t('view_store', lang)} →</Link>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string,string> = { pending: '#FF6600', confirmed: '#17A2B8', shipped: '#1E88E5', delivered: '#28A745', cancelled: '#DC3545' };
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: `${colors[status] || '#6C757D'}20`, color: colors[status] || '#6C757D' }}>{status}</span>;
}

function ProductsTab({ store, products, setProducts, lang }: any) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const plan = PLANS[store.plan as keyof typeof PLANS];
  const limitReached = products.length >= plan.products;

  const refresh = async () => {
    const data = await fetch(`/api/products?store_id=${store.id}`).then(r => r.json());
    setProducts(Array.isArray(data) ? data : []);
  };

  const del = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-2">
        <h1 className="text-lg sm:text-xl font-bold text-[#212529]">{t('products', lang)} ({products.length}/{plan.products === 99999 ? '∞' : plan.products})</h1>
        <button onClick={() => { if (limitReached) { alert(`Your ${plan.name} plan allows ${plan.products} products.`); return; } setEditing(null); setShowForm(true); }} className="bg-[#FF6600] hover:bg-[#e65c00] text-white text-sm font-bold px-3 sm:px-4 py-2 rounded-md flex items-center gap-1.5 shrink-0"><Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('add_product', lang)}</span><span className="sm:hidden">Add</span></button>
      </div>
      <div className="bg-white rounded-lg overflow-hidden">
        {products.length === 0 ? <p className="text-sm text-[#6C757D] py-10 text-center">{t('no_products', lang)}</p> : (
          <div className="divide-y divide-[#E9ECEF]">
            {products.map((p: Product) => (
              <div key={p.id} className="flex items-center gap-3 p-3">
                <img src={p.image_url} className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[#212529] line-clamp-1">{p.name}</p><p className="text-xs text-[#6C757D]">{p.category} • {t('stock', lang)}: {p.stock}</p></div>
                <span className="text-sm font-bold text-[#000000] shrink-0">{formatNPR(Number(p.price))}</span>
                <button onClick={() => { setEditing(p); setShowForm(true); }} className="p-2 text-[#6C757D] hover:text-[#17A2B8] shrink-0"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => del(p.id)} className="p-2 text-[#6C757D] hover:text-[#DC3545] shrink-0"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
      {showForm && <ProductForm store={store} product={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); refresh(); }} />}
    </div>
  );
}

function ProductForm({ store, product, onClose, onSaved }: any) {
  const [form, setForm] = useState({ name: product?.name || '', description: product?.description || '', price: product?.price || '', mrp: product?.mrp || '', image_url: product?.image_url || PRESET_IMAGES[0], category: product?.category || CATEGORIES[0], stock: product?.stock || 10 });
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const body = { ...form, price: Number(form.price), mrp: form.mrp ? Number(form.mrp) : null, stock: Number(form.stock), store_id: store.id };
    if (product) {
      await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id, ...body }) });
    } else {
      await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, rating: 4 + Math.random(), reviews_count: Math.floor(Math.random()*50) }) });
    }
    setSaving(false); onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[#E9ECEF] sticky top-0 bg-white"><h2 className="font-bold text-[#212529]">{product ? 'Edit Product' : 'Add Product'}</h2><button onClick={onClose}><X className="w-5 h-5" /></button></div>
        <form onSubmit={save} className="p-4 space-y-4">
          <div><label className="text-xs font-semibold text-[#6C757D]">Product Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" /></div>
          <div><label className="text-xs font-semibold text-[#6C757D]">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-[#6C757D]">Price (Rs.) *</label><input required type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" /></div>
            <div><label className="text-xs font-semibold text-[#6C757D]">MRP (Rs.)</label><input type="number" value={form.mrp} onChange={e => setForm({...form, mrp: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-[#6C757D]">Category</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="text-xs font-semibold text-[#6C757D]">Stock</label><input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" /></div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6C757D]">Product Image</label>
            <div className="flex gap-3 items-center mt-1">
              <img src={form.image_url} className="w-16 h-16 rounded-md object-cover border border-[#DEE2E6]" />
              <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="flex-1 px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" />
            </div>
            <div className="grid grid-cols-7 gap-1.5 mt-2">
              {PRESET_IMAGES.map(img => <button type="button" key={img} onClick={() => setForm({...form, image_url: img})} className={`aspect-square rounded overflow-hidden border-2 ${form.image_url === img ? 'border-[#FF6600]' : 'border-transparent'}`}><img src={img} className="w-full h-full object-cover" /></button>)}
            </div>
          </div>
          <button type="submit" disabled={saving} className="w-full bg-[#FF6600] hover:bg-[#e65c00] disabled:opacity-60 text-white font-bold py-3 rounded-md flex items-center justify-center gap-2">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : product ? 'Save Changes' : 'Add Product'}</button>
        </form>
      </div>
    </div>
  );
}

function OrdersTab({ orders, setOrders, storeId, lang }: any) {
  const [invoiceOrderId, setInvoiceOrderId] = useState<string | null>(null);
  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    const data = await fetch(`/api/orders?store_id=${storeId}`).then(r => r.json());
    setOrders(Array.isArray(data) ? data : []);
  };
  return (
    <div>
      <h1 className="text-lg sm:text-xl font-bold text-[#212529] mb-4">{t('orders', lang)} ({orders.length})</h1>
      {orders.length === 0 ? <div className="bg-white rounded-lg p-10 text-center text-sm text-[#6C757D]">{t('no_orders_yet', lang)}</div> : (
        <div className="space-y-3">
          {orders.map((o: Order) => (
            <div key={o.id} className="bg-white rounded-lg p-3 sm:p-4">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div className="min-w-0"><p className="font-bold text-[#212529] truncate">{o.order_number}</p><p className="text-xs text-[#6C757D]">{new Date(o.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kathmandu' })}</p></div>
                <div className="text-right shrink-0"><p className="font-extrabold text-[#000000]">{formatNPR(Number(o.total))}</p><StatusBadge status={o.status} /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-[#6C757D] mb-1">{t('customer', lang)}</p><p className="font-medium text-[#212529]">{o.customer_name}</p><p className="text-xs text-[#6C757D]">{o.customer_phone}</p></div>
                <div><p className="text-xs text-[#6C757D] mb-1">{t('delivery_address', lang)}</p><p className="text-xs text-[#212529]">{o.address_line}, Ward {o.ward}, {o.municipality}, {o.district}</p></div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#E9ECEF]">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <p className="text-xs text-[#6C757D]">{t('items', lang)} ({o.items?.length || 0}) • {t('payment', lang)}: <span className="font-semibold uppercase text-[#212529]">{o.payment_method}</span></p>
                  <button onClick={() => setInvoiceOrderId(o.id)} className="text-xs font-bold text-[#17A2B8] flex items-center gap-1 hover:underline"><FileText className="w-3.5 h-3.5" /> {t('invoice', lang)}</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['pending','confirmed','shipped','delivered','cancelled'].map(s => (
                    <button key={s} onClick={() => updateStatus(o.id, s)} className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${o.status === s ? 'bg-[#0F1B3D] text-white' : 'bg-[#F8F9FA] text-[#6C757D] hover:bg-[#E9ECEF]'}`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {invoiceOrderId && <InvoiceModal orderId={invoiceOrderId} storeId={storeId} onClose={() => setInvoiceOrderId(null)} />}
    </div>
  );
}

function OfflineOrderTab({ store, products, onOrderCreated, lang }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', product_id: '', qty: '1', source: 'facebook', notes: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const product = products.find((p: Product) => String(p.id) === String(form.product_id));
    if (!product) { setSaving(false); return; }
    const total = Number(product.price) * Number(form.qty);
    const orderBody = {
      store_id: store.id,
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      customer_email: null,
      items: [{ product_id: product.id, name: product.name, price: Number(product.price), qty: Number(form.qty), image_url: product.image_url }],
      subtotal: Number(product.price) * Number(form.qty),
      shipping: 0, discount: 0, total,
      payment_method: 'cod', payment_status: 'pending', status: 'confirmed',
      province: store.province || '', district: store.district || '', municipality: store.municipality || '', ward: '', address_line: form.notes || 'Offline order',
      coupon_code: null,
    };
    await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderBody) });
    // Send SMS
    fetch('/api/sms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: form.customer_phone, message: `Dear ${form.customer_name}, your order for ${product.name} (${form.qty}x) = ${formatNPR(total)} is confirmed. — Pasal Nepal` }) }).catch(() => {});
    setSaving(false); setSuccess(true); setShowForm(false);
    setForm({ customer_name: '', customer_phone: '', product_id: '', qty: '1', source: 'facebook', notes: '' });
    setTimeout(() => setSuccess(false), 3000);
    onOrderCreated();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#212529]">{t('offline_orders', lang)}</h1>
          <p className="text-xs text-[#6C757D]">{t('offline_order_desc', lang)}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-[#FF6600] hover:bg-[#e65c00] text-white text-sm font-bold px-4 py-2 rounded-md flex items-center gap-1.5 shrink-0"><Plus className="w-4 h-4" /> {t('add_offline_order', lang)}</button>
      </div>

      {success && (
        <div className="bg-[#28A745]/10 border border-[#28A745]/20 rounded-lg p-3 mb-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-[#28A745]" />
          <p className="text-sm font-semibold text-[#28A745]">Offline order added successfully! SMS sent to customer.</p>
        </div>
      )}

      {/* Source cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
        {ORDER_SOURCES.map(s => (
          <button key={s.id} onClick={() => { setForm({...form, source: s.id}); setShowForm(true); }} className="bg-white rounded-lg p-3 flex flex-col items-center gap-1.5 hover:border-[#FF6600] border-2 border-transparent transition-colors">
            <span className="text-2xl">{s.icon}</span>
            <span className="text-[10px] font-semibold text-[#6C757D]">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Smartphone className="w-5 h-5 text-[#17A2B8]" />
          <h2 className="font-bold text-[#212529]">How it works</h2>
        </div>
        <ol className="text-sm text-[#6C757D] space-y-1.5 ml-5 list-decimal">
          <li>Customer orders via Facebook, Instagram, WhatsApp, or phone call</li>
          <li>Click "Add Manual Order" and select the source</li>
          <li>Choose the product and quantity from your inventory</li>
          <li>Enter customer's name and phone number</li>
          <li>Order is created and SMS confirmation sent automatically</li>
        </ol>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#E9ECEF] sticky top-0 bg-white">
              <h2 className="font-bold text-[#212529]">{t('add_offline_order', lang)}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="p-4 space-y-4">
              <div className="flex items-center gap-2 bg-[#F8F9FA] rounded-lg p-2.5">
                {ORDER_SOURCES.map(s => (
                  <button type="button" key={s.id} onClick={() => setForm({...form, source: s.id})} className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-md transition-colors ${form.source === s.id ? 'bg-white shadow-sm' : ''}`} style={form.source === s.id ? { borderTop: `2px solid ${s.color}` } : {}}>
                    <span className="text-lg">{s.icon}</span>
                    <span className="text-[9px] font-semibold text-[#6C757D]">{s.label}</span>
                  </button>
                ))}
              </div>
              <div><label className="text-xs font-semibold text-[#6C757D]">{t('customer_name', lang)} *</label><input required value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" /></div>
              <div><label className="text-xs font-semibold text-[#6C757D]">{t('customer_phone', lang)} *</label><input required value={form.customer_phone} onChange={e => setForm({...form, customer_phone: e.target.value.replace(/\D/g,'').slice(0,10)})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="98XXXXXXXX" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><label className="text-xs font-semibold text-[#6C757D]">{t('select_product', lang)} *</label><select required value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none"><option value="">Select</option>{products.map((p: Product) => <option key={p.id} value={p.id}>{p.name} — {formatNPR(Number(p.price))}</option>)}</select></div>
                <div><label className="text-xs font-semibold text-[#6C757D]">{t('quantity', lang)}</label><input type="number" min="1" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" /></div>
              </div>
              <div><label className="text-xs font-semibold text-[#6C757D]">Notes / Address</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="Delivery address or order notes..." /></div>
              {form.product_id && <div className="bg-[#F8F9FA] rounded-lg p-3 text-sm flex justify-between"><span className="text-[#6C757D]">Total:</span><span className="font-extrabold text-[#000000]">{formatNPR(Number(products.find((p: Product) => String(p.id) === String(form.product_id))?.price || 0) * Number(form.qty))}</span></div>}
              <button type="submit" disabled={saving} className="w-full bg-[#FF6600] hover:bg-[#e65c00] disabled:opacity-60 text-white font-bold py-3 rounded-md flex items-center justify-center gap-2">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Order & Send SMS'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PayoutsTab({ store, lang }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({ bank_code: '', bank_name: '', account_number: '', account_name: '', branch: '' });
  const [payoutAmount, setPayoutAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const res = await fetch(`/api/payouts?store_id=${store.id}`);
    const d = await res.json();
    setData(d);
    if (d.bankAccount) {
      setBankForm({ bank_code: d.bankAccount.bank_code, bank_name: d.bankAccount.bank_name, account_number: d.bankAccount.account_number, account_name: d.bankAccount.account_name, branch: d.bankAccount.branch || '' });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [store.id]);

  const saveBank = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    await fetch('/api/payouts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ store_id: store.id, ...bankForm }) });
    setSaving(false); setShowBankForm(false); load();
    setMsg('Bank account saved successfully!'); setTimeout(() => setMsg(''), 3000);
  };

  const requestPayout = async () => {
    const amt = Number(payoutAmount);
    if (!amt || amt < 500) { setMsg('Minimum payout is रू 500'); return; }
    setSaving(true);
    const res = await fetch('/api/payouts', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ store_id: store.id, amount: amt }) });
    const d = await res.json();
    if (d.error) { setMsg(d.error); } else { setMsg(`Payout request created! Ref: ${d.reference}`); setPayoutAmount(''); load(); }
    setSaving(false);
    setTimeout(() => setMsg(''), 5000);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#FF6600]" /></div>;
  const bal = data?.balance || {};

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-[#212529] flex items-center gap-2"><Banknote className="w-5 h-5 text-[#28A745]" /> {t('payouts', lang)}</h1>
        <p className="text-sm text-[#6C757D]">Nepal bank account settlement & payout management</p>
      </div>

      {msg && <div className="bg-[#17A2B8]/10 text-[#17A2B8] text-sm p-3 rounded-lg">{msg}</div>}

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-[#0F1B3D] to-[#1A2B5C] text-white rounded-xl p-5">
        <p className="text-xs text-white/60 mb-1">{t('available_balance', lang)}</p>
        <p className="text-3xl sm:text-4xl font-extrabold mb-4">{formatNPR(bal.availableBalance || 0)}</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-white/50 text-xs">Gross Earnings</p><p className="font-bold">{formatNPR(bal.grossEarnings || 0)}</p></div>
          <div><p className="text-white/50 text-xs">Platform Commission (2%)</p><p className="font-bold text-[#FF6600]">-{formatNPR(bal.commission || 0)}</p></div>
          <div><p className="text-white/50 text-xs">Total Paid Out</p><p className="font-bold">{formatNPR(bal.totalPaidOut || 0)}</p></div>
          <div><p className="text-white/50 text-xs">Pending Payouts</p><p className="font-bold text-[#FFD814]">{formatNPR(bal.pendingPayouts || 0)}</p></div>
        </div>
      </div>

      {/* Bank Account */}
      <div className="bg-white rounded-lg p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#212529] flex items-center gap-2"><Building2 className="w-4 h-4 text-[#0F1B3D]" /> {t('bank_account', lang)}</h2>
          {data?.bankAccount && <button onClick={() => setShowBankForm(!showBankForm)} className="text-xs text-[#17A2B8] font-semibold">{showBankForm ? 'Cancel' : 'Edit'}</button>}
        </div>
        {data?.bankAccount && !showBankForm ? (
          <div className="bg-[#F8F9FA] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-[#0F1B3D] flex items-center justify-center"><Banknote className="w-6 h-6 text-white" /></div>
              <div><p className="font-bold text-[#212529]">{data.bankAccount.bank_name}</p><p className="text-xs text-[#6C757D]">{data.bankAccount.account_name}</p></div>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-[#6C757D]">Account Number</span><span className="font-mono font-semibold text-[#212529]">****{data.bankAccount.account_number?.slice(-4)}</span></div>
              {data.bankAccount.branch && <div className="flex justify-between"><span className="text-[#6C757D]">Branch</span><span className="text-[#212529]">{data.bankAccount.branch}</span></div>}
            </div>
          </div>
        ) : (
          <form onSubmit={saveBank} className="space-y-3">
            <div><label className="text-xs font-semibold text-[#6C757D]">{t('select_bank', lang)} *</label>
              <select required value={bankForm.bank_code} onChange={e => { const bank = ALL_BANKS.find(b => b.code === e.target.value); setBankForm({...bankForm, bank_code: e.target.value, bank_name: bank?.name || ''}); }} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none">
                <option value="">Select bank</option>
                <optgroup label="Class A (Commercial Banks)">
                  {ALL_BANKS.filter(b => b.class === 'A').map(b => <option key={b.code} value={b.code}>{b.name} ({b.nameNp})</option>)}
                </optgroup>
                <optgroup label="Class B (Development Banks)">
                  {ALL_BANKS.filter(b => b.class === 'B').map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                </optgroup>
                <optgroup label="Class C (Finance Companies)">
                  {ALL_BANKS.filter(b => b.class === 'C').map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                </optgroup>
              </select>
            </div>
            <div><label className="text-xs font-semibold text-[#6C757D]">{t('account_number', lang)} *</label><input required value={bankForm.account_number} onChange={e => setBankForm({...bankForm, account_number: e.target.value.replace(/[^0-9]/g, '')})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm font-mono focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="1234567890" /></div>
            <div><label className="text-xs font-semibold text-[#6C757D]">{t('account_name', lang)} *</label><input required value={bankForm.account_name} onChange={e => setBankForm({...bankForm, account_name: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="Ram Bahadur Sharma" /></div>
            <div><label className="text-xs font-semibold text-[#6C757D]">Branch (optional)</label><input value={bankForm.branch} onChange={e => setBankForm({...bankForm, branch: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="New Road, Kathmandu" /></div>
            <button type="submit" disabled={saving} className="w-full bg-[#0F1B3D] hover:bg-[#1A2B5C] disabled:opacity-60 text-white font-bold py-2.5 rounded-md flex items-center justify-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Bank Account'}</button>
          </form>
        )}
      </div>

      {/* Request Payout */}
      {data?.bankAccount && (bal.availableBalance || 0) >= 500 && (
        <div className="bg-white rounded-lg p-4 sm:p-5">
          <h2 className="font-bold text-[#212529] mb-3">{t('request_payout', lang)}</h2>
          <div className="flex gap-2">
            <input type="number" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)} className="flex-1 px-3 py-2.5 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder={`Min रू 500 • Available: ${formatNPR(bal.availableBalance)}`} />
            <button onClick={requestPayout} disabled={saving} className="bg-[#28A745] hover:bg-[#218838] disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-md whitespace-nowrap">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Request'}</button>
          </div>
          <button onClick={() => setPayoutAmount(String(bal.availableBalance))} className="text-xs text-[#17A2B8] font-semibold mt-2">Withdraw all ({formatNPR(bal.availableBalance)})</button>
        </div>
      )}

      {/* Payout History */}
      <div className="bg-white rounded-lg p-4 sm:p-5">
        <h2 className="font-bold text-[#212529] mb-4">{t('payout_history', lang)}</h2>
        {(!data?.payouts || data.payouts.length === 0) ? <p className="text-sm text-[#6C757D] py-4 text-center">No payouts yet.</p> : (
          <div className="space-y-2">
            {data.payouts.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-[#E9ECEF] last:border-0">
                <div><p className="text-sm font-semibold text-[#212529]">{p.reference}</p><p className="text-xs text-[#6C757D]">{p.bank_name} • ****{p.account_number?.slice(-4)}</p></div>
                <div className="text-right"><p className="text-sm font-bold text-[#000000]">{formatNPR(Number(p.amount))}</p><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === 'completed' ? 'bg-[#28A745]/10 text-[#28A745]' : p.status === 'pending' ? 'bg-[#FFD814]/10 text-[#FF6600]' : 'bg-[#DC3545]/10 text-[#DC3545]'}`}>{p.status}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SMS Provider info */}
      <div className="bg-[#F8F9FA] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2"><MessageSquare className="w-4 h-4 text-[#17A2B8]" /><h3 className="font-bold text-[#212529] text-sm">SMS Gateway</h3></div>
        <div className="flex flex-wrap gap-2">
          {SMS_PROVIDERS.map(p => (
            <span key={p.id} className="text-xs bg-white border border-[#E9ECEF] rounded-md px-2.5 py-1 flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: p.color }} /> {p.name}</span>
          ))}
        </div>
        <p className="text-[10px] text-[#6C757D] mt-2">Order confirmations & OTP sent via local Nepal SMS gateways</p>
      </div>
    </div>
  );
}

function ComplianceTab({ store }: any) {
  const [compliance, setCompliance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [panInput, setPanInput] = useState('');
  const [panStatus, setPanStatus] = useState<{ valid: boolean; type: string; message: string } | null>(null);
  const [vatInput, setVatInput] = useState('');
  const [vatEnabled, setVatEnabled] = useState(false);
  const [returnPolicy, setReturnPolicy] = useState('');
  const [invoicePrefix, setInvoicePrefix] = useState('');
  const [certUrl, setCertUrl] = useState('');

  useEffect(() => {
    fetch(`/api/compliance?store_id=${store.id}`)
      .then(r => r.json())
      .then(d => {
        setCompliance(d);
        setPanInput(d.pan_number || '');
        setVatInput(d.vat_number || '');
        setVatEnabled(d.vat_enabled || false);
        setReturnPolicy(d.return_policy_text || '');
        setInvoicePrefix(d.invoice_prefix || store.subdomain?.toUpperCase().slice(0, 5) || 'INV');
        setCertUrl(d.company_cert_url || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [store.id]);

  const handlePanChange = (val: string) => {
    const cleaned = val.replace(/[^0-9Vv]/g, '').toUpperCase();
    setPanInput(cleaned);
    if (cleaned.length >= 9) setPanStatus(validatePAN(cleaned));
    else setPanStatus(null);
  };

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: `cert-${store.id}-${file.name}`, fileBase64: base64, contentType: file.type }),
      });
      const data = await res.json();
      if (data.url) setCertUrl(data.url);
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    const body = {
      store_id: store.id,
      pan_number: panInput,
      vat_number: vatEnabled ? vatInput : null,
      vat_enabled: vatEnabled,
      invoice_prefix: invoicePrefix,
      return_policy_text: returnPolicy,
      company_cert_url: certUrl,
    };
    await fetch('/api/compliance', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await fetch(`/api/compliance?store_id=${store.id}`).then(r => r.json());
    setCompliance(d);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#FF6600]" /></div>;

  const status = compliance?.compliance_status || {};
  const score = getComplianceScore(status as ComplianceStatus);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-[#212529] flex items-center gap-2"><Shield className="w-5 h-5 text-[#FF6600]" /> IRD Nepal Compliance</h1>
        <p className="text-sm text-[#6C757D]">Manage your tax registration, invoices, and legal compliance</p>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#212529]">Compliance Score</h2>
          <span className={`text-lg font-extrabold ${score.percentage === 100 ? 'text-[#28A745]' : score.percentage >= 50 ? 'text-[#FF6600]' : 'text-[#DC3545]'}`}>{score.percentage}%</span>
        </div>
        <div className="w-full bg-[#E9ECEF] rounded-full h-2.5 overflow-hidden mb-4">
          <div className={`h-full rounded-full transition-all ${score.percentage === 100 ? 'bg-[#28A745]' : 'bg-[#FF6600]'}`} style={{ width: `${score.percentage}%` }} />
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {COMPLIANCE_CHECKLIST.map(item => {
            const done = status[item.id as keyof ComplianceStatus];
            return (
              <div key={item.id} className={`flex items-center gap-2 p-2 rounded-md text-xs ${done ? 'bg-[#28A745]/5' : 'bg-[#F8F9FA]'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-[#28A745] text-white' : 'bg-[#E9ECEF] text-[#ADB5BD]'}`}>
                  {done ? <Check className="w-3 h-3" /> : '○'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold ${done ? 'text-[#28A745]' : 'text-[#6C757D]'}`}>{item.label}</p>
                  <p className="text-[10px] text-[#6C757D]">{item.description}</p>
                </div>
                {item.required && <span className="text-[9px] bg-[#DC3545]/10 text-[#DC3545] px-1.5 py-0.5 rounded-full font-bold">REQUIRED</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5">
        <h2 className="font-bold text-[#212529] mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-[#0F1B3D]" /> PAN / VAT Registration</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#6C757D]">Business PAN Number *</label>
            <input value={panInput} onChange={e => handlePanChange(e.target.value)} className={`w-full px-3 py-2.5 border rounded-md text-sm font-mono focus:ring-2 outline-none ${panStatus?.valid === false ? 'border-[#DC3545]' : panStatus?.valid ? 'border-[#28A745]' : 'border-[#DEE2E6] focus:ring-[#FF6600]'}`} placeholder="123456789" maxLength={10} />
            {panStatus && <p className={`text-[10px] mt-1 font-semibold ${panStatus.valid ? 'text-[#28A745]' : 'text-[#DC3545]'}`}>{panStatus.valid ? '✓ ' : '✗ '}{panStatus.message}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6C757D]">Invoice Prefix</label>
            <input value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))} className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-md text-sm font-mono focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="HMT" />
            <p className="text-[10px] text-[#6C757D] mt-1">Invoice serial: {invoicePrefix}-2081-00001</p>
          </div>
        </div>
        <div className="mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={vatEnabled} onChange={e => setVatEnabled(e.target.checked)} className="w-4 h-4 accent-[#FF6600]" />
            <span className="text-sm text-[#212529]">VAT Registered — Enable 13% VAT calculation</span>
          </label>
        </div>
        {vatEnabled && (
          <div className="mt-3">
            <label className="text-xs font-semibold text-[#6C757D]">VAT Registration Number</label>
            <input value={vatInput} onChange={e => setVatInput(e.target.value.replace(/[^0-9Vv]/g, '').toUpperCase())} className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-md text-sm font-mono focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="V123456789" maxLength={10} />
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5">
        <h2 className="font-bold text-[#212529] mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-[#0F1B3D]" /> Company Registration (OCR Certificate)</h2>
        <p className="text-xs text-[#6C757D] mb-3">Upload your Office of Company Registrar (OCR) certificate for verification.</p>
        {certUrl ? (
          <div className="flex items-center gap-3 bg-[#28A745]/5 border border-[#28A745]/20 rounded-lg p-3">
            <FileText className="w-8 h-8 text-[#28A745]" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#212529]">Certificate uploaded</p>
              <p className="text-xs text-[#6C757D]">Status: <span className="capitalize font-semibold text-[#FF6600]">{compliance?.company_cert_status || 'pending_verification'}</span></p>
            </div>
            <a href={certUrl} target="_blank" className="text-xs text-[#17A2B8] font-semibold">View</a>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#DEE2E6] rounded-lg p-6 cursor-pointer hover:border-[#FF6600] transition-colors">
            <Upload className="w-8 h-8 text-[#ADB5BD] mb-2" />
            <p className="text-sm text-[#6C757D]">Click to upload OCR certificate</p>
            <p className="text-xs text-[#ADB5BD] mt-1">PDF, JPG, PNG (max 5MB)</p>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleCertUpload} className="hidden" />
          </label>
        )}
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5">
        <h2 className="font-bold text-[#212529] mb-1 flex items-center gap-2"><Shield className="w-4 h-4 text-[#0F1B3D]" /> Return & Refund Policy</h2>
        <p className="text-xs text-[#6C757D] mb-3">Required by Nepal Consumer Protection Act.</p>
        <textarea value={returnPolicy} onChange={e => setReturnPolicy(e.target.value)} rows={4} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="e.g., We accept returns within 7 days of delivery..." />
        <Link to="/return-policy" target="_blank" className="text-xs text-[#17A2B8] font-semibold mt-2 inline-block">View platform default policy →</Link>
      </div>

      <button onClick={save} disabled={saving} className="bg-[#FF6600] hover:bg-[#e65c00] disabled:opacity-60 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Compliance Settings'}
      </button>
    </div>
  );
}

function CouponsTab({ store, coupons, setCoupons, lang }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', min_order: '0' });

  const refresh = async () => { const d = await fetch(`/api/coupons?store_id=${store.id}`).then(r => r.json()); setCoupons(Array.isArray(d) ? d : []); };
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ store_id: store.id, code: form.code.toUpperCase(), type: form.type, value: Number(form.value), min_order: Number(form.min_order), active: true }) });
    setForm({ code: '', type: 'percent', value: '', min_order: '0' }); setShowForm(false); refresh();
  };
  const del = async (id: string) => { await fetch('/api/coupons', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); refresh(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4"><h1 className="text-lg sm:text-xl font-bold text-[#212529]">{t('coupons', lang)} ({coupons.length})</h1><button onClick={() => setShowForm(!showForm)} className="bg-[#FF6600] hover:bg-[#e65c00] text-white text-sm font-bold px-4 py-2 rounded-md flex items-center gap-1.5"><Plus className="w-4 h-4" /> New Coupon</button></div>
      {showForm && (
        <form onSubmit={create} className="bg-white rounded-lg p-4 mb-4 grid sm:grid-cols-4 gap-3 items-end">
          <div><label className="text-xs font-semibold text-[#6C757D]">Code</label><input required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm" placeholder="SAVE10" /></div>
          <div><label className="text-xs font-semibold text-[#6C757D]">Type</label><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm"><option value="percent">Percentage</option><option value="fixed">Fixed Amount</option></select></div>
          <div><label className="text-xs font-semibold text-[#6C757D]">Value</label><input required type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm" placeholder="10" /></div>
          <button type="submit" className="bg-[#0F1B3D] text-white text-sm font-bold py-2 rounded-md">Create</button>
        </form>
      )}
      {coupons.length === 0 ? <div className="bg-white rounded-lg p-10 text-center text-sm text-[#6C757D]">No coupons yet. Create discount codes to boost sales.</div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {coupons.map((c: Coupon) => (
            <div key={c.id} className="bg-white rounded-lg p-4 border-l-4 border-[#FF6600]">
              <div className="flex items-start justify-between"><div><p className="font-extrabold text-[#212529]">{c.code}</p><p className="text-xs text-[#6C757D]">{c.type === 'percent' ? `${c.value}% off` : `${formatNPR(Number(c.value))} off`}</p></div><button onClick={() => del(c.id)} className="text-[#DC3545]"><Trash2 className="w-4 h-4" /></button></div>
              <span className="inline-block mt-2 text-[10px] bg-[#28A745]/10 text-[#28A745] px-2 py-0.5 rounded-full font-bold">Active</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AppearanceTab({ store, setStore }: any) {
  const [color, setColor] = useState(store.primary_color || '#0F1B3D');
  const [desc, setDesc] = useState(store.description || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await fetch('/api/stores', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: store.id, primary_color: color, description: desc }) });
    setStore({ ...store, primary_color: color, description: desc });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="text-lg sm:text-xl font-bold text-[#212529] mb-1">Website Builder</h1>
      <p className="text-sm text-[#6C757D] mb-6">Customize your store's appearance — no coding needed.</p>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-5 space-y-5">
          <div>
            <label className="text-sm font-bold text-[#212529] block mb-2">Store Theme Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => <button key={c} onClick={() => setColor(c)} className={`w-9 h-9 rounded-full border-2 ${color === c ? 'border-[#212529]' : 'border-transparent'}`} style={{ background: c }} />)}
            </div>
            <input value={color} onChange={e => setColor(e.target.value)} className="mt-2 w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm" />
          </div>
          <div>
            <label className="text-sm font-bold text-[#212529] block mb-2">Store Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" />
          </div>
          <div>
            <label className="text-sm font-bold text-[#212529] block mb-2">Store URL</label>
            <div className="flex items-center bg-[#F8F9FA] rounded-md px-3 py-2 text-sm"><span className="text-[#6C757D]">{store.subdomain}.pasalnepal.com</span><Link to={`/store/${store.subdomain}`} target="_blank" className="ml-auto text-[#17A2B8]"><ExternalLink className="w-4 h-4" /></Link></div>
          </div>
          <button onClick={save} disabled={saving} className="bg-[#FF6600] hover:bg-[#e65c00] disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-md flex items-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Changes'}</button>
        </div>
        <div className="bg-white rounded-lg p-5">
          <p className="text-xs font-semibold text-[#6C757D] mb-3">LIVE PREVIEW</p>
          <div className="rounded-lg overflow-hidden border border-[#E9ECEF]">
            <div className="h-20 flex items-end p-3" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}><div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold">{store.name.charAt(0)}</div></div>
            <div className="p-3"><h3 className="font-bold text-[#000000]">{store.name}</h3><p className="text-xs text-[#6C757D] line-clamp-2">{desc}</p><button className="mt-2 text-white text-xs font-bold px-3 py-1.5 rounded" style={{ background: color }}>Shop Now</button></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscriptionTab({ store, setStore }: any) {
  const [changing, setChanging] = useState(false);
  const changePlan = async (plan: string) => {
    if (plan === store.plan) return;
    setChanging(true);
    await fetch('/api/stores', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: store.id, plan }) });
    setStore({ ...store, plan });
    setChanging(false);
  };
  return (
    <div>
      <h1 className="text-lg sm:text-xl font-bold text-[#212529] mb-1">Subscription</h1>
      <p className="text-sm text-[#6C757D] mb-6">Current plan: <span className="font-bold capitalize text-[#212529]">{store.plan}</span></p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(PLANS).map(([key, plan]) => (
          <div key={key} className={`rounded-xl p-5 border-2 ${store.plan === key ? 'border-[#FF6600]' : 'border-[#E9ECEF]'}`}>
            <h3 className="font-bold text-[#212529]">{plan.name}</h3>
            <p className="text-2xl font-extrabold text-[#000000] my-2">{plan.price === 0 ? 'Rs.0' : formatNPR(plan.price)}<span className="text-xs font-normal text-[#6C757D]">/mo</span></p>
            <ul className="space-y-1.5 my-4">{plan.features.map(f => <li key={f} className="flex items-start gap-1.5 text-xs text-[#6C757D]"><Check className="w-3 h-3 text-[#28A745] mt-0.5 shrink-0" />{f}</li>)}</ul>
            <button onClick={() => changePlan(key)} disabled={changing || store.plan === key} className={`w-full py-2 rounded-md text-sm font-bold ${store.plan === key ? 'bg-[#F8F9FA] text-[#6C757D]' : 'bg-[#FF6600] text-white hover:bg-[#e65c00]'}`}>{store.plan === key ? 'Current Plan' : `Switch to ${plan.name}`}</button>
          </div>
        ))}
      </div>
      <div className="bg-[#F8F9FA] rounded-lg p-4 mt-6 text-sm text-[#6C757D]"><p className="font-semibold text-[#212529] mb-1">How you're billed:</p>Monthly subscription fee + 2% commission on every order processed. No hidden charges. Cancel anytime.</div>
    </div>
  );
}

function MarketingTab({ store, orders }: any) {
  const [subTab, setSubTab] = useState('campaigns');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Campaign form
  const [campForm, setCampForm] = useState({ festival: 'dashain', name: '', banner_text: '', discount_percent: '10', start_date: '', end_date: '' });
  // SMS form
  const [smsForm, setSmsForm] = useState({ message: '', recipientType: 'all' });
  // Affiliate form
  const [affForm, setAffForm] = useState({ code: '', influencer_name: '', platform: 'tiktok', discount_percent: '10', commission_percent: '5' });
  // Tiered discount form
  const [tierForm, setTierForm] = useState({ discount_type: 'bogo', name: '', banner_text: '', min_qty: '2', discount_value: '50' });

  const load = async () => {
    const res = await fetch(`/api/marketing?store_id=${store.id}`);
    const d = await res.json();
    setData(d);
    setLoading(false);
  };

  useEffect(() => { load(); }, [store.id]);

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  // Create festival campaign
  const createCampaign = async () => {
    setSaving(true);
    const festival = FESTIVALS.find(f => f.id === campForm.festival);
    await fetch('/api/marketing', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_campaign', store_id: store.id, payload: {
        ...campForm, discount_percent: Number(campForm.discount_percent),
        banner_text: campForm.banner_text || festival?.bannerText || '',
        banner_color: festival?.color || '#FF6600',
        name: campForm.name || `${festival?.name} Sale`,
      }}),
    });
    setCampForm({ festival: 'dashain', name: '', banner_text: '', discount_percent: '10', start_date: '', end_date: '' });
    setSaving(false); showMsg('Festival campaign created!'); load();
  };

  // Send bulk SMS
  const sendBulkSms = async () => {
    if (!smsForm.message) return;
    setSaving(true);
    // Get unique customer phones from orders
    const phones = [...new Set(orders.map((o: Order) => o.customer_phone).filter(Boolean))];
    const res = await fetch('/api/marketing', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bulk_sms', store_id: store.id, payload: { message: smsForm.message, recipients: phones } }),
    });
    const result = await res.json();
    setSmsForm({ message: '', recipientType: 'all' });
    setSaving(false);
    showMsg(`SMS sent to ${result.sent}/${result.total} customers!`);
    load();
  };

  // Create affiliate code
  const createAffiliate = async () => {
    setSaving(true);
    await fetch('/api/marketing', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_affiliate', store_id: store.id, payload: {
        ...affForm, discount_percent: Number(affForm.discount_percent), commission_percent: Number(affForm.commission_percent),
      }}),
    });
    setAffForm({ code: '', influencer_name: '', platform: 'tiktok', discount_percent: '10', commission_percent: '5' });
    setSaving(false); showMsg('Affiliate code created!'); load();
  };

  // Create tiered discount
  const createTiered = async () => {
    setSaving(true);
    const dt = TIERED_DISCOUNT_TYPES.find(t => t.id === tierForm.discount_type);
    await fetch('/api/marketing', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_tiered_discount', store_id: store.id, payload: {
        name: tierForm.name || dt?.name || 'Tiered Discount',
        banner_text: tierForm.banner_text || dt?.name,
        discount_type: tierForm.discount_type,
        config: { min_qty: Number(tierForm.min_qty), discount_value: Number(tierForm.discount_value) },
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 864e5).toISOString(),
      }}),
    });
    setTierForm({ discount_type: 'bogo', name: '', banner_text: '', min_qty: '2', discount_value: '50' });
    setSaving(false); showMsg('Tiered discount created!'); load();
  };

  const toggleCampaign = async (id: number) => {
    await fetch('/api/marketing', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'toggle_campaign' }) });
    load();
  };

  const toggleAffiliate = async (id: number) => {
    await fetch('/api/marketing', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'toggle_affiliate' }) });
    load();
  };

  const deleteCampaign = async (id: number) => {
    await fetch('/api/marketing', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  };

  const deleteAffiliate = async (id: number) => {
    await fetch('/api/marketing', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, type: 'affiliate' }) });
    load();
  };

  const customerCount = new Set(orders.map((o: Order) => o.customer_phone).filter(Boolean)).size;

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#FF6600]" /></div>;

  const subTabs = [
    { id: 'campaigns', label: 'Festival Themes', icon: Gift },
    { id: 'sms', label: 'Bulk SMS', icon: Send },
    { id: 'tiered', label: 'Tiered Discounts', icon: Tag },
    { id: 'social', label: 'Social Share', icon: Share2 },
    { id: 'affiliate', label: 'Affiliate Codes', icon: Users },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-[#212529] flex items-center gap-2"><Megaphone className="w-5 h-5 text-[#FF6600]" /> Marketing & Growth</h1>
        <p className="text-sm text-[#6C757D]">Festival sales, bulk SMS, discounts, social rewards & affiliate tracking</p>
      </div>

      {msg && <div className="bg-[#28A745]/10 text-[#28A745] text-sm p-3 rounded-lg flex items-center gap-2"><Check className="w-4 h-4" /> {msg}</div>}

      {/* Sub-tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {subTabs.map(st => {
          const Icon = st.icon;
          return <button key={st.id} onClick={() => setSubTab(st.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${subTab === st.id ? 'bg-[#FF6600] text-white' : 'bg-white text-[#6C757D] hover:bg-[#F8F9FA]'}`}><Icon className="w-3.5 h-3.5" /> {st.label}</button>;
        })}
      </div>

      {/* FESTIVAL CAMPAIGNS */}
      {subTab === 'campaigns' && (
        <div className="space-y-4">
          {/* Festival picker */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-bold text-[#212529] mb-3 flex items-center gap-2"><Gift className="w-4 h-4 text-[#FF6600]" /> Create Festival Campaign</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
              {FESTIVALS.map(f => (
                <button key={f.id} onClick={() => { setCampForm({...campForm, festival: f.id, banner_text: f.bannerText, discount_percent: String(f.defaultDiscount)}); }}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${campForm.festival === f.id ? 'border-[#FF6600] bg-[#FF6600]/5' : 'border-[#E9ECEF] hover:border-[#ADB5BD]'}`}>
                  <div className="text-2xl mb-1">{f.emoji}</div>
                  <p className="text-[10px] font-bold text-[#212529]">{f.name}</p>
                  <p className="text-[9px] text-[#6C757D]">{f.nameNp}</p>
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold text-[#6C757D]">Campaign Name</label><input value={campForm.name} onChange={e => setCampForm({...campForm, name: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="Dashain Mega Sale" /></div>
              <div><label className="text-xs font-semibold text-[#6C757D]">Discount %</label><input type="number" value={campForm.discount_percent} onChange={e => setCampForm({...campForm, discount_percent: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" /></div>
              <div className="sm:col-span-2"><label className="text-xs font-semibold text-[#6C757D]">Banner Text</label><input value={campForm.banner_text} onChange={e => setCampForm({...campForm, banner_text: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" /></div>
              <div><label className="text-xs font-semibold text-[#6C757D]">Start Date</label><input type="date" value={campForm.start_date} onChange={e => setCampForm({...campForm, start_date: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" /></div>
              <div><label className="text-xs font-semibold text-[#6C757D]">End Date</label><input type="date" value={campForm.end_date} onChange={e => setCampForm({...campForm, end_date: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" /></div>
            </div>
            {/* Live banner preview */}
            {campForm.banner_text && (
              <div className="mt-3 rounded-lg p-3 text-center text-white font-bold text-sm" style={{ background: FESTIVALS.find(f => f.id === campForm.festival)?.color || '#FF6600' }}>
                {FESTIVALS.find(f => f.id === campForm.festival)?.emoji} {campForm.banner_text}
                {campForm.end_date && <span className="ml-2 text-xs">• {getDaysUntil(campForm.end_date)} days left</span>}
              </div>
            )}
            <button onClick={createCampaign} disabled={saving} className="mt-3 bg-[#FF6600] hover:bg-[#e65c00] disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-md flex items-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Campaign</button>
          </div>

          {/* Active campaigns */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-bold text-[#212529] mb-3">Active Campaigns</h2>
            {(data?.campaigns || []).length === 0 ? <p className="text-sm text-[#6C757D] py-4 text-center">No campaigns yet.</p> : (
              <div className="space-y-2">
                {data.campaigns.map((c: any) => {
                  const festival = FESTIVALS.find(f => f.id === c.festival);
                  return (
                    <div key={c.id} className={`rounded-lg p-3 border-l-4 ${c.active ? '' : 'opacity-50'}`} style={{ borderColor: c.banner_color || '#FF6600' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{festival?.emoji || '🎉'}</span>
                            <p className="font-bold text-[#212529] text-sm">{c.name}</p>
                            {c.active ? <span className="text-[9px] bg-[#28A745]/10 text-[#28A745] px-1.5 py-0.5 rounded-full font-bold">ACTIVE</span> : <span className="text-[9px] bg-[#6C757D]/10 text-[#6C757D] px-1.5 py-0.5 rounded-full font-bold">PAUSED</span>}
                          </div>
                          <p className="text-xs text-[#6C757D] mt-1">{c.banner_text}</p>
                          {c.discount_percent > 0 && <p className="text-xs font-bold text-[#FF6600] mt-0.5">{c.discount_percent}% off</p>}
                          {c.end_date && <p className="text-[10px] text-[#6C757D] mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {getDaysUntil(c.end_date)} days remaining</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => toggleCampaign(c.id)} className="text-xs px-2 py-1 rounded bg-[#F8F9FA] text-[#6C757D] hover:bg-[#E9ECEF]">{c.active ? 'Pause' : 'Resume'}</button>
                          <button onClick={() => deleteCampaign(c.id)} className="p-1.5 text-[#DC3545]"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* BULK SMS */}
      {subTab === 'sms' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-bold text-[#212529] mb-1 flex items-center gap-2"><Send className="w-4 h-4 text-[#17A2B8]" /> Bulk SMS Marketing</h2>
            <p className="text-xs text-[#6C757D] mb-4">Send promotional SMS to your {customerCount} past customers via Sparrow SMS</p>
            <div className="bg-[#17A2B8]/5 border border-[#17A2B8]/20 rounded-lg p-3 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#17A2B8]" />
              <p className="text-xs text-[#17A2B8] font-semibold">{customerCount} unique customers will receive this SMS</p>
            </div>
            <textarea value={smsForm.message} onChange={e => setSmsForm({...smsForm, message: e.target.value})} rows={4} maxLength={160} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="Dashain Sale! Get 25% off on all electronics. Visit our store now!" />
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-[#6C757D]">{smsForm.message.length}/160 characters</p>
              <p className="text-[10px] text-[#6C757D]">Est. cost: रू {customerCount * 2}</p>
            </div>
            <button onClick={sendBulkSms} disabled={saving || !smsForm.message} className="mt-3 bg-[#0F1B3D] hover:bg-[#1A2B5C] disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-md flex items-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send to {customerCount} Customers</button>
          </div>

          {/* SMS History */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-bold text-[#212529] mb-3">SMS History</h2>
            {(data?.smsLogs || []).length === 0 ? <p className="text-sm text-[#6C757D] py-4 text-center">No SMS campaigns sent yet.</p> : (
              <div className="space-y-2">
                {data.smsLogs.map((s: any) => (
                  <div key={s.id} className="flex items-start justify-between py-2 border-b border-[#E9ECEF] last:border-0">
                    <div className="flex-1 min-w-0"><p className="text-sm text-[#212529] line-clamp-2">{s.message}</p><p className="text-[10px] text-[#6C757D] mt-0.5">{new Date(s.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kathmandu' })}</p></div>
                    <div className="text-right shrink-0 ml-2"><p className="text-xs font-bold text-[#212529]">{s.recipient_count} sent</p><span className="text-[9px] bg-[#28A745]/10 text-[#28A745] px-1.5 py-0.5 rounded-full font-bold">{s.status}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TIERED DISCOUNTS */}
      {subTab === 'tiered' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-bold text-[#212529] mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-[#28A745]" /> Create Tiered Discount</h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {TIERED_DISCOUNT_TYPES.map(td => (
                <button key={td.id} onClick={() => setTierForm({...tierForm, discount_type: td.id})} className={`p-3 rounded-lg border-2 text-center transition-all ${tierForm.discount_type === td.id ? 'border-[#FF6600] bg-[#FF6600]/5' : 'border-[#E9ECEF]'}`}>
                  <div className="text-2xl mb-1">{td.icon}</div>
                  <p className="text-[10px] font-bold text-[#212529]">{td.name}</p>
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold text-[#6C757D]">Name</label><input value={tierForm.name} onChange={e => setTierForm({...tierForm, name: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm" placeholder="Buy 1 Get 1 Free" /></div>
              <div><label className="text-xs font-semibold text-[#6C757D]">Banner Text</label><input value={tierForm.banner_text} onChange={e => setTierForm({...tierForm, banner_text: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm" placeholder="Buy 1 Get 1 FREE!" /></div>
              {tierForm.discount_type !== 'bogo' && (
                <>
                  <div><label className="text-xs font-semibold text-[#6C757D]">Min Quantity</label><input type="number" value={tierForm.min_qty} onChange={e => setTierForm({...tierForm, min_qty: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm" /></div>
                  <div><label className="text-xs font-semibold text-[#6C757D]">Discount %</label><input type="number" value={tierForm.discount_value} onChange={e => setTierForm({...tierForm, discount_value: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm" /></div>
                </>
              )}
            </div>
            <button onClick={createTiered} disabled={saving} className="mt-3 bg-[#28A745] hover:bg-[#218838] disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-md flex items-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Discount</button>
          </div>
          {/* Active tiered discounts */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-bold text-[#212529] mb-3">Active Discounts</h2>
            {(data?.campaigns || []).filter((c: any) => c.discount_type).length === 0 ? <p className="text-sm text-[#6C757D] py-4 text-center">No tiered discounts yet.</p> : (
              <div className="space-y-2">
                {data.campaigns.filter((c: any) => c.discount_type).map((c: any) => (
                  <div key={c.id} className="rounded-lg p-3 border-l-4 border-[#28A745]">
                    <div className="flex items-center justify-between">
                      <div><p className="font-bold text-[#212529] text-sm">{c.name}</p><p className="text-xs text-[#6C757D]">{c.banner_text}</p></div>
                      <button onClick={() => deleteCampaign(c.id)} className="p-1.5 text-[#DC3545]"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SOCIAL SHARE REWARDS */}
      {subTab === 'social' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-bold text-[#212529] mb-1 flex items-center gap-2"><Share2 className="w-4 h-4 text-[#5C2D91]" /> Social Share Rewards</h2>
            <p className="text-xs text-[#6C757D] mb-4">Customers who share products on WhatsApp/Viber get a discount coupon</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
              {SOCIAL_PLATFORMS.map(p => (
                <div key={p.id} className="flex flex-col items-center gap-1 p-3 bg-[#F8F9FA] rounded-lg">
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-[10px] font-semibold text-[#6C757D]">{p.name}</span>
                </div>
              ))}
            </div>
            <div className="bg-[#5C2D91]/5 border border-[#5C2D91]/20 rounded-lg p-3 mb-3">
              <p className="text-xs text-[#5C2D91] font-semibold mb-1">How it works:</p>
              <ol className="text-[11px] text-[#6C757D] space-y-0.5 ml-4 list-decimal">
                <li>Customer shares a product link on WhatsApp/Viber</li>
                <li>They enter their phone number to verify</li>
                <li>A unique discount coupon is generated automatically</li>
                <li>Coupon code sent via SMS (Sparrow SMS)</li>
                <li>Customer uses the coupon on their next purchase</li>
              </ol>
            </div>
            <div className="bg-[#F8F9FA] rounded-lg p-3">
              <p className="text-xs font-semibold text-[#212529] mb-1">Sample reward code:</p>
              <p className="font-mono font-bold text-[#FF6600]">{generateRewardCode(store.subdomain || 'store')}</p>
            </div>
          </div>
          {/* Share tracking */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-bold text-[#212529] mb-3">Recent Shares</h2>
            {(data?.shareRewards || []).length === 0 ? <p className="text-sm text-[#6C757D] py-4 text-center">No shares tracked yet. Share rewards activate when customers share products.</p> : (
              <div className="space-y-2">
                {data.shareRewards.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-[#E9ECEF] last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{SOCIAL_PLATFORMS.find(p => p.id === s.platform)?.icon || '📤'}</span>
                      <div><p className="text-xs font-semibold text-[#212529]">{s.customer_phone || 'Anonymous'}</p><p className="text-[10px] text-[#6C757D]">{new Date(s.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kathmandu' })}</p></div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#FF6600]">{s.reward_code}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AFFILIATE CODES */}
      {subTab === 'affiliate' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-bold text-[#212529] mb-1 flex items-center gap-2"><Users className="w-4 h-4 text-[#E91E63]" /> Affiliate / Influencer Codes</h2>
            <p className="text-xs text-[#6C757D] mb-4">Create custom discount codes for TikTokers & Instagram influencers</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold text-[#6C757D]">Code *</label><input value={affForm.code} onChange={e => setAffForm({...affForm, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm font-mono" placeholder="TIKTOK10" /></div>
              <div><label className="text-xs font-semibold text-[#6C757D]">Influencer Name *</label><input value={affForm.influencer_name} onChange={e => setAffForm({...affForm, influencer_name: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm" placeholder="Saroj Kc" /></div>
              <div><label className="text-xs font-semibold text-[#6C757D]">Platform</label><select value={affForm.platform} onChange={e => setAffForm({...affForm, platform: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm">{INFLUENCER_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-semibold text-[#6C757D]">Discount %</label><input type="number" value={affForm.discount_percent} onChange={e => setAffForm({...affForm, discount_percent: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm" /></div>
                <div><label className="text-xs font-semibold text-[#6C757D]">Commission %</label><input type="number" value={affForm.commission_percent} onChange={e => setAffForm({...affForm, commission_percent: e.target.value})} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm" /></div>
              </div>
            </div>
            <button onClick={createAffiliate} disabled={saving || !affForm.code || !affForm.influencer_name} className="mt-3 bg-[#E91E63] hover:bg-[#C2185B] disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-md flex items-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Affiliate Code</button>
          </div>

          {/* Affiliate list */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-bold text-[#212529] mb-3">Active Affiliate Codes</h2>
            {(data?.affiliates || []).length === 0 ? <p className="text-sm text-[#6C757D] py-4 text-center">No affiliate codes yet.</p> : (
              <div className="space-y-2">
                {data.affiliates.map((a: any) => (
                  <div key={a.id} className={`rounded-lg p-3 border-l-4 ${a.active ? 'border-[#E91E63]' : 'border-[#6C757D] opacity-50'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-mono font-extrabold text-[#E91E63]">{a.code}</p>
                          <span className="text-[9px] bg-[#E91E63]/10 text-[#E91E63] px-1.5 py-0.5 rounded-full font-bold">{a.discount_percent}% OFF</span>
                          <span className="text-[9px] bg-[#28A745]/10 text-[#28A745] px-1.5 py-0.5 rounded-full font-bold">{a.commission_percent}% commission</span>
                        </div>
                        <p className="text-xs text-[#212529] mt-1">{INFLUENCER_PLATFORMS.find(p => p.id === a.influencer_platform)?.icon} {a.influencer_name}</p>
                        <div className="flex gap-3 mt-1 text-[10px] text-[#6C757D]">
                          <span>Uses: <strong className="text-[#212529]">{a.uses}</strong></span>
                          <span>Revenue: <strong className="text-[#28A745]">{formatNPR(Number(a.revenue_generated))}</strong></span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => toggleAffiliate(a.id)} className="text-xs px-2 py-1 rounded bg-[#F8F9FA] text-[#6C757D]">{a.active ? 'Pause' : 'Resume'}</button>
                        <button onClick={() => deleteAffiliate(a.id)} className="p-1.5 text-[#DC3545]"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
