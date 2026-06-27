import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Store, TrendingUp, CreditCard, Smartphone, ArrowRight, Loader2, Shield, Building2, FileCheck } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import supabase from '../lib/supabase';
import { PLANS, PROVINCES, formatNPR } from '../lib/types';
import { validatePAN } from '../lib/tax';

export default function Sell() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'landing' | 'signup'>('landing');
  const [form, setForm] = useState({
    store_name: '', subdomain: '', owner_name: '', email: '', password: '', phone: '', province: '', district: '', plan: 'free',
    pan_number: '', vat_number: '', business_type: 'individual', vat_registered: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [panStatus, setPanStatus] = useState<{ valid: boolean; type: string; message: string } | null>(null);

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  const handlePanChange = (val: string) => {
    const cleaned = val.replace(/[^0-9Vv]/g, '').toUpperCase();
    set('pan_number', cleaned);
    if (cleaned.length >= 9) {
      setPanStatus(validatePAN(cleaned));
    } else {
      setPanStatus(null);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate PAN
    const panCheck = validatePAN(form.pan_number);
    if (!panCheck.valid) { setError('Please enter a valid PAN number (9 digits for individual, 10 for business)'); return; }

    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!/^[a-z0-9-]+$/.test(form.subdomain)) { setError('Subdomain: lowercase letters, numbers, hyphens only'); return; }
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password });
      if (authError) throw authError;
      const res = await fetch('/api/stores', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.store_name, subdomain: form.subdomain.toLowerCase(),
          owner_email: form.email, owner_name: form.owner_name, owner_phone: form.phone,
          plan: form.plan, status: 'active', primary_color: '#0F1B3D',
          province: form.province, district: form.district,
          description: `Welcome to ${form.store_name}!`,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to create store'); }
      const store = await res.json();

      // Create subscription record
      await fetch('/api/subscriptions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: store.id, plan: form.plan, status: 'active', started_at: new Date().toISOString(), renews_at: new Date(Date.now() + 30*864e5).toISOString() }),
      });

      // Create compliance record with PAN/VAT
      await fetch('/api/compliance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: store.id,
          pan_number: form.pan_number,
          vat_number: form.vat_registered ? form.vat_number : null,
          vat_enabled: form.vat_registered,
          invoice_prefix: form.subdomain.toUpperCase().slice(0, 5),
          invoice_sequence: 0,
          company_cert_status: 'not_uploaded',
          compliance_status: {
            pan_registered: true,
            vat_registered: form.vat_registered,
            company_certificate: false,
            invoice_configured: true,
            return_policy: false,
            tax_enabled: form.vat_registered,
          },
        }),
      });

      navigate('/merchant');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  if (mode === 'landing') {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <section className="bg-gradient-to-br from-[#0F1B3D] to-[#1A2B5C] text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <span className="inline-block bg-[#FF6600]/20 text-[#FF6600] text-xs font-bold px-3 py-1 rounded-full mb-4">FOR MERCHANTS</span>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Start selling online in Nepal today</h1>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">Create your store in minutes. No coding needed. Accept payments via eSewa, Khalti, FonePay, IME Pay & Cash on Delivery.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={() => setMode('signup')} className="bg-[#FF6600] hover:bg-[#e65c00] text-white font-bold px-7 py-3.5 rounded-lg flex items-center gap-2 transition-colors">Create Your Store <ArrowRight className="w-4 h-4" /></button>
              <Link to="/merchant" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-7 py-3.5 rounded-lg">Merchant Login</Link>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Store, title: 'Build Your Store', desc: 'Get a unique subdomain (yourstore.pasalnepal) and customize it with our drag-drop builder.' },
              { icon: CreditCard, title: 'Accept Payments', desc: 'All Nepal payment gateways integrated. COD is default. Get paid fast.' },
              { icon: TrendingUp, title: 'Grow with Analytics', desc: 'Track sales, orders, and customers. Create coupons to boost sales.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[#F8F9FA] rounded-xl p-6">
                <div className="w-12 h-12 rounded-lg bg-[#FF6600]/10 flex items-center justify-center mb-4"><Icon className="w-6 h-6 text-[#FF6600]" /></div>
                <h3 className="font-bold text-[#212529] mb-2">{title}</h3>
                <p className="text-sm text-[#6C757D]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-extrabold text-[#212529] text-center mb-8">Simple, transparent pricing</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div key={key} className={`rounded-xl p-6 border ${key === 'growth' ? 'border-[#FF6600] shadow-lg relative' : 'border-[#E9ECEF]'}`}>
                {key === 'growth' && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF6600] text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>}
                <h3 className="font-bold text-[#212529]">{plan.name}</h3>
                <p className="text-3xl font-extrabold text-[#000000] my-2">{plan.price === 0 ? 'Rs.0' : formatNPR(plan.price)}<span className="text-sm font-normal text-[#6C757D]">/mo</span></p>
                <ul className="space-y-2 mt-4">
                  {plan.features.map(f => <li key={f} className="flex items-start gap-2 text-xs text-[#6C757D]"><Check className="w-3.5 h-3.5 text-[#28A745] mt-0.5 shrink-0" />{f}</li>)}
                </ul>
                <button onClick={() => { setMode('signup'); set('plan', key); }} className={`mt-5 w-full py-2.5 rounded-lg text-sm font-bold ${key === 'growth' ? 'bg-[#FF6600] text-white' : 'border border-[#0F1B3D] text-[#0F1B3D]'}`}>Choose {plan.name}</button>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-[#6C757D] mt-6">All plans include 2% commission per order. No hidden fees.</p>
        </section>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <button onClick={() => setMode('landing')} className="text-sm text-[#17A2B8] font-semibold mb-4">← Back</button>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold text-[#212529] mb-1">Create your store</h1>
          <p className="text-sm text-[#6C757D] mb-6">Start selling on Pasal Nepal. Free plan available.</p>
          {error && <div className="bg-[#DC3545]/10 text-[#DC3545] text-sm p-3 rounded-md mb-4">{error}</div>}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Store Info */}
            <div className="bg-[#F8F9FA] rounded-lg p-3 mb-2">
              <p className="text-xs font-bold text-[#6C757D] uppercase mb-3">Store Information</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-[#6C757D]">Store Name *</label><input required value={form.store_name} onChange={e => set('store_name', e.target.value)} className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="Himalayan Crafts" /></div>
                <div><label className="text-xs font-semibold text-[#6C757D]">Subdomain *</label><div className="flex items-center"><input required value={form.subdomain} onChange={e => set('subdomain', e.target.value.toLowerCase())} className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-l-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="himalayan" /><span className="px-3 py-2.5 bg-[#E9ECEF] border border-l-0 border-[#DEE2E6] rounded-r-md text-xs text-[#6C757D]">.pasalnepal</span></div></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div><label className="text-xs font-semibold text-[#6C757D]">Province</label><select value={form.province} onChange={e => set('province', e.target.value)} className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none"><option value="">Select</option>{PROVINCES.map(p => <option key={p}>{p}</option>)}</select></div>
                <div><label className="text-xs font-semibold text-[#6C757D]">District</label><input value={form.district} onChange={e => set('district', e.target.value)} className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="Kathmandu" /></div>
              </div>
            </div>

            {/* IRD Compliance Section */}
            <div className="bg-[#FFF8E1] border border-[#FFD814]/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-[#FF6600]" />
                <p className="text-sm font-bold text-[#212529]">IRD Nepal Compliance (Required)</p>
              </div>
              <p className="text-xs text-[#6C757D] mb-3">As per Nepal government regulations, all merchants must provide a valid PAN number.</p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#6C757D]">Business PAN Number *</label>
                  <input
                    required
                    value={form.pan_number}
                    onChange={e => handlePanChange(e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-md text-sm font-mono focus:ring-2 outline-none ${panStatus?.valid === false ? 'border-[#DC3545] focus:ring-[#DC3545]' : panStatus?.valid ? 'border-[#28A745] focus:ring-[#28A745]' : 'border-[#DEE2E6] focus:ring-[#FF6600]'}`}
                    placeholder="123456789"
                    maxLength={10}
                  />
                  {panStatus && (
                    <p className={`text-[10px] mt-1 font-semibold ${panStatus.valid ? 'text-[#28A745]' : 'text-[#DC3545]'}`}>
                      {panStatus.valid ? '✓ ' : '✗ '}{panStatus.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6C757D]">Business Type</label>
                  <select value={form.business_type} onChange={e => set('business_type', e.target.value)} className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none">
                    <option value="individual">Individual (Sole Proprietor)</option>
                    <option value="partnership">Partnership Firm</option>
                    <option value="private_ltd">Private Limited Company</option>
                    <option value="public_ltd">Public Limited Company</option>
                  </select>
                </div>
              </div>

              {/* VAT Registration Toggle */}
              <div className="mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.vat_registered} onChange={e => set('vat_registered', e.target.checked as any)} className="w-4 h-4 accent-[#FF6600]" />
                  <span className="text-sm text-[#212529]">I am VAT registered (turnover &gt; रू 50,00,000/year)</span>
                </label>
              </div>

              {form.vat_registered && (
                <div className="mt-3">
                  <label className="text-xs font-semibold text-[#6C757D]">VAT Registration Number *</label>
                  <input
                    value={form.vat_number}
                    onChange={e => set('vat_number', e.target.value.replace(/[^0-9Vv]/g, '').toUpperCase())}
                    className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-md text-sm font-mono focus:ring-2 focus:ring-[#FF6600] outline-none"
                    placeholder="V123456789"
                    maxLength={10}
                  />
                  <p className="text-[10px] text-[#6C757D] mt-1">VAT registration enables 13% VAT calculation on invoices</p>
                </div>
              )}

              <div className="mt-3 flex items-start gap-2 bg-white/50 rounded-md p-2">
                <FileCheck className="w-4 h-4 text-[#17A2B8] shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#6C757D]">After registration, you can upload your OCR (Office of Company Registrar) certificate in the merchant dashboard compliance section.</p>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-[#F8F9FA] rounded-lg p-3">
              <p className="text-xs font-bold text-[#6C757D] uppercase mb-3">Account Information</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-[#6C757D]">Your Name *</label><input required value={form.owner_name} onChange={e => set('owner_name', e.target.value)} className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" /></div>
                <div><label className="text-xs font-semibold text-[#6C757D]">Phone *</label><input required value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g,'').slice(0,10))} className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="98XXXXXXXX" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div><label className="text-xs font-semibold text-[#6C757D]">Email *</label><input required type="email" value={form.email} onChange={e => set('email', e.target.value)} className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" /></div>
                <div><label className="text-xs font-semibold text-[#6C757D]">Password *</label><input required type="password" value={form.password} onChange={e => set('password', e.target.value)} className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="Min 6 characters" /></div>
              </div>
            </div>

            <div><label className="text-xs font-semibold text-[#6C757D]">Subscription Plan</label><select value={form.plan} onChange={e => set('plan', e.target.value)} className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none">{Object.entries(PLANS).map(([k,p]) => <option key={k} value={k}>{p.name} — {p.price === 0 ? 'Free' : formatNPR(p.price)+'/mo'}</option>)}</select></div>

            <button type="submit" disabled={loading} className="w-full bg-[#FF6600] hover:bg-[#e65c00] disabled:opacity-60 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Store & Start Selling'}</button>
            <p className="text-xs text-[#6C757D] text-center">Already have a store? <Link to="/merchant" className="text-[#17A2B8] font-semibold">Login here</Link></p>
          </form>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
