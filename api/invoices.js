import supabase from './db-client.js';

// IRD Compliant Invoice Generation
// Format: Serial Number, Merchant PAN, Tax Breakup, Customer details

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { order_id, store_id } = req.query;

      if (order_id) {
        // Get specific invoice for an order
        const { data: invoice, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('order_id', order_id)
          .single();
        if (error && error.code !== 'PGRST116') throw error;

        if (invoice) {
          // Fetch order details
          const { data: order } = await supabase.from('orders').select('*').eq('id', order_id).single();
          const { data: store } = await supabase.from('stores').select('*').eq('id', store_id || order?.store_id).single();
          const { data: compliance } = await supabase.from('store_compliance').select('*').eq('store_id', store_id || order?.store_id).single();
          return res.status(200).json({ invoice, order, store, compliance });
        }
        return res.status(404).json({ error: 'Invoice not found' });
      }

      // List invoices for a store
      if (store_id) {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('store_id', store_id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data || []);
      }

      return res.status(400).json({ error: 'order_id or store_id required' });
    }

    if (req.method === 'POST') {
      // Generate invoice for an order
      const { order_id, store_id, subtotal, vat_amount, total, items, customer_name, customer_phone } = req.body;

      // Get compliance settings for invoice number
      const { data: compliance, error: cErr } = await supabase
        .from('store_compliance')
        .select('*')
        .eq('store_id', store_id)
        .single();

      const prefix = compliance?.invoice_prefix || 'INV';
      const nextSeq = (compliance?.invoice_sequence || 0) + 1;
      const fiscalYear = getFiscalYear();
      const invoiceNumber = `${prefix}-${fiscalYear}-${String(nextSeq).padStart(5, '0')}`;

      // Create invoice record
      const { data: invoice, error: invErr } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          order_id,
          store_id,
          subtotal,
          vat_amount: vat_amount || 0,
          total,
          vat_rate: 0.13,
          items: items || [],
          customer_name,
          customer_phone,
          pan_number: compliance?.pan_number || null,
          vat_number: compliance?.vat_number || null,
          fiscal_year: fiscalYear,
          status: 'issued',
        })
        .select()
        .single();

      if (invErr) throw invErr;

      // Increment invoice sequence
      if (compliance) {
        await supabase
          .from('store_compliance')
          .update({ invoice_sequence: nextSeq })
          .eq('store_id', store_id);
      }

      return res.status(201).json(invoice);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Invoice API error:', err);
    res.status(500).json({ error: err.message });
  }
}

function getFiscalYear() {
  const now = new Date();
  const nepaliYear = now.getFullYear() + 57;
  const month = now.getMonth();
  if (month < 6 || (month === 6 && now.getDate() < 16)) {
    return `${nepaliYear - 1}-${String(nepaliYear).slice(-2)}`;
  }
  return `${nepaliYear}-${String(nepaliYear + 1).slice(-2)}`;
}
