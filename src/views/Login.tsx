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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
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
    <div className="min-h-screen bg-[var(--color-neu-bg)] flex items-center justify-center p-6 font-body">
      {/* Language Toggle */}
      {setLang && (
        <div className="absolute top-8 right-8 flex bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] p-2 rounded-full border border-white/40">
          <button
            onClick={() => setLang('en')}
            className={cn(
              "px-6 py-2.5 rounded-full font-black text-xs transition-all uppercase tracking-widest",
              lang === 'en'
                ? "bg-blue-600 text-white shadow-[0_5px_15px_rgba(37,99,235,0.3)]"
                : "text-gray-400 hover:text-black"
            )}
          >
            EN
          </button>
          <button
            onClick={() => setLang('zh')}
            className={cn(
              "px-6 py-2.5 rounded-full font-black text-xs transition-all uppercase tracking-widest",
              lang === 'zh'
                ? "bg-blue-600 text-white shadow-[0_5px_15px_rgba(37,99,235,0.3)]"
                : "text-gray-400 hover:text-black"
            )}
          >
            中文
          </button>
        </div>
      )}

      {/* Main Login Card */}
      <div className="max-w-md w-full bg-[var(--color-neu-bg)] rounded-[3.5rem] p-12 shadow-[var(--shadow-neu-flat)] border border-white/20 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/60">
            <Lock size={48} strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-black text-black tracking-tighter mb-3 uppercase [text-shadow:-2px_2px_4px_var(--color-neu-shadow-dark)]">
            {t('portal')}
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] bg-white/50 px-6 py-2 rounded-full inline-block shadow-[var(--shadow-neu-sm)]">
            {t('subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-5 bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-widest rounded-3xl border border-red-100 shadow-[var(--shadow-neu-sm)] text-center animate-shake">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-4">
                {t('user')}
              </label>
              <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[2.5rem] p-1.5 border border-black/5 flex items-center px-5 transition-all focus-within:border-blue-500/20">
                <User size={22} strokeWidth={3} className="text-gray-300 ml-2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent px-4 py-5 text-sm font-black text-black outline-none placeholder:text-gray-300"
                  placeholder={t('enterUser')}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-4">
                {t('pass')}
              </label>
              <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[2.5rem] p-1.5 border border-black/5 flex items-center px-5 transition-all focus-within:border-blue-500/20">
                <Key size={22} strokeWidth={3} className="text-gray-300 ml-2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent px-4 py-5 text-sm font-black text-black outline-none placeholder:text-gray-300"
                  placeholder={t('enterPass')}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 mt-6 bg-blue-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(37,99,235,0.4)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {t('btn')}
                <ArrowRight size={24} strokeWidth={3} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
