// Nepal Payment Gateway Configuration
// All amounts in NPR (Nepalese Rupee). Khalti uses paisa (NPR * 100).

export type PaymentGatewayId =
  | 'cod' | 'esewa' | 'khalti' | 'fonepay' | 'connectips' | 'imepay' | 'sct';

export interface PaymentGateway {
  id: PaymentGatewayId;
  name: string;
  nameNp: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  descriptionNp: string;
  category: 'wallet' | 'bank' | 'card' | 'cash';
  requiresLogin: boolean;
  supportsQR: boolean;
  badge?: string;
  processingTime: string;
  feePercent: number;
  minAmount: number;
  maxAmount: number;
}

export const PAYMENT_GATEWAYS: PaymentGateway[] = [
  {
    id: 'cod',
    name: 'Cash on Delivery',
    nameNp: 'क्याश अन डेलिभरी',
    icon: '💵',
    color: '#28A745',
    bgColor: '#28A74515',
    description: 'Pay in cash when your order arrives at your door',
    descriptionNp: 'सामान बुझेपछि नगद तिर्नुहोस्',
    category: 'cash',
    requiresLogin: false,
    supportsQR: false,
    badge: 'MOST POPULAR',
    processingTime: 'On delivery',
    feePercent: 0,
    minAmount: 0,
    maxAmount: 100000,
  },
  {
    id: 'esewa',
    name: 'eSewa',
    nameNp: 'ई-सेवा',
    icon: '🟢',
    color: '#60BB46',
    bgColor: '#60BB4615',
    description: 'Nepal\'s largest digital wallet — pay instantly',
    descriptionNp: 'नेपालको सबैभन्दा ठूलो डिजिटल वालेट',
    category: 'wallet',
    requiresLogin: true,
    supportsQR: false,
    badge: 'WALLET',
    processingTime: 'Instant',
    feePercent: 0,
    minAmount: 10,
    maxAmount: 100000,
  },
  {
    id: 'khalti',
    name: 'Khalti',
    nameNp: 'खल्ती',
    icon: '🟣',
    color: '#5C2D91',
    bgColor: '#5C2D9115',
    description: 'Mobile banking & wallet — pay via Khalti app or web',
    descriptionNp: 'मोबाइल बैंकिङ र वालेट',
    category: 'wallet',
    requiresLogin: true,
    supportsQR: true,
    badge: 'WALLET',
    processingTime: 'Instant',
    feePercent: 0,
    minAmount: 10,
    maxAmount: 200000,
  },
  {
    id: 'fonepay',
    name: 'FonePay',
    nameNp: 'फोनपे',
    icon: '📲',
    color: '#1E88E5',
    bgColor: '#1E88E515',
    description: 'Scan QR & pay from any Nepal bank mobile app',
    descriptionNp: 'QR स्क्यान गरेर तिर्नुहोस्',
    category: 'bank',
    requiresLogin: false,
    supportsQR: true,
    badge: 'QR PAY',
    processingTime: 'Instant',
    feePercent: 0,
    minAmount: 1,
    maxAmount: 500000,
  },
  {
    id: 'connectips',
    name: 'ConnectIPS',
    nameNp: 'कनेक्ट आईपीएस',
    icon: '🏦',
    color: '#00897B',
    bgColor: '#00897B15',
    description: 'Direct bank-to-bank transfer for large transactions',
    descriptionNp: 'ठूला लेनदेनको लागि बैंक ट्रान्सफर',
    category: 'bank',
    requiresLogin: true,
    supportsQR: false,
    badge: 'BANK',
    processingTime: '1-2 hours',
    feePercent: 0,
    minAmount: 100,
    maxAmount: 1000000,
  },
  {
    id: 'imepay',
    name: 'IME Pay',
    nameNp: 'आईएमई पे',
    icon: '🟠',
    color: '#FF6600',
    bgColor: '#FF660015',
    description: 'Popular wallet for rural & semi-urban Nepal',
    descriptionNp: 'ग्रामिण क्षेत्रको लागि लोकप्रिय',
    category: 'wallet',
    requiresLogin: true,
    supportsQR: true,
    badge: 'WALLET',
    processingTime: 'Instant',
    feePercent: 0,
    minAmount: 10,
    maxAmount: 100000,
  },
  {
    id: 'sct',
    name: 'SCT Card',
    nameNp: 'एससीटी कार्ड',
    icon: '💳',
    color: '#E91E63',
    bgColor: '#E91E6315',
    description: 'Pay with local Nepali debit/credit cards (SmartChoice)',
    descriptionNp: 'नेपाली डेबिट/क्रेडिट कार्ड',
    category: 'card',
    requiresLogin: false,
    supportsQR: false,
    badge: 'CARD',
    processingTime: 'Instant',
    feePercent: 1.5,
    minAmount: 10,
    maxAmount: 500000,
  },
];

export const getGateway = (id: string) => PAYMENT_GATEWAYS.find(g => g.id === id);

// Convert NPR to paisa (for Khalti)
export const nprToPaisa = (npr: number) => Math.round(npr * 100);

// Format NPR with Nepali Rupee symbol
export const formatNPR = (amount: number) =>
  `रू ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

// Format NPR with Rs. prefix (alternative)
export const formatRs = (amount: number) =>
  `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

// Nepal provinces for address
export const PROVINCES = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];

// Nepal phone validation (10 digits, starts with 97/98)
export const isValidNepalPhone = (phone: string) => /^9[7-8]\d{8}$/.test(phone);

// Generate FonePay QR payload (simulated)
export const generateFonePayPayload = (merchantId: string, amount: number, refId: string) => {
  // Real FonePay uses a specific QR format; this simulates the payload
  return JSON.stringify({
    type: 'fonepay',
    merchantId,
    amount: amount.toString(),
    refId,
    currency: 'NPR',
    timestamp: new Date().toISOString(),
  });
};
