import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, Smartphone, QrCode, CreditCard, Banknote, Shield, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PaymentGateway } from '../lib/payments';

interface PaymentModalProps {
  gateway: PaymentGateway;
  amount: number;
  customerPhone: string;
  customerName: string;
  onClose: () => void;
  onSuccess: (txnId: string) => void;
  onFailure: (message: string) => void;
}

type Stage = 'init' | 'login' | 'qr' | 'card' | 'bank' | 'processing' | 'success' | 'failed' | 'cod_verify';

export default function PaymentModal({ gateway, amount, customerPhone, customerName, onClose, onSuccess, onFailure }: PaymentModalProps) {
  const [stage, setStage] = useState<Stage>('init');
  const [txnId, setTxnId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loginField, setLoginField] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [qrCountdown, setQrCountdown] = useState(300);
  const [codVerified, setCodVerified] = useState(false);
  const [codStep, setCodStep] = useState(0);

  const refId = `FP${Date.now().toString().slice(-8)}`;

  // QR countdown timer
  useEffect(() => {
    if (stage === 'qr' && qrCountdown > 0) {
      const timer = setTimeout(() => setQrCountdown(qrCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (stage === 'qr' && qrCountdown === 0) {
      setStage('failed');
      setErrorMsg('QR code expired. Please try again.');
    }
  }, [stage, qrCountdown]);

  // Initialize based on gateway type
  useEffect(() => {
    if (gateway.id === 'cod') {
      setStage('cod_verify');
    } else if (gateway.id === 'fonepay') {
      setStage('qr');
    } else if (gateway.id === 'sct') {
      setStage('card');
    } else if (gateway.id === 'connectips') {
      setStage('bank');
    } else {
      setStage('login');
    }
  }, [gateway.id]);

  const processPayment = async () => {
    setStage('processing');
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: gateway.id,
          amount,
          customer_phone: customerPhone,
        }),
      });
      const data = await res.json();
      setTxnId(data.txnId || '');

      setTimeout(() => {
        if (data.success) {
          setStage('success');
          setTimeout(() => onSuccess(data.txnId), 1500);
        } else {
          setStage('failed');
          setErrorMsg(data.message || 'Payment failed');
        }
      }, 2000);
    } catch {
      setStage('failed');
      setErrorMsg('Network error. Please try again.');
    }
  };

  const handleLogin = () => {
    if (gateway.requiresLogin && !loginField) return;
    // Send OTP for wallet login
    setOtpSent(true);
    setStage('processing');
    setTimeout(() => {
      // Simulate OTP sent
      setStage('login');
    }, 1500);
  };

  const handleOtpVerify = () => {
    if (otp.length < 4) return;
    processPayment();
  };

  const handleCodVerify = () => {
    setStage('processing');
    setTimeout(async () => {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gateway: 'cod', amount, customer_phone: customerPhone }),
      });
      const data = await res.json();
      setTxnId(data.txnId || '');
      setCodVerified(true);
      setStage('success');
      setTimeout(() => onSuccess(data.txnId), 1500);
    }, 1500);
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const qrPayload = JSON.stringify({
    type: gateway.id === 'fonepay' ? 'fonepay-qr' : `${gateway.id}-qr`,
    merchantId: 'PASAL_NEPAL',
    amount: amount.toString(),
    refId,
    currency: 'NPR',
  });

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E9ECEF] px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: gateway.bgColor }}>
              {gateway.icon}
            </div>
            <div>
              <h2 className="font-bold text-[#212529]">{gateway.name}</h2>
              <p className="text-xs text-[#6C757D]">{gateway.nameNp}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F8F9FA] rounded-lg">
            <X className="w-5 h-5 text-[#6C757D]" />
          </button>
        </div>

        <div className="p-5">
          {/* Amount Display */}
          <div className="bg-[#F8F9FA] rounded-xl p-4 mb-5 text-center">
            <p className="text-xs text-[#6C757D] mb-1">Amount to Pay</p>
            <p className="text-3xl font-extrabold text-[#000000]">रू {amount.toLocaleString('en-IN')}</p>
            {gateway.feePercent > 0 && (
              <p className="text-xs text-[#6C757D] mt-1">+{gateway.feePercent}% processing fee: रू {Math.round(amount * gateway.feePercent / 100)}</p>
            )}
            {gateway.id === 'khalti' && (
              <p className="text-xs text-[#5C2D91] mt-1 font-semibold">Khalti amount: {amount * 100} paisa</p>
            )}
          </div>

          {/* LOGIN STAGE (eSewa, Khalti, IME Pay) */}
          {stage === 'login' && !otpSent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-[#6C757D]">
                <Shield className="w-4 h-4 text-[#28A745]" />
                <span>Secure login via {gateway.name}</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6C757D]">
                  {gateway.id === 'esewa' ? 'eSewa ID (Email/Phone)' : gateway.id === 'khalti' ? 'Khalti Mobile Number' : 'IME Pay Mobile Number'}
                </label>
                <input
                  type="text"
                  value={loginField}
                  onChange={e => setLoginField(e.target.value)}
                  placeholder={gateway.id === 'esewa' ? 'your@email.com or 98XXXXXXXX' : '98XXXXXXXX'}
                  className="w-full mt-1 px-3 py-2.5 border border-[#DEE2E6] rounded-lg text-sm focus:ring-2 focus:ring-[#FF6600] outline-none"
                  autoFocus
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={!loginField}
                className="w-full text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-colors"
                style={{ background: gateway.color }}
              >
                Send OTP to {gateway.name}
              </button>
              <p className="text-xs text-[#6C757D] text-center">You'll receive an OTP on your registered mobile number</p>
            </div>
          )}

          {/* OTP STAGE */}
          {stage === 'login' && otpSent && (
            <div className="space-y-4">
              <div className="bg-[#28A745]/10 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#28A745] shrink-0" />
                <p className="text-sm text-[#28A745] font-medium">OTP sent to {customerPhone}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6C757D]">Enter OTP (4 digits)</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full mt-1 px-3 py-3 border border-[#DEE2E6] rounded-lg text-2xl text-center tracking-[0.5em] font-bold focus:ring-2 focus:ring-[#FF6600] outline-none"
                  autoFocus
                />
              </div>
              <button
                onClick={handleOtpVerify}
                disabled={otp.length < 4}
                className="w-full text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-colors"
                style={{ background: gateway.color }}
              >
                Verify & Pay रू {amount.toLocaleString('en-IN')}
              </button>
              <button onClick={() => setOtpSent(false)} className="w-full text-sm text-[#17A2B8] font-semibold">← Change number</button>
            </div>
          )}

          {/* QR STAGE (FonePay, Khalti QR, IME Pay QR) */}
          {stage === 'qr' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="bg-white p-4 rounded-2xl border-2 shadow-sm" style={{ borderColor: `${gateway.color}30` }}>
                    <QRCodeSVG value={qrPayload} size={200} level="M" fgColor="#0F1B3D" bgColor="#FFFFFF" />
                  </div>
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 rounded-tl-lg" style={{ borderColor: gateway.color }} />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 rounded-tr-lg" style={{ borderColor: gateway.color }} />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 rounded-bl-lg" style={{ borderColor: gateway.color }} />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 rounded-br-lg" style={{ borderColor: gateway.color }} />
                </div>

                <div className="text-center">
                  <p className="text-xs text-[#6C757D]">Scan QR with {gateway.name} app</p>
                  <p className="text-xs text-[#6C757D]">or any Nepal bank mobile app</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#6C757D]">
                  <Clock className="w-3.5 h-3.5" />
                  QR expires in {Math.floor(qrCountdown / 60)}:{String(qrCountdown % 60).padStart(2, '0')}
                </div>

                {gateway.id === 'fonepay' && (
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {['NIC Asia', 'Global IME', 'NMB', 'Everest', 'Nabil', 'Prabhu'].map(b => (
                      <span key={b} className="text-[10px] bg-[#F8F9FA] text-[#6C757D] px-2 py-0.5 rounded-full">{b}</span>
                    ))}
                  </div>
                )}

                <div className="w-full pt-2">
                  <button
                    onClick={processPayment}
                    className="w-full text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    style={{ background: gateway.color }}
                  >
                    <QrCode className="w-4 h-4" /> I've Scanned & Paid
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CARD STAGE (SCT) */}
          {stage === 'card' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-[#6C757D]">
                <CreditCard className="w-4 h-4 text-[#E91E63]" />
                <span>Enter your Nepali card details</span>
              </div>

              {/* Card preview */}
              <div className="rounded-xl p-4 text-white relative overflow-hidden h-40" style={{ background: 'linear-gradient(135deg, #E91E63, #C2185B)' }}>
                <div className="flex justify-between items-start">
                  <span className="text-xs opacity-80">SmartChoice Technologies</span>
                  <span className="text-xs font-bold">SCT</span>
                </div>
                <div className="w-10 h-7 rounded bg-yellow-400/30 mt-4 border border-yellow-400/50" />
                <p className="font-mono text-lg tracking-wider mt-2">{cardNumber || '•••• •••• •••• ••••'}</p>
                <div className="flex justify-between mt-3 text-xs">
                  <span>{cardExpiry || 'MM/YY'}</span>
                  <span>VISA / Mastercard</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6C757D]">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="4242 4242 4242 4242"
                  className="w-full mt-1 px-3 py-2.5 border border-[#DEE2E6] rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#E91E63] outline-none"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#6C757D]">Expiry</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="w-full mt-1 px-3 py-2.5 border border-[#DEE2E6] rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#E91E63] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6C757D]">CVV</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="•••"
                    className="w-full mt-1 px-3 py-2.5 border border-[#DEE2E6] rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#E91E63] outline-none"
                  />
                </div>
              </div>
              <button
                onClick={processPayment}
                disabled={cardNumber.replace(/\s/g, '').length < 16 || cardExpiry.length < 5 || cardCvv.length < 3}
                className="w-full bg-[#E91E63] hover:bg-[#C2185B] text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-colors"
              >
                Pay रू {amount.toLocaleString('en-IN')}
              </button>
              <p className="text-xs text-[#6C757D] text-center flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> 256-bit encrypted • SCT secured
              </p>
            </div>
          )}

          {/* BANK STAGE (ConnectIPS) */}
          {stage === 'bank' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-[#6C757D]">
                <Banknote className="w-4 h-4 text-[#00897B]" />
                <span>Direct bank-to-bank transfer via ConnectIPS</span>
              </div>

              <div className="bg-[#00897B]/5 border border-[#00897B]/20 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6C757D]">Transfer Amount</span>
                  <span className="font-bold text-[#000000]">रू {amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6C757D]">Beneficiary</span>
                  <span className="font-semibold text-[#212529]">Pasal Nepal Pvt. Ltd.</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6C757D]">Reference ID</span>
                  <span className="font-mono font-semibold text-[#212529]">{refId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6C757D]">Processing Time</span>
                  <span className="font-semibold text-[#00897B]">1-2 hours</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#6C757D] mb-2">Select your bank</p>
                <div className="grid grid-cols-2 gap-2">
                  {['NIC Asia Bank', 'Nabil Bank', 'Global IME', 'NMB Bank', 'Everest Bank', 'Prabhu Bank', 'Nepal Bank', 'Rastriya Banijya'].map(bank => (
                    <button
                      key={bank}
                      onClick={processPayment}
                      className="text-xs font-medium border border-[#DEE2E6] rounded-lg p-2.5 hover:border-[#00897B] hover:bg-[#00897B]/5 transition-colors text-left"
                    >
                      🏦 {bank}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-[#6C757D] text-center">You'll be redirected to your bank's portal to complete the transfer</p>
            </div>
          )}

          {/* COD VERIFICATION STAGE */}
          {stage === 'cod_verify' && (
            <div className="space-y-4">
              <div className="bg-[#28A745]/5 border border-[#28A745]/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Banknote className="w-5 h-5 text-[#28A745]" />
                  <h3 className="font-bold text-[#212529]">Cash on Delivery Confirmation</h3>
                </div>
                <p className="text-sm text-[#6C757D] mb-3">
                  You'll pay <span className="font-bold text-[#000000]">रू {amount.toLocaleString('en-IN')}</span> in cash when your order is delivered to your address.
                </p>

                <div className="space-y-2">
                  {[
                    'Order placed & merchant confirms availability',
                    'Courier dispatched with your order',
                    'Delivery agent calls before arriving',
                    'Inspect & pay exact cash amount',
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${codStep >= i ? 'bg-[#28A745] text-white' : 'bg-[#E9ECEF] text-[#6C757D]'}`}>
                        {codStep > i ? '✓' : i + 1}
                      </div>
                      <span className={codStep >= i ? 'text-[#212529]' : 'text-[#6C757D]'}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#FFF8E1] border border-[#FFD814]/30 rounded-lg p-3">
                <p className="text-xs text-[#6C757D]">
                  ⚠️ <strong>Please keep exact change ready.</strong> Delivery agent may not carry change for large amounts.
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={codVerified} onChange={e => setCodVerified(e.target.checked)} className="w-4 h-4 accent-[#28A745]" />
                  <span className="text-[#212529]">I confirm I will pay रू {amount.toLocaleString('en-IN')} in cash on delivery</span>
                </label>
              </div>

              <button
                onClick={handleCodVerify}
                disabled={!codVerified}
                className="w-full bg-[#28A745] hover:bg-[#218838] text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> Confirm COD Order
              </button>
            </div>
          )}

          {/* PROCESSING STAGE */}
          {stage === 'processing' && (
            <div className="flex flex-col items-center py-12 gap-4">
              <Loader2 className="w-12 h-12 animate-spin" style={{ color: gateway.color }} />
              <div className="text-center">
                <p className="font-bold text-[#212529]">Processing payment...</p>
                <p className="text-sm text-[#6C757D] mt-1">
                  {gateway.id === 'cod' ? 'Confirming COD order' : `Connecting to ${gateway.name}...`}
                </p>
              </div>
              <div className="w-full bg-[#F8F9FA] rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full animate-pulse" style={{ background: gateway.color, width: '60%' }} />
              </div>
            </div>
          )}

          {/* SUCCESS STAGE */}
          {stage === 'success' && (
            <div className="flex flex-col items-center py-12 gap-4 animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-[#28A745]/10 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-[#28A745]" />
              </div>
              <div className="text-center">
                <p className="text-xl font-extrabold text-[#212529]">
                  {gateway.id === 'cod' ? 'COD Order Confirmed!' : 'Payment Successful!'}
                </p>
                <p className="text-sm text-[#6C757D] mt-1">
                  {gateway.id === 'cod'
                    ? 'Pay रू ' + amount.toLocaleString('en-IN') + ' on delivery'
                    : 'रू ' + amount.toLocaleString('en-IN') + ' paid via ' + gateway.name}
                </p>
                {txnId && (
                  <p className="text-xs font-mono text-[#6C757D] mt-2">Txn ID: {txnId}</p>
                )}
              </div>
            </div>
          )}

          {/* FAILED STAGE */}
          {stage === 'failed' && (
            <div className="flex flex-col items-center py-12 gap-4">
              <div className="w-20 h-20 rounded-full bg-[#DC3545]/10 flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-[#DC3545]" />
              </div>
              <div className="text-center">
                <p className="text-xl font-extrabold text-[#212529]">Payment Failed</p>
                <p className="text-sm text-[#6C757D] mt-1">{errorMsg}</p>
              </div>
              <button
                onClick={() => {
                  setStage(gateway.id === 'cod' ? 'cod_verify' : gateway.id === 'fonepay' ? 'qr' : gateway.id === 'sct' ? 'card' : gateway.id === 'connectips' ? 'bank' : 'login');
                  setErrorMsg('');
                }}
                className="bg-[#FF6600] hover:bg-[#e65c00] text-white font-bold px-6 py-2.5 rounded-lg"
              >
                Try Again
              </button>
              <button onClick={() => onFailure(errorMsg)} className="text-sm text-[#6C757D] font-semibold">Choose another method</button>
            </div>
          )}
        </div>

        {/* Footer security note */}
        {stage !== 'success' && stage !== 'failed' && stage !== 'processing' && (
          <div className="px-5 py-3 border-t border-[#E9ECEF] flex items-center justify-center gap-2 text-xs text-[#6C757D]">
            <Shield className="w-3.5 h-3.5 text-[#28A745]" />
            Secured by {gateway.name} • NPR transactions only
          </div>
        )}
      </div>
    </div>
  );
}
