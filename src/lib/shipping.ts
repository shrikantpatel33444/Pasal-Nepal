// Nepal Logistics & Shipping System
// Couriers: Nepal Can Move (NCM), Pathao Cargo, Upaya CityCargo, Merchant Self-Delivery
// Rate zones: Inside Valley (Kathmandu, Lalitpur, Bhaktapur), Outside Valley, Terai, Hilly

export type CourierId = 'ncm' | 'pathao' | 'upaya' | 'merchant';
export type DeliveryZone = 'inside_valley' | 'outside_valley' | 'terai' | 'hilly' | 'remote';
export type DeliverySpeed = 'same_day' | 'next_day' | 'standard' | 'bulk';

export interface Courier {
  id: CourierId;
  name: string;
  nameNp: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  coverage: 'nationwide' | 'intra_city' | 'local';
  speeds: DeliverySpeed[];
  maxWeight: number; // kg
  trackingSupported: boolean;
  badge?: string;
}

export interface ShippingRate {
  courierId: CourierId;
  courierName: string;
  zone: DeliveryZone;
  speed: DeliverySpeed;
  baseRate: number;
  perKgRate: number;
  estimatedDays: string;
  available: boolean;
}

export const COURIERS: Courier[] = [
  {
    id: 'ncm',
    name: 'Nepal Can Move',
    nameNp: 'नेपाल क्यान मुभ',
    icon: '🚛',
    color: '#1E88E5',
    bgColor: '#1E88E515',
    description: 'Nationwide bulk delivery outside Kathmandu Valley',
    coverage: 'nationwide',
    speeds: ['standard', 'bulk'],
    maxWeight: 50,
    trackingSupported: true,
    badge: 'NATIONWIDE',
  },
  {
    id: 'pathao',
    name: 'Pathao Cargo',
    nameNp: 'पाठाओ कार्गो',
    icon: '🏍️',
    color: '#E91E63',
    bgColor: '#E91E6315',
    description: 'Intra-city same-day delivery in Kathmandu, Pokhara & more',
    coverage: 'intra_city',
    speeds: ['same_day', 'next_day'],
    maxWeight: 20,
    trackingSupported: true,
    badge: 'SAME DAY',
  },
  {
    id: 'upaya',
    name: 'Upaya CityCargo',
    nameNp: 'उपाया सिटीकार्गो',
    icon: '🚚',
    color: '#FF6600',
    bgColor: '#FF660015',
    description: 'City cargo for Kathmandu Valley same-day delivery',
    coverage: 'intra_city',
    speeds: ['same_day', 'next_day'],
    maxWeight: 30,
    trackingSupported: true,
    badge: 'CITY CARGO',
  },
  {
    id: 'merchant',
    name: 'Delivered by Merchant',
    nameNp: 'व्यापारीले नै डेलिभरी',
    icon: '🏪',
    color: '#28A745',
    bgColor: '#28A74515',
    description: 'Merchant delivers with their own staff (local area only)',
    coverage: 'local',
    speeds: ['same_day', 'standard'],
    maxWeight: 100,
    trackingSupported: false,
    badge: 'SELF-DELIVERY',
  },
];

// Kathmandu Valley districts
const VALLEY_DISTRICTS = ['Kathmandu', 'Lalitpur', 'Bhaktapur'];

// Terai districts (plains)
const TERAI_DISTRICTS = [
  'Jhapa', 'Morang', 'Sunsari', 'Saptari', 'Siraha', 'Dhanusha', 'Mahottari', 'Sarlahi',
  'Rautahat', 'Bara', 'Parsa', 'Rupandehi', 'Kapilvastu', 'Banke', 'Bardiya', 'Kailali',
  'Kanchanpur', 'Dhanusa', 'Nawalparasi', 'Parasi',
];

// Remote districts (hard to reach)
const REMOTE_DISTRICTS = [
  'Humla', 'Jumla', 'Mugu', 'Dolpa', 'Kalikot', 'Bajura', 'Bajhang', 'Darchula',
  'Rukum West', 'Salyan', 'Jajarkot', 'Dailekh', 'Achham', 'Doti', 'Bajhang',
];

export function getDeliveryZone(province: string, district: string): DeliveryZone {
  if (!district) return 'outside_valley';
  if (VALLEY_DISTRICTS.some(d => district.toLowerCase().includes(d.toLowerCase()))) {
    return 'inside_valley';
  }
  if (REMOTE_DISTRICTS.some(d => district.toLowerCase().includes(d.toLowerCase()))) {
    return 'remote';
  }
  if (TERAI_DISTRICTS.some(d => district.toLowerCase().includes(d.toLowerCase()))) {
    return 'terai';
  }
  return 'hilly';
}

export function getZoneLabel(zone: DeliveryZone): string {
  const labels: Record<DeliveryZone, string> = {
    inside_valley: 'Inside Kathmandu Valley',
    outside_valley: 'Outside Valley (Hill Region)',
    terai: 'Terai Region (Plains)',
    hilly: 'Hill Region',
    remote: 'Remote Area',
  };
  return labels[zone];
}

export function getSpeedLabel(speed: DeliverySpeed): string {
  const labels: Record<DeliverySpeed, string> = {
    same_day: 'Same Day Delivery',
    next_day: 'Next Day Delivery',
    standard: 'Standard (2-3 days)',
    bulk: 'Bulk (3-5 days)',
  };
  return labels[speed];
}

