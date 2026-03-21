import React from 'react';
import { 
  Printer, 
  Plus, 
  Bluetooth, 
  Network, 
  Router, 
  Receipt, 
  Save, 
  Eye,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { api } from '../lib/api';
import { LogOut } from 'lucide-react';

export function SettingsView({ onLogout }: { onLogout?: () => void }) {
  const [header, setHeader] = React.useState(`Precision Tech Repairs\n123 Artisan Way, Ste 4\nSan Francisco, CA 94103\nTel: (555) 012-3456`);
  const [footer, setFooter] = React.useState(`Warranty: 90 days on parts and labor. No refunds on water damage repairs. Thank you for choosing Precision!`);
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    api.getSettings().then(settings => {
      if (settings.ali_pos_invoice_header) setHeader(settings.ali_pos_invoice_header);
      if (settings.ali_pos_invoice_footer) setFooter(settings.ali_pos_invoice_footer);
    }).catch(console.error);
  }, []);

  const handleSave = async () => {
    try {
      await api.updateSetting('ali_pos_invoice_header', header);
      await api.updateSetting('ali_pos_invoice_footer', footer);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="mb-10 text-left">
        <h2 className="text-3xl font-extrabold text-primary tracking-tight mb-2">System Settings</h2>
        <p className="text-on-surface-variant font-body">Manage your hardware connections and document preferences.</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="md:col-span-5 flex flex-col gap-8">
          {/* Printers */}
          <section className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/5">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Printer className="text-primary" size={24} />
                <h3 className="text-lg font-bold text-primary">Printers</h3>
              </div>
              <button className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all flex items-center gap-2">
                <Plus size={14} />
                ADD NEW
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between group border border-outline-variant/5 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-teal-50 p-3 rounded-xl">
                    <Bluetooth className="text-teal-700" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">Star Micronics mPOP</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Connected</span>
                    </div>
                  </div>
                </div>
                <MoreVertical className="text-outline-variant group-hover:text-primary cursor-pointer transition-colors" size={20} />
              </div>

              <div className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between group border border-outline-variant/5 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-3 rounded-xl">
                    <Network className="text-slate-500" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">Epson TM-T88VI</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                      <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Offline</span>
                    </div>
                  </div>
                </div>
                <MoreVertical className="text-outline-variant group-hover:text-primary cursor-pointer transition-colors" size={20} />
              </div>
            </div>
          </section>

          {/* Diagnostics */}
          <section className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/5">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-6">Diagnostics</h3>
            <div className="flex items-center justify-between bg-surface-container-lowest p-5 rounded-2xl border-l-4 border-primary shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-primary-container/10 rounded-xl">
                  <Router className="text-primary" size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-on-surface uppercase tracking-wider">Shop Network Gateway</p>
                  <p className="text-[11px] font-bold text-on-surface-variant mt-0.5">Lat: 12ms | Down: 150Mbps</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full">
                <CheckCircle2 size={12} className="text-emerald-600" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">OPTIMAL</span>
              </div>
            </div>
          </section>

          {/* Account Security */}
          <section className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/5">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-6">Account & Security</h3>
            <div className="flex items-center justify-between bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/10 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-error/10 rounded-xl">
                  <LogOut className="text-error" size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-on-surface uppercase tracking-wider">End Active Session</p>
                  <p className="text-[10px] font-bold text-on-surface-variant mt-1">Logs you out securely.</p>
                </div>
              </div>
              
              <button 
                onClick={onLogout}
                className="bg-error text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 shadow-lg shadow-error/20 transition-all active:scale-95"
              >
                Sign Out
              </button>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="md:col-span-7">
          <section className="bg-surface-container-low rounded-[2rem] p-8 h-full flex flex-col border border-outline-variant/5">
            <div className="flex items-center gap-3 mb-10">
              <Receipt className="text-primary" size={24} />
              <h3 className="text-xl font-black text-primary tracking-tight">Invoice Templates</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 flex-grow">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.15em]">Invoice Header</label>
                  <textarea 
                    className="w-full bg-surface-container-high border-none rounded-2xl text-sm p-5 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all resize-none font-medium h-32" 
                    value={header}
                    onChange={(e) => setHeader(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.15em]">Footer Disclaimer</label>
                  <textarea 
                    className="w-full bg-surface-container-high border-none rounded-2xl text-sm p-5 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all resize-none font-medium h-32" 
                    value={footer}
                    onChange={(e) => setFooter(e.target.value)}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handleSave}
                    className="flex-1 signature-gradient text-on-primary py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
                  >
                    {isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                    {isSaved ? 'SAVED' : 'SAVE CHANGES'}
                  </button>
                  <button className="bg-secondary-container text-on-secondary-container px-6 rounded-2xl font-black hover:bg-secondary-fixed transition-all">
                    <Eye size={20} />
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-slate-200/50 rounded-3xl blur-sm"></div>
                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 h-full flex flex-col">
                  <div className="w-16 h-1.5 bg-slate-200 rounded-full mx-auto mb-8"></div>
                  <div className="text-center mb-10">
                    <p className="text-[11px] font-black text-slate-900 leading-tight tracking-widest uppercase">{header.split('\n')[0]}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1">{header.split('\n')[1]}</p>
                  </div>
                  <div className="flex-grow space-y-4">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-[9px] font-bold text-slate-400">Qty 1 - iPhone 13 OLED</span>
                      <span className="text-[9px] font-black text-slate-900">$189.00</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-[9px] font-bold text-slate-400">Labor Fee</span>
                      <span className="text-[9px] font-black text-slate-900">$65.00</span>
                    </div>
                    <div className="pt-4 flex justify-between">
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">TOTAL</span>
                      <span className="text-[11px] font-black text-primary">$254.00</span>
                    </div>
                  </div>
                  <div className="mt-10 text-center">
                    <p className="text-[8px] font-bold text-slate-400 leading-relaxed italic">"{footer.substring(0, 80)}..."</p>
                    <div className="mt-6 flex flex-col items-center gap-1">
                      <div className="w-full h-8 bg-slate-100 rounded flex items-center justify-center">
                        <div className="flex gap-0.5">
                          {[...Array(20)].map((_, i) => (
                            <div key={i} className={cn("w-0.5 bg-slate-300", i % 3 === 0 ? "h-5" : "h-4")}></div>
                          ))}
                        </div>
                      </div>
                      <span className="text-[7px] font-bold text-slate-300 uppercase tracking-[0.3em]">RP-8829-X9</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
