import supabase from './db-client.js';

const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'delivered'];
const STATUS_MESSAGES = {
  confirmed: 'Your order {ORDER} has been confirmed and is being prepared.',
  shipped: 'Great news! Your order {ORDER} has been shipped and is on the way.',
  delivered: 'Your order {ORDER} has been delivered. Thank you for shopping with us!',
  cancelled: 'Your order {ORDER} has been cancelled. Please contact us for assistance.',
};

async function sendSms(phone, message) {
  try {
    await fetch(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/sms` : '/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message }),
    });
  } catch (e) { console.error('SMS send failed:', e.message); }
}

async function logStatusChange(orderId, oldStatus, newStatus, note) {
  try {
    await supabase.from('order_status_logs').insert({
      order_id: orderId,
      old_status: oldStatus,
      new_status: newStatus,
      note: note || '',
    });
  } catch (e) { console.error('Log insert failed:', e.message); }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { store_id, id } = req.query;
      let query = supabase.from('orders').select('*');
      if (store_id) query = query.eq('store_id', store_id);
      if (id) query = query.eq('id', id).single();
      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = req.body;
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const rand = Math.floor(1000 + Math.random() * 9000);
      body.order_number = `ORD-${dateStr}-${rand}`;
      body.status = body.status || 'pending';
      const { data, error } = await supabase.from('orders').insert(body).select().single();
      if (error) throw error;
      // Log initial status
      await logStatusChange(data.id, null, 'pending', 'Order placed');
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status, auto_advance, ...rest } = req.body;

      // Auto-advance: move order to next status in the flow
      if (auto_advance) {
        const { data: order, error: fetchErr } = await supabase.from('orders').select('*').eq('id', id).single();
        if (fetchErr) throw fetchErr;

        const currentIdx = STATUS_FLOW.indexOf(order.status);
        if (currentIdx === -1 || currentIdx >= STATUS_FLOW.length - 1) {
          return res.status(200).json({ ...order, message: 'Order is already at final status' });
        }
        const nextStatus = STATUS_FLOW[currentIdx + 1];
        const { data: updated, error: updErr } = await supabase
          .from('orders').update({ status: nextStatus }).eq('id', id).select().single();
        if (updErr) throw updErr;

        await logStatusChange(id, order.status, nextStatus, 'Auto-advanced');

        // Send SMS notification
        const msg = STATUS_MESSAGES[nextStatus]?.replace('{ORDER}', order.order_number) || '';
        if (msg && order.customer_phone) {
          await sendSms(order.customer_phone, `Dear ${order.customer_name}, ${msg} — Pasal Nepal`);
        }
        return res.status(200).json({ ...updated, smsSent: !!msg });
      }

      // Manual status update with SMS + logging
      if (status !== undefined) {
        const { data: order, error: fetchErr } = await supabase.from('orders').select('*').eq('id', id).single();
        if (fetchErr) throw fetchErr;
        const oldStatus = order.status;

        const updateBody = { status, ...rest };
        const { data: updated, error: updErr } = await supabase
          .from('orders').update(updateBody).eq('id', id).select().single();
        if (updErr) throw updErr;

        if (oldStatus !== status) {
          await logStatusChange(id, oldStatus, status, rest.note || 'Status updated by merchant');
          const msg = STATUS_MESSAGES[status]?.replace('{ORDER}', order.order_number) || '';
          if (msg && order.customer_phone) {
            await sendSms(order.customer_phone, `Dear ${order.customer_name}, ${msg} — Pasal Nepal`);
          }
        }
        return res.status(200).json({ ...updated, smsSent: oldStatus !== status });
      }

      // Generic update (no status change)
      const { data, error } = await supabase.from('orders').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
