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
  CheckCircle2,
  Sparkles,
  PenTool,
  Trash2,
  FileText,
  MessageSquare,
  Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { api } from '../lib/api';
import { LogOut } from 'lucide-react';

export function SettingsView({ 
  onLogout, 
  currentUser, 
  onUpdateUser 
}: { 
  onLogout?: () => void, 
  currentUser: any, 
  onUpdateUser: (user: any) => void 
}) {
  const [header, setHeader] = React.useState(`Precision Tech Repairs\n123 Artisan Way, Ste 4\nSan Francisco, CA 94103\nTel: (555) 012-3456`);
  const [footer, setFooter] = React.useState(`Warranty: 90 days on parts and labor. No refunds on water damage repairs. Thank you for choosing Precision!`);
  const [isSaved, setIsSaved] = React.useState(false);
  const [newName, setNewName] = React.useState(currentUser?.username || '');
  const [newPassword, setNewPassword] = React.useState('');
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [blogTopic, setBlogTopic] = React.useState('');
  const [isGeneratingBlog, setIsGeneratingBlog] = React.useState(false);
  const [blogDraft, setBlogDraft] = React.useState<any>(null);

  // SMS Generator States
  const [smsModel, setSmsModel] = React.useState('');
  const [smsRepair, setSmsRepair] = React.useState('');
  const [smsAmount, setSmsAmount] = React.useState('');
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopySMS = async () => {
    if (!smsModel || !smsRepair || !smsAmount) {
      alert('Please fill in Model, Repair Item, and Amount.');
      return;
    }
    
    const text = `Ali Mobile Repair\n\n型号 (Model): ${smsModel}\n维修项目 (Repair): ${smsRepair}\n金额 (Price): $${smsAmount}\n\n预约网址 (Booking): https://alimobile.com.au\n店面地址 (Address): Kiosk C1 Ringwood Square Shopping Centre, Ringwood 3134\n联系电话 (Phone): 0481 058 514`;
    
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to copy text.');
    }
  };

  const [printers, setPrinters] = React.useState<any[]>([]);
  const [networkInfo, setNetworkInfo] = React.useState<{type: string, downlink: number, ping: number, online: boolean}>({
    type: 'wifi', downlink: 0, ping: 0, online: navigator.onLine
  });

  React.useEffect(() => {
    // Network Diagnostics
    const updateNetInfo = () => {
      const conn = (navigator as any).connection;
      setNetworkInfo({
        type: conn?.effectiveType || 'wifi',
        downlink: conn?.downlink || 0,
        ping: conn?.rtt || 0,
        online: navigator.onLine
      });
    };
    updateNetInfo();
    window.addEventListener('online', updateNetInfo);
    window.addEventListener('offline', updateNetInfo);
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', updateNetInfo);
    }

    // USB Printers
    if ('usb' in navigator) {
      (navigator as any).usb.getDevices().then(setPrinters).catch(console.error);
      const handleConnect = (e: any) => setPrinters((prev: any[]) => [...prev, e.device]);
      const handleDisconnect = (e: any) => setPrinters((prev: any[]) => prev.filter(d => d !== e.device));
      (navigator as any).usb.addEventListener('connect', handleConnect);
      (navigator as any).usb.addEventListener('disconnect', handleDisconnect);
      
      return () => {
        (navigator as any).usb.removeEventListener('connect', handleConnect);
        (navigator as any).usb.removeEventListener('disconnect', handleDisconnect);
        window.removeEventListener('online', updateNetInfo);
        window.removeEventListener('offline', updateNetInfo);
        if ((navigator as any).connection) {
          (navigator as any).connection.removeEventListener('change', updateNetInfo);
        }
      };
    }
  }, []);

  const handleAddPrinter = async () => {
    if (!('usb' in navigator)) {
      alert("WebUSB API is not supported in this browser. Please use Chrome/Edge.");
      return;
    }
    try {
      await (navigator as any).usb.requestDevice({ filters: [] });
      const devices = await (navigator as any).usb.getDevices();
      setPrinters(devices);
    } catch (err) {
      console.error("Printer selection cancelled", err);
    }
  };

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

  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      const updateData: { username?: string, password?: string } = {};
      if (newName && newName !== currentUser.username) updateData.username = newName;
      if (newPassword) updateData.password = newPassword;

      if (Object.keys(updateData).length === 0) {
        setIsSyncing(false);
        return;
      }

      const updatedUser = await api.updateUser(currentUser.id, updateData);
      onUpdateUser(updatedUser);
      
      // Update local storage session if it exists
      const savedSession = localStorage.getItem('pos_session');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          session.user = updatedUser;
          localStorage.setItem('pos_session', JSON.stringify(session));
        } catch (e) {
          console.error('Failed to update session localStorage', e);
        }
      }

      setNewPassword('');
      alert("Employee profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGenerateBlog = async () => {
    if (!blogTopic.trim()) return;
    setIsGeneratingBlog(true);
    try {
      const draft = await api.generateBlog(blogTopic);
      setBlogDraft(draft);
    } catch (err) {
      console.error(err);
      alert("Failed to generate blog: " + err.message);
    } finally {
      setIsGeneratingBlog(false);
    }
  };

  const handlePublishBlog = async () => {
    if (!blogDraft) return;
    try {
      await api.confirmBlog(blogDraft.slug, blogDraft.content);
      alert("Blog post published successfully!");
      setBlogDraft(null);
      setBlogTopic('');
    } catch (err) {
      console.error(err);
      alert("Failed to publish blog: " + err.message);
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
                <div>
                  <h3 className="text-lg font-bold text-primary leading-tight">Hardware Printers</h3>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mt-0.5">System Default & USB</p>
                </div>
              </div>
              <button 
                onClick={handleAddPrinter}
                className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all flex items-center gap-2"
              >
                <Plus size={14} />
                SCAN USB
              </button>
            </div>

            <div className="space-y-4">
              {/* System Default Printer (always available via window.print) */}
              <div className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between group border border-outline-variant/5 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-teal-50 p-3 rounded-xl">
                    <Printer className="text-teal-700" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">System Default Printer</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">OS Managed (SAM4S ready)</span>
                    </div>
                  </div>
                </div>
                <MoreVertical className="text-outline-variant group-hover:text-primary cursor-pointer transition-colors" size={20} />
              </div>

              {/* Dynamic USB Printers */}
              {printers.map((printer, idx) => (
                <div key={idx} className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between group border border-outline-variant/5 hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <Bluetooth className="text-blue-700" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{printer.productName || `USB Device (${printer.vendorId})`}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Direct USB Connected</span>
                      </div>
                    </div>
                  </div>
                  <MoreVertical className="text-outline-variant group-hover:text-primary cursor-pointer transition-colors" size={20} />
                </div>
              ))}
            </div>
          </section>

          {/* Diagnostics */}
          <section className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/5">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-6">Diagnostics</h3>
            <div className={cn("flex items-center justify-between p-5 rounded-2xl border-l-4 shadow-sm", networkInfo.online ? "bg-surface-container-lowest border-primary" : "bg-error/5 border-error")}>
              <div className="flex items-center gap-4">
                <div className={cn("p-2.5 rounded-xl", networkInfo.online ? "bg-primary-container/10 text-primary" : "bg-error/10 text-error")}>
                  <Router size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-on-surface uppercase tracking-wider">Shop Network Gateway</p>
                  <p className="text-[11px] font-bold text-on-surface-variant mt-0.5">
                    {networkInfo.online ? `Type: ${networkInfo.type.toUpperCase()} | Ping: ${networkInfo.ping}ms | Down: ${networkInfo.downlink}Mbps` : 'Disconnected'}
                  </p>
                </div>
              </div>
              <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full", networkInfo.online ? "bg-emerald-50" : "bg-error/10")}>
                {networkInfo.online ? <CheckCircle2 size={12} className="text-emerald-600" /> : <Network size={12} className="text-error" />}
                <span className={cn("text-[10px] font-black uppercase tracking-widest", networkInfo.online ? "text-emerald-600" : "text-error")}>
                  {networkInfo.online ? 'OPTIMAL' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </section>

          {/* Account Security & Profile */}
          <section className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/5">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-6">Employee Information</h3>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-center mb-2">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl border border-primary/20 shadow-inner uppercase">
                  {(currentUser?.username || 'A').charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-black text-on-surface leading-tight">{currentUser?.username || 'Employee'}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{currentUser?.role || 'Staff'}</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Update Name</label>
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter new display name..."
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Change Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password..."
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <button 
                  onClick={handleUpdateProfile}
                  className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-95 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isSyncing ? <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-rotate"></div> : <Save size={14} />}
                  Save Employee Updates
                </button>
              </div>

              <div className="h-px bg-outline-variant/10 my-8"></div>

              <div className="flex items-center justify-between bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/10 shadow-sm opacity-60">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-error/10 rounded-xl text-error">
                    <LogOut size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-on-surface uppercase tracking-wider">End Session</p>
                    <p className="text-[10px] font-bold text-on-surface-variant mt-0.5">Logout for security</p>
                  </div>
                </div>
                <button 
                  onClick={onLogout}
                  className="bg-surface-container-high text-error px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-error/20 hover:bg-error hover:text-white transition-all"
                >
                  Sign Out
                </button>
              </div>
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

          {/* AI Blog Generator */}
          <section className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/5 mt-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-black text-primary tracking-tight">AI Blog Marketing</h3>
            </div>

            {!blogDraft ? (
              <div className="space-y-6">
                <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
                  Generate SEO-optimized blog posts for your storefront in seconds. Just enter a topic like "iPhone screen repair" or "MacBook battery tips".
                </p>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Article Topic</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={blogTopic}
                      onChange={(e) => setBlogTopic(e.target.value)}
                      placeholder="e.g. Benefits of iPad screen replacement..."
                      className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all pr-12"
                    />
                    <PenTool className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant" size={18} />
                  </div>
                </div>
                <button 
                   onClick={handleGenerateBlog}
                   disabled={isGeneratingBlog || !blogTopic.trim()}
                   className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isGeneratingBlog ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-rotate"></div>
                  ) : (
                    <Sparkles size={16} className="text-purple-400" />
                  )}
                  {isGeneratingBlog ? 'Crafting Content...' : 'Generate Blog Draft'}
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl overflow-hidden shadow-sm">
                  <div className="aspect-video relative group">
                    <img src={blogDraft.image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-5 flex flex-col justify-end">
                      <span className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Previewing Draft</span>
                      <h4 className="text-white font-black text-lg leading-tight">{blogDraft.title}</h4>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText size={14} className="text-purple-600" />
                      <span className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest">{blogDraft.date} | SEO Optimized</span>
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic mb-4 line-clamp-3">
                      "{blogDraft.description}"
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setBlogDraft(null)}
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-on-surface-variant bg-surface-container-high hover:bg-error/5 hover:text-error transition-all"
                  >
                    <Trash2 size={16} />
                    Discard
                  </button>
                  <button 
                    onClick={handlePublishBlog}
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-emerald-600 shadow-lg shadow-emerald-200 hover:bg-emerald-500 transition-all active:scale-[0.98]"
                  >
                    <CheckCircle2 size={16} />
                    Publish Now
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Quick SMS Generator */}
          <section className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/5 mt-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-xl font-black text-primary tracking-tight">Quick SMS Generator</h3>
            </div>

            <div className="space-y-6">
              <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
                Generate a ready-to-send SMS with repair quote and shop details.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">型号 (Model)</label>
                  <input 
                    type="text" 
                    value={smsModel}
                    onChange={(e) => setSmsModel(e.target.value)}
                    placeholder="e.g. iPhone 13"
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">维修项目 (Repair Item)</label>
                  <input 
                    type="text" 
                    value={smsRepair}
                    onChange={(e) => setSmsRepair(e.target.value)}
                    placeholder="e.g. Screen Replacement"
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">金额 (Amount)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                  <input 
                    type="number" 
                    value={smsAmount}
                    onChange={(e) => setSmsAmount(e.target.value)}
                    placeholder="150"
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl pl-9 pr-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleCopySMS}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3",
                    isCopied 
                      ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-200" 
                      : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-200"
                  )}
                >
                  {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  {isCopied ? 'Copied to Clipboard!' : 'Generate & Copy SMS'}
                </button>
              </div>

              {/* Preview Box */}
              {(smsModel || smsRepair || smsAmount) && (
                <div className="mt-6 p-4 bg-surface-container-highest rounded-xl border border-outline-variant/10 text-sm whitespace-pre-wrap font-medium text-on-surface-variant">
                  {`Ali Mobile Repair\n\n型号 (Model): ${smsModel}\n维修项目 (Repair): ${smsRepair}\n金额 (Price): $${smsAmount || '0'}\n\n预约网址 (Booking): https://alimobile.com.au\n店面地址 (Address): Kiosk C1 Ringwood Square Shopping Centre, Ringwood 3134\n联系电话 (Phone): 0481 058 514`}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
