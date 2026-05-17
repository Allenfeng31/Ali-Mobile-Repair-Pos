import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { CheckCircle, Clock, AlertTriangle, Smartphone, Search, RefreshCw, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TrackStatusPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repair, setRepair] = useState<any>(null);
  const [id, setId] = useState('');

  const performFetch = async (searchId: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.trackRepair(searchId);
      setRepair({
        ...data.repair,
        customerName: data.customerName
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch repair status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get('id');

    if (urlId) {
      setId(urlId);
      performFetch(urlId);
    }
  }, []);

  useEffect(() => {
    if (!repair || !id) return;
    
    const interval = setInterval(() => {
      api.trackRepair(id).then(data => {
        setRepair({
          ...data.repair,
          customerName: data.customerName
        });
      }).catch(err => {
        console.error("Polling error", err);
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [repair, id]);

  const performCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (id.trim()) {
      performFetch(id);
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'Completed') return <CheckCircle className="text-emerald-500 w-16 h-16 sm:w-20 sm:h-20" />;
    if (status === 'Urgent') return <AlertTriangle className="text-red-500 w-16 h-16 sm:w-20 sm:h-20" />;
    return <Clock className="text-blue-500 w-16 h-16 sm:w-20 sm:h-20" />;
  };

  return (
    <div className="min-h-screen bg-[var(--color-neu-bg)] flex flex-col items-center justify-center py-20 px-6 font-body">
      
      <div className="w-full max-w-lg bg-[var(--color-neu-bg)] rounded-[3rem] shadow-[var(--shadow-neu-flat)] p-8 sm:p-12 relative overflow-hidden border border-white/20">
        
        {/* Status Badge */}
        <div className="absolute top-0 left-0 w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] text-[10px] font-black py-2.5 flex justify-center items-center gap-2 tracking-[0.2em] uppercase text-emerald-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          Live Repair Status
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center mt-10 mb-12">
          <div className="w-16 h-16 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-2xl flex items-center justify-center mb-6 text-blue-600">
            <Smartphone size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-lg font-black tracking-[0.3em] uppercase text-black mb-1">Ali Mobile Repair</h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Customer Service Portal</p>
        </div>

        {/* Dynamic Content */}
        {!repair ? (
          <div className="w-full">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-black text-black mb-2">Track Your Repair</h3>
              <p className="text-sm font-bold text-gray-500">Enter your Order ID or Phone Number below.</p>
            </div>

            <form onSubmit={performCheck} className="space-y-6">
              <div className="space-y-2">
                <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl p-1">
                  <input 
                    type="text" 
                    value={id} 
                    onChange={(e) => setId(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 px-6 py-5 text-center text-black font-black text-lg placeholder:text-gray-400 placeholder:font-bold"
                    placeholder="ID or Phone Number"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[var(--color-neu-bg)] text-blue-600 rounded-[2rem] py-6 font-black text-sm uppercase tracking-widest shadow-[var(--shadow-neu-flat)] hover:opacity-90 active:shadow-[var(--shadow-neu-pressed)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Search size={20} strokeWidth={3} />}
                {loading ? "SEARCHING..." : "CHECK STATUS"}
              </button>

              {error && (
                <div className="mt-6 p-4 bg-red-50/50 rounded-2xl border border-red-100">
                  <p className="text-red-500 text-xs font-bold text-center">{error}</p>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-black text-black mb-1">Hello, {repair.customerName || 'Customer'}!</h3>
              <p className="text-sm font-bold text-gray-500">Here is the live status of your device.</p>
            </div>

            <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[2.5rem] p-10 flex flex-col items-center mb-10">
              <div className="mb-8 p-6 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[2rem]">
                <StatusIcon status={repair.status} />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 mb-2">Current Status</p>
                <p className="text-3xl font-black text-black leading-tight mb-4 uppercase">{repair.status}</p>
                
                <div className="h-0.5 w-12 bg-gray-200 mx-auto mb-6 shadow-inner"></div>
                
                <div className="space-y-1">
                  <p className="text-lg font-black text-black">{repair.repairItem}</p>
                  <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">{repair.modelNumber}</p>
                </div>

                {repair.totalPrice > 0 && (
                  <div className="mt-8 pt-8 border-t border-black/5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Service Amount</p>
                    <p className="text-2xl font-black text-black">${repair.totalPrice.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => { setRepair(null); setId(''); }} 
              className="w-full flex items-center justify-center gap-2 text-xs font-black text-gray-500 hover:text-blue-600 uppercase tracking-widest transition-all group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Check Another Device
            </button>
          </div>
        )}

      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center opacity-40">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">© Ali Mobile Repair • Professional Tech Solutions</p>
      </div>
    </div>
  );
}
