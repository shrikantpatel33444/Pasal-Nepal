import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Package, ShoppingCart, DollarSign, TrendingUp, LogOut, RefreshCw, ExternalLink, Loader2, Users, Percent, Shield, Wallet, AlertTriangle, RotateCcw, CheckCircle2, XCircle, Clock, Eye, Banknote, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../lib/supabase';
import { Store as StoreType, formatNPR, PLANS } from '../lib/types';

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [escrowData, setEscrowData] = useState<any>(null);
  const [moderationData, setModerationData] = useState<any>(null);
  const [rtoData, setRtoData] = useState<any>(null);
  const [commissionRates, setCommissionRates] = useState<any[]>([]);
  const [complianceList, setComplianceList] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    const [adminRes, escrowRes, rtoRes, commRes] = await Promise.all([
      fetch('/api/admin').then(r => r.json()),
      fetch('/api/escrow').then(r => r.json()),
      fetch('/api/moderation?type=rto').then(r => r.json()),
      fetch('/api/moderation?type=commissions').then(r => r.json()),
    ]);
    setData(adminRes);
    setEscrowData(escrowRes);
    setRtoData(rtoRes);
    setCommissionRates(commRes.rates || commRes.defaults || []);

    // Fetch moderation alerts
    const modRes = await fetch('/api/moderation?type=alerts').then(r => r.json());
    setModerationData(modRes);

    // Fetch compliance data for all stores
    const compRes = await fetch('/api/admin?include=compliance').then(r => r.json()).catch(() => adminRes);
    if (compRes.compliance) setComplianceList(compRes.compliance);

    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/admin'); return; }
    load();
  }, [user, authLoading]);

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="w-8 h-8 animate-spin text-[#FF6600]" /></div>;

  const { stats, stores, products, orders, subscriptions } = data;

  const toggleStatus = async (store: StoreType) => {
    const newStatus = store.status === 'active' ? 'suspended' : 'active';
    await fetch('/api/admin', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: store.id, status: newStatus }) });
    load();
  };

  const releaseEscrow = async (id: string) => {
    await fetch('/api/escrow', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'release' }) });
    load();
  };

  const refundEscrow = async (id: string) => {
    if (!confirm('Refund this escrow amount to customer?')) return;
    await fetch('/api/escrow', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'refund' }) });
    load();
  };

  const verifyMerchant = async (storeId: string, status: 'approved' | 'rejected') => {
    await fetch('/api/moderation', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'verify_merchant', id: storeId, alert_status: status }) });
    load();
  };

  const updateCommission = async (category: string, pct: number, fee: number) => {
    await fetch('/api/moderation', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_commission', category, commission_pct: pct, fixed_fee: fee, active: true }) });
    load();
  };

  const resolveAlert = async (id: string, status: string) => {
    await fetch('/api/moderation', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_alert', id, alert_status: status }) });
    load();
  };

  const signOut = async () => { await supabase.auth.signOut(); navigate('/'); };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white rounded-lg p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}><Icon className="w-5 h-5" style={{ color }} /></div>
      <div><p className="text-xs text-[#6C757D]">{label}</p><p className="text-xl font-extrabold text-[#212529]">{value}</p></div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'verification', label: 'Merchant Verification' },
    { id: 'escrow', label: 'Escrow Wallet' },
    { id: 'stores', label: 'Stores' },
    { id: 'orders', label: 'Orders' },
    { id: 'moderation', label: 'Price Moderation' },
    { id: 'commissions', label: 'Commissions' },
    { id: 'rto', label: 'RTO Analytics' },
    { id: 'subscriptions', label: 'Subscriptions' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#0F1B3D] text-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2"><div className="w-7 h-7 rounded bg-[#FF6600] flex items-center justify-center font-extrabold text-sm">P</div><span className="font-bold hidden sm:block">Pasal Nepal</span></Link>
            <span className="text-white/30">/</span><span className="text-sm font-medium">Super Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} className="text-white/70 hover:text-[#FF6600]"><RefreshCw className="w-4 h-4" /></button>
            <button onClick={signOut} className="text-sm text-white/70 hover:text-[#DC3545] flex items-center gap-1"><LogOut className="w-4 h-4" /><span className="hidden sm:inline">Sign out</span></button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-md text-sm font-semibold whitespace-nowrap ${tab === t.id ? 'bg-[#0F1B3D] text-white' : 'bg-white text-[#6C757D] border border-[#E9ECEF]'}`}>{t.label}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard icon={Store} label="Total Stores" value={stats.totalStores} color="#FF6600" />
              <StatCard icon={Package} label="Total Products" value={stats.totalProducts} color="#17A2B8" />
              <StatCard icon={ShoppingCart} label="Total Orders" value={stats.totalOrders} color="#5C2D91" />
              <StatCard icon={DollarSign} label="Platform Earnings" value={formatNPR(Math.round(stats.totalEarnings))} color="#28A745" />
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-5 h-5 text-[#28A745]" /><h2 className="font-bold text-[#212529]">Revenue Breakdown</h2></div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><span className="text-sm text-[#6C757D]">Gross Merchandise Value</span><span className="font-bold text-[#212529]">{formatNPR(Math.round(stats.totalRevenue))}</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-[#6C757D] flex items-center gap-1"><Percent className="w-3 h-3" /> Commission</span><span className="font-bold text-[#28A745]">{formatNPR(Math.round(stats.commission))}</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-[#6C757D]">Subscription Revenue</span><span className="font-bold text-[#17A2B8]">{formatNPR(Math.round(stats.planRevenue))}</span></div>
                  <div className="flex justify-between items-center border-t border-[#E9ECEF] pt-3"><span className="font-bold text-[#212529]">Total Earnings</span><span className="font-extrabold text-[#000000] text-lg">{formatNPR(Math.round(stats.totalEarnings))}</span></div>
                </div>
              </div>

              {/* Escrow Summary */}
              {escrowData && (
                <div className="bg-white rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3"><Wallet className="w-5 h-5 text-[#FF6600]" /><h2 className="font-bold text-[#212529]">Escrow Wallet</h2></div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center"><span className="text-sm text-[#6C757D]">Held (Pending Release)</span><span className="font-bold text-[#FF6600]">{formatNPR(Math.round(escrowData.summary.held))}</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-[#6C757D]">Released to Merchants</span><span className="font-bold text-[#28A745]">{formatNPR(Math.round(escrowData.summary.released))}</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-[#6C757D]">Refunded to Customers</span><span className="font-bold text-[#DC3545]">{formatNPR(Math.round(escrowData.summary.refunded))}</span></div>
                    <div className="flex justify-between items-center border-t border-[#E9ECEF] pt-3"><span className="text-sm text-[#6C757D]">Pending Release Count</span><span className="font-bold text-[#212529]">{escrowData.summary.pendingRelease}</span></div>
                  </div>
                  <button onClick={() => setTab('escrow')} className="mt-3 text-xs text-[#17A2B8] font-semibold">Manage Escrow →</button>
                </div>
              )}

              {/* RTO Summary */}
              {rtoData && (
                <div className="bg-white rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3"><RotateCcw className="w-5 h-5 text-[#DC3545]" /><h2 className="font-bold text-[#212529]">RTO Analytics</h2></div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center"><span className="text-sm text-[#6C757D]">Overall RTO Rate</span><span className={`font-bold ${rtoData.summary.overallRtoRate > 15 ? 'text-[#DC3545]' : 'text-[#28A745]'}`}>{rtoData.summary.overallRtoRate}%</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-[#6C757D]">Returned Orders</span><span className="font-bold text-[#212529]">{rtoData.summary.totalReturned}</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-[#6C757D]">Lost Value</span><span className="font-bold text-[#DC3545]">{formatNPR(Math.round(rtoData.summary.totalLostValue))}</span></div>
                  </div>
                  <button onClick={() => setTab('rto')} className="mt-3 text-xs text-[#17A2B8] font-semibold">View RTO Details →</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MERCHANT VERIFICATION */}
        {tab === 'verification' && (
          <div>
            <div className="flex items-center gap-2 mb-1"><Shield className="w-5 h-5 text-[#FF6600]" /><h1 className="text-xl font-bold text-[#212529]">Merchant Verification</h1></div>
            <p className="text-sm text-[#6C757D] mb-6">Review merchant documents before activating their store. Subdomains go live only after admin approval.</p>

            <div className="grid gap-3">
              {stores.map((s: StoreType) => {
                const compliance = complianceList.find((c: any) => c.store_id === s.id);
                const certStatus = compliance?.company_cert_status || 'not_uploaded';
                const panNumber = compliance?.pan_number;
                const vatNumber = compliance?.vat_number;
                const vatEnabled = compliance?.vat_enabled;

                return (
                  <div key={s.id} className="bg-white rounded-lg p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: s.primary_color || '#0F1B3D' }}>{s.name.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-[#212529]">{s.name}</p>
                          <p className="text-xs text-[#6C757D]">{s.subdomain}.pasalnepal • {s.owner_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.status === 'active' ? 'bg-[#28A745]/10 text-[#28A745]' : s.status === 'suspended' ? 'bg-[#DC3545]/10 text-[#DC3545]' : 'bg-[#FF6600]/10 text-[#FF6600]'}`}>{s.status}</span>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-4 gap-3 text-sm">
                      <div className="bg-[#F8F9FA] rounded-md p-2">
                        <p className="text-[10px] text-[#6C757D] uppercase">PAN Number</p>
                        <p className="font-mono font-bold text-[#212529] text-xs">{panNumber || 'Not provided'}</p>
                        {panNumber && <CheckCircle2 className="w-3 h-3 text-[#28A745] inline ml-1" />}
                      </div>
                      <div className="bg-[#F8F9FA] rounded-md p-2">
                        <p className="text-[10px] text-[#6C757D] uppercase">VAT Number</p>
                        <p className="font-mono font-bold text-[#212529] text-xs">{vatNumber || 'N/A'}</p>
                      </div>
                      <div className="bg-[#F8F9FA] rounded-md p-2">
                        <p className="text-[10px] text-[#6C757D] uppercase">VAT Enabled</p>
                        <p className="font-bold text-xs">{vatEnabled ? '✓ Yes' : '✗ No'}</p>
                      </div>
                      <div className="bg-[#F8F9FA] rounded-md p-2">
                        <p className="text-[10px] text-[#6C757D] uppercase">OCR Certificate</p>
                        <span className={`text-xs font-bold ${certStatus === 'verified' ? 'text-[#28A745]' : certStatus === 'pending_verification' ? 'text-[#FF6600]' : certStatus === 'rejected' ? 'text-[#DC3545]' : 'text-[#6C757D]'}`}>
                          {certStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E9ECEF]">
                      {certStatus === 'pending_verification' && (
                        <>
                          <button onClick={() => verifyMerchant(s.id, 'approved')} className="bg-[#28A745] hover:bg-[#218838] text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Approve</button>
                          <button onClick={() => verifyMerchant(s.id, 'rejected')} className="bg-[#DC3545]/10 hover:bg-[#DC3545] hover:text-white text-[#DC3545] text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Reject</button>
                        </>
                      )}
                      <button onClick={() => toggleStatus(s)} className={`text-xs font-bold px-3 py-1.5 rounded ml-auto ${s.status === 'active' ? 'bg-[#DC3545]/10 text-[#DC3545] hover:bg-[#DC3545] hover:text-white' : 'bg-[#28A745]/10 text-[#28A745] hover:bg-[#28A745] hover:text-white'}`}>
                        {s.status === 'active' ? 'Suspend Store' : 'Activate Store'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ESCROW WALLET */}
        {tab === 'escrow' && escrowData && (
          <div>
            <div className="flex items-center gap-2 mb-1"><Wallet className="w-5 h-5 text-[#FF6600]" /><h1 className="text-xl font-bold text-[#212529]">Escrow Wallet System</h1></div>
            <p className="text-sm text-[#6C757D] mb-6">Customer payments are held safely. Release to merchant only after delivery confirmation.</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <StatCard icon={Clock} label="Held (Pending)" value={formatNPR(Math.round(escrowData.summary.held))} color="#FF6600" />
              <StatCard icon={CheckCircle2} label="Released" value={formatNPR(Math.round(escrowData.summary.released))} color="#28A745" />
              <StatCard icon={RotateCcw} label="Refunded" value={formatNPR(Math.round(escrowData.summary.refunded))} color="#DC3545" />
              <StatCard icon={Wallet} label="Pending Count" value={escrowData.summary.pendingRelease} color="#17A2B8" />
            </div>

            <div className="bg-white rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F8F9FA] text-[#6C757D] text-xs uppercase">
                    <tr><th className="text-left p-3">Order ID</th><th className="text-left p-3">Store</th><th className="text-left p-3">Amount</th><th className="text-left p-3">Commission</th><th className="text-left p-3">Merchant Payout</th><th className="text-left p-3">Payment</th><th className="text-left p-3">Status</th><th className="text-left p-3">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9ECEF]">
                    {escrowData.transactions.map((e: any) => {
                      const store = stores.find((s: StoreType) => s.id === e.store_id);
                      return (
                        <tr key={e.id} className="hover:bg-[#F8F9FA]">
                          <td className="p-3 font-semibold text-[#212529]">#{e.order_id}</td>
                          <td className="p-3 text-[#6C757D]">{store?.name || '-'}</td>
                          <td className="p-3 font-bold text-[#000000]">{formatNPR(Number(e.amount))}</td>
                          <td className="p-3 text-[#DC3545]">{formatNPR(Number(e.commission_amount))}</td>
                          <td className="p-3 font-semibold text-[#28A745]">{formatNPR(Number(e.merchant_payout))}</td>
                          <td className="p-3 uppercase text-xs text-[#6C757D]">{e.payment_method}</td>
                          <td className="p-3">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${e.status === 'held' ? 'bg-[#FF6600]/10 text-[#FF6600]' : e.status === 'released' ? 'bg-[#28A745]/10 text-[#28A745]' : 'bg-[#DC3545]/10 text-[#DC3545]'}`}>{e.status}</span>
                          </td>
                          <td className="p-3">
                            {e.status === 'held' && (
                              <div className="flex gap-1">
                                <button onClick={() => releaseEscrow(e.id)} className="bg-[#28A745] hover:bg-[#218838] text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Release</button>
                                <button onClick={() => refundEscrow(e.id)} className="bg-[#DC3545]/10 hover:bg-[#DC3545] hover:text-white text-[#DC3545] text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Refund</button>
                              </div>
                            )}
                            {e.status !== 'held' && <span className="text-xs text-[#6C757D]">{e.admin_note || '—'}</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 bg-[#FFF8E1] border border-[#FFD814]/30 rounded-lg p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#FF6600] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#212529]">How Escrow Works</p>
                <p className="text-xs text-[#6C757D] mt-1">1. Customer pays → funds held in escrow (safe). 2. Merchant fulfills order. 3. Delivery confirmed → admin releases funds to merchant (minus 2% commission). 4. If order fails/refunded → funds returned to customer.</p>
              </div>
            </div>
          </div>
        )}

        {/* STORES */}
        {tab === 'stores' && (
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F9FA] text-[#6C757D] text-xs uppercase">
                  <tr><th className="text-left p-3">Store</th><th className="text-left p-3">Owner</th><th className="text-left p-3">Plan</th><th className="text-left p-3">Products</th><th className="text-left p-3">Status</th><th className="text-left p-3">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-[#E9ECEF]">
                  {stores.map((s: StoreType) => (
                    <tr key={s.id} className="hover:bg-[#F8F9FA]">
                      <td className="p-3"><Link to={`/store/${s.subdomain}`} target="_blank" className="font-semibold text-[#212529] hover:text-[#FF6600] flex items-center gap-1">{s.name}<ExternalLink className="w-3 h-3" /></Link><span className="text-xs text-[#6C757D]">{s.subdomain}.pasalnepal</span></td>
                      <td className="p-3 text-[#6C757D]">{s.owner_name}<br/><span className="text-xs">{s.owner_email}</span></td>
                      <td className="p-3"><span className="capitalize text-xs font-bold bg-[#F8F9FA] px-2 py-0.5 rounded">{s.plan}</span></td>
                      <td className="p-3 text-[#212529]">{products.filter((p:any) => p.store_id === s.id).length}</td>
                      <td className="p-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${s.status === 'active' ? 'bg-[#28A745]/10 text-[#28A745]' : 'bg-[#DC3545]/10 text-[#DC3545]'}`}>{s.status}</span></td>
                      <td className="p-3"><button onClick={() => toggleStatus(s)} className={`text-xs font-bold px-3 py-1.5 rounded ${s.status === 'active' ? 'bg-[#DC3545]/10 text-[#DC3545] hover:bg-[#DC3545] hover:text-white' : 'bg-[#28A745]/10 text-[#28A745] hover:bg-[#28A745] hover:text-white'}`}>{s.status === 'active' ? 'Suspend' : 'Activate'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F9FA] text-[#6C757D] text-xs uppercase"><tr><th className="text-left p-3">Order</th><th className="text-left p-3">Store</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Amount</th><th className="text-left p-3">Payment</th><th className="text-left p-3">Status</th><th className="text-left p-3">Commission</th></tr></thead>
                <tbody className="divide-y divide-[#E9ECEF]">
                  {orders.map((o:any) => {
                    const store = stores.find((s:StoreType) => s.id === o.store_id);
                    return (
                      <tr key={o.id} className="hover:bg-[#F8F9FA]">
                        <td className="p-3 font-semibold text-[#212529]">{o.order_number}</td>
                        <td className="p-3 text-[#6C757D]">{store?.name || '-'}</td>
                        <td className="p-3 text-[#6C757D]">{o.customer_name}<br/><span className="text-xs">{o.customer_phone}</span></td>
                        <td className="p-3 font-bold text-[#000000]">{formatNPR(Number(o.total))}</td>
                        <td className="p-3 uppercase text-xs text-[#6C757D]">{o.payment_method}</td>
                        <td className="p-3"><span className="text-xs font-bold capitalize text-[#6C757D]">{o.status}</span></td>
                        <td className="p-3 font-bold text-[#28A745]">{formatNPR(Number(o.total)*0.02)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {orders.length === 0 && <p className="text-center text-sm text-[#6C757D] py-10">No orders yet.</p>}
            </div>
          </div>
        )}

        {/* PRICE MODERATION */}
        {tab === 'moderation' && moderationData && (
          <div>
            <div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-5 h-5 text-[#FF6600]" /><h1 className="text-xl font-bold text-[#212529]">Price Moderation</h1></div>
            <p className="text-sm text-[#6C757D] mb-6">Detect unfair pricing, fake discounts, and potential black marketing.</p>

            {/* Auto-detected alerts */}
            <h2 className="font-bold text-[#212529] mb-3 flex items-center gap-2"><Eye className="w-4 h-4 text-[#17A2B8]" /> Auto-Detected Alerts ({moderationData.autoAlerts?.length || 0})</h2>
            <div className="space-y-3 mb-6">
              {(moderationData.autoAlerts || []).map((a: any, i: number) => (
                <div key={i} className={`bg-white rounded-lg p-4 border-l-4 ${a.severity === 'high' ? 'border-[#DC3545]' : 'border-[#FF6600]'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${a.severity === 'high' ? 'bg-[#DC3545]/10 text-[#DC3545]' : 'bg-[#FF6600]/10 text-[#FF6600]'}`}>{a.severity}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F8F9FA] text-[#6C757D] uppercase">{a.type.replace(/_/g, ' ')}</span>
                      </div>
                      <p className="text-sm font-semibold text-[#212529]">{a.message}</p>
                      <p className="text-xs text-[#6C757D] mt-1">Store: {a.store_name} • {a.store_subdomain}.pasalnepal</p>
                    </div>
                  </div>
                </div>
              ))}
              {(moderationData.autoAlerts || []).length === 0 && <div className="bg-white rounded-lg p-6 text-center text-sm text-[#6C757D]">✓ No pricing anomalies detected. All products look fair.</div>}
            </div>

            {/* Manual alerts */}
            {moderationData.alerts?.length > 0 && (
              <>
                <h2 className="font-bold text-[#212529] mb-3">Manual Alerts ({moderationData.alerts.length})</h2>
                <div className="space-y-3">
                  {moderationData.alerts.map((a: any) => (
                    <div key={a.id} className="bg-white rounded-lg p-4 border-l-4 border-[#FF6600]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#212529]">{a.message}</p>
                          <p className="text-xs text-[#6C757D] mt-1">Type: {a.alert_type} • Severity: {a.severity}</p>
                        </div>
                        {a.status === 'pending' && (
                          <button onClick={() => resolveAlert(a.id, 'resolved')} className="bg-[#28A745] hover:bg-[#218838] text-white text-xs font-bold px-3 py-1.5 rounded">Resolve</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* CATEGORY COMMISSIONS */}
        {tab === 'commissions' && (
          <div>
            <div className="flex items-center gap-2 mb-1"><Settings className="w-5 h-5 text-[#FF6600]" /><h1 className="text-xl font-bold text-[#212529]">Category-Wise Commission</h1></div>
            <p className="text-sm text-[#6C757D] mb-6">Set different commission rates for each product category. Master control for platform fees.</p>

            <div className="bg-white rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F9FA] text-[#6C757D] text-xs uppercase">
                  <tr><th className="text-left p-3">Category</th><th className="text-left p-3">Commission %</th><th className="text-left p-3">Fixed Fee</th><th className="text-left p-3">Status</th><th className="text-left p-3">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-[#E9ECEF]">
                  {commissionRates.map((c: any) => (
                    <CommissionRow key={c.category} category={c.category} pct={Number(c.commission_pct)} fee={Number(c.fixed_fee)} active={c.active} onUpdate={updateCommission} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 bg-[#F8F9FA] rounded-lg p-4">
              <p className="text-sm font-bold text-[#212529] mb-2">How Commission Works:</p>
              <ul className="text-xs text-[#6C757D] space-y-1 ml-4 list-disc">
                <li>Commission is calculated on the order total (excluding shipping)</li>
                <li>Percentage commission is deducted from the merchant payout</li>
                <li>Fixed fee is added on top of the percentage (if set)</li>
                <li>Example: Electronics 3% on रू 10,000 = रू 300 commission</li>
                <li>Different categories can have different rates to optimize revenue</li>
              </ul>
            </div>
          </div>
        )}

        {/* RTO ANALYTICS */}
        {tab === 'rto' && rtoData && (
          <div>
            <div className="flex items-center gap-2 mb-1"><RotateCcw className="w-5 h-5 text-[#DC3545]" /><h1 className="text-xl font-bold text-[#212529]">RTO Analytics (Return to Origin)</h1></div>
            <p className="text-sm text-[#6C757D] mb-6">Track which merchants have the highest return rates to prevent logistics losses.</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <StatCard icon={ShoppingCart} label="Total Orders" value={rtoData.summary.totalOrders} color="#17A2B8" />
              <StatCard icon={RotateCcw} label="Returned Orders" value={rtoData.summary.totalReturned} color="#DC3545" />
              <StatCard icon={TrendingUp} label="Overall RTO Rate" value={`${rtoData.summary.overallRtoRate}%`} color={rtoData.summary.overallRtoRate > 15 ? '#DC3545' : '#28A745'} />
              <StatCard icon={DollarSign} label="Lost Value" value={formatNPR(Math.round(rtoData.summary.totalLostValue))} color="#DC3545" />
            </div>

            <div className="bg-white rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F8F9FA] text-[#6C757D] text-xs uppercase">
                    <tr><th className="text-left p-3">Store</th><th className="text-left p-3">Total Orders</th><th className="text-left p-3">Delivered</th><th className="text-left p-3">Returned</th><th className="text-left p-3">RTO Rate</th><th className="text-left p-3">Lost Value</th><th className="text-left p-3">Risk Level</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9ECEF]">
                    {rtoData.stores.map((s: any) => (
                      <tr key={s.store_id} className="hover:bg-[#F8F9FA]">
                        <td className="p-3"><Link to={`/store/${s.subdomain}`} target="_blank" className="font-semibold text-[#212529] hover:text-[#FF6600]">{s.store_name}</Link></td>
                        <td className="p-3 text-[#212529]">{s.total_orders}</td>
                        <td className="p-3 text-[#28A745] font-semibold">{s.delivered_orders}</td>
                        <td className="p-3 text-[#DC3545] font-semibold">{s.returned_orders}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-[#E9ECEF] rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full rounded-full ${s.rto_rate > 30 ? 'bg-[#DC3545]' : s.rto_rate > 15 ? 'bg-[#FF6600]' : s.rto_rate > 5 ? 'bg-[#FFD814]' : 'bg-[#28A745]'}`} style={{ width: `${Math.min(100, s.rto_rate * 2)}%` }} />
                            </div>
                            <span className="font-bold text-[#212529] text-xs">{s.rto_rate}%</span>
                          </div>
                        </td>
                        <td className="p-3 font-bold text-[#DC3545]">{formatNPR(Math.round(s.lost_value))}</td>
                        <td className="p-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${s.risk_level === 'critical' ? 'bg-[#DC3545]/10 text-[#DC3545]' : s.risk_level === 'high' ? 'bg-[#FF6600]/10 text-[#FF6600]' : s.risk_level === 'medium' ? 'bg-[#FFD814]/20 text-[#856404]' : 'bg-[#28A745]/10 text-[#28A745]'}`}>{s.risk_level}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 bg-[#FFF8E1] border border-[#FFD814]/30 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#FF6600] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#212529]">Why RTO Matters</p>
                <p className="text-xs text-[#6C757D] mt-1">Return to Origin (RTO) occurs when a customer refuses delivery or the package is undeliverable. High RTO rates indicate poor product quality, misleading listings, or unreliable customers. Merchants with RTO rate above 30% should be reviewed for potential suspension.</p>
              </div>
            </div>
          </div>
        )}

        {/* SUBSCRIPTIONS */}
        {tab === 'subscriptions' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(PLANS).map(([key, plan]) => {
              const subs = subscriptions.filter((s:any) => s.plan === key);
              const revenue = subs.filter((s: any) => s.status === 'active').length * plan.price;
              return (
                <div key={key} className="bg-white rounded-lg p-5">
                  <h3 className="font-bold text-[#212529]">{plan.name}</h3>
                  <p className="text-2xl font-extrabold text-[#000000] my-2">{formatNPR(plan.price)}<span className="text-xs font-normal text-[#6C757D]">/mo</span></p>
                  <div className="space-y-1 text-sm border-t border-[#E9ECEF] pt-3 mt-3">
                    <div className="flex justify-between"><span className="text-[#6C757D]">Active</span><span className="font-bold text-[#28A745]">{subs.filter((s: any) => s.status === 'active').length}</span></div>
                    <div className="flex justify-between"><span className="text-[#6C757D]">Monthly Rev.</span><span className="font-bold text-[#212529]">{formatNPR(revenue)}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CommissionRow({ category, pct, fee, active, onUpdate }: { category: string; pct: number; fee: number; active: boolean; onUpdate: (cat: string, pct: number, fee: number) => void }) {
  const [editPct, setEditPct] = useState(String(pct));
  const [editFee, setEditFee] = useState(String(fee));
  const [editing, setEditing] = useState(false);

  const save = () => {
    onUpdate(category, Number(editPct), Number(editFee));
    setEditing(false);
  };

  return (
    <tr className="hover:bg-[#F8F9FA]">
      <td className="p-3 font-semibold text-[#212529]">{category}</td>
      <td className="p-3">
        {editing ? (
          <div className="flex items-center gap-1"><input type="number" value={editPct} onChange={e => setEditPct(e.target.value)} className="w-16 px-2 py-1 border border-[#DEE2E6] rounded text-sm" /><span className="text-xs text-[#6C757D]">%</span></div>
        ) : (
          <span className="font-bold text-[#FF6600]">{pct}%</span>
        )}
      </td>
      <td className="p-3">
        {editing ? (
          <div className="flex items-center gap-1"><span className="text-xs text-[#6C757D]">रू</span><input type="number" value={editFee} onChange={e => setEditFee(e.target.value)} className="w-20 px-2 py-1 border border-[#DEE2E6] rounded text-sm" /></div>
        ) : (
          <span className="text-[#6C757D]">{fee > 0 ? formatNPR(fee) : '—'}</span>
        )}
      </td>
      <td className="p-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-[#28A745]/10 text-[#28A745]' : 'bg-[#6C757D]/10 text-[#6C757D]'}`}>{active ? 'Active' : 'Inactive'}</span></td>
      <td className="p-3">
        {editing ? (
          <div className="flex gap-1">
            <button onClick={save} className="bg-[#28A745] text-white text-xs font-bold px-2 py-1 rounded">Save</button>
            <button onClick={() => { setEditPct(String(pct)); setEditFee(String(fee)); setEditing(false); }} className="text-[#6C757D] text-xs font-bold px-2 py-1">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-[#17A2B8] text-xs font-bold hover:underline">Edit</button>
        )}
      </td>
    </tr>
  );
}
