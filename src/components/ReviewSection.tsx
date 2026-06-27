import { Star } from 'lucide-react';
import { useState } from 'react';

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  images: string[];
  created_at: string;
}

export default function ReviewSection({ reviews, avgRating, reviewCount }: { reviews: Review[]; avgRating: number; reviewCount: number }) {
  const [showAll, setShowAll] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'fill-[#FFD814] text-[#FFD814]' : 'text-[#DEE2E6]'}`} />
      ))}
    </div>
  );

  if (reviews.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-[#6C757D]">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#E9ECEF]">
        <div className="text-center">
          <p className="text-3xl font-extrabold text-[#212529]">{avgRating.toFixed(1)}</p>
          {renderStars(Math.round(avgRating))}
          <p className="text-xs text-[#6C757D] mt-1">{reviewCount} reviews</p>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {visibleReviews.map(review => (
          <div key={review.id} className="border-b border-[#E9ECEF] pb-4 last:border-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-[#FF6600]/10 flex items-center justify-center text-sm font-bold text-[#FF6600]">
                {review.customer_name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#212529]">{review.customer_name}</p>
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                  <span className="text-[10px] text-[#6C757D]">{new Date(review.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kathmandu' })}</span>
                </div>
              </div>
            </div>
            {review.comment && <p className="text-sm text-[#6C757D] mt-2 ml-10">{review.comment}</p>}
            {/* Review images */}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mt-2 ml-10">
                {review.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(img)} className="w-16 h-16 rounded-lg overflow-hidden border border-[#E9ECEF] hover:ring-2 hover:ring-[#FF6600] transition-all">
                    <img src={img} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {reviews.length > 3 && (
        <button onClick={() => setShowAll(!showAll)} className="text-sm text-[#17A2B8] font-semibold mt-4 hover:underline">
          {showAll ? 'Show less' : `See all ${reviews.length} reviews`}
        </button>
      )}

      {/* Image lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} className="max-w-full max-h-full rounded-lg" />
          <button className="absolute top-4 right-4 text-white text-2xl">✕</button>
        </div>
      )}
    </div>
  );
}
