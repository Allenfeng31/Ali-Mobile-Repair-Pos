import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

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
    
    // Poll every 15 seconds to keep it live without hammering the server
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
    if (status === 'Completed') return <CheckCircle className="text-green-500 w-16 h-16 sm:w-20 sm:h-20" />;
    if (status === 'Urgent') return <AlertTriangle className="text-red-500 w-16 h-16 sm:w-20 sm:h-20" />;
    return <Clock className="text-blue-500 w-16 h-16 sm:w-20 sm:h-20" />;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4 w-full bg-slate-50 dark:bg-gray-900">
      
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 overflow-hidden flex flex-col items-center border border-slate-100 dark:border-gray-700">
        
        {/* 1. Portal Top Badge */}
        <div className="absolute top-0 left-0 w-full bg-[#Edf7ed] text-[#1e4620] dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold py-1.5 flex justify-center items-center gap-1.5 tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4caf50] animate-pulse"></span>
          Connection Stable
        </div>

        {/* 2. Decorative Background Blob (Safe, absolute positioned) */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-slate-50 dark:bg-gray-700/30 rounded-full z-0 pointer-events-none"></div>

        {/* 3. Main Card Content */}
        <div className="relative z-10 w-full flex flex-col items-center mt-6">
          
          {/* Brand Header */}
          <div className="w-12 h-12 bg-slate-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-slate-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
          </div>
          <h2 className="text-sm font-black tracking-widest uppercase text-slate-900 dark:text-white">Ali Mobile Repair</h2>
          <p className="text-xs text-slate-500 mb-8">Customer Service Portal</p>

          {/* Dynamic State: Form vs Result */}
          {!repair ? (
            <div className="w-full text-center flex flex-col items-center">
              <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Track Your Repair</h3>
              <form onSubmit={performCheck} className="w-full flex flex-col gap-3">
                <input 
                  type="text" 
                  value={id} 
                  onChange={(e) => setId(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-gray-700 border-transparent focus:border-slate-300 focus:ring-0 rounded-xl p-3.5 text-center text-slate-900 dark:text-white font-medium"
                  placeholder="Order ID or Phone Number"
                  required
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#003B4A] text-white rounded-xl p-3.5 font-bold hover:bg-[#002a35] transition-colors disabled:opacity-50 mt-1"
                >
                  {loading ? "Searching..." : "Check Status"}
                </button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </form>
            </div>
          ) : (
            <div className="w-full text-center flex flex-col items-center">
               <h3 className="text-xl font-bold mb-1 text-slate-800 dark:text-white">Hello, {repair.customerName || 'Customer'}!</h3>
               <p className="text-sm text-slate-500 mb-6">Here is the live status of your repair.</p>
               
               {/* You can keep your existing repair details rendering here */}
               <div className="w-full bg-slate-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-2">
                  <div className="flex justify-center mb-4">
                    <StatusIcon status={repair.status} />
                  </div>
                  <p className="text-[#003B4A] dark:text-blue-400 font-black text-xl mb-1">{repair.status}</p>
                  <p className="font-bold text-center text-slate-800 dark:text-white">{repair.repairItem}</p>
                  <p className="text-sm text-slate-500 dark:text-gray-400 text-center font-medium mb-4">{repair.modelNumber}</p>
               </div>

               <button onClick={() => { setRepair(null); setId(''); }} className="mt-4 text-sm font-semibold text-slate-500 hover:text-slate-800 underline dark:hover:text-white">
                 Start Over
               </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
