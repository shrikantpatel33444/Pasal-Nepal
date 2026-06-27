import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, RotateCcw, CreditCard, Truck, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';

export default function ReturnRefundPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <Link to="/" className="text-sm text-[#17A2B8] font-semibold flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Back to home</Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#FF6600]/10 flex items-center justify-center"><Shield className="w-6 h-6 text-[#FF6600]" /></div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#212529]">Return & Refund Policy</h1>
            <p className="text-sm text-[#6C757D]">In compliance with Nepal Consumer Protection Act</p>
          </div>
        </div>

        <div className="bg-[#28A745]/5 border border-[#28A745]/20 rounded-lg p-4 mb-6 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#28A745] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#212529]">Your Rights are Protected</p>
            <p className="text-xs text-[#6C757D] mt-1">This policy complies with the Consumer Protection Act, 2075 (2018) of Nepal and the E-Commerce Guidelines issued by the Government of Nepal.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Return Window */}
          <section className="bg-white border border-[#E9ECEF] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="w-5 h-5 text-[#17A2B8]" />
              <h2 className="font-bold text-[#212529]">1. Return Window</h2>
            </div>
            <ul className="space-y-2 text-sm text-[#6C757D] ml-7 list-disc">
              <li>Customers may return products within <strong className="text-[#212529]">7 days</strong> of delivery for most items.</li>
              <li>Electronics and appliances: <strong className="text-[#212529]">3 days</strong> return window with original packaging.</li>
              <li>Perishable goods (groceries, food items): <strong className="text-[#212529]">No return</strong> unless damaged or expired upon delivery.</li>
              <li>Custom-made or personalized items: <strong className="text-[#212529]">No return</strong> unless defective.</li>
            </ul>
          </section>

          {/* Return Conditions */}
          <section className="bg-white border border-[#E9ECEF] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-[#28A745]" />
              <h2 className="font-bold text-[#212529]">2. Return Conditions</h2>
            </div>
            <ul className="space-y-2 text-sm text-[#6C757D] ml-7 list-disc">
              <li>Product must be unused, unwashed, and in original condition with all tags attached.</li>
              <li>Original packaging, manuals, and accessories must be included.</li>
              <li>Proof of purchase (invoice/receipt) must be presented.</li>
              <li>Product should not be damaged due to customer misuse.</li>
            </ul>
          </section>

          {/* Refund Process */}
          <section className="bg-white border border-[#E9ECEF] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-[#FF6600]" />
              <h2 className="font-bold text-[#212529]">3. Refund Process</h2>
            </div>
            <ul className="space-y-2 text-sm text-[#6C757D] ml-7 list-disc">
              <li>Refunds are processed within <strong className="text-[#212529]">7-10 business days</strong> after the returned product is received and inspected.</li>
              <li><strong className="text-[#212529]">Digital wallets</strong> (eSewa, Khalti, IME Pay): Refund credited to the original wallet within 3-5 business days.</li>
              <li><strong className="text-[#212529]">Bank transfer</strong> (ConnectIPS, FonePay): Refund to original bank account within 7-10 business days.</li>
              <li><strong className="text-[#212529]">Cash on Delivery</strong>: Refund via bank transfer or store credit within 10 business days.</li>
              <li><strong className="text-[#212529]">SCT Card</strong>: Refund to original card within 10-14 business days.</li>
            </ul>
          </section>

          {/* Exchange Policy */}
          <section className="bg-white border border-[#E9ECEF] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-5 h-5 text-[#1E88E5]" />
              <h2 className="font-bold text-[#212529]">4. Exchange Policy</h2>
            </div>
            <ul className="space-y-2 text-sm text-[#6C757D] ml-7 list-disc">
              <li>Size/color exchanges are available within <strong className="text-[#212529]">7 days</strong> of delivery.</li>
              <li>Customer bears the return shipping cost for exchanges.</li>
              <li>Exchange subject to product availability.</li>
              <li>Price difference will be charged or refunded accordingly.</li>
            </ul>
          </section>

          {/* Non-Returnable Items */}
          <section className="bg-white border border-[#E9ECEF] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-[#DC3545]" />
              <h2 className="font-bold text-[#212529]">5. Non-Returnable Items</h2>
            </div>
            <ul className="space-y-2 text-sm text-[#6C757D] ml-7 list-disc">
              <li>Innerwear, swimwear, and personal care items (hygiene reasons)</li>
              <li>Perishable goods (fruits, vegetables, dairy, meat)</li>
              <li>Opened cosmetics and beauty products</li>
              <li>Digital products and gift cards</li>
              <li>Custom-made or engraved products</li>
            </ul>
          </section>

          {/* Damaged/Defective */}
          <section className="bg-white border border-[#E9ECEF] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-[#FF6600]" />
              <h2 className="font-bold text-[#212529]">6. Damaged or Defective Products</h2>
            </div>
            <ul className="space-y-2 text-sm text-[#6C757D] ml-7 list-disc">
              <li>If you receive a damaged or defective product, contact us within <strong className="text-[#212529]">48 hours</strong> of delivery.</li>
              <li>Provide photos/videos of the damaged product and packaging.</li>
              <li>Full refund or replacement will be provided at no extra cost.</li>
              <li>Return shipping for defective items is borne by the seller.</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="bg-[#0F1B3D] text-white rounded-lg p-5">
            <h2 className="font-bold mb-3 flex items-center gap-2"><Clock className="w-5 h-5 text-[#FF6600]" /> How to Request a Return/Refund</h2>
            <ol className="space-y-2 text-sm text-white/70 ml-7 list-decimal">
              <li>Log into your account and go to <strong className="text-white">My Orders</strong></li>
              <li>Select the order and click <strong className="text-white">Request Return</strong></li>
              <li>Choose return reason and upload product photos (if damaged)</li>
              <li>Our team will review and approve within <strong className="text-white">24-48 hours</strong></li>
              <li>Ship the product to the merchant's address (we'll provide details)</li>
              <li>Refund processed after product inspection</li>
            </ol>
            <div className="mt-4 pt-4 border-t border-white/10 text-sm">
              <p className="text-white/60">For return queries, contact:</p>
              <p className="text-white font-semibold mt-1">📞 Pasal Nepal Support: 980-XXXXXXX</p>
              <p className="text-white font-semibold">✉️ support@pasalnepal.com</p>
            </div>
          </section>
        </div>

        <div className="mt-6 bg-[#F8F9FA] rounded-lg p-4 text-center">
          <p className="text-xs text-[#6C757D]">This policy is governed by the Consumer Protection Act, 2075 (2018) of Nepal and the E-Commerce Operation Guidelines, 2079 (2023) issued by the Department of Commerce, Supplies and Consumer Protection.</p>
        </div>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
