import supabase from './db-client.js';

// IRD Nepal Compliance API
// Handles: PAN/VAT verification, invoice generation, company certificate upload, tax settings

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { store_id } = req.query;
      if (!store_id) return res.status(400).json({ error: 'store_id required' });

      const { data, error } = await supabase
        .from('store_compliance')
        .select('*')
        .eq('store_id', store_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return res.status(200).json(data || {
        store_id,
        pan_number: null,
        vat_number: null,
        vat_enabled: false,
        company_cert_url: null,
        company_cert_status: 'not_uploaded',
        invoice_prefix: null,
        invoice_sequence: 0,
        return_policy_text: null,
        compliance_status: {
          pan_registered: false,
          vat_registered: false,
          company_certificate: false,
          invoice_configured: false,
          return_policy: false,
          tax_enabled: false,
        },
      });
    }

    if (req.method === 'POST') {
      const body = req.body;
      const { data, error } = await supabase
        .from('store_compliance')
        .upsert(body)
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { store_id, ...rest } = req.body;

      // If uploading company certificate, set status to pending_verification
      if (rest.company_cert_url) {
        rest.company_cert_status = 'pending_verification';
      }

      // Recalculate compliance status
      const compliance = {
        pan_registered: !!rest.pan_number,
        vat_registered: !!rest.vat_number,
        company_certificate: rest.company_cert_status === 'verified',
        invoice_configured: !!rest.invoice_prefix,
        return_policy: !!rest.return_policy_text,
        tax_enabled: !!rest.vat_enabled,
      };
      rest.compliance_status = compliance;

      const { data, error } = await supabase
        .from('store_compliance')
        .upsert({ store_id, ...rest })
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Compliance API error:', err);
    res.status(500).json({ error: err.message });
  }
}
