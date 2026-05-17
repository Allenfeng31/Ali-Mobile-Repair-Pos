import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Smartphone, CheckCircle, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export function PortalView() {
  const [view, setView] = useState<'home' | 'dropoff' | 'track'>('home');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);
  const [backendOk, setBackendOk] = React.useState(false);

  // Check backend connection
  React.useEffect(() => {
    api.getIp().then(() => setBackendOk(true)).catch(() => setBackendOk(false));
  }, []);

  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Drop-off form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [problem, setProblem] = useState('');
  const [password, setPassword] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [referralOther, setReferralOther] = useState('');
  const [upsells, setUpsells] = useState<any[]>([]);
  const [selectedUpsells, setSelectedUpsells] = useState<string[]>([]);

  // Fetch upsells
  useEffect(() => {
    api.getUpsells().then(setUpsells).catch(console.error);
  }, []);

  // Polling for live status
  useEffect(() => {
    if (view !== 'track' || !phone) return;

    const poll = async () => {
      try {
        const data = await api.getCustomers();
        const found = data.find((c: any) => c.phone === phone);
        if (found) {
          // sort repairs by timestamp to show the latest
          found.repairs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setCustomer(found);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [view, phone]);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await api.trackRepair(phone.trim());
      if (data && data.repair) {
        setCustomer({
          name: data.customerName,
          repairs: [data.repair]
        });
      } else {
        setErrorMsg('Repair not found. Please check your ID or Phone Number.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Repair not found. Please check your ID or Phone Number.');
    }
    setLoading(false);
  };

  const handleDropoffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !deviceModel || !problem) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const existing = await api.getCustomers();
      let targetCustomer = existing.find((c: any) => c.phone === phone);

      if (!targetCustomer) {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        targetCustomer = await api.createCustomer({
          id: Math.random().toString(36).substr(2, 9).toUpperCase(),
          name,
          phone,
          email,
          initials,
          status: 'In Processing',
          statusColor: 'tertiary',
          lastVisit: 'Today',
          totalSpent: 0
        });
      }

      const source = referralSource === 'Other' ? referralOther : referralSource;
      let finalRemark = source ? `Where did you hear about us: ${source}. Client Self-Service Drop-off` : 'Client Self-Service Drop-off';

      if (selectedUpsells.length > 0) {
        const accessoryNames = upsells
          .filter(u => selectedUpsells.includes(u.id))
          .map(u => u.name)
          .join(', ');
        finalRemark += ` | Requested Accessories: ${accessoryNames}`;
      }

      await api.createRepair({
        id: 'R-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        customer_id: targetCustomer.id,
        timestamp: new Date().toISOString(),
        repairItem: problem,
        modelNumber: deviceModel,
        price: 0,
        liquidDamage: false,
        password: password,
        imei: '',
        remark: finalRemark,
        status: 'In Processing'
      });

      // Fire SMS confirmation — non-blocking, don't await
      api.sendSms(phone, 'dropoff', { customerName: name }).catch(() => {});

      // Switch to tracking view directly!
      setView('track');
    } catch (err) {
      setErrorMsg('Failed to submit repair request. Please try again.');
    }
    setLoading(false);
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'Completed') return <CheckCircle className="text-emerald-500 w-16 h-16 sm:w-20 sm:h-20" />;
    if (status === 'Urgent') return <AlertTriangle className="text-red-500 w-16 h-16 sm:w-20 sm:h-20" />;
    return <Clock className="text-blue-600 w-16 h-16 sm:w-20 sm:h-20" />;
  };

  return (
    <div className="min-h-screen bg-[var(--color-neu-bg)] text-[var(--color-neu-text-primary)] font-body p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-[var(--color-neu-bg)] rounded-[3rem] shadow-[var(--shadow-neu-flat)] p-8 sm:p-12 relative overflow-hidden flex flex-col">
        
        {/* Top Status Bar */}
        <div className={cn(
          "absolute top-0 left-0 w-full flex justify-center py-2 transition-all z-50 shadow-[var(--shadow-neu-pressed)]",
          backendOk ? "bg-emerald-500/5" : "bg-red-500/5"
        )}>
           <div className="flex items-center gap-3">
              <div className={cn(
                "w-2 h-2 rounded-full",
                backendOk ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" : "bg-red-500"
              )} />
              <span className={cn(
                "text-[9px] font-black uppercase tracking-[0.2em]",
                backendOk ? "text-emerald-600" : "text-red-600"
              )}>
                {backendOk ? 'Connection Stable' : 'Server Offline - SMS Disabled'}
              </span>
           </div>
        </div>

        <div className="flex flex-col items-center mb-10 mt-6 relative z-10">
          <div className="w-20 h-20 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[2rem] flex items-center justify-center text-blue-600 mb-6">
            <Smartphone size={40} />
          </div>
          <h1 className="text-2xl font-black text-black tracking-tighter uppercase mb-1">Ali Mobile Repair</h1>
          <p className="text-gray-600 text-sm font-bold uppercase tracking-widest">Customer Portal</p>
        </div>

        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 relative z-10"
            >
              <button 
                onClick={() => setView('dropoff')}
                className="w-full py-6 bg-[var(--color-neu-bg)] text-blue-600 rounded-2xl font-black shadow-[var(--shadow-neu-flat)] active:shadow-[var(--shadow-neu-pressed)] active:scale-[0.98] transition-all text-xl uppercase tracking-widest"
              >
                Start New Repair
              </button>
              <button 
                onClick={() => setView('track')}
                className="w-full py-6 bg-[var(--color-neu-bg)] text-gray-600 rounded-2xl font-black shadow-[var(--shadow-neu-flat)] active:shadow-[var(--shadow-neu-pressed)] active:scale-[0.98] transition-all text-xl uppercase tracking-widest"
              >
                Track My Ticket
              </button>
            </motion.div>
          )}

          {view === 'track' && !customer && (
            <motion.div
              key="track-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8 relative z-10"
            >
              <button onClick={() => setView('home')} className="flex items-center gap-2 text-gray-500 font-black text-xs uppercase tracking-widest mb-4 hover:text-blue-600 transition-colors">
                <ArrowLeft size={16} /> Back
              </button>
              <h2 className="text-xl font-black text-black text-center mb-6 uppercase tracking-tight">Track Your Repair</h2>
              <form onSubmit={handleTrackSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Identification</label>
                  <input 
                    type="text"
                    placeholder="Order ID or Phone Number"
                    className="w-full px-6 py-5 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl outline-none text-center font-black text-lg text-black placeholder:text-gray-400"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
                {errorMsg && <p className="text-red-500 text-center text-sm font-black">{errorMsg}</p>}
                <button 
                  disabled={loading}
                  className="w-full py-5 bg-[var(--color-neu-bg)] text-blue-600 rounded-2xl font-black shadow-[var(--shadow-neu-flat)] active:shadow-[var(--shadow-neu-pressed)] active:scale-[0.98] transition-all uppercase tracking-widest disabled:opacity-50"
                  type="submit"
                >
                  {loading ? 'Searching...' : 'Check Status'}
                </button>
              </form>
            </motion.div>
          )}

          {view === 'track' && customer && (
            <motion.div
              key="track-result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 flex flex-col items-center"
            >
              <h2 className="text-2xl font-black text-black mb-2 text-center leading-tight">Hello, {customer.name}!</h2>
              <p className="text-sm text-gray-600 mb-8 text-center font-bold">Here is the live status of your latest repair ticket.</p>
              
              {customer.repairs.length > 0 ? (
                <div className="w-full space-y-8">
                  {customer.repairs.map((r: any) => (
                    <div key={r.id} className="bg-[var(--color-neu-bg)] p-8 rounded-[2rem] shadow-[var(--shadow-neu-flat)] flex flex-col items-center relative overflow-hidden">
                       <p className="absolute top-6 left-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Ticket: {r.id}</p>
                       <div className="mt-10 mb-6 transition-transform hover:scale-105 duration-500">
                          <StatusIcon status={r.status} />
                       </div>
                       <h3 className={cn(
                         "text-3xl font-black text-center mb-2 uppercase tracking-tighter",
                         r.status === 'Completed' ? "text-emerald-600" : r.status === 'Urgent' ? "text-red-500" : "text-blue-600"
                       )}>{r.status}</h3>
                       <p className="font-black text-center text-black text-lg mb-1">{r.repairItem}</p>
                       <p className="text-xs text-gray-600 text-center font-black uppercase tracking-widest mb-8">{r.modelNumber}</p>
                       
                       {r.status === 'In Processing' && (
                         <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] w-full p-5 rounded-2xl text-center">
                           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-relaxed">
                             Our technicians are actively working on your device. Status updates automatically!
                           </p>
                         </div>
                       )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 rounded-[2rem] shadow-[var(--shadow-neu-pressed)] text-center w-full">
                  <p className="font-black text-gray-400 uppercase tracking-widest">No repairs found.</p>
                </div>
              )}
              
              <button 
                onClick={() => { setCustomer(null); setView('home'); }}
                className="mt-10 text-gray-500 font-black text-xs uppercase tracking-[0.2em] hover:text-blue-600 transition-colors"
              >
                Start Over
              </button>
            </motion.div>
          )}

          {view === 'dropoff' && (
            <motion.div
              key="dropoff-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 relative z-10"
            >
              <button onClick={() => setView('home')} className="flex items-center gap-2 text-gray-500 font-black text-xs uppercase tracking-widest mb-4 hover:text-blue-600 transition-colors">
                <ArrowLeft size={16} /> Back
              </button>
              <h2 className="text-2xl font-black text-black text-center mb-8 uppercase tracking-tighter">Repair Quick Drop-off</h2>
              <form onSubmit={handleDropoffSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Contact Details</label>
                  <div className="space-y-4">
                    <input 
                      type="text" placeholder="Full Name *" required
                      className="w-full px-5 py-4 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl outline-none text-black font-bold placeholder:text-gray-400"
                      value={name} onChange={e => setName(e.target.value)}
                    />
                    <input 
                      type="tel" placeholder="Phone Number *" required
                      className="w-full px-5 py-4 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl outline-none text-black font-bold placeholder:text-gray-400"
                      value={phone} onChange={e => setPhone(e.target.value)}
                    />
                    <input 
                      type="email" placeholder="Email (Optional)"
                      className="w-full px-5 py-4 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl outline-none text-black font-bold placeholder:text-gray-400"
                      value={email} onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Device Information</label>
                  <div className="space-y-4">
                    <input 
                      type="text" placeholder="Device Model (e.g. iPhone 13 Pro) *" required
                      className="w-full px-5 py-4 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl outline-none text-black font-bold placeholder:text-gray-400"
                      value={deviceModel} onChange={e => setDeviceModel(e.target.value)}
                    />
                    <textarea 
                      placeholder="Describe the issue... *" required rows={3}
                      className="w-full px-5 py-4 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl outline-none text-black font-bold placeholder:text-gray-400 resize-none"
                      value={problem} onChange={e => setProblem(e.target.value)}
                    />
                  </div>
                </div>

                {/* Accessory Upsells */}
                {upsells.length > 0 && (
                  <div className="space-y-4 py-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Optional Protection</p>
                    <div className="grid grid-cols-1 gap-4">
                      {upsells.map(upsell => (
                        <label key={upsell.id} className={cn(
                          "flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all",
                          selectedUpsells.includes(upsell.id) 
                            ? "bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] text-blue-600" 
                            : "bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-gray-600"
                        )}>
                          <input 
                            type="checkbox"
                            className="w-5 h-5 accent-blue-600 shadow-[var(--shadow-neu-pressed)]"
                            checked={selectedUpsells.includes(upsell.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUpsells([...selectedUpsells, upsell.id]);
                              } else {
                                setSelectedUpsells(selectedUpsells.filter(id => id !== upsell.id));
                              }
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-black uppercase tracking-tight">{upsell.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-gray-400 font-black line-through opacity-50">${upsell.regular_price}</span>
                              <span className="text-[10px] font-black uppercase tracking-widest">Bundle +${upsell.bundle_price}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Device Security</label>
                    <input 
                      type="text" placeholder="Device Passcode (Optional)"
                      className="w-full px-5 py-4 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl outline-none text-black font-bold placeholder:text-gray-400"
                      value={password} onChange={e => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Where did you hear about us? *</label>
                    <select
                      required
                      value={referralSource}
                      onChange={(e) => setReferralSource(e.target.value)}
                      className="w-full px-5 py-4 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl outline-none text-black font-bold appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select an option</option>
                      <option value="Google">Google Search</option>
                      <option value="Walk in">Walk in / Signage</option>
                      <option value="Friend referral">Friend / Family Referral</option>
                      <option value="Regular customer">Existing Customer</option>
                      <option value="Facebook">Facebook / Instagram</option>
                      <option value="Website">alimobile.com.au</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {referralSource === 'Other' && (
                    <input 
                      type="text" placeholder="Please specify... *" required
                      className="w-full px-5 py-4 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl outline-none text-black font-bold animate-in fade-in slide-in-from-top-1"
                      value={referralOther} onChange={e => setReferralOther(e.target.value)}
                    />
                  )}
                </div>

                {errorMsg && <p className="text-red-500 text-center text-sm font-black">{errorMsg}</p>}
                
                <button 
                  disabled={loading}
                  className="w-full py-6 bg-[var(--color-neu-bg)] text-blue-600 rounded-[2rem] font-black shadow-[var(--shadow-neu-flat)] active:shadow-[var(--shadow-neu-pressed)] active:scale-[0.98] transition-all uppercase tracking-[0.2em] mt-4 disabled:opacity-50"
                  type="submit"
                >
                  {loading ? 'Submitting...' : 'Complete Drop-off'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
