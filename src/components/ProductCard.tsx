import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product, formatNPR } from '../lib/types';
import { useCart } from '../contexts/CartContext';
import { useState, useEffect } from 'react';
import { isLowDataMode, getOptimizedImageUrl } from '../lib/imageOptimization';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [wished, setWished] = useState(false);
  const [lowData, setLowData] = useState(false);

  useEffect(() => { setLowData(isLowDataMode()); }, []);

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;
  const outOfStock = product.stock <= 0;
  const imgUrl = getOptimizedImageUrl(product.image_url, lowData ? 300 : 500);

  return (
    <div className="group bg-white rounded-md border border-[#E9ECEF] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      <Link to={`/product/${product.id}`} className="relative block aspect-square bg-white overflow-hidden">
        <img
          src={imgUrl}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${lowData ? '' : ''}`}
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-[#28A745] text-white text-[11px] font-bold px-2 py-0.5 rounded">-{discount}%</span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-[#DC3545] text-white text-xs font-bold px-3 py-1 rounded">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <Link to={`/product/${product.id}`} className="text-[#000000] font-medium text-sm leading-snug line-clamp-2 hover:text-[#FF6600] transition-colors">
          {product.name}
        </Link>

        {product.rating != null && (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[#FFD814] text-[#FFD814]" />
            <span className="text-xs font-semibold text-[#212529]">{Number(product.rating).toFixed(1)}</span>
            <span className="text-xs text-[#6C757D]">({product.reviews_count || 0})</span>
          </div>
        )}

        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-lg font-bold text-[#000000]">{formatNPR(Number(product.price))}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-xs text-[#6C757D] line-through">{formatNPR(Number(product.mrp))}</span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => addToCart(product)}
            disabled={outOfStock}
            className="flex-1 bg-[#FF6600] hover:bg-[#e65c00] disabled:bg-[#DEE2E6] disabled:cursor-not-allowed text-white text-xs font-bold py-2 rounded-md flex items-center justify-center gap-1 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add to Cart
          </button>
          <button
            onClick={() => setWished(!wished)}
            className={`p-2 rounded-md border ${wished ? 'border-[#DC3545] text-[#DC3545]' : 'border-[#DEE2E6] text-[#6C757D] hover:border-[#DC3545] hover:text-[#DC3545]'} transition-colors`}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${wished ? 'fill-[#DC3545]' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
