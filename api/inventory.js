import supabase from './db-client.js';

// Inventory summary: stock levels, low-stock alerts, variant stock
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { store_id, low_stock_threshold } = req.query;
      const threshold = parseInt(low_stock_threshold) || 5;

      let prodQuery = supabase.from('products').select('*');
      if (store_id) prodQuery = prodQuery.eq('store_id', store_id);
      const { data: products, error: pErr } = await prodQuery.order('created_at', { ascending: false });
      if (pErr) throw pErr;

      // Fetch all variants for these products
      const productIds = (products || []).map(p => p.id);
      let variants = [];
      if (productIds.length > 0) {
        const { data: vData, error: vErr } = await supabase
          .from('product_variants')
          .select('*')
          .in('product_id', productIds);
        if (vErr) throw vErr;
        variants = vData || [];
      }

      // Build inventory summary
      let totalSkus = 0;
      let inStock = 0;
      let lowStock = 0;
      let outOfStock = 0;
      let totalUnits = 0;
      let inventoryValue = 0;
      const lowStockItems = [];

      for (const p of products || []) {
        const pVariants = variants.filter(v => v.product_id === p.id);
        if (pVariants.length > 0) {
          for (const v of pVariants) {
            totalSkus++;
            totalUnits += v.stock;
            inventoryValue += v.stock * Number(p.price);
            if (v.stock === 0) { outOfStock++; lowStockItems.push({ ...p, variant: v, stockLevel: 'out' }); }
            else if (v.stock <= threshold) { lowStock++; lowStockItems.push({ ...p, variant: v, stockLevel: 'low' }); }
            else inStock++;
          }
        } else {
          totalSkus++;
          totalUnits += p.stock;
          inventoryValue += p.stock * Number(p.price);
          if (p.stock === 0) { outOfStock++; lowStockItems.push({ ...p, stockLevel: 'out' }); }
          else if (p.stock <= threshold) { lowStock++; lowStockItems.push({ ...p, stockLevel: 'low' }); }
          else inStock++;
        }
      }

      return res.status(200).json({
        products: products || [],
        variants,
        summary: {
          totalSkus,
          inStock,
          lowStock,
          outOfStock,
          totalUnits,
          inventoryValue,
          threshold,
        },
        lowStockItems,
      });
    }

    if (req.method === 'PUT') {
      // Bulk stock adjustment
      const { updates } = req.body;
      // updates: [{ type: 'product', id, stock } | { type: 'variant', id, stock }]
      const results = [];
      for (const u of updates || []) {
        if (u.type === 'variant') {
          const { data, error } = await supabase
            .from('product_variants')
            .update({ stock: u.stock })
            .eq('id', u.id)
            .select().single();
          if (error) console.error('Variant stock update error:', error);
          else results.push(data);
        } else {
          const { data, error } = await supabase
            .from('products')
            .update({ stock: u.stock })
            .eq('id', u.id)
            .select().single();
          if (error) console.error('Product stock update error:', error);
          else results.push(data);
        }
      }
      return res.status(200).json({ ok: true, updated: results.length });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
