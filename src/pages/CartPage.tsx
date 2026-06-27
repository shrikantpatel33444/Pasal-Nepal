import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Weight, Truck } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import EmptyState from '../components/EmptyState';
import { useCart } from '../contexts/CartContext';
import { CartItem, formatNPR } from '../lib/types';
import { estimateCartWeight } from '../lib/shipping';

export default function CartPage() {
  const { items, updateQty, removeFromCart, subtotal, clearCart } = useCart();
  const cartWeight = estimateCartWeight(items as any);
  const freeShippingThreshold = 5000;
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - subtotal);
  const shipping = subtotal > 0 ? (subtotal >= freeShippingThreshold ? 0 : 150) : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <h1 className="text-xl font-bold text-[#212529] mb-4">Your Cart ({items.length})</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg">
            <EmptyState title="Your cart is empty" message="Browse products from local stores and add them to your cart." actionLabel="Start Shopping" actionTo="/products" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {items.map(({ product, qty }: CartItem) => (
                <div key={product.id} className="bg-white rounded-lg p-3 flex gap-3">
                  <Link to={`/product/${product.id}`} className="w-20 h-20 rounded-md bg-[#F8F9FA] overflow-hidden shrink-0">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${product.id}`} className="text-sm font-medium text-[#000000] hover:text-[#FF6600] line-clamp-2">{product.name}</Link>
                    <p className="text-lg font-bold text-[#000000] mt-1">{formatNPR(Number(product.price))}</p>
                    {product.mrp && product.mrp > product.price && (
                      <p className="text-xs text-[#6C757D] line-through">{formatNPR(Number(product.mrp))}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-[#DEE2E6] rounded-md">
                        <button onClick={() => updateQty(product.id, qty - 1)} className="p-1.5 hover:bg-[#F8F9FA]"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="px-3 text-sm font-semibold">{qty}</span>
                        <button onClick={() => updateQty(product.id, qty + 1)} className="p-1.5 hover:bg-[#F8F9FA]"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <button onClick={() => removeFromCart(product.id)} className="text-[#DC3545] hover:text-[#a82833] p-1.5"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={clearCart} className="text-sm text-[#DC3545] font-semibold hover:underline">Clear cart</button>
            </div>

            <div className="bg-white rounded-lg p-5 h-fit lg:sticky lg:top-20">
              <h2 className="font-bold text-[#212529] mb-4">Order Summary</h2>

              {/* Free shipping progress */}
              {remainingForFreeShip > 0 ? (
                <div className="bg-[#FFF8E1] border border-[#FFD814]/30 rounded-lg p-3 mb-4">
                  <p className="text-xs text-[#6C757D] mb-1.5 flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-[#FF6600]" /> Add <strong className="text-[#FF6600]">{formatNPR(remainingForFreeShip)}</strong> more for FREE shipping!</p>
                  <div className="w-full bg-[#E9ECEF] rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#FF6600] h-full rounded-full transition-all" style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }} />
                  </div>
                </div>
              ) : (
                <div className="bg-[#28A745]/10 border border-[#28A745]/20 rounded-lg p-3 mb-4">
                  <p className="text-xs text-[#28A745] font-bold flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> 🎉 You've unlocked FREE shipping!</p>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[#6C757D]">Subtotal</span><span className="font-semibold">{formatNPR(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-[#6C757D]">Shipping (est.)</span><span className="font-semibold">{shipping === 0 ? <span className="text-[#28A745]">FREE</span> : formatNPR(shipping)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#6C757D] flex items-center gap-1"><Weight className="w-3 h-3" /> Est. Weight</span><span className="text-[#6C757D]">{cartWeight.toFixed(1)} kg</span></div>
                <div className="border-t border-[#E9ECEF] pt-2 flex justify-between text-base"><span className="font-bold">Total</span><span className="font-extrabold text-[#000000]">{formatNPR(total)}</span></div>
              </div>
              <p className="text-[10px] text-[#6C757D] mt-2 text-center">Final shipping calculated at checkout based on your location</p>
              <Link to="/checkout" className="mt-4 w-full bg-[#FF6600] hover:bg-[#e65c00] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/products" className="mt-2 w-full text-center text-sm text-[#17A2B8] font-semibold hover:underline block">Continue shopping</Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
