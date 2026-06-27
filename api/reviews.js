import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { product_id, store_id } = req.query;
      let query = supabase.from('reviews').select('*');
      if (product_id) query = query.eq('product_id', product_id);
      if (store_id) query = query.eq('store_id', store_id);
      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const body = req.body;
      const { data, error } = await supabase.from('reviews').insert({
        product_id: body.product_id,
        store_id: body.store_id,
        customer_name: body.customer_name,
        rating: body.rating,
        comment: body.comment || '',
        images: body.images || [],
      }).select().single();
      if (error) throw error;

      // Update product rating average
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', body.product_id);
      if (allReviews && allReviews.length > 0) {
        const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
        await supabase.from('products').update({
          rating: Math.round(avg * 10) / 10,
          reviews_count: allReviews.length,
        }).eq('id', body.product_id);
      }

      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Reviews API error:', err);
    res.status(500).json({ error: err.message });
  }
}
