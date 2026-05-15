import React, { useState } from 'react';
import { Lock, User, ArrowRight, Key } from 'lucide-react';
import { dict, Language } from '../lib/i18n';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: (user: any) => void;
  lang?: Language;
  setLang?: (l: Language) => void;
}

export function LoginView({ onLogin, lang = 'en', setLang }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Renamed from 'loading' to 'isLoading'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Dummy Email Mapping Pattern
      const mappedEmail = username.includes('@') ? username : `${username}@pos.local`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: mappedEmail,
        password
      });

      if (error) throw error;
      if (data.user) {
        onLogin(data.user);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const t = (k: string) => dict[lang].login[k] || k;

  return (
    <div className="min-h-screen bg-blue-500 hover:bg-blue-600 flex items-center justify-center p-4 relative">
      {/* Top Right Toggle */}
      {setLang && (
        <div className="absolute top-6 right-6 flex bg-white/20 backdrop-blur-md p-1 rounded-full shadow-lg border border-white/30 text-white font-bold text-xs">
          <button 
            onClick={() => setLang('en')} 
            className={cn("px-4 py-2 rounded-full transition-all", lang === 'en' ? "bg-white text-blue-500" : "hover:bg-white/10")}
          >
            EN
          </button>
          <button 
            onClick={() => setLang('zh')} 
            className={cn("px-4 py-2 rounded-full transition-all", lang === 'zh' ? "bg-white text-blue-500" : "hover:bg-white/10")}
          >
            中文
          </button>
        </div>
      )}

      {/* Decorative Elements */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-tertiary/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-zinc-900/50/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl border border-zinc-800/20 relative z-10">
        <div className="text-center mb-10 relative z-10">
          <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-500/20">
            <Lock size={36} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">{t('portal')}</h1>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {error && (
            <div className="p-4 bg-red-900/30 text-red-400 text-sm font-bold rounded-2xl flex items-center justify-center border border-red-500/20 shadow-inner">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 pl-2">
                {t('user')}
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-white font-semibold outline-none transition-all shadow-inner"
                  placeholder={t('enterUser')}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 pl-2">
                {t('pass')}
              </label>
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-white font-semibold outline-none transition-all shadow-inner"
                  placeholder={t('enterPass')}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-4 bg-blue-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {t('btn')}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>    
    </div>
  );
}
