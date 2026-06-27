import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Tag, ArrowLeft, Shield, ChevronRight, Truck, Package, MapPin, Weight, Zap, Clock, Info } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import EmptyState from '../components/EmptyState';
import PaymentModal from '../components/PaymentModal';
import { useCart } from '../contexts/CartContext';
import { CartItem, PROVINCES } from '../lib/types';
import { PAYMENT_GATEWAYS, PaymentGateway, formatNPR } from '../lib/payments';
import { calculateShipping, estimateCartWeight, getDeliveryZone, getZoneLabel, ShippingQuote, COURIERS } from '../lib/shipping';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', customer_email: '',
    province: '', district: '', municipality: '', ward: '', address_line: '',
  });
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<ShippingQuote | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cartWeight = useMemo(() => estimateCartWeight(items as any), [items]);
  const shippingQuotes = useMemo(() => {
    if (!form.province || !form.district) return [];
    return calculateShipping(form.province, form.district, cartWeight, subtotal);
  }, [form.province, form.district, cartWeight, subtotal]);

  // Auto-select cheapest quote when quotes change
  useEffect(() => {
    if (shippingQuotes.length > 0 && !selectedQuote) {
      setSelectedQuote(shippingQuotes[0]);
    }
    if (shippingQuotes.length > 0 && selectedQuote) {
      // Re-match if the selected quote no longer exists
      const match = shippingQuotes.find(q => q.courierId === selectedQuote.courierId && q.speed === selectedQuote.speed);
      if (!match) setSelectedQuote(shippingQuotes[0]);
      else setSelectedQuote(match);
    }
  }, [shippingQuotes]);

  const shipping = selectedQuote?.totalCharge ?? 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const storeGroups = items.reduce((acc: Record<string, CartItem[]>, item) => {
    acc[item.product.store_id] = acc[item.product.store_id] || [];
    acc[item.product.store_id].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const set = (k: string, v: string) => {
    setForm({ ...form, [k]: v });
    if (k === 'province' || k === 'district') setSelectedQuote(null);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.customer_name.trim()) e.customer_name = 'Required';
    if (!/^[0-9]{10}$/.test(form.customer_phone)) e.customer_phone = 'Enter valid 10-digit phone';
    if (!form.province) e.province = 'Select province';
    if (!form.district.trim()) e.district = 'Required';
    if (!form.municipality.trim()) e.municipality = 'Required';
    if (!form.ward.trim()) e.ward = 'Required';
    if (!form.address_line.trim()) e.address_line = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await fetch(`/api/coupons?store_id=${Object.keys(storeGroups)[0] || ''}`);
      const coupons = await res.json();
      const found = (Array.isArray(coupons) ? coupons : []).find((c: any) => c.code.toLowerCase() === couponCode.toLowerCase() && c.active);
      if (!found) { setCouponMsg('Invalid coupon'); setDiscount(0); return; }
      const d = found.type === 'percent' ? (subtotal * found.value) / 100 : found.value;
      setDiscount(d);
      setCouponMsg(`Coupon applied! You saved ${formatNPR(d)}`);
    } catch { setCouponMsg('Could not apply coupon'); }
  };

  const handlePayClick = () => {
    if (!validate()) return;
    if (!selectedGateway) { alert('Please select a payment method'); return; }
  };

  const onPaymentSuccess = async (txnId: string) => {
    setSelectedGateway(null);

    const orderNumbers: string[] = [];
    for (const [storeId, storeItems] of Object.entries(storeGroups) as [string, CartItem[]][]) {
      const storeSubtotal = storeItems.reduce((s: number, i) => s + i.qty * Number(i.product.price), 0);
      const storeShipping = shipping > 0 ? Math.round(shipping * storeSubtotal / Math.max(subtotal, 1)) : 0;
      const storeTotal = storeSubtotal + storeShipping - (discount * storeSubtotal / Math.max(subtotal, 1));
      const orderBody = {
        store_id: storeId,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_email: form.customer_email,
        items: storeItems.map(i => ({ product_id: i.product.id, name: i.product.name, price: Number(i.product.price), qty: i.qty, image_url: i.product.image_url })),
        subtotal: storeSubtotal,
        shipping: storeShipping,
        discount: Math.round(discount * storeSubtotal / Math.max(subtotal, 1)),
        total: Math.round(storeTotal),
        payment_method: selectedGateway?.id || 'cod',
        payment_status: selectedGateway?.id === 'cod' ? 'pending' : 'paid',
        status: 'pending',
        province: form.province, district: form.district, municipality: form.municipality, ward: form.ward, address_line: form.address_line,
        coupon_code: discount > 0 ? couponCode : null,
        courier: selectedQuote?.courierId || null,
        courier_name: selectedQuote?.courierName || null,
        delivery_zone: selectedQuote?.zone || null,
        delivery_speed: selectedQuote?.speed || null,
        estimated_delivery: selectedQuote?.estimatedDays || null,
        cart_weight: cartWeight,
      };
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderBody) });
      const data = await res.json();
      if (data.order_number) orderNumbers.push(data.order_number);

      fetch('/api/sms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: form.customer_phone,
          message: `Dear ${form.customer_name}, order ${data.order_number} confirmed for ${formatNPR(Math.round(storeTotal))}. Delivery via ${selectedQuote?.courierName || 'courier'} (${selectedQuote?.estimatedDays || '2-3 days'}). Payment: ${selectedGateway?.name || 'COD'}. — Pasal Nepal`,
        }),
      }).catch(() => {});
    }

    clearCart();
    navigate('/order-success', { state: { orderNumbers, total, payment: selectedGateway?.id || 'cod', txnId, courier: selectedQuote } });
  };

  const onPaymentFailure = (message: string) => {
    setSelectedGateway(null);
    alert(`Payment failed: ${message}`);
  };

  if (items.length === 0) {
    return <div className="min-h-screen bg-white"><Header /><EmptyState title="Your cart is empty" message="Add products before checking out." actionLabel="Shop now" actionTo="/products" /><BottomNav /></div>;
  }

  const inputCls = (field: string) => `w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600] ${errors[field] ? 'border-[#DC3545]' : 'border-[#DEE2E6]'}`;
  const currentZone = form.province && form.district ? getDeliveryZone(form.province, form.district) : null;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <Link to="/cart" className="text-sm text-[#17A2B8] font-semibold flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Back to cart</Link>
        <h1 className="text-xl font-bold text-[#212529] mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg p-5">
              <h2 className="font-bold text-[#212529] mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-[#FF6600]" /> Delivery Address (Nepal)</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#6C757D]">Full Name *</label>
                  <input value={form.customer_name} onChange={e => set('customer_name', e.target.value)} className={inputCls('customer_name')} placeholder="Ram Bahadur" />
                  {errors.customer_name && <p className="text-xs text-[#DC3545] mt-1">{errors.customer_name}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6C757D]">Phone Number *</label>
                  <input value={form.customer_phone} onChange={e => set('customer_phone', e.target.value.replace(/\D/g, '').slice(0,10))} className={inputCls('customer_phone')} placeholder="98XXXXXXXX" />
                  {errors.customer_phone && <p className="text-xs text-[#DC3545] mt-1">{errors.customer_phone}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6C757D]">Email (optional)</label>
                  <input value={form.customer_email} onChange={e => set('customer_email', e.target.value)} className={inputCls('customer_email')} placeholder="you@email.com" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6C757D]">Province *</label>
                  <select value={form.province} onChange={e => set('province', e.target.value)} className={inputCls('province')}>
                    <option value="">Select province</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errors.province && <p className="text-xs text-[#DC3545] mt-1">{errors.province}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6C757D]">District *</label>
                  <input value={form.district} onChange={e => set('district', e.target.value)} className={inputCls('district')} placeholder="Kathmandu" />
                  {errors.district && <p className="text-xs text-[#DC3545] mt-1">{errors.district}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6C757D]">Municipality *</label>
                  <input value={form.municipality} onChange={e => set('municipality', e.target.value)} className={inputCls('municipality')} placeholder="Kathmandu Metropolitan" />
                  {errors.municipality && <p className="text-xs text-[#DC3545] mt-1">{errors.municipality}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6C757D]">Ward Number *</label>
                  <input value={form.ward} onChange={e => set('ward', e.target.value)} className={inputCls('ward')} placeholder="5" />
                  {errors.ward && <p className="text-xs text-[#DC3545] mt-1">{errors.ward}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#6C757D]">Street / Tole / Landmark *</label>
                  <textarea value={form.address_line} onChange={e => set('address_line', e.target.value)} rows={2} className={inputCls('address_line')} placeholder="Opposite to Standard Chartered Bank, Near ABC Temple, House 123" />
                  {errors.address_line && <p className="text-xs text-[#DC3545] mt-1">{errors.address_line}</p>}
                  <p className="text-[10px] text-[#6C757D] mt-1">💡 Landmarks help delivery agents find your location easily in Nepal</p>
                </div>
              </div>
            </div>

            {/* Shipping / Courier Selection */}
            <div className="bg-white rounded-lg p-5">
              <h2 className="font-bold text-[#212529] mb-1 flex items-center gap-2"><Truck className="w-4 h-4 text-[#FF6600]" /> Shipping & Delivery</h2>

              {!form.province || !form.district ? (
                <div className="bg-[#F8F9FA] rounded-lg p-6 text-center">
                  <MapPin className="w-8 h-8 text-[#ADB5BD] mx-auto mb-2" />
                  <p className="text-sm text-[#6C757D]">Select your province and district to see delivery options</p>
                </div>
              ) : (
                <>
                  {/* Zone & Weight info */}
                  <div className="flex flex-wrap gap-2 mb-4 text-xs">
                    {currentZone && (
                      <span className="bg-[#17A2B8]/10 text-[#17A2B8] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {getZoneLabel(currentZone)}
                      </span>
                    )}
                    <span className="bg-[#FF6600]/10 text-[#FF6600] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                      <Weight className="w-3 h-3" /> Est. Weight: {cartWeight.toFixed(1)} kg
                    </span>
                    {subtotal >= 5000 && (
                      <span className="bg-[#28A745]/10 text-[#28A745] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3" /> FREE Shipping Unlocked!
                      </span>
                    )}
                  </div>

                  {shippingQuotes.length === 0 ? (
                    <div className="bg-[#FFF8E1] border border-[#FFD814]/30 rounded-lg p-4 text-sm text-[#6C757D]">
                      ⚠️ No courier services available for this location. Please contact the store for delivery arrangements.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {shippingQuotes.map((q, i) => {
                        const isSelected = selectedQuote?.courierId === q.courierId && selectedQuote?.speed === q.speed;
                        return (
                          <button
                            key={`${q.courierId}-${q.speed}-${i}`}
                            onClick={() => setSelectedQuote(q)}
                            className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-all text-left ${isSelected ? 'border-[#FF6600] bg-[#FF6600]/5 ring-2 ring-[#FF6600]/20' : 'border-[#DEE2E6] hover:border-[#ADB5BD] hover:bg-[#F8F9FA]'}`}
                          >
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${q.courierColor}15` }}>
                              {q.courierIcon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-bold text-[#212529]">{q.courierName}</p>
                                {q.badge && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: q.courierColor }}>{q.badge}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-[#6C757D] flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {q.speedLabel}
                                </span>
                                <span className="text-[10px] text-[#ADB5BD]">•</span>
                                <span className="text-xs text-[#6C757D]">ETA: {q.estimatedDays}</span>
                              </div>
                              {q.weightCharge > 0 && (
                                <p className="text-[10px] text-[#ADB5BD] mt-0.5">
                                  Base {formatNPR(q.baseRate)} + {formatNPR(q.perKgRate)}/kg × {(q.weight - 1).toFixed(1)}kg extra
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              {q.totalCharge === 0 ? (
                                <span className="text-lg font-extrabold text-[#28A745]">FREE</span>
                              ) : (
                                <span className="text-lg font-extrabold text-[#000000]">{formatNPR(q.totalCharge)}</span>
                              )}
                              {q.trackingSupported && <p className="text-[10px] text-[#17A2B8] mt-0.5">📦 Tracking</p>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Rate breakdown info */}
                  <div className="mt-3 bg-[#F8F9FA] rounded-lg p-3 flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#6C757D] shrink-0 mt-0.5" />
                    <div className="text-[11px] text-[#6C757D] space-y-0.5">
                      <p>• Inside Valley: flat rate starts at रू 60-100 (same-day available)</p>
                      <p>• Outside Valley: weight-based rates, 2-5 day delivery</p>
                      <p>• Orders over रू 5,000 get <strong className="text-[#28A745]">FREE shipping</strong></p>
                      <p>• Weight estimated from product categories ({cartWeight.toFixed(1)} kg total)</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg p-5">
              <h2 className="font-bold text-[#212529] mb-4 flex items-center gap-2"><Lock className="w-4 h-4" /> Payment Method</h2>
              <div className="space-y-2">
                {PAYMENT_GATEWAYS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGateway(g)}
                    className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-all text-left ${selectedGateway?.id === g.id ? 'border-[#FF6600] bg-[#FF6600]/5 ring-2 ring-[#FF6600]/20' : 'border-[#DEE2E6] hover:border-[#ADB5BD] hover:bg-[#F8F9FA]'}`}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: g.bgColor }}>{g.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#212529]">{g.name}</p>
                        {g.badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: g.color }}>{g.badge}</span>}
                      </div>
                      <p className="text-xs text-[#6C757D] line-clamp-1">{g.description}</p>
                      <p className="text-[10px] text-[#6C757D] mt-0.5">{g.nameNp} • {g.processingTime}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#ADB5BD] shrink-0" />
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-[#6C757D] bg-[#F8F9FA] rounded-lg p-3">
                <Shield className="w-4 h-4 text-[#28A745] shrink-0" />
                <span>All payments in <strong className="text-[#212529]">Nepalese Rupee (रू)</strong>. Encrypted & secure.</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg p-5 h-fit lg:sticky lg:top-20">
            <h2 className="font-bold text-[#212529] mb-4">Order Summary</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
              {items.map(({ product, qty }: CartItem) => (
                <div key={product.id} className="flex gap-2 text-sm">
                  <img src={product.image_url} className="w-10 h-10 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#212529] line-clamp-1">{product.name}</p>
                    <p className="text-xs text-[#6C757D]">{qty} × {formatNPR(Number(product.price))}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6C757D]" />
                <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code" className="w-full pl-8 pr-3 py-2 border border-[#DEE2E6] rounded-md text-sm" />
              </div>
              <button onClick={applyCoupon} className="bg-[#0F1B3D] text-white text-sm font-semibold px-4 rounded-md">Apply</button>
            </div>
            {couponMsg && <p className={`text-xs mb-3 ${discount > 0 ? 'text-[#28A745]' : 'text-[#DC3545]'}`}>{couponMsg}</p>}

            <div className="space-y-2 text-sm border-t border-[#E9ECEF] pt-3">
              <div className="flex justify-between"><span className="text-[#6C757D]">Subtotal</span><span>{formatNPR(subtotal)}</span></div>
              <div className="flex justify-between">
                <span className="text-[#6C757D]">Shipping {selectedQuote && `(${selectedQuote.courierName})`}</span>
                <span>{shipping === 0 ? <span className="text-[#28A745] font-bold">FREE</span> : formatNPR(shipping)}</span>
              </div>
              {discount > 0 && <div className="flex justify-between text-[#28A745]"><span>Discount</span><span>-{formatNPR(discount)}</span></div>}
              <div className="flex justify-between text-base font-extrabold border-t border-[#E9ECEF] pt-2">
                <span>Total</span><span className="text-[#000000]">{formatNPR(total)}</span>
              </div>
              {selectedQuote && (
                <div className="bg-[#F8F9FA] rounded-md p-2 mt-2 text-xs text-[#6C757D]">
                  <div className="flex items-center gap-1 mb-1"><Truck className="w-3 h-3" /> <span className="font-semibold text-[#212529]">{selectedQuote.courierName}</span></div>
                  <p>📦 {selectedQuote.speedLabel} • ETA: {selectedQuote.estimatedDays}</p>
                  {selectedQuote.trackingSupported && <p>🔍 Tracking available</p>}
                </div>
              )}
            </div>

            {selectedGateway ? (
              <button
                onClick={() => { if (validate()) { /* PaymentModal is shown because selectedGateway is set */ } }}
                className="mt-4 w-full text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                style={{ background: selectedGateway.color }}
              >
                Pay {formatNPR(total)} via {selectedGateway.name}
              </button>
            ) : (
              <button onClick={handlePayClick} className="mt-4 w-full bg-[#FF6600] hover:bg-[#e65c00] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                Select Payment Method
              </button>
            )}
            <p className="text-xs text-[#6C757D] text-center mt-2">🔒 Secure checkout • {Object.keys(storeGroups).length} store(s) in this order</p>
          </div>
        </div>
      </div>

      {selectedGateway && (
        <PaymentModal
          gateway={selectedGateway}
          amount={total}
          customerPhone={form.customer_phone}
          customerName={form.customer_name}
          onClose={() => setSelectedGateway(null)}
          onSuccess={onPaymentSuccess}
          onFailure={onPaymentFailure}
        />
      )}

      <Footer />
      <BottomNav />
    </div>
  );
}
