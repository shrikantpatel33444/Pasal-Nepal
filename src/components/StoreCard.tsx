import { Link } from 'react-router-dom';
import { Store as StoreIcon } from 'lucide-react';
import { Store } from '../lib/types';

export default function StoreCard({ store, productCount }: { store: Store; productCount?: number }) {
  return (
    <Link to={`/store/${store.subdomain}`} className="group bg-white rounded-lg border border-[#E9ECEF] shadow-sm hover:shadow-md transition-all p-4 flex flex-col items-center text-center gap-3">
      <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ background: store.primary_color || '#0F1B3D' }}>
        {store.logo_url ? <img src={store.logo_url} alt={store.name} className="w-full h-full rounded-full object-cover" /> : store.name.charAt(0)}
      </div>
      <div>
        <h3 className="font-bold text-[#000000] text-sm group-hover:text-[#FF6600] transition-colors">{store.name}</h3>
        <p className="text-xs text-[#6C757D] mt-0.5 line-clamp-1">{store.description || 'Online store'}</p>
      </div>
      <div className="flex items-center gap-2 text-[11px]">
        <span className="bg-[#F8F9FA] text-[#6C757D] px-2 py-0.5 rounded-full capitalize">{store.plan} plan</span>
        {productCount != null && <span className="bg-[#F8F9FA] text-[#6C757D] px-2 py-0.5 rounded-full">{productCount} products</span>}
      </div>
    </Link>
  );
}
