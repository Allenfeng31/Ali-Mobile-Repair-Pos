"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Dummy Email Mapping Pattern
      const mappedEmail = username.includes('@') ? username : `${username}@pos.local`;

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: mappedEmail,
        password: password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // Success - redirect to dashboard
      router.push('/dashboard/analytics');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during authentication.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-6 font-sans">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600 opacity-10 blur-[160px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900/50 border border-white/10 backdrop-blur-3xl p-12 rounded-[3.5rem] shadow-2xl flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-600/40 relative">
            <div className="absolute inset-0 bg-blue-400 rounded-3xl animate-ping opacity-20" />
            <ShieldCheck className="text-white relative z-10" size={40} />
          </div>

          <h1 className="text-4xl font-black text-white tracking-tighter mb-10">
            Boss <span className="text-blue-500">Terminal</span>
          </h1>
          
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 mb-4">
                <AlertCircle className="text-red-400 shrink-0" size={20} />
                <div className="text-red-400 text-xs font-bold text-left leading-tight">
                  {error}
                </div>
              </div>
            )}

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">
                Username or Email
              </label>
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="allen"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/10"
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">
                Access Password
              </label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Authorize Access"
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 w-full">
            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">
              Ali Mobile Repair <span className="text-blue-500/40">Enterprise</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
