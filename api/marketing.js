import supabase from './db-client.js';

// Marketing & Growth Tools API
// Handles: Festival campaigns, Bulk SMS, Tiered discounts, Social share rewards, Affiliate codes

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { store_id, type } = req.query;

    if (req.method === 'GET') {
      if (!store_id) return res.status(400).json({ error: 'store_id required' });

      // Fetch all marketing data for the store
      const [campaigns, smsLogs, affiliates, shareRewards] = await Promise.all([
        supabase.from('marketing_campaigns').select('*').eq('store_id', store_id).order('created_at', { ascending: false }),
        supabase.from('bulk_sms_logs').select('*').eq('store_id', store_id).order('created_at', { ascending: false }).limit(20),
        supabase.from('affiliate_codes').select('*').eq('store_id', store_id).order('created_at', { ascending: false }),
        supabase.from('social_shares').select('*').eq('store_id', store_id).order('created_at', { ascending: false }).limit(20),
      ]);

      return res.status(200).json({
        campaigns: campaigns.data || [],
        smsLogs: smsLogs.data || [],
        affiliates: affiliates.data || [],
        shareRewards: shareRewards.data || [],
      });
    }

    if (req.method === 'POST') {
      const { action, store_id: sid, payload } = req.body;
      const storeId = sid || store_id;

      // Create festival campaign
      if (action === 'create_campaign') {
        const { data, error } = await supabase.from('marketing_campaigns').insert({
          store_id: storeId,
          name: payload.name,
          festival: payload.festival,
          banner_text: payload.banner_text,
          banner_color: payload.banner_color || '#FF6600',
          discount_percent: payload.discount_percent || 0,
          start_date: payload.start_date,
          end_date: payload.end_date,
          active: true,
        }).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }

      // Send bulk SMS
      if (action === 'bulk_sms') {
        const { message, recipients } = payload;
        const results = [];
        for (const phone of (recipients || [])) {
          try {
            // Simulate Sparrow SMS API
n            const smsRes = await fetch(`${req.headers.origin || ''}/api/sms`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone, message }),
            });
            results.push({ phone, status: 'sent' });
          } catch (e) {
            results.push({ phone, status: 'failed', error: e.message });
          }
        }
        // Log the bulk SMS
        const { data: log } = await supabase.from('bulk_sms_logs').insert({
          store_id: storeId,
          message,
          recipient_count: (recipients || []).length,
          status: 'sent',
          results,
        }).select().single();
        return res.status(200).json({ ok: true, sent: results.filter(r => r.status === 'sent').length, total: results.length, log });
      }

      // Create affiliate code
      if (action === 'create_affiliate') {
        const { data, error } = await supabase.from('affiliate_codes').insert({
          store_id: storeId,
          code: payload.code.toUpperCase(),
          influencer_name: payload.influencer_name,
          influencer_platform: payload.platform,
          discount_percent: payload.discount_percent || 10,
          commission_percent: payload.commission_percent || 5,
          active: true,
          uses: 0,
          revenue_generated: 0,
        }).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }

      // Track social share
      if (action === 'track_share') {
        const { data, error } = await supabase.from('social_shares').insert({
          store_id: storeId,
          product_id: payload.product_id,
          platform: payload.platform,
          customer_phone: payload.customer_phone,
          reward_code: payload.reward_code,
          reward_given: true,
        }).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }

      // Create tiered discount (BOGO / bulk)
      if (action === 'create_tiered_discount') {
        const { data, error } = await supabase.from('marketing_campaigns').insert({
          store_id: storeId,
          name: payload.name,
          festival: 'tiered_discount',
          banner_text: payload.banner_text,
          banner_color: '#28A745',
          discount_percent: 0,
          discount_type: payload.discount_type, // 'bogo', 'bulk', 'tiered'
          discount_config: payload.config,
          start_date: payload.start_date,
          end_date: payload.end_date,
          active: true,
        }).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    if (req.method === 'PUT') {
      const { id, action, store_id: sid } = req.body;

      if (action === 'toggle_campaign') {
        const { data: campaign } = await supabase.from('marketing_campaigns').select('active').eq('id', id).single();
        const { data, error } = await supabase.from('marketing_campaigns').update({ active: !campaign?.active }).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }

      if (action === 'toggle_affiliate') {
        const { data: aff } = await supabase.from('affiliate_codes').select('active').eq('id', id).single();
        const { data, error } = await supabase.from('affiliate_codes').update({ active: !aff?.active }).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    if (req.method === 'DELETE') {
      const { id, type: delType } = req.body;
      let table = 'marketing_campaigns';
      if (delType === 'affiliate') table = 'affiliate_codes';
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Marketing API error:', err);
    res.status(500).json({ error: err.message });
  }
}
