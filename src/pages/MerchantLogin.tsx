import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Store } from 'lucide-react';
import supabase from '../lib/supabase';

export default function MerchantLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/merchant/dashboard');
    } catch (err: any) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#FF6600] flex items-center justify-center font-extrabold text-white text-xl">P</div>
          <span className="font-extrabold text-2xl">Pasal<span className="text-[#FF6600]">Nepal</span></span>
        </Link>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><Store className="w-5 h-5 text-[#FF6600]" /><h1 className="text-xl font-bold text-[#212529]">Merchant Login</h1></div>
          <p className="text-sm text-[#6C757D] mb-6">Sign in to manage your store</p>
          {error && <div className="bg-[#DC3545]/10 text-[#DC3545] text-sm p-3 rounded-md mb-4">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="text-xs font-semibold text-[#6C757D]">Email</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="you@store.com" /></div>
            <div><label className="text-xs font-semibold text-[#6C757D]">Password</label><input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" /></div>
            <button type="submit" disabled={loading} className="w-full bg-[#FF6600] hover:bg-[#e65c00] disabled:opacity-60 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}</button>
          </form>
          <div className="mt-6 pt-4 border-t border-[#E9ECEF] text-center text-sm text-[#6C757D]">
            Don't have a store? <Link to="/sell" className="text-[#17A2B8] font-semibold">Create one free</Link>
          </div>
        </div>
        <p className="text-center text-xs text-[#6C757D] mt-4">Demo: use the merchant account you created, or <Link to="/sell" className="underline">sign up</Link>.</p>
      </div>
    </div>
  );
}
