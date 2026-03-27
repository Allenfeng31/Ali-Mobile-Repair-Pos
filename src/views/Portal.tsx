import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Smartphone, CheckCircle, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
      const data = await api.getCustomers();
      const found = data.find((c: any) => c.phone === phone);
      if (found) {
        found.repairs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setCustomer(found);
      } else {
        setErrorMsg('No repair found for this phone number.');
      }
    } catch (err) {
      setErrorMsg('Failed to fetch tracking data.');
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
      const finalRemark = source ? `Where did you hear about us: ${source}. Client Self-Service Drop-off` : 'Client Self-Service Drop-off';

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
    if (status === 'Completed') return <CheckCircle className="text-green-500 w-16 h-16 sm:w-20 sm:h-20" />;
    if (status === 'Urgent') return <AlertTriangle className="text-red-500 w-16 h-16 sm:w-20 sm:h-20" />;
    return <Clock className="text-blue-500 w-16 h-16 sm:w-20 sm:h-20" />;
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-sans p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-outline-variant/10 relative overflow-hidden">
        
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] pointer-events-none"></div>

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
            <Smartphone size={32} />
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-on-surface tracking-tighter">ALI MOBILE REPAIR</h1>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${backendOk ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${backendOk ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {backendOk ? 'Server Active' : 'Offline'}
            </div>
          </div>
          <p className="text-on-surface-variant text-sm font-medium">Customer Service Portal</p>
        </div>

        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4 relative z-10"
            >
              <button 
                onClick={() => setView('dropoff')}
                className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg"
              >
                Start New Repair
              </button>
              <button 
                onClick={() => setView('track')}
                className="w-full py-4 bg-surface-container-high text-on-surface rounded-xl font-bold hover:bg-surface-container-highest transition-all text-lg"
              >
                Track My Repair
              </button>
            </motion.div>
          )}

          {view === 'track' && !customer && (
            <motion.div
              key="track-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4 relative z-10"
            >
              <button onClick={() => setView('home')} className="flex items-center gap-2 text-on-surface-variant font-bold text-sm mb-4 hover:text-primary transition-colors">
                <ArrowLeft size={16} /> Back
              </button>
              <h2 className="text-xl font-bold text-center mb-6">Track Your Repair</h2>
              <form onSubmit={handleTrackSubmit} className="space-y-4">
                <input 
                  type="tel"
                  placeholder="Enter your Phone Number"
                  className="w-full px-4 py-4 bg-surface-container-low border border-outline-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-center font-bold text-lg"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
                {errorMsg && <p className="text-error text-center text-sm font-bold">{errorMsg}</p>}
                <button 
                  disabled={loading}
                  className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold shadow-lg disabled:opacity-50"
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
              <h2 className="text-xl font-bold mb-2">Hello, {customer.name}!</h2>
              <p className="text-sm text-on-surface-variant mb-6 text-center">Here is the live status of your latest repair ticket.</p>
              
              {customer.repairs.length > 0 ? (
                <div className="w-full space-y-6">
                  {customer.repairs.map((r: any, idx: number) => (
                    <div key={r.id} className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 flex flex-col items-center relative overflow-hidden shadow-sm">
                       <p className="absolute top-4 left-4 text-[10px] font-black uppercase text-on-surface-variant tracking-wider">Ticket: {r.id}</p>
                       <div className="mt-6 mb-4 animate-bounce-slight">
                          <StatusIcon status={r.status} />
                       </div>
                       <h3 className="text-2xl font-black text-center mb-1 text-primary">{r.status}</h3>
                       <p className="font-bold text-center text-on-surface">{r.repairItem}</p>
                       <p className="text-sm text-on-surface-variant text-center font-medium mb-4">{r.modelNumber}</p>
                       
                       {r.status === 'Completed' && (
                         <div className="bg-green-100 text-green-800 w-full p-3 rounded-xl text-center text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
                           Your device is fully repaired and ready for pickup!
                         </div>
                       )}
                       {r.status === 'In Processing' && (
                         <div className="bg-blue-100 text-blue-800 w-full p-3 rounded-xl text-center text-xs font-bold animate-in fade-in transition-all">
                           Our technicians are actively working on your device. This screen will jump to completed automatically!
                         </div>
                       )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No repairs found.</p>
              )}
              
              <button 
                onClick={() => { setCustomer(null); setView('home'); }}
                className="mt-8 text-on-surface-variant font-bold text-sm hover:text-primary transition-colors"
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
              className="space-y-4 relative z-10"
            >
              <button onClick={() => setView('home')} className="flex items-center gap-2 text-on-surface-variant font-bold text-sm mb-4 hover:text-primary transition-colors">
                <ArrowLeft size={16} /> Back
              </button>
              <h2 className="text-xl font-bold text-center mb-6">Repair Quick Drop-off</h2>
              <form onSubmit={handleDropoffSubmit} className="space-y-4">
                <input 
                  type="text" placeholder="Full Name *" required
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-medium"
                  value={name} onChange={e => setName(e.target.value)}
                />
                <input 
                  type="tel" placeholder="Phone Number *" required
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-medium"
                  value={phone} onChange={e => setPhone(e.target.value)}
                />
                <input 
                  type="email" placeholder="Email Address (Optional)"
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-medium"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
                <input 
                  type="text" placeholder="Device Model (e.g. iPhone 13 Pro) *" required
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-medium"
                  value={deviceModel} onChange={e => setDeviceModel(e.target.value)}
                />
                <textarea 
                  placeholder="Describe the issue... *" required rows={3}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-medium resize-none text-sm"
                  value={problem} onChange={e => setProblem(e.target.value)}
                />

                <input 
                  type="text" placeholder="Phone Password (Optional)"
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-medium text-sm"
                  value={password} onChange={e => setPassword(e.target.value)}
                />

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Where did you hear about us? *</label>
                  <select
                    required
                    value={referralSource}
                    onChange={(e) => setReferralSource(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-medium text-sm"
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="Google">Google</option>
                    <option value="Walk in">Walk in</option>
                    <option value="Friend referral">Friend referral</option>
                    <option value="Regular customer">Regular customer</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Website">Website</option>
                    <option value="Other">Other (Please specify)</option>
                  </select>
                </div>

                {referralSource === 'Other' && (
                  <input 
                    type="text" placeholder="Please specify... *" required
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-medium text-sm animate-in fade-in slide-in-from-top-1"
                    value={referralOther} onChange={e => setReferralOther(e.target.value)}
                  />
                )}
                {errorMsg && <p className="text-error text-center text-sm font-bold">{errorMsg}</p>}
                <button 
                  disabled={loading}
                  className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold shadow-lg mt-2 disabled:opacity-50"
                  type="submit"
                >
                  {loading ? 'Submitting...' : 'Submit Form & Track Status'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
