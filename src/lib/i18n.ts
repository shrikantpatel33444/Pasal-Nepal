// Bilingual Dashboard i18n (English + Nepali)
// Basic Nepali translations for merchant dashboard

export type Lang = 'en' | 'np';

export const translations = {
  // Navigation
  overview: { en: 'Overview', np: 'सिंहावलोकन' },
  products: { en: 'Products', np: 'उत्पादनहरू' },
  orders: { en: 'Orders', np: 'अर्डरहरू' },
  coupons: { en: 'Coupons', np: 'कुपनहरू' },
  compliance: { en: 'IRD Compliance', np: 'आईआरडी अनुपालन' },
  appearance: { en: 'Store Builder', np: 'स्टोर बिल्डर' },
  subscription: { en: 'Subscription', np: 'सदस्यता' },
  payouts: { en: 'Payouts', np: 'भुक्तानी' },
  offline_orders: { en: 'Offline Orders', np: 'अफलाइन अर्डर' },
  settings: { en: 'Settings', np: 'सेटिङ्स' },

  // Overview
  welcome_back: { en: 'Welcome back', np: 'स्वागत छ' },
  store_performance: { en: "Here's your store performance", np: 'तपाईंको स्टोरको प्रदर्शन' },
  total_revenue: { en: 'Total Revenue', np: 'कुल आम्दानी' },
  total_orders: { en: 'Total Orders', np: 'कुल अर्डर' },
  pending_orders: { en: 'Pending Orders', np: 'बाँकी अर्डर' },
  recent_orders: { en: 'Recent Orders', np: 'हालैका अर्डर' },
  no_orders_yet: { en: 'No orders yet', np: 'अहिलेसम्म अर्डर छैन' },
  store_is_live: { en: 'Your store is live', np: 'तपाईंको स्टोर खुला छ' },

  // Products
  add_product: { en: 'Add Product', np: 'उत्पादन थप्नुहोस्' },
  edit_product: { en: 'Edit Product', np: 'उत्पादन सम्पादन' },
  product_name: { en: 'Product Name', np: 'उत्पादनको नाम' },
  price: { en: 'Price', np: 'मूल्य' },
  stock: { en: 'Stock', np: 'स्टक' },
  category: { en: 'Category', np: 'वर्ग' },
  description: { en: 'Description', np: 'विवरण' },
  no_products: { en: 'No products yet. Add your first product!', np: 'अहिलेसम्म उत्पादन छैन। पहिलो थप्नुहोस्!' },

  // Orders
  customer: { en: 'Customer', np: 'ग्राहक' },
  delivery_address: { en: 'Delivery Address', np: 'डेलिभरी ठेगाना' },
  items: { en: 'Items', np: 'वस्तुहरू' },
  payment: { en: 'Payment', np: 'भुक्तानी' },
  status: { en: 'Status', np: 'स्थिति' },
  invoice: { en: 'Invoice', np: 'बिल' },
  pending: { en: 'Pending', np: 'बाँकी' },
  confirmed: { en: 'Confirmed', np: 'पुष्टि भयो' },
  shipped: { en: 'Shipped', np: 'पठाइयो' },
  delivered: { en: 'Delivered', np: 'बुझाइयो' },
  cancelled: { en: 'Cancelled', np: 'रद्द' },

  // Offline Orders
  offline_order_desc: { en: 'Add orders from Facebook, Instagram, or phone calls', np: 'फेसबुक, इन्स्टाग्राम वा फोनबाट अर्डर थप्नुहोस्' },
  add_offline_order: { en: 'Add Manual Order', np: 'म्यानुअल अर्डर थप्नुहोस्' },
  customer_name: { en: 'Customer Name', np: 'ग्राहकको नाम' },
  customer_phone: { en: 'Phone Number', np: 'फोन नम्बर' },
  select_product: { en: 'Select Product', np: 'उत्पादन छान्नुहोस्' },
  quantity: { en: 'Quantity', np: 'परिमाण' },
  order_source: { en: 'Order Source', np: 'अर्डर स्रोत' },

  // Payouts
  bank_account: { en: 'Bank Account', np: 'बैंक खाता' },
  available_balance: { en: 'Available Balance', np: 'उपलब्ध ब्यालेन्स' },
  request_payout: { en: 'Request Payout', np: 'भुक्तानी अनुरोध' },
  payout_history: { en: 'Payout History', np: 'भुक्तानी इतिहास' },
  select_bank: { en: 'Select Bank', np: 'बैंक छान्नुहोस्' },
  account_number: { en: 'Account Number', np: 'खाता नम्बर' },
  account_name: { en: 'Account Holder Name', np: 'खाता धनीको नाम' },

  // Common
  save: { en: 'Save', np: 'सेभ' },
  cancel: { en: 'Cancel', np: 'रद्द' },
  delete: { en: 'Delete', np: 'मेटाउनुहोस्' },
  loading: { en: 'Loading...', np: 'लोड हुँदै...' },
  sign_out: { en: 'Sign out', np: 'साइन आउट' },
  view_store: { en: 'View store', np: 'स्टोर हेर्नुहोस्' },
  current_plan: { en: 'Current Plan', np: 'हालको योजना' },
  manage: { en: 'Manage', np: 'व्यवस्थापन' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry.en;
}

// Nepal commercial banks by class
export const NEPAL_BANKS = {
  class_a: [
    { code: 'NABIL', name: 'Nabil Bank', nameNp: 'नबिल बैंक' },
    { code: 'NICAsia', name: 'NIC Asia Bank', nameNp: 'एनआईसी एशिया बैंक' },
    { code: 'GlobalIME', name: 'Global IME Bank', nameNp: 'ग्लोबल आईएमई बैंक' },
    { code: 'NMB', name: 'NMB Bank', nameNp: 'एनएमबी बैंक' },
    { code: 'Everest', name: 'Everest Bank', nameNp: 'एभरेष्ट बैंक' },
    { code: 'Prabhu', name: 'Prabhu Bank', nameNp: 'प्रभु बैंक' },
    { code: 'NepalBank', name: 'Nepal Bank Ltd.', nameNp: 'नेपाल बैंक लिमिटेड' },
    { code: 'RBB', name: 'Rastriya Banijya Bank', nameNp: 'राष्ट्रिय वाणिज्य बैंक' },
    { code: 'Himalayan', name: 'Himalayan Bank', nameNp: 'हिमालयन बैंक' },
    { code: 'StandardChartered', name: 'Standard Chartered Bank', nameNp: 'स्ट्यान्डर्ड चार्टर्ड बैंक' },
    { code: 'NepalSBI', name: 'Nepal SBI Bank', nameNp: 'नेपाल एसबीआई बैंक' },
    { code: 'Mega', name: 'Mega Bank', nameNp: 'मेगा बैंक' },
  ],
  class_b: [
    { code: 'Kamana', name: 'Kamana Bikas Bank', nameNp: 'कमना विकास बैंक' },
    { code: 'Miteri', name: 'Miteri Dev Bank', nameNp: 'मितेरी विकास बैंक' },
    { code: 'Sindhu', name: 'Sindhu Bikas Bank', nameNp: 'सिन्धु विकास बैंक' },
    { code: 'Sahara', name: 'Sahara Bikas Bank', nameNp: 'सहारा विकास बैंक' },
  ],
  class_c: [
    { code: 'Jyoti', name: 'Jyoti Mahila Bikas Bank', nameNp: 'ज्योति महिला विकास बैंक' },
    { code: 'NepalInfrastructure', name: 'Nepal Infrastructure Bank', nameNp: 'नेपाल पूर्वाधार बैंक' },
  ],
};

export const ALL_BANKS = [
  ...NEPAL_BANKS.class_a.map(b => ({ ...b, class: 'A' })),
  ...NEPAL_BANKS.class_b.map(b => ({ ...b, class: 'B' })),
  ...NEPAL_BANKS.class_c.map(b => ({ ...b, class: 'C' })),
];

// SMS Gateway providers
export const SMS_PROVIDERS = [
  { id: 'sparrow', name: 'Sparrow SMS', nameNp: 'स्पैरो एसएमएस', description: 'Most popular SMS gateway in Nepal', color: '#17A2B8' },
  { id: 'aakash', name: 'Aakash SMS', nameNp: 'आकाश एसएमएस', description: 'Affordable bulk SMS for businesses', color: '#5C2D91' },
];

// Order sources for offline entry
export const ORDER_SOURCES = [
  { id: 'facebook', label: 'Facebook', icon: '📘', color: '#1877F2' },
  { id: 'instagram', label: 'Instagram', icon: '📷', color: '#E4405F' },
  { id: 'phone', label: 'Phone Call', icon: '📞', color: '#28A745' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬', color: '#25D366' },
  { id: 'walk_in', label: 'Walk-in Customer', icon: '🚶', color: '#FF6600' },
  { id: 'other', label: 'Other', icon: '📌', color: '#6C757D' },
];
