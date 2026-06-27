import supabase from './db-client.js';

// Enhanced SMS Gateway API
// Supports: Sparrow SMS, Aakash SMS
// Uses: Order confirmations, OTP, payout alerts, status updates

const SMS_PROVIDERS = {
  sparrow: {
    name: 'Sparrow SMS',
    apiUrl: 'https://api.sparrowsms.com/v2/sms/',
    // In production: use process.env.SPARROW_SMS_TOKEN
    token: process.env.SPARROW_SMS_TOKEN || 'demo_token',
    sender: 'PASAL',
  },
  aakash: {
    name: 'Aakash SMS',
    apiUrl: 'https://aakasmss.com/api/sms/bulk',
    // In production: use process.env.AAKASH_SMS_KEY
    apiKey: process.env.AAKASH_SMS_KEY || 'demo_key',
    sender: 'PASAL',
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      // Return available SMS providers
      return res.status(200).json({
        providers: Object.entries(SMS_PROVIDERS).map(([id, p]) => ({
          id,
          name: p.name,
          sender: p.sender,
          configured: !p.token.includes('demo') || !p.apiKey.includes('demo'),
        })),
      });
    }

    if (req.method === 'POST') {
      const { phone, message, provider = 'sparrow', type = 'transactional' } = req.body;

      // Validate Nepal phone (10 digits, starts with 97/98)
      const cleanPhone = phone.replace(/\D/g, '');
      if (!/^9[7-8]\d{8}$/.test(cleanPhone)) {
        return res.status(400).json({ error: 'Invalid Nepal phone number. Must be 10 digits starting with 97 or 98.' });
      }

      // Truncate message to 160 chars (single SMS)
      const truncatedMessage = message.slice(0, 160);

      // Select provider
      const smsProvider = SMS_PROVIDERS[provider];
      if (!smsProvider) {
        return res.status(400).json({ error: `Unknown SMS provider: ${provider}` });
      }

      // Generate SMS ID
      const smsId = `SMS-${provider.toUpperCase().slice(0,3)}-${Date.now().toString().slice(-8)}`;

      // In production, this would make actual API calls:
      // Sparrow SMS: POST to https://api.sparrowsms.com/v2/sms/ with token, from, to, text
      // Aakash SMS: POST to https://aakasmss.com/api/sms/bulk with auth_token, from, to, text

      // Simulate SMS sending
      console.log(`[${smsProvider.name}] To: 977${cleanPhone} | From: ${smsProvider.sender} | Message: ${truncatedMessage} | ID: ${smsId}`);

      // Store SMS log
      try {
        await supabase.from('sms_logs').insert({
          provider,
          sms_id: smsId,
          phone: cleanPhone,
          message: truncatedMessage,
          type,
          status: 'sent',
          sender_id: smsProvider.sender,
        });
      } catch (e) { console.error('SMS log failed:', e.message); }

      return res.status(200).json({
        success: true,
        smsId,
        provider: smsProvider.name,
        phone: cleanPhone,
        message: truncatedMessage,
        type,
        timestamp: new Date().toISOString(),
        cost: type === 'otp' ? 0.25 : 0.35, // NPR per SMS (approximate)
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('SMS API error:', err);
    res.status(500).json({ error: err.message });
  }
}
