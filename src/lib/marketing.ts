// Nepal Festivals & Marketing Configuration

export interface Festival {
  id: string;
  name: string;
  nameNp: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  defaultDiscount: number;
  bannerText: string;
  bannerTextNp: string;
  month: string; // Approximate month
}

export const FESTIVALS: Festival[] = [
  {
    id: 'dashain',
    name: 'Dashain',
    nameNp: 'दशैं',
    emoji: '🪁',
    color: '#DC3545',
    bgColor: '#DC354515',
    description: 'Nepal\'s biggest festival — 15 days of celebration',
    defaultDiscount: 25,
    bannerText: 'Dashain Mega Sale — Up to 25% OFF!',
    bannerTextNp: 'दशैं मेगा सेल — २५% सम्म छुट!',
    month: 'October',
  },
  {
    id: 'tihar',
    name: 'Tihar',
    nameNp: 'तिहार',
    emoji: '🪔',
    color: '#FFD814',
    bgColor: '#FFD81415',
    description: 'Festival of lights — 5 days of joy',
    defaultDiscount: 20,
    bannerText: 'Tihar Festival of Lights Sale — 20% OFF!',
    bannerTextNp: 'तिहार पर्व छुट — २०% छुट!',
    month: 'November',
  },
  {
    id: 'nepali_new_year',
    name: 'Nepali New Year',
    nameNp: 'नयाँ वर्ष',
    emoji: '🎉',
    color: '#FF6600',
    bgColor: '#FF660015',
    description: 'Bikram Sambat New Year celebration',
    defaultDiscount: 15,
    bannerText: 'New Year, New Deals — 15% OFF Everything!',
    bannerTextNp: 'नयाँ वर्ष, नयाँ समान — १५% छुट!',
    month: 'April',
  },
  {
    id: 'chhath',
    name: 'Chhath Puja',
    nameNp: 'छठ पूजा',
    emoji: '🌅',
    color: '#FF6600',
    bgColor: '#FF660015',
    description: 'Festival dedicated to Sun God',
    defaultDiscount: 15,
    bannerText: 'Chhath Special — 15% OFF!',
    bannerTextNp: 'छठ विशेष — १५% छुट!',
    month: 'November',
  },
  {
    id: 'holi',
    name: 'Holi',
    nameNp: 'होली',
    emoji: '🎨',
    color: '#E91E63',
    bgColor: '#E91E6315',
    description: 'Festival of colors',
    defaultDiscount: 20,
    bannerText: 'Holi Color Sale — 20% OFF!',
    bannerTextNp: 'होली रंग सेल — २०% छुट!',
    month: 'March',
  },
  {
    id: 'buddha_jayanti',
    name: 'Buddha Jayanti',
    nameNp: 'बुद्ध जयन्ती',
    emoji: '🪷',
    color: '#28A745',
    bgColor: '#28A74515',
    description: 'Birth anniversary of Lord Buddha',
    defaultDiscount: 10,
    bannerText: 'Buddha Jayanti Special — 10% OFF!',
    bannerTextNp: 'बुद्ध जयन्ती विशेष — १०% छुट!',
    month: 'May',
  },
];

export const SOCIAL_PLATFORMS = [
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: '#25D366', shareUrl: 'https://wa.me/?text=' },
  { id: 'viber', name: 'Viber', icon: '📞', color: '#7360F2', shareUrl: 'viber://forward?text=' },
  { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2', shareUrl: 'https://www.facebook.com/sharer/sharer.php?u=' },
  { id: 'messenger', name: 'Messenger', icon: '💬', color: '#0084FF', shareUrl: 'https://m.me/sharer?u=' },
  { id: 'instagram', name: 'Instagram', icon: '📸', color: '#E4405F', shareUrl: '' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000', shareUrl: '' },
];

export const INFLUENCER_PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'youtube', name: 'YouTube', icon: '▶️' },
  { id: 'facebook', name: 'Facebook', icon: '📘' },
  { id: 'other', name: 'Other', icon: '⭐' },
];

export const TIERED_DISCOUNT_TYPES = [
  { id: 'bogo', name: 'Buy 1 Get 1 Free', description: 'Customer buys one, gets one free', icon: '🎁' },
  { id: 'bulk', name: 'Bulk Discount', description: 'Buy more, save more (e.g., 3+ items = 10% off)', icon: '📦' },
  { id: 'tiered', name: 'Tiered Pricing', description: 'Different prices for different quantities', icon: '📊' },
];

// Generate a unique reward code for social sharing
export function generateRewardCode(storeSubdomain: string): string {
  const prefix = storeSubdomain.toUpperCase().slice(0, 4);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-SHARE-${rand}`;
}

// Countdown timer helper
export function getDaysUntil(targetDate: string): number {
  const target = new Date(targetDate).getTime();
  const now = new Date().getTime();
  return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
}

export const formatNPR = (amount: number) =>
  `रू ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
