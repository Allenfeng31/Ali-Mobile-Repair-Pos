"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: 'allen@pos.local',
          password: 'Password123!', // Using a robust placeholder, the user can change this if needed
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

    autoLogin();
  }, [router, supabase.auth]);

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

          <h1 className="text-4xl font-black text-white tracking-tighter mb-4">
            Boss <span className="text-blue-500">Terminal</span>
          </h1>
          
          <div className="flex flex-col items-center gap-4">
            {loading ? (
              <>
                <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                  <Loader2 className="text-blue-500 animate-spin" size={20} />
                  <span className="text-white/80 font-bold tracking-wide">Authenticating Boss Terminal...</span>
                </div>
                <p className="text-white/30 text-xs font-medium uppercase tracking-[0.2em]">Secure Handshake in Progress</p>
              </>
            ) : error ? (
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] flex flex-col items-center gap-4">
                  <AlertCircle className="text-red-400" size={32} />
                  <div className="text-red-400 text-sm font-bold leading-relaxed">
                    Authentication Failed:<br/>
                    <span className="opacity-70 font-medium">{error}</span>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            ) : null}
          </div>

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
