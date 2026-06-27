import supabase from './db-client.js';

// Price Moderation & RTO Analytics
// Tracks unfair pricing alerts and Return-to-Origin rates per merchant

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { type } = req.query; // 'alerts' | 'rto' | 'commissions'

      if (type === 'alerts') {
        // Fetch price moderation alerts
        const { data: alerts, error } = await supabase
          .from('price_alerts')
          .select('*, stores(name, subdomain)')
          .order('created_at', { ascending: false });
        if (error) throw error;

        // Auto-detect suspicious pricing from current products
        const { data: products } = await supabase.from('products').select('*, stores(name, subdomain)');
        const autoAlerts = [];
        for (const p of (products || [])) {
          // Flag if MRP is more than 5x the selling price (potential fake discount)
          if (p.mrp && p.mrp > 0 && p.price > 0) {
            const discountPct = ((p.mrp - p.price) / p.mrp) * 100;
            if (discountPct > 80) {
              autoAlerts.push({
                id: `auto-${p.id}`,
                type: 'fake_discount',
                product_name: p.name,
                store_name: p.stores?.name || 'Unknown',
                store_subdomain: p.stores?.subdomain || '',
                price: p.price,
                mrp: p.mrp,
                discount_pct: Math.round(discountPct),
                message: `Suspicious discount: ${Math.round(discountPct)}% off on "${p.name}"`,
                severity: 'high',
                status: 'pending',
                created_at: new Date().toISOString(),
              });
            }
          }
          // Flag if price is extremely high compared to category average
          const catProducts = (products || []).filter(x => x.category === p.category && x.id !== p.id);
          if (catProducts.length > 2) {
            const avgPrice = catProducts.reduce((s, x) => s + Number(x.price), 0) / catProducts.length;
            if (avgPrice > 0 && Number(p.price) > avgPrice * 5) {
              autoAlerts.push({
                id: `auto-high-${p.id}`,
                type: 'overpriced',
                product_name: p.name,
                store_name: p.stores?.name || 'Unknown',
                store_subdomain: p.stores?.subdomain || '',
                price: p.price,
                mrp: p.mrp,
                avg_price: Math.round(avgPrice),
                message: `Potential overpricing: "${p.name}" priced at रू${p.price} (avg: रू${Math.round(avgPrice)})`,
                severity: 'medium',
                status: 'pending',
                created_at: new Date().toISOString(),
              });
            }
          }
        }

        return res.status(200).json({ alerts: alerts || [], autoAlerts });
      }

      if (type === 'rto') {
        // RTO (Return to Origin) analytics per merchant
        const { data: orders, error: oErr } = await supabase
          .from('orders')
          .select('id, store_id, status, total, created_at')
          .order('created_at', { ascending: false });
        if (oErr) throw oErr;

        const { data: stores } = await supabase.from('stores').select('id, name, subdomain');

        // Calculate RTO per store
        const storeRto = (stores || []).map(store => {
          const storeOrders = (orders || []).filter(o => o.store_id === store.id);
          const total = storeOrders.length;
          const returned = storeOrders.filter(o => o.status === 'cancelled').length;
          const delivered = storeOrders.filter(o => o.status === 'delivered').length;
          const rtoRate = total > 0 ? (returned / total) * 100 : 0;
          const lostValue = storeOrders.filter(o => o.status === 'cancelled').reduce((s, o) => s + Number(o.total || 0), 0);

          return {
            store_id: store.id,
            store_name: store.name,
            subdomain: store.subdomain,
            total_orders: total,
            delivered_orders: delivered,
            returned_orders: returned,
            rto_rate: Math.round(rtoRate * 10) / 10,
            lost_value: lostValue,
            risk_level: rtoRate > 30 ? 'critical' : rtoRate > 15 ? 'high' : rtoRate > 5 ? 'medium' : 'low',
          };
        }).sort((a, b) => b.rto_rate - a.rto_rate);

        const totalOrders = (orders || []).length;
        const totalReturned = (orders || []).filter(o => o.status === 'cancelled').length;
        const totalLostValue = storeRto.reduce((s, r) => s + r.lost_value, 0);

        return res.status(200).json({
          stores: storeRto,
          summary: {
            totalOrders,
            totalReturned,
            overallRtoRate: totalOrders > 0 ? Math.round((totalReturned / totalOrders) * 1000) / 10 : 0,
            totalLostValue,
          },
        });
      }

      if (type === 'commissions') {
        // Category-wise commission rates
        const { data: rates, error } = await supabase.from('category_commissions').select('*').order('category', { ascending: true });
        if (error) throw error;

        // Default rates if table is empty
        const defaults = [
          { category: 'Electronics', commission_pct: 3, fixed_fee: 0, active: true },
          { category: 'Fashion', commission_pct: 5, fixed_fee: 0, active: true },
          { category: 'Groceries', commission_pct: 2, fixed_fee: 0, active: true },
          { category: 'Home & Living', commission_pct: 4, fixed_fee: 0, active: true },
          { category: 'Beauty', commission_pct: 6, fixed_fee: 0, active: true },
          { category: 'Accessories', commission_pct: 5, fixed_fee: 0, active: true },
        ];

        return res.status(200).json({ rates: rates?.length > 0 ? rates : defaults, defaults });
      }

      return res.status(400).json({ error: 'Invalid type parameter' });
    }

    if (req.method === 'POST') {
      // Create a manual price alert
      const { product_id, store_id, alert_type, message, severity } = req.body;
      const { data, error } = await supabase.from('price_alerts').insert({
        product_id, store_id, alert_type, message, severity: severity || 'medium', status: 'pending',
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { action, id, category, commission_pct, fixed_fee, active, alert_status } = req.body;

      // Update category commission
      if (action === 'update_commission') {
        const { data, error } = await supabase
          .from('category_commissions')
          .upsert({ category, commission_pct, fixed_fee: fixed_fee || 0, active: active !== false, updated_at: new Date().toISOString() })
          .select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }

      // Update alert status (resolve/dismiss)
      if (action === 'update_alert') {
        const { data, error } = await supabase
          .from('price_alerts')
          .update({ status: alert_status, resolved_at: alert_status === 'resolved' ? new Date().toISOString() : null })
          .eq('id', id)
          .select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }

      // Verify merchant (approve/reject)
      if (action === 'verify_merchant') {
        const { data, error } = await supabase
          .from('store_compliance')
          .update({ company_cert_status: alert_status === 'approved' ? 'verified' : 'rejected', verified_at: new Date().toISOString() })
          .eq('store_id', id)
          .select().single();
        if (error) throw error;

        // If approved, activate the store
        if (alert_status === 'approved') {
          const compliance = data;
          if (compliance?.store_id) {
            await supabase.from('stores').update({ status: 'active' }).eq('id', compliance.store_id);
          }
        }

        return res.status(200).json(data);
      }
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Moderation API error:', err);
    res.status(500).json({ error: err.message });
  }
}
