import supabase from './db-client.js';

// Nepal Bank Payout Settlement System
// Supports A, B, C class commercial banks
// Payout cycle: Weekly (every Friday) or on-demand

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { store_id } = req.query;
      if (!store_id) return res.status(400).json({ error: 'store_id required' });

      // Get bank account info
      const { data: bankAccount, error: baErr } = await supabase
        .from('merchant_bank_accounts')
        .select('*')
        .eq('store_id', store_id)
        .eq('active', true)
        .single();

      // Get payout history
      const { data: payouts, error: pErr } = await supabase
        .from('payouts')
        .select('*')
        .eq('store_id', store_id)
        .order('created_at', { ascending: false });

      // Calculate available balance from orders
      const { data: orders, error: oErr } = await supabase
        .from('orders')
        .select('total, status, payment_method, payment_status, created_at')
        .eq('store_id', store_id);

      if (oErr) throw oErr;

      // Available = paid orders (non-COD) - already paid out - platform commission (2%)
      const paidOrders = (orders || []).filter(o => o.payment_status === 'paid' && o.status !== 'cancelled');
      const grossEarnings = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
      const commission = grossEarnings * 0.02;
      const netEarnings = grossEarnings - commission;

      const totalPaidOut = (payouts || []).filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount), 0);
      const pendingPayouts = (payouts || []).filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0);
      const availableBalance = Math.max(0, netEarnings - totalPaidOut - pendingPayouts);

      return res.status(200).json({
        bankAccount: bankAccount || null,
        payouts: payouts || [],
        balance: {
          grossEarnings: Math.round(grossEarnings),
          commission: Math.round(commission),
          netEarnings: Math.round(netEarnings),
          totalPaidOut: Math.round(totalPaidOut),
          pendingPayouts: Math.round(pendingPayouts),
          availableBalance: Math.round(availableBalance),
        },
      });
    }

    if (req.method === 'POST') {
      // Save/update bank account
      const { store_id, bank_code, bank_name, account_number, account_name, branch } = req.body;

      // Deactivate existing accounts
      await supabase.from('merchant_bank_accounts').update({ active: false }).eq('store_id', store_id);

      const { data, error } = await supabase
        .from('merchant_bank_accounts')
        .insert({ store_id, bank_code, bank_name, account_number, account_name, branch, active: true })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      // Request payout
      const { store_id, amount } = req.body;

      // Verify available balance
      const balanceRes = await fetch(`${process.env.VERCEL_URL || ''}/api/payouts?store_id=${store_id}`);
      const balanceData = await balanceRes.json();

      if (amount > balanceData.balance.availableBalance) {
        return res.status(400).json({ error: 'Insufficient balance for payout' });
      }

      if (!balanceData.bankAccount) {
        return res.status(400).json({ error: 'No bank account configured. Please add a bank account first.' });
      }

      // Minimum payout: Rs. 500
      if (amount < 500) {
        return res.status(400).json({ error: 'Minimum payout amount is रू 500' });
      }

      // Create payout request
      const payoutRef = `PAY-${Date.now().toString().slice(-8)}`;
      const { data, error } = await supabase
        .from('payouts')
        .insert({
          store_id,
          amount,
          reference: payoutRef,
          bank_code: balanceData.bankAccount.bank_code,
          bank_name: balanceData.bankAccount.bank_name,
          account_number: balanceData.bankAccount.account_number,
          account_name: balanceData.bankAccount.account_name,
          status: 'pending',
          notes: `Payout requested for ${balanceData.bankAccount.bank_name} - ${balanceData.bankAccount.account_number.slice(-4).padStart(4, '*')}`,
        })
        .select()
        .single();

      if (error) throw error;

      // Send SMS notification
      try {
        await fetch(`${process.env.VERCEL_URL || ''}/api/sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: '9800000000', // Merchant phone (would be fetched from store)
            message: `Payout request of रू ${amount} created. Ref: ${payoutRef}. Funds will be transferred to ${balanceData.bankAccount.bank_name} within 1-2 business days.`,
          }),
        });
      } catch (e) { console.error('SMS failed:', e.message); }

      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Payouts API error:', err);
    res.status(500).json({ error: err.message });
  }
}
