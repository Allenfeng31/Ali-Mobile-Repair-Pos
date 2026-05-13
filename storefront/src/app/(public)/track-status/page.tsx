'use client';

import { useState } from 'react';

export default function TrackStatusPage() {
  const [id, setId] = useState('');
  const [repair, setRepair] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const performCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/proxy/repairs/track/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error('Repair not found. Please check your ID.');
      const data = await res.json();
      setRepair(data.repair || data);
    } catch (err: any) {
      setError(err.message || 'Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-40 pb-16 px-4 w-full bg-slate-50">
      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-slate-800">Track Repair Status</h1>
        <p className="text-gray-500 mt-2">Enter your Order ID (found on your receipt) to check the real-time status.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md mt-8 flex flex-col items-center text-center">
        {!repair ? (
          <form onSubmit={performCheck} className="w-full flex flex-col gap-5">
            <div className="flex flex-col text-left">
              <label className="text-sm font-semibold mb-2 text-slate-800">Order ID or Phone Number</label>
              <input 
                type="text" 
                value={id} 
                onChange={(e) => setId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. REP-12345"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#007aff] text-white rounded-lg p-3.5 font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Searching..." : "Check Status"}
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>
        ) : (
          <div className="w-full flex flex-col items-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Ticket: {repair.id || id}</h3>
            {repair.customerName && <p className="text-slate-600 mb-4">Customer: {repair.customerName}</p>}
            
            <div className="w-full border border-blue-100 bg-blue-50/50 rounded-xl p-6 my-4">
              <p className="text-sm text-slate-500 mb-1">Current Status:</p>
              <p className="text-[#007aff] font-bold text-2xl">{repair.status}</p>
            </div>

            <button 
              onClick={() => setRepair(null)} 
              className="mt-4 text-sm font-medium text-[#007aff] hover:underline"
            >
              Search Another Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
