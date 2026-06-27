import supabase from './db-client.js';

// Nepal Shipping & Logistics API
// Calculates shipping rates based on zone, weight, and courier availability

// Rate matrix mirrors the frontend logic for server-side validation
const VALLEY_DISTRICTS = ['Kathmandu', 'Lalitpur', 'Bhaktapur'];
const TERAI_DISTRICTS = ['Jhapa','Morang','Sunsari','Saptari','Siraha','Dhanusha','Mahottari','Sarlahi','Rautahat','Bara','Parsa','Rupandehi','Kapilvastu','Banke','Bardiya','Kailali','Kanchanpur','Dhanusa','Nawalparasi','Parasi'];
const REMOTE_DISTRICTS = ['Humla','Jumla','Mugu','Dolpa','Kalikot','Bajura','Bajhang','Darchula','Rukum West','Salyan','Jajarkot','Dailekh','Achham','Doti'];

function getZone(district) {
  if (!district) return 'outside_valley';
  const d = district.toLowerCase();
  if (VALLEY_DISTRICTS.some(v => d.includes(v.toLowerCase()))) return 'inside_valley';
  if (REMOTE_DISTRICTS.some(r => d.includes(r.toLowerCase()))) return 'remote';
  if (TERAI_DISTRICTS.some(t => d.includes(t.toLowerCase()))) return 'terai';
  return 'hilly';
}

const CATEGORY_WEIGHTS = { Electronics: 1.5, Fashion: 0.5, Groceries: 2.0, 'Home & Living': 3.0, Beauty: 0.3, Accessories: 0.4 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      // Return courier list and zone info
      return res.status(200).json({
        couriers: [
          { id: 'ncm', name: 'Nepal Can Move', coverage: 'nationwide' },
          { id: 'pathao', name: 'Pathao Cargo', coverage: 'intra_city' },
          { id: 'upaya', name: 'Upaya CityCargo', coverage: 'intra_city' },
          { id: 'merchant', name: 'Delivered by Merchant', coverage: 'local' },
        ],
        zones: ['inside_valley', 'outside_valley', 'terai', 'hilly', 'remote'],
      });
    }

    if (req.method === 'POST') {
      const { province, district, weight, subtotal, items } = req.body;

      // Calculate weight from items if not provided
      let weightKg = Number(weight) || 0;
      if (!weightKg && Array.isArray(items)) {
        weightKg = items.reduce((sum, item) => {
          const catWeight = CATEGORY_WEIGHTS[item.category] || 1.0;
          return sum + catWeight * (item.qty || 1);
        }, 0);
      }
      weightKg = Math.max(0.5, weightKg);

      const zone = getZone(district);
      const freeShipping = Number(subtotal) >= 5000;

      // Build quotes (mirrors frontend logic)
      const RATE_MATRIX = {
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

      const COURIER_ZONES = {
        ncm: ['outside_valley', 'terai', 'hilly', 'remote'],
        pathao: ['inside_valley'],
        upaya: ['inside_valley'],
        merchant: ['inside_valley', 'outside_valley', 'terai'],
      };

      const COURIER_SPEEDS = {
        ncm: ['standard', 'bulk'],
        pathao: ['same_day', 'next_day'],
        upaya: ['same_day', 'next_day'],
        merchant: ['same_day', 'standard'],
      };

      const COURIER_INFO = {
        ncm: { name: 'Nepal Can Move', icon: '🚛', color: '#1E88E5', badge: 'NATIONWIDE', tracking: true, maxWeight: 50 },
        pathao: { name: 'Pathao Cargo', icon: '🏍️', color: '#E91E63', badge: 'SAME DAY', tracking: true, maxWeight: 20 },
        upaya: { name: 'Upaya CityCargo', icon: '🚚', color: '#FF6600', badge: 'CITY CARGO', tracking: true, maxWeight: 30 },
        merchant: { name: 'Delivered by Merchant', icon: '🏪', color: '#28A745', badge: 'SELF-DELIVERY', tracking: false, maxWeight: 100 },
      };

      const MERCHANT_RATES = {
        inside_valley: { baseRate: 80, estimatedDays: 'Same day' },
        outside_valley: { baseRate: 150, estimatedDays: '2-3 days' },
        terai: { baseRate: 200, estimatedDays: '3-4 days' },
        hilly: { baseRate: 250, estimatedDays: '4-5 days' },
        remote: { baseRate: 400, estimatedDays: '7-10 days' },
      };

      const quotes = [];

      for (const [courierId, info] of Object.entries(COURIER_INFO)) {
        const availableZones = COURIER_ZONES[courierId];
        if (!availableZones.includes(zone)) continue;

        if (courierId === 'merchant') {
          const rate = MERCHANT_RATES[zone];
          const charge = freeShipping ? 0 : rate.baseRate;
          quotes.push({
            courierId, courierName: info.name, courierIcon: info.icon, courierColor: info.color,
            zone, zoneLabel: zone.replace(/_/g, ' '),
            speed: zone === 'inside_valley' ? 'same_day' : 'standard',
            speedLabel: zone === 'inside_valley' ? 'Same Day Delivery' : 'Standard (2-3 days)',
            baseRate: rate.baseRate, perKgRate: 0, weight: weightKg, weightCharge: 0,
            totalCharge: charge, estimatedDays: rate.estimatedDays,
            trackingSupported: false, badge: info.badge,
          });
          continue;
        }

        if (weightKg > info.maxWeight) continue;

        const zoneRates = RATE_MATRIX[zone];
        if (!zoneRates) continue;

        for (const speed of COURIER_SPEEDS[courierId]) {
          const rate = zoneRates[speed];
          if (!rate) continue;

          const weightCharge = Math.max(0, weightKg - 1) * rate.perKgRate;
          const totalCharge = freeShipping ? 0 : rate.baseRate + weightCharge;

          quotes.push({
            courierId, courierName: info.name, courierIcon: info.icon, courierColor: info.color,
            zone, zoneLabel: zone.replace(/_/g, ' '),
            speed, speedLabel: speed.replace(/_/g, ' '),
            baseRate: rate.baseRate, perKgRate: rate.perKgRate, weight: weightKg, weightCharge,
            totalCharge, estimatedDays: rate.estimatedDays,
            trackingSupported: info.tracking, badge: info.badge,
          });
        }
      }

      return res.status(200).json({
        zone,
        zoneLabel: zone.replace(/_/g, ' '),
        weight: weightKg,
        freeShipping,
        quotes,
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Shipping API error:', err);
    res.status(500).json({ error: err.message });
  }
}
