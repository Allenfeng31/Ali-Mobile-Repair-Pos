import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

/**
 * Feedback Buffer Page
 * 
 * Public-facing page accessed via QR code on receipts.
 * Routes satisfied customers → Google Review, intercepts unhappy ones.
 * 
 * URL: /feedback?id=ORDER_ID
 */

export function FeedbackPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [view, setView] = useState<'ask' | 'negative' | 'submitted'>('ask');
  const [message, setMessage] = useState('');
  
  // New State for Contact Info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrderId(params.get('id'));
  }, []);

  const handlePositive = () => {
    window.location.href = "https://g.page/r/CRGwjUq_bZMbEBM/review";
  };

  const handleNegative = () => {
    setView('negative');
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !name.trim() || !phone.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // 1. Generate a unique session token for this feedback inquiry
      const sessionToken = Math.random().toString(36).substring(2, 18);
      
      // 2. Create the chat session
      await api.createChatSession(sessionToken);
      
      // 3. Format the payload exactly as required by ChatInbox.tsx parsing rules
      const payload = `[CUSTOMER_INFO]\nName: ${name}\nPhone: ${phone}\n\nNegative Feedback:\n${message}`;
      
      // 4. Route the feedback directly to the Chat system
      await api.sendChatMessage(sessionToken, payload);
      
      console.log('[Feedback] Routed to ChatInbox. Order:', orderId);
      setView('submitted');
    } catch (err) {
      console.error('[Feedback] Submission failed:', err);
      alert('Failed to send feedback. Please try again or call us.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-neu-bg)] flex items-center justify-center p-6 font-body text-[var(--color-neu-text-primary)]">
      <div className="max-w-[480px] w-full bg-[var(--color-neu-bg)] rounded-[2.5rem] shadow-[var(--shadow-neu-flat)] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-10 pb-6 text-center">
          <div className="w-20 h-20 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
            {view === 'ask' ? '💬' : view === 'negative' ? '🙏' : '✅'}
          </div>
          <h1 className="text-2xl font-black text-black tracking-tighter uppercase mb-1">
            ALI MOBILE REPAIRS
          </h1>
          {orderId && (
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
              Order #{orderId}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="px-10 py-8 flex-grow">
          {/* ── Initial Question ── */}
          {view === 'ask' && (
            <div className="text-center">
              <h2 className="text-xl font-black text-black mb-3 leading-tight">
                Were you satisfied with your repair today?
              </h2>
              <p className="text-sm font-bold text-gray-600 mb-10 leading-relaxed">
                Your feedback helps us improve our service.
              </p>

              <div className="flex flex-col gap-6">
                <button
                  onClick={handlePositive}
                  className="w-full py-5 px-6 rounded-2xl font-black text-lg shadow-[var(--shadow-neu-flat)] active:shadow-[var(--shadow-neu-pressed)] active:scale-[0.98] transition-all bg-[var(--color-neu-bg)] text-emerald-600 flex items-center justify-center gap-4 group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">😊</span>
                  Yes, I love it!
                </button>

                <button
                  onClick={handleNegative}
                  className="w-full py-5 px-6 rounded-2xl font-black text-lg shadow-[var(--shadow-neu-flat)] active:shadow-[var(--shadow-neu-pressed)] active:scale-[0.98] transition-all bg-[var(--color-neu-bg)] text-red-500 flex items-center justify-center gap-4 group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">😞</span>
                  No, I had an issue
                </button>
              </div>
            </div>
          )}

          {/* ── Negative Feedback Form (With Contact Capture & Chat Routing) ── */}
          {view === 'negative' && (
            <div className="text-center">
              <h2 className="text-xl font-black text-black mb-3">
                We're sorry to hear that!
              </h2>
              <p className="text-sm font-bold text-gray-600 mb-8 leading-relaxed">
                Please provide your contact details so our manager can reach out and resolve this personally.
              </p>

              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                <div className="space-y-4">
                  <div className="text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2 block">Your Name</label>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Smith"
                      required
                      className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl px-6 py-4 text-sm font-bold text-black placeholder:text-gray-400 outline-none transition-all"
                    />
                  </div>
                  
                  <div className="text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2 block">Phone Number</label>
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0400 000 000"
                      required
                      className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl px-6 py-4 text-sm font-bold text-black placeholder:text-gray-400 outline-none transition-all"
                    />
                  </div>

                  <div className="text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2 block">What happened?</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your experience..."
                      required
                      className="w-full min-h-[140px] p-6 text-sm font-bold bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-3xl text-black placeholder:text-gray-400 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim() || !name.trim() || !phone.trim()}
                  className={cn(
                    "w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center",
                    (message.trim() && name.trim() && phone.trim() && !isSubmitting)
                      ? "shadow-[var(--shadow-neu-flat)] active:shadow-[var(--shadow-neu-pressed)] active:scale-[0.98] text-blue-600 bg-[var(--color-neu-bg)]"
                      : "opacity-50 cursor-not-allowed text-gray-400"
                  )}
                >
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </button>
              </form>
            </div>
          )}

          {/* ── Submitted Confirmation ── */}
          {view === 'submitted' && (
            <div className="text-center">
              <h2 className="text-2xl font-black text-black mb-4">
                Feedback Received
              </h2>
              <p className="text-sm font-bold text-gray-600 mb-10 leading-relaxed">
                Thank you, {name}. Your message has been sent directly to our support desk. 
                Our manager will review it and contact you on {phone} as soon as possible.
              </p>
              <div className="p-6 rounded-3xl bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] flex flex-col items-center gap-2">
                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Urgent Issue?</p>
                <p className="text-lg font-black text-black">📞 0481 058 514</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 text-center bg-[var(--color-neu-bg)]">
          <p className="text-[10px] font-black text-gray-400 leading-relaxed uppercase tracking-widest px-4">
            Ali Mobile Repairs · Kiosk C1, Ringwood Square Shopping Centre
          </p>
        </div>
      </div>
    </div>
  );
}
