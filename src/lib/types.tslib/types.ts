export interface Store {
  id: string;
  name: string;
  subdomain: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  owner_email: string;
  owner_name: string;
  owner_phone: string;
  plan: 'free' | 'starter' | 'growth' | 'premium';
  status: 'active' | 'suspended' | 'pending';
  primary_color: string | null;
  province: string | null;
  district: string | null;
  municipality: string | null;
  ward: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  mrp: number | null;
  image_url: string;
  category: string;
  stock: number;
  sku: string | null;
  rating: number | null;
  reviews_count: number | null;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  qty: number;
  image_url: string;
}

export interface Order {
  id: string;
  store_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  payment_method: 'esewa' | 'khalti' | 'fonepay' | 'imepay' | 'cod';
  payment_status: 'pending' | 'paid' | 'failed';
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  province: string;
  district: string;
  municipality: string;
  ward: string;
  address_line: string;
  coupon_code: string | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  store_id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  store_id: string;
  plan: 'free' | 'starter' | 'growth' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  started_at: string;
  renews_at: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export const PLANS = {
  free: { name: 'Free', price: 0, products: 10, commission: 2, features: ['Up to 10 products', '2% commission', 'Cash on Delivery', 'Basic analytics'] },
  starter: { name: 'Starter', price: 999, products: 100, commission: 2, features: ['Up to 100 products', '2% commission', 'All payment gateways', 'Custom subdomain', 'Email support'] },
  growth: { name: 'Growth', price: 2499, products: 1000, commission: 2, features: ['Up to 1,000 products', '2% commission', 'All payment gateways', 'Drag-drop builder', 'Coupons & discounts', 'Priority support'] },
  premium: { name: 'Premium', price: 4999, products: 99999, commission: 2, features: ['Unlimited products', '2% commission', 'All payment gateways', 'Drag-drop builder', 'Coupons & discounts', 'SMS notifications', 'Dedicated manager', 'Custom domain'] },
};

export const PROVINCES = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];

export const PAYMENT_GATEWAYS = [
  { id: 'cod', name: 'Cash on Delivery', icon: '💵', description: 'Pay when you receive', color: '#28A745' },
  { id: 'esewa', name: 'eSewa', icon: '🟢', description: 'Pay via eSewa wallet', color: '#60BB46' },
  { id: 'khalti', name: 'Khalti', icon: '🟣', description: 'Pay via Khalti wallet', color: '#5C2D91' },
  { id: 'fonepay', name: 'FonePay', icon: '🔵', description: 'Pay via FonePay', color: '#1E88E5' },
  { id: 'imepay', name: 'IME Pay', icon: '🟠', description: 'Pay via IME Pay', color: '#FF6600' },
];

export const formatNPR = (amount: number) => `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const getNepalTime = () => {
  const now = new Date();
  // UTC+5:45
  const offset = 5.75 * 60 * 60 * 1000;
  return new Date(now.getTime() + offset);
};
