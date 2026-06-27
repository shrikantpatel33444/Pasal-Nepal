import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { product_id, store_id } = req.query;
      let query = supabase.from('product_variants').select('*');
      if (product_id) query = query.eq('product_id', product_id);
      const { data, error } = await query.order('created_at', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data || []);
    }
    if (req.method === 'POST') {
      // Support batch insert
      const body = req.body;
      const rows = Array.isArray(body) ? body : [body];
      const { data, error } = await supabase.from('product_variants').insert(rows).select();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, ...rest } = req.body;
      const { data, error } = await supabase.from('product_variants').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id, product_id } = req.body;
      let query = supabase.from('product_variants').delete();
      if (id) query = query.eq('id', id);
      else if (product_id) query = query.eq('product_id', product_id);
      const { error } = await query;
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
