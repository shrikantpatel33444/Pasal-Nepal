import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

export default function EmptyState({ title, message, actionLabel, actionTo }: { title: string; message: string; actionLabel?: string; actionTo?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
      <div className="w-16 h-16 rounded-full bg-[#F8F9FA] flex items-center justify-center">
        <Package className="w-8 h-8 text-[#ADB5BD]" />
      </div>
      <h3 className="text-lg font-bold text-[#212529]">{title}</h3>
      <p className="text-sm text-[#6C757D] max-w-sm">{message}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="mt-2 bg-[#FF6600] hover:bg-[#e65c00] text-white text-sm font-bold px-5 py-2.5 rounded-md transition-colors">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
