import { useState, useRef } from 'react';
import { Star, Camera, X, Loader2, Check } from 'lucide-react';
import { Product } from '../lib/types';

export default function ReviewForm({ product, onClose, onSubmitted }: { product: Product; onClose: () => void; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).slice(0, 4).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          store_id: product.store_id,
          customer_name: name,
          rating,
          comment,
          images,
        }),
      });
      setSuccess(true);
      setTimeout(() => { onSubmitted(); onClose(); }, 1500);
    } catch {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[#28A745]/10 flex items-center justify-center mx-auto mb-3">
            <Check className="w-8 h-8 text-[#28A745]" />
          </div>
          <h3 className="text-lg font-bold text-[#212529]">Review Submitted!</h3>
          <p className="text-sm text-[#6C757D] mt-1">Thank you for your feedback 🙏</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[#E9ECEF] sticky top-0 bg-white">
          <h2 className="font-bold text-[#212529]">Write a Review</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-[#6C757D]" /></button>
        </div>
        <form onSubmit={submit} className="p-4 space-y-4">
          {/* Rating */}
          <div>
            <label className="text-xs font-semibold text-[#6C757D] block mb-2">Your Rating *</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i)}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${i <= (hoverRating || rating) ? 'fill-[#FFD814] text-[#FFD814]' : 'text-[#DEE2E6]'}`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && <p className="text-xs text-[#6C757D] mt-1">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</p>}
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-[#6C757D]">Your Name *</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="Ram Bahadur" />
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs font-semibold text-[#6C757D]">Your Review</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full px-3 py-2 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="Share your experience with this product..." />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="text-xs font-semibold text-[#6C757D] block mb-2">Add Photos (up to 4)</label>
            <div className="flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#E9ECEF]">
                  <img src={img} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white text-xs">✕</button>
                </div>
              ))}
              {images.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-[#DEE2E6] rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[#FF6600] transition-colors"
                >
                  <Camera className="w-5 h-5 text-[#ADB5BD]" />
                  <span className="text-[9px] text-[#6C757D]">Add Photo</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            <p className="text-[10px] text-[#6C757D] mt-1">💡 Real photos from Nepali customers build trust!</p>
          </div>

          <button type="submit" disabled={submitting || rating === 0 || !name.trim()} className="w-full bg-[#FF6600] hover:bg-[#e65c00] disabled:opacity-60 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
