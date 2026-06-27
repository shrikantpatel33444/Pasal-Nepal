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
  payment_method: 'esewa' | 'khalti' | 'fonepay' | 'imepay' | 'cod' | 'connectips' | 'sct';
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

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: string;  // 'size', 'color', etc.
  variant_value: string; // 'S', 'Red', etc.
  sku: string | null;
  stock: number;
  price_adjustment: number;
  active: boolean;
  created_at: string;
}

export interface OrderStatusLog {
  id: string;
  order_id: string;
  old_status: string | null;
  new_status: string;
  note: string;
  created_at: string;
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

// Re-export payment config from payments.ts for backward compatibility
export { PAYMENT_GATEWAYS } from './payments';

// NPR currency formatter — uses Nepali Rupee symbol (रू)
export const formatNPR = (amount: number) => `रू ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
