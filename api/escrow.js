import supabase from './db-client.js';

// Escrow Wallet System
// Customer payments are held in escrow until delivery is confirmed.
// Only then is the funds released to the merchant.
// This prevents fraud — merchants can't run away with customer money.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { store_id, status } = req.query;
      let query = supabase.from('escrow_transactions').select('*');
      if (store_id) query = query.eq('store_id', store_id);
      if (status) query = query.eq('status', status);
      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;

      // Calculate escrow summary
      const held = (data || []).filter(e => e.status === 'held').reduce((s, e) => s + Number(e.amount), 0);
      const released = (data || []).filter(e => e.status === 'released').reduce((s, e) => s + Number(e.amount), 0);
      const refunded = (data || []).filter(e => e.status === 'refunded').reduce((s, e) => s + Number(e.amount), 0);
      const pendingRelease = (data || []).filter(e => e.status === 'held').length;

      return res.status(200).json({
        transactions: data || [],
        summary: { held, released, refunded, pendingRelease, total: data?.length || 0 },
      });
    }

    if (req.method === 'POST') {
      // Create escrow hold when order is placed
      const { order_id, store_id, amount, customer_phone, payment_method } = req.body;
      const { data, error } = await supabase.from('escrow_transactions').insert({
        order_id, store_id, amount,
        commission_amount: Number(amount) * 0.02,
        merchant_payout: Number(amount) * 0.98,
        status: 'held',
        payment_method,
        customer_phone,
        held_at: new Date().toISOString(),
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, action, note } = req.body;
      // action: 'release' | 'refund'
      const newStatus = action === 'release' ? 'released' : 'refunded';
      const releaseDate = new Date().toISOString();

      const { data: escrow } = await supabase.from('escrow_transactions').select('*').eq('id', id).single();
      if (!escrow) return res.status(404).json({ error: 'Escrow not found' });
      if (escrow.status !== 'held') return res.status(400).json({ error: `Escrow already ${escrow.status}` });

      const { data, error } = await supabase.from('escrow_transactions').update({
        status: newStatus,
        released_at: action === 'release' ? releaseDate : null,
        refunded_at: action === 'refund' ? releaseDate : null,
        admin_note: note || '',
      }).eq('id', id).select().single();
      if (error) throw error;

      // If releasing, update order status to delivered if not already
      if (action === 'release' && escrow.order_id) {
        await supabase.from('orders').update({ status: 'delivered' }).eq('id', escrow.order_id);
      }

      return res.status(200).json({ ...data, message: `Funds ${newStatus} successfully` });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Escrow API error:', err);
    res.status(500).json({ error: err.message });
  }
}
