import supabase from './db-client.js';

// Nepal Payment Gateway Processing
// All base amounts in NPR. Khalti uses paisa (NPR * 100).
// Gateways: eSewa, Khalti, FonePay, ConnectIPS, IME Pay, SCT Card, COD

const GATEWAY_CONFIG = {
  esewa: { name: 'eSewa', currency: 'NPR', feePercent: 0, minAmount: 10, maxAmount: 100000 },
  khalti: { name: 'Khalti', currency: 'NPR', feePercent: 0, minAmount: 10, maxAmount: 200000, usesPaisa: true },
  fonepay: { name: 'FonePay', currency: 'NPR', feePercent: 0, minAmount: 1, maxAmount: 500000 },
  connectips: { name: 'ConnectIPS', currency: 'NPR', feePercent: 0, minAmount: 100, maxAmount: 1000000 },
  imepay: { name: 'IME Pay', currency: 'NPR', feePercent: 0, minAmount: 10, maxAmount: 100000 },
  sct: { name: 'SCT Card', currency: 'NPR', feePercent: 1.5, minAmount: 10, maxAmount: 500000 },
  cod: { name: 'Cash on Delivery', currency: 'NPR', feePercent: 0, minAmount: 0, maxAmount: 100000 },
};

function generateTxnId(gateway) {
  const prefix = gateway.toUpperCase().slice(0, 4);
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${ts}-${rand}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    // GET: Return available gateways and config
    if (req.method === 'GET') {
      return res.status(200).json({
        currency: 'NPR',
        currencySymbol: 'रू',
        gateways: Object.entries(GATEWAY_CONFIG).map(([id, cfg]) => ({
          id,
          ...cfg,
          usesPaisa: cfg.usesPaisa || false,
        })),
      });
    }

    if (req.method === 'POST') {
      const { gateway, amount, order_id, customer_phone, customer_email, merchant_id } = req.body;

      // Validate gateway
      const cfg = GATEWAY_CONFIG[gateway];
      if (!cfg) {
        return res.status(400).json({ success: false, error: `Unknown gateway: ${gateway}` });
      }

      // Validate amount
      const nprAmount = Number(amount);
      if (isNaN(nprAmount) || nprAmount < cfg.minAmount) {
        return res.status(400).json({
          success: false,
          error: `Minimum amount for ${cfg.name} is रू ${cfg.minAmount}`,
        });
      }
      if (nprAmount > cfg.maxAmount) {
        return res.status(400).json({
          success: false,
          error: `Maximum amount for ${cfg.name} is रू ${cfg.maxAmount.toLocaleString()}`,
        });
      }

      // COD: No online processing, just verification
      if (gateway === 'cod') {
        const txnId = generateTxnId('COD');
        return res.status(200).json({
          success: true,
          gateway: 'cod',
          method: 'cash_on_delivery',
          txnId,
          order_id,
          amount: nprAmount,
          displayAmount: nprAmount,
          currency: 'NPR',
          message: 'COD order confirmed. Pay in cash on delivery.',
          paymentStatus: 'pending',
          requiresVerification: true,
          verificationSteps: [
            'Order placed successfully',
            'Merchant will confirm availability',
            'Courier dispatched with order',
            'Pay exact cash amount on delivery',
          ],
        });
      }

      // Khalti: Convert to paisa
      const gatewayAmount = cfg.usesPaisa ? nprAmount * 100 : nprAmount;
      const amountLabel = cfg.usesPaisa ? `${gatewayAmount} paisa (रू ${nprAmount})` : `रू ${nprAmount}`;

      // Calculate processing fee
      const processingFee = Math.round((nprAmount * cfg.feePercent) / 100);
      const totalDeducted = nprAmount + processingFee;

      // Simulate gateway processing (95% success)
      const success = Math.random() > 0.05;
      const txnId = generateTxnId(gateway);

      // Gateway-specific response
      const gatewayResponses = {
        esewa: {
          redirectUrl: success ? `https://esewa.com.np/checkout?txn=${txnId}&amt=${nprAmount}` : null,
          loginRequired: true,
          walletType: 'esewa',
        },
        khalti: {
          redirectUrl: success ? `https://pay.khalti.com/?pidx=${txnId}&amount=${gatewayAmount}` : null,
          loginRequired: true,
          walletType: 'khalti',
          qrSupported: true,
          qrPayload: JSON.stringify({
            type: 'khalti-qr',
            amount: gatewayAmount,
            refId: txnId,
            merchantId: merchant_id || 'PASAL_NEPAL',
          }),
        },
        fonepay: {
          redirectUrl: null,
          loginRequired: false,
          qrSupported: true,
          qrPayload: JSON.stringify({
            type: 'fonepay-qr',
            merchantId: merchant_id || 'PASAL_NEPAL',
            amount: nprAmount.toString(),
            refId: txnId,
            currency: 'NPR',
          }),
        },
        connectips: {
          redirectUrl: success ? `https://connectips.com/pay?txn=${txnId}&amt=${nprAmount}` : null,
          loginRequired: true,
          bankTransfer: true,
        },
        imepay: {
          redirectUrl: success ? `https://imepay.com.np/checkout?txn=${txnId}&amt=${nprAmount}` : null,
          loginRequired: true,
          walletType: 'imepay',
          qrSupported: true,
        },
        sct: {
          redirectUrl: success ? `https://sct.com.np/pay?txn=${txnId}&amt=${nprAmount}` : null,
          loginRequired: false,
          cardPayment: true,
          cardTypes: ['Visa', 'Mastercard', 'UnionPay'],
        },
      };

      const response = {
        success,
        gateway,
        gatewayName: cfg.name,
        txnId,
        order_id,
        amount: gatewayAmount,
        displayAmount: nprAmount,
        currency: 'NPR',
        amountLabel,
        processingFee,
        totalDeducted,
        message: success
          ? `${cfg.name} payment of रू ${nprAmount} processed successfully. Txn ID: ${txnId}`
          : `${cfg.name} payment failed. Please try again or use a different payment method.`,
        paymentStatus: success ? 'paid' : 'failed',
        timestamp: new Date().toISOString(),
        ...(gatewayResponses[gateway] || {}),
      };

      if (!success) {
        return res.status(200).json(response);
      }

      // Store transaction record
      try {
        await supabase.from('payment_transactions').insert({
          gateway,
          txn_id: txnId,
          order_id: order_id || null,
          amount: nprAmount,
          gateway_amount: gatewayAmount,
          currency: 'NPR',
          processing_fee: processingFee,
          status: 'success',
          customer_phone,
          customer_email,
          metadata: gatewayResponses[gateway] || {},
        });
      } catch (e) {
        console.error('Failed to store transaction:', e.message);
      }

      return res.status(200).json(response);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Payment API error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
