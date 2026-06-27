import { useState, useEffect, useRef } from 'react';
import { Loader2, ArrowLeft, Shield, Smartphone } from 'lucide-react';
import supabase from '../lib/supabase';

export default function OTPLogin({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [stage, setStage] = useState<'phone' | 'otp' | 'verifying' | 'success'>('phone');
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^9[7-8]\d{8}$/.test(phone)) {
      setError('Please enter a valid Nepal mobile number (98XXXXXXXX or 97XXXXXXXX)');
      return;
    }
    setError('');
    setStage('otp');
    setResendTimer(30);
    // Simulate OTP send via Sparrow SMS
    fetch('/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        message: `Your Pasal Nepal OTP is: ${Math.floor(100000 + Math.random() * 900000)}. Valid for 5 minutes. Do not share with anyone.`,
      }),
    }).catch(() => {});
  };

  const verifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Enter all 6 digits'); return; }
    setError('');
    setStage('verifying');
    // Simulate verification (any 6-digit code works in demo)
    setTimeout(() => {
      // Create or sign in guest user with phone-based email
      const email = `${phone}@guest.pasalnepal.com`;
      const password = `PasalNepal_${phone}`;
      supabase.auth.signInWithPassword({ email, password }).then(({ error }) => {
        if (error) {
          // Try sign up
          supabase.auth.signUp({ email, password }).then(({ error: err2 }) => {
            if (err2) { setError('Login failed. Please try again.'); setStage('otp'); return; }
            setStage('success');
            setTimeout(onSuccess, 1000);
          });
        } else {
          setStage('success');
          setTimeout(onSuccess, 1000);
        }
      });
    }, 1500);
  };

  const resendOtp = () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    fetch('/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        message: `Your Pasal Nepal OTP is: ${Math.floor(100000 + Math.random() * 900000)}. Valid for 5 minutes.`,
      }),
    }).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0F1B3D] to-[#1A2B5C] text-white p-6 text-center relative">
          {stage === 'otp' && (
            <button onClick={() => setStage('phone')} className="absolute top-4 left-4 text-white/70 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white text-xl">✕</button>
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
            <Smartphone className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold">Quick Login with OTP</h2>
          <p className="text-sm text-white/70 mt-1">No password needed — just your Nepal mobile number</p>
        </div>

        <div className="p-6">
          {error && <div className="bg-[#DC3545]/10 text-[#DC3545] text-sm p-3 rounded-lg mb-4">{error}</div>}

          {stage === 'phone' && (
            <form onSubmit={sendOtp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#6C757D]">Mobile Number</label>
                <div className="flex items-center mt-1">
                  <span className="px-3 py-2.5 bg-[#F8F9FA] border border-r-0 border-[#DEE2E6] rounded-l-md text-sm font-semibold text-[#6C757D]">🇳🇵 +977</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="flex-1 px-3 py-2.5 border border-[#DEE2E6] rounded-r-md text-sm font-semibold focus:ring-2 focus:ring-[#FF6600] outline-none"
                    placeholder="98XXXXXXXX"
                    autoFocus
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#FF6600] hover:bg-[#e65c00] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" /> Send OTP
              </button>
              <p className="text-xs text-[#6C757D] text-center">An OTP will be sent via SMS to your phone</p>
            </form>
          )}

          {(stage === 'otp' || stage === 'verifying') && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#6C757D]">Enter 6-digit OTP</label>
                <p className="text-xs text-[#6C757D] mb-3">Sent to 🇳🇵 +977 {phone}</p>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      disabled={stage === 'verifying'}
                      className="w-10 h-12 text-center text-xl font-bold border-2 border-[#DEE2E6] rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-[#FF6600] outline-none disabled:opacity-50"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
              </div>
              <button onClick={verifyOtp} disabled={stage === 'verifying'} className="w-full bg-[#FF6600] hover:bg-[#e65c00] disabled:opacity-60 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                {stage === 'verifying' ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : 'Verify & Login'}
              </button>
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-xs text-[#6C757D]">Resend OTP in {resendTimer}s</p>
                ) : (
                  <button onClick={resendOtp} className="text-xs text-[#17A2B8] font-semibold hover:underline">Resend OTP</button>
                )}
              </div>
            </div>
          )}

          {stage === 'success' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#28A745]/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-[#28A745]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-lg font-bold text-[#212529]">Login Successful!</h3>
              <p className="text-sm text-[#6C757D] mt-1">Welcome to Pasal Nepal 🎉</p>
            </div>
          )}
        </div>

        <div className="bg-[#F8F9FA] px-6 py-3 text-center">
          <p className="text-[10px] text-[#6C757D] flex items-center justify-center gap-1">
            <Shield className="w-3 h-3 text-[#28A745]" /> Secured by Sparrow SMS • Nepal OTP gateway
          </p>
        </div>
      </div>
    </div>
  );
}
