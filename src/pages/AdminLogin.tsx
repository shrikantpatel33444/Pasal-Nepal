import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';
import supabase from '../lib/supabase';

export default function AdminLogin() {
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
      navigate('/admin/panel');
    } catch (err: any) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0F1B3D] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#FF6600] flex items-center justify-center font-extrabold text-white text-xl">P</div>
          <span className="font-extrabold text-2xl text-white">Pasal<span className="text-[#FF6600]">Nepal</span></span>
        </Link>
        <div className="bg-white rounded-xl p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-1"><Shield className="w-5 h-5 text-[#0F1B3D]" /><h1 className="text-xl font-bold text-[#212529]">Super Admin</h1></div>
          <p className="text-sm text-[#6C757D] mb-6">Platform control panel access</p>
          {error && <div className="bg-[#DC3545]/10 text-[#DC3545] text-sm p-3 rounded-md mb-4">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="text-xs font-semibold text-[#6C757D]">Admin Email</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" placeholder="admin@pasalnepal.com" /></div>
            <div><label className="text-xs font-semibold text-[#6C757D]">Password</label><input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-md text-sm focus:ring-2 focus:ring-[#FF6600] outline-none" /></div>
            <button type="submit" disabled={loading} className="w-full bg-[#0F1B3D] hover:bg-[#1A2B5C] disabled:opacity-60 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Access Admin Panel'}</button>
          </form>
        </div>
        <p className="text-center text-xs text-white/50 mt-4">Demo admin: admin@pasalnepal.com / admin123</p>
      </div>
    </div>
  );
}
