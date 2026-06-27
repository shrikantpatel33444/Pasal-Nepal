import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { include } = req.query;
      // Platform-wide stats for super admin
      const [stores, products, orders, subs] = await Promise.all([
        supabase.from('stores').select('id, name, subdomain, plan, status, owner_email, owner_name, owner_phone, province, district, primary_color, created_at'),
        supabase.from('products').select('id, store_id, price, category, name'),
        supabase.from('orders').select('id, store_id, total, status, created_at, customer_name, customer_phone, payment_method, order_number'),
        supabase.from('subscriptions').select('id, store_id, plan, status'),
      ]);
      if (stores.error) throw stores.error;
      if (products.error) throw products.error;
      if (orders.error) throw orders.error;
      if (subs.error) throw subs.error;

      const totalRevenue = orders.data.reduce((s, o) => s + Number(o.total || 0), 0);
      const commission = totalRevenue * 0.02;
      const planRevenue = subs.data.filter(s => s.status === 'active').reduce((sum, s) => {
        const prices = { free: 0, starter: 999, growth: 2499, premium: 4999 };
        return sum + (prices[s.plan] || 0);
      }, 0);

      const response = {
        stores: stores.data,
        products: products.data,
        orders: orders.data,
        subscriptions: subs.data,
        stats: {
          totalStores: stores.data.length,
          totalProducts: products.data.length,
          totalOrders: orders.data.length,
          totalRevenue,
          commission,
          planRevenue,
          totalEarnings: commission + planRevenue,
        },
      };

      // Include compliance data if requested
      if (include === 'compliance') {
        const { data: compliance, error: cErr } = await supabase
          .from('store_compliance')
          .select('*');
        if (cErr) throw cErr;
        response.compliance = compliance || [];
      }

      return res.status(200).json(response);
    }
    if (req.method === 'PUT') {
      const { id, status } = req.body;
      const { data, error } = await supabase.from('stores').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
