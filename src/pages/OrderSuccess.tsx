import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, MessageSquare, Receipt, Truck, Clock, MapPin, Weight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { formatNPR } from '../lib/payments';
import { ShippingQuote } from '../lib/shipping';

export default function OrderSuccess() {
  const { state } = useLocation() as { state: { orderNumbers: string[]; total: number; payment: string; txnId?: string; courier?: ShippingQuote } };
  const orderNumbers = state?.orderNumbers || [];
  const total = state?.total || 0;
  const payment = state?.payment || 'cod';
  const txnId = state?.txnId;
  const courier = state?.courier;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-12 pb-24 md:pb-12 text-center">
        <div className="w-20 h-20 rounded-full bg-[#28A745]/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-[#28A745]" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#212529] mb-2">Order Placed Successfully!</h1>
        <p className="text-[#6C757D] mb-6">Thank you for shopping with Pasal Nepal. A confirmation SMS has been sent to your phone.</p>

        <div className="bg-[#F8F9FA] rounded-lg p-5 text-left mb-6">
          <div className="flex justify-between py-2 border-b border-[#E9ECEF]">
            <span className="text-sm text-[#6C757D]">Order Number(s)</span>
            <span className="text-sm font-bold text-[#212529]">{orderNumbers.join(', ') || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#E9ECEF]">
            <span className="text-sm text-[#6C757D]">Total Amount</span>
            <span className="text-sm font-bold text-[#000000]">{formatNPR(total)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#E9ECEF]">
            <span className="text-sm text-[#6C757D]">Payment Method</span>
            <span className="text-sm font-bold text-[#212529] uppercase">{payment}</span>
          </div>
          {txnId && (
            <div className="flex justify-between py-2 border-b border-[#E9ECEF]">
              <span className="text-sm text-[#6C757D]">Transaction ID</span>
              <span className="text-sm font-mono font-bold text-[#17A2B8]">{txnId}</span>
            </div>
          )}
          <div className="flex justify-between py-2">
            <span className="text-sm text-[#6C757D]">Payment Status</span>
            <span className={`text-sm font-bold ${payment === 'cod' ? 'text-[#FF6600]' : 'text-[#28A745]'}`}>
              {payment === 'cod' ? 'Pay on Delivery' : 'Paid ✓'}
            </span>
          </div>
        </div>

        {/* Delivery / Courier Info */}
        {courier && (
          <div className="bg-white border-2 border-[#17A2B8]/20 rounded-lg p-5 mb-6 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-[#17A2B8]" />
              <h3 className="font-bold text-[#212529]">Delivery Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: `${courier.courierColor}15` }}>{courier.courierIcon}</div>
                <div>
                  <p className="text-xs text-[#6C757D]">Courier</p>
                  <p className="font-bold text-[#212529] text-sm">{courier.courierName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#FF6600]/10 flex items-center justify-center"><Clock className="w-4 h-4 text-[#FF6600]" /></div>
                <div>
                  <p className="text-xs text-[#6C757D]">Estimated Delivery</p>
                  <p className="font-bold text-[#212529] text-sm">{courier.estimatedDays}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#17A2B8]/10 flex items-center justify-center"><MapPin className="w-4 h-4 text-[#17A2B8]" /></div>
                <div>
                  <p className="text-xs text-[#6C757D]">Delivery Zone</p>
                  <p className="font-bold text-[#212529] text-sm capitalize">{courier.zone.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#5C2D91]/10 flex items-center justify-center"><Weight className="w-4 h-4 text-[#5C2D91]" /></div>
                <div>
                  <p className="text-xs text-[#6C757D]">Package Weight</p>
                  <p className="font-bold text-[#212529] text-sm">{courier.weight.toFixed(1)} kg</p>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#E9ECEF] flex items-center justify-between text-sm">
              <span className="text-[#6C757D]">Speed: <span className="font-semibold text-[#212529]">{courier.speedLabel}</span></span>
              {courier.trackingSupported ? (
                <span className="text-[#17A2B8] font-semibold flex items-center gap-1">📦 Tracking available</span>
              ) : (
                <span className="text-[#6C757D] text-xs">Merchant will contact you for delivery</span>
              )}
            </div>
            {courier.totalCharge === 0 && (
              <div className="mt-2 bg-[#28A745]/10 rounded-md p-2 text-center text-sm font-bold text-[#28A745]">🎉 You got FREE Shipping!</div>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-[#6C757D] mb-6">
          <MessageSquare className="w-4 h-4 text-[#17A2B8]" />
          SMS confirmation sent via Sparrow SMS
        </div>

        {payment === 'cod' && (
          <div className="bg-[#FFF8E1] border border-[#FFD814]/30 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="w-4 h-4 text-[#FF6600]" />
              <p className="text-sm font-bold text-[#212529]">Cash on Delivery Instructions</p>
            </div>
            <ul className="text-xs text-[#6C757D] space-y-1 ml-6 list-disc">
              <li>Keep exact change of {formatNPR(total)} ready</li>
              <li>Delivery agent will call before arriving</li>
              <li>Inspect your order before paying</li>
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/products" className="bg-[#FF6600] hover:bg-[#e65c00] text-white font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2"><Package className="w-4 h-4" /> Continue Shopping</Link>
          <Link to="/" className="border border-[#DEE2E6] text-[#212529] font-bold px-6 py-3 rounded-lg">Back to Home</Link>
        </div>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