// Rate matrix: [zone][speed] = { baseRate, perKgRate, estimatedDays }
const RATE_MATRIX: Record<DeliveryZone, Partial<Record<DeliverySpeed, { baseRate: number; perKgRate: number; estimatedDays: string }>>> = {
  inside_valley: {
    same_day: { baseRate: 100, perKgRate: 15, estimatedDays: 'Today' },
    next_day: { baseRate: 80, perKgRate: 12, estimatedDays: 'Tomorrow' },
    standard: { baseRate: 60, perKgRate: 10, estimatedDays: '1-2 days' },
  },
  outside_valley: {
    standard: { baseRate: 150, perKgRate: 25, estimatedDays: '2-3 days' },
    bulk: { baseRate: 120, perKgRate: 20, estimatedDays: '3-5 days' },
  },
  terai: {
    standard: { baseRate: 180, perKgRate: 30, estimatedDays: '2-4 days' },
    bulk: { baseRate: 140, perKgRate: 22, estimatedDays: '3-5 days' },
  },
  hilly: {
    standard: { baseRate: 200, perKgRate: 35, estimatedDays: '3-5 days' },
    bulk: { baseRate: 160, perKgRate: 28, estimatedDays: '4-6 days' },
  },
  remote: {
    bulk: { baseRate: 350, perKgRate: 50, estimatedDays: '5-10 days' },
  },
};

// Which couriers serve which zones
const COURIER_ZONE_AVAILABILITY: Record<CourierId, DeliveryZone[]> = {
  ncm: ['outside_valley', 'terai', 'hilly', 'remote'],
  pathao: ['inside_valley'], // Pathao only in major cities
  upaya: ['inside_valley'],
  merchant: ['inside_valley', 'outside_valley', 'terai'],
};

// Merchant delivery flat rates
const MERCHANT_RATES: Record<DeliveryZone, { baseRate: number; perKgRate: number; estimatedDays: string }> = {
  inside_valley: { baseRate: 80, perKgRate: 0, estimatedDays: 'Same day' },
  outside_valley: { baseRate: 150, perKgRate: 0, estimatedDays: '2-3 days' },
  terai: { baseRate: 200, perKgRate: 0, estimatedDays: '3-4 days' },
  hilly: { baseRate: 250, perKgRate: 0, estimatedDays: '4-5 days' },
  remote: { baseRate: 400, perKgRate: 0, estimatedDays: '7-10 days' },
};

export interface ShippingQuote {
  courierId: CourierId;
  courierName: string;
  courierIcon: string;
  courierColor: string;
  zone: DeliveryZone;
  zoneLabel: string;
  speed: DeliverySpeed;
  speedLabel: string;
  baseRate: number;
  perKgRate: number;
  weight: number;
  weightCharge: number;
  totalCharge: number;
  estimatedDays: string;
  trackingSupported: boolean;
  badge?: string;
}

export function calculateShipping(
  province: string,
  district: string,
  weightKg: number,
  subtotal: number,
): ShippingQuote[] {
  const zone = getDeliveryZone(province, district);
  const quotes: ShippingQuote[] = [];
  const weight = Math.max(0.5, weightKg); // minimum 0.5 kg

  // Free shipping threshold
  const freeShipping = subtotal >= 5000;

  for (const courier of COURIERS) {
    const availableZones = COURIER_ZONE_AVAILABILITY[courier.id];
    if (!availableZones.includes(zone)) continue;

    if (courier.id === 'merchant') {
      const rate = MERCHANT_RATES[zone];
      const charge = freeShipping ? 0 : rate.baseRate;
      quotes.push({
        courierId: courier.id,
        courierName: courier.name,
        courierIcon: courier.icon,
        courierColor: courier.color,
        zone,
        zoneLabel: getZoneLabel(zone),
        speed: zone === 'inside_valley' ? 'same_day' : 'standard',
        speedLabel: zone === 'inside_valley' ? getSpeedLabel('same_day') : getSpeedLabel('standard'),
        baseRate: rate.baseRate,
        perKgRate: 0,
        weight,
        weightCharge: 0,
        totalCharge: charge,
        estimatedDays: rate.estimatedDays,
        trackingSupported: false,
        badge: courier.badge,
      });
      continue;
    }

    const zoneRates = RATE_MATRIX[zone];
    if (!zoneRates) continue;

    for (const speed of courier.speeds) {
      const rate = zoneRates[speed];
      if (!rate) continue;
      if (weight > courier.maxWeight) continue;

      const weightCharge = Math.max(0, weight - 1) * rate.perKgRate;
      const totalCharge = freeShipping ? 0 : rate.baseRate + weightCharge;

      quotes.push({
        courierId: courier.id,
        courierName: courier.name,
        courierIcon: courier.icon,
        courierColor: courier.color,
        zone,
        zoneLabel: getZoneLabel(zone),
        speed,
        speedLabel: getSpeedLabel(speed),
        baseRate: rate.baseRate,
        perKgRate: rate.perKgRate,
        weight,
        weightCharge,
        totalCharge,
        estimatedDays: rate.estimatedDays,
        trackingSupported: courier.trackingSupported,
        badge: courier.badge,
      });
    }
  }

  return quotes;
}

// Default weight estimation per product category (kg)
export const CATEGORY_WEIGHTS: Record<string, number> = {
  Electronics: 1.5,
  Fashion: 0.5,
  Groceries: 2.0,
  'Home & Living': 3.0,
  Beauty: 0.3,
  Accessories: 0.4,
};

export function estimateCartWeight(items: { product: { category: string }; qty: number }[]): number {
  return items.reduce((total, item) => {
    const unitWeight = CATEGORY_WEIGHTS[item.product.category] || 1.0;
    return total + unitWeight * item.qty;
  }, 0);
}

export const formatNPR = (amount: number) =>
  `रू ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
