import React from 'react';
import { 
  Receipt, 
  Save, 
  Eye,
  CheckCircle2,
  Trash2,
  MessageSquare,
  Copy,
  Layers,
  Edit2,
  Bell,
  BellOff,
  BellRing,
  Smartphone,
  SmartphoneNfc,
  Users
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

  // Supabase system roles that are NOT custom user roles — must be skipped
  const SUPABASE_SYSTEM_ROLES = ['authenticated', 'anon', 'service_role'];
  const rawTopLevelRole = currentUser?.role || '';
  const isSystemRole = SUPABASE_SYSTEM_ROLES.includes(String(rawTopLevelRole).toLowerCase());
  const userRole = (!rawTopLevelRole || isSystemRole)
    ? (currentUser?.app_metadata?.role || currentUser?.user_metadata?.role || '')
    : rawTopLevelRole;
  const userRoleStr = String(userRole);
  const isSuperAdmin = typeof userRoleStr === 'string' && userRoleStr.toLowerCase().replace(/_/g, ' ') === 'super admin';

  // SMS Generator States
  const [smsModel, setSmsModel] = React.useState('');
  const [smsRepair, setSmsRepair] = React.useState('');
  const [smsAmount, setSmsAmount] = React.useState('');
  const [isCopied, setIsCopied] = React.useState(false);

  // Quality Tiers Management
  const [qualityTiers, setQualityTiers] = React.useState<any[]>([]);
  const [newTierName, setNewTierName] = React.useState('');
  const [newTierDesc, setNewTierDesc] = React.useState('');
  const [editingTierId, setEditingTierId] = React.useState<string | null>(null);
  const [editingTierDesc, setEditingTierDesc] = React.useState('');

  // Push Notification State
  const [pushEnabled, setPushEnabled] = React.useState(false);
  const [pushLoading, setPushLoading] = React.useState(false);
  const [pushStatus, setPushStatus] = React.useState<'idle' | 'granted' | 'denied' | 'unsupported'>('idle');
  const [testPushSent, setTestPushSent] = React.useState(false);

  // SMS Alerts Toggle State
  const [smsAlertsEnabled, setSmsAlertsEnabled] = React.useState(true);
  const [smsToggleLoading, setSmsToggleLoading] = React.useState(false);

  // Google Contacts Sync Toggle State
  const [googleSyncEnabled, setGoogleSyncEnabled] = React.useState(false);
  const [googleSyncLoading, setGoogleSyncLoading] = React.useState(false);

  // Check push notification status on mount
  React.useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPushStatus('unsupported');
      return;
    }
    if (Notification.permission === 'granted') {
      setPushStatus('granted');
      // Check if we have an active subscription
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setPushEnabled(!!sub);
        });
      });
    } else if (Notification.permission === 'denied') {
      setPushStatus('denied');
    }
  }, []);

  const handleTogglePush = async () => {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        // Unsubscribe
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await api.unsubscribePush(sub.endpoint);
          await sub.unsubscribe();
        }
        setPushEnabled(false);
        setPushStatus('idle');
      } else {
        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setPushStatus('denied');
          setPushLoading(false);
          return;
        }
        setPushStatus('granted');

        // Get VAPID public key from server
        const { publicKey } = await api.getVapidPublicKey();
        
        // Convert VAPID key to Uint8Array
        const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
          const padding = '='.repeat((4 - base64String.length % 4) % 4);
          const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
          const rawData = window.atob(base64);
          const outputArray = new Uint8Array(rawData.length);
          for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
          }
          return outputArray;
        };

        // Subscribe
        const reg = await navigator.serviceWorker.ready;
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        
        // Send subscription to server
        await api.subscribePush(subscription.toJSON());
        setPushEnabled(true);
      }
    } catch (err: any) {
      console.error('[Push] Toggle failed:', err);
      alert('Failed to toggle push notifications: ' + err.message);
    } finally {
      setPushLoading(false);
    }
  };

  const handleTestPush = async () => {
    try {
      await api.testPush();
      setTestPushSent(true);
      setTimeout(() => setTestPushSent(false), 3000);
    } catch (err: any) {
      alert('Test push failed: ' + err.message);
    }
  };

  const handleCopySMS = async () => {
    if (!smsModel || !smsRepair || !smsAmount) {
      alert('Please fill in Model, Repair Item, and Amount.');
      return;
    }
    
    const text = `Hi there, this is Ali Mobile Repair,\n\nThe ${smsRepair} for ${smsModel} is $${smsAmount}.\n\nYou are welcome to walk in or book an appointment here: https://alimobile.com.au\nAddress: Kiosk C1 Ringwood Square Shopping Centre, Ringwood 3134\nPhone: 0481 058 514`;
    
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setSmsModel('');
      setSmsRepair('');
      setSmsAmount('');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to copy text.');
    }
  };



  const handleToggleSmsAlerts = async () => {
    setSmsToggleLoading(true);
    try {
      const newValue = !smsAlertsEnabled;
      await api.updateSetting('sms_alerts_enabled', newValue ? 'true' : 'false');
      setSmsAlertsEnabled(newValue);
    } catch (err: any) {
      console.error('[SMS Toggle] Failed:', err);
      alert('Failed to update SMS setting: ' + err.message);
    } finally {
      setSmsToggleLoading(false);
    }
  };

  const handleToggleGoogleSync = async () => {
    setGoogleSyncLoading(true);
    try {
      const newValue = !googleSyncEnabled;
      await api.updateSetting('google_contacts_sync_enabled', newValue ? 'true' : 'false');
      setGoogleSyncEnabled(newValue);
    } catch (err: any) {
      console.error('[Google Sync Toggle] Failed:', err);
      alert('Failed to update Google Sync setting: ' + err.message);
    } finally {
      setGoogleSyncLoading(false);
    }
  };

  React.useEffect(() => {
    api.getSettings().then(settings => {
      if (settings.ali_pos_invoice_header) setHeader(settings.ali_pos_invoice_header);
      if (settings.ali_pos_invoice_footer) setFooter(settings.ali_pos_invoice_footer);
      // Load SMS alerts setting (default: true if not set)
      if (settings.sms_alerts_enabled !== undefined) {
        setSmsAlertsEnabled(settings.sms_alerts_enabled !== 'false');
      }
      // Load Google Contacts Sync setting
      if (settings.google_contacts_sync_enabled !== undefined) {
        setGoogleSyncEnabled(settings.google_contacts_sync_enabled === 'true' || settings.google_contacts_sync_enabled === true);
      }
    }).catch(console.error);

    if (isSuperAdmin) {
      loadQualityTiers();
    }
  }, [currentUser]);

  const loadQualityTiers = async () => {
    try {
      const tiers = await api.getQualityTiers();
      setQualityTiers(tiers || []);
    } catch (err) {
      console.error('Failed to load quality tiers:', err);
    }
  };

  const handleCreateTier = async () => {
    if (!newTierName || !newTierDesc) return;
    try {
      await api.createQualityTier({ name: newTierName, description: newTierDesc });
      setNewTierName('');
      setNewTierDesc('');
      loadQualityTiers();
    } catch (err) {
      console.error(err);
      alert('Failed to create tier: ' + err.message);
    }
  };

  const handleUpdateTierDesc = async (id: string) => {
    if (!editingTierDesc) return;
    try {
      await api.updateQualityTier(id, { description: editingTierDesc });
      setEditingTierId(null);
      setEditingTierDesc('');
      loadQualityTiers();
    } catch (err) {
      console.error(err);
      alert('Failed to update tier: ' + err.message);
    }
  };

  const handleDeleteTier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tier?')) return;
    try {
      await api.deleteQualityTier(id);
      loadQualityTiers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete tier: ' + err.message);
    }
  };

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

          {/* Push Notifications */}
          <section className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/5">
            <div className="flex items-center gap-3 mb-6">
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                pushEnabled ? "bg-emerald-50 text-emerald-600" : "bg-surface-container-high text-on-surface-variant"
              )}>
                {pushEnabled ? <BellRing size={22} /> : <Bell size={22} />}
              </div>
              <div>
                <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Push Notifications</h3>
                <p className="text-[10px] text-on-surface-variant/60 mt-0.5">
                  {pushStatus === 'unsupported' && 'Not supported on this browser'}
                  {pushStatus === 'denied' && 'Blocked — check browser settings'}
                  {pushStatus === 'granted' && pushEnabled && 'Active — you will receive alerts'}
                  {pushStatus === 'granted' && !pushEnabled && 'Permission granted — tap to enable'}
                  {pushStatus === 'idle' && 'Enable to receive chat alerts on this device'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Status indicator */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-highest border border-outline-variant/10">
                <div className={cn(
                  "w-3 h-3 rounded-full flex-shrink-0 transition-colors",
                  pushEnabled ? "bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" : "bg-on-surface-variant/20"
                )} />
                <span className={cn(
                  "text-sm font-bold",
                  pushEnabled ? "text-emerald-500" : "text-on-surface-variant"
                )}>
                  {pushEnabled ? 'Notifications Active' : 'Notifications Off'}
                </span>
              </div>

              {/* Toggle button */}
              <button 
                id="push-notification-toggle"
                onClick={handleTogglePush}
                disabled={pushLoading || pushStatus === 'unsupported'}
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50",
                  pushEnabled 
                    ? "bg-surface-container-high text-on-surface-variant border border-outline-variant/10 hover:bg-error/10 hover:text-error hover:border-error/20 shadow-none" 
                    : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-200"
                )}
              >
                {pushLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : pushEnabled ? (
                  <BellOff size={16} />
                ) : (
                  <Bell size={16} />
                )}
                {pushEnabled ? 'Disable Notifications' : 'Enable Push Notifications'}
              </button>

              {/* Test button (only visible when enabled) */}
              {pushEnabled && (
                <button 
                  id="push-notification-test"
                  onClick={handleTestPush}
                  className={cn(
                    "w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                    testPushSent 
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-surface-container-highest text-on-surface-variant border border-outline-variant/10 hover:text-primary hover:border-primary/20"
                  )}
                >
                  {testPushSent ? <CheckCircle2 size={14} /> : <BellRing size={14} />}
                  {testPushSent ? 'Test Notification Sent!' : 'Send Test Notification'}
                </button>
              )}

              {pushStatus === 'denied' && (
                <p className="text-[10px] text-error font-bold leading-relaxed">
                  ⚠️ Notifications are blocked. Open your browser settings and allow notifications for this site, then try again.
                </p>
              )}
            </div>
          </section>

          {/* SMS Alerts Toggle */}
          <section id="sms-alerts-section" className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/5">
            <div className="flex items-center gap-3 mb-6">
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                smsAlertsEnabled ? "bg-amber-50 text-amber-600" : "bg-surface-container-high text-on-surface-variant"
              )}>
                {smsAlertsEnabled ? <SmartphoneNfc size={22} /> : <Smartphone size={22} />}
              </div>
              <div>
                <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">SMS Alerts</h3>
                <p className="text-[10px] text-on-surface-variant/60 mt-0.5">
                  Receive text messages for new customer chats
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Status indicator */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-highest border border-outline-variant/10">
                <div className={cn(
                  "w-3 h-3 rounded-full flex-shrink-0 transition-colors",
                  smsAlertsEnabled ? "bg-amber-500 shadow-lg shadow-amber-500/50 animate-pulse" : "bg-on-surface-variant/20"
                )} />
                <span className={cn(
                  "text-sm font-bold",
                  smsAlertsEnabled ? "text-amber-500" : "text-on-surface-variant"
                )}>
                  {smsAlertsEnabled ? 'SMS Alerts Active' : 'SMS Alerts Off'}
                </span>
              </div>

              {/* Toggle button */}
              <button
                id="sms-alerts-toggle"
                onClick={handleToggleSmsAlerts}
                disabled={smsToggleLoading}
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50",
                  smsAlertsEnabled
                    ? "bg-surface-container-high text-on-surface-variant border border-outline-variant/10 hover:bg-error/10 hover:text-error hover:border-error/20 shadow-none"
                    : "bg-amber-500 text-white hover:bg-amber-400 shadow-amber-200"
                )}
              >
                {smsToggleLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : smsAlertsEnabled ? (
                  <BellOff size={16} />
                ) : (
                  <Smartphone size={16} />
                )}
                {smsAlertsEnabled ? 'Disable SMS Alerts' : 'Enable SMS Alerts'}
              </button>

              {/* Cost-saving info */}
              <p className="text-[10px] text-on-surface-variant/60 leading-relaxed px-1">
                💡 Turn this off to stop receiving text messages and save Twilio credits.
                Desktop/PWA push notifications will still work.
              </p>
            </div>
          </section>

          {/* Google Contacts Sync */}
          <section id="google-sync-section" className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/5">
            <div className="flex items-center gap-3 mb-6">
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                googleSyncEnabled ? "bg-blue-50 text-blue-600" : "bg-surface-container-high text-on-surface-variant"
              )}>
                <Users size={22} />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Google Contacts Sync</h3>
                <p className="text-[10px] text-on-surface-variant/60 mt-0.5">
                  Automatically add new customers to Google Contacts
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-highest border border-outline-variant/10">
                <div className={cn(
                  "w-3 h-3 rounded-full flex-shrink-0 transition-colors",
                  googleSyncEnabled ? "bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse" : "bg-on-surface-variant/20"
                )} />
                <span className={cn(
                  "text-sm font-bold",
                  googleSyncEnabled ? "text-blue-500" : "text-on-surface-variant"
                )}>
                  {googleSyncEnabled ? 'Auto-Sync Active' : 'Auto-Sync Off'}
                </span>
              </div>

              <button
                id="google-sync-toggle"
                onClick={handleToggleGoogleSync}
                disabled={googleSyncLoading}
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50",
                  googleSyncEnabled
                    ? "bg-surface-container-high text-on-surface-variant border border-outline-variant/10 hover:bg-error/10 hover:text-error hover:border-error/20 shadow-none"
                    : "bg-blue-500 text-white hover:bg-blue-400 shadow-blue-200"
                )}
              >
                {googleSyncLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Users size={16} />
                )}
                {googleSyncEnabled ? 'Disable Auto-Sync' : 'Enable Auto-Sync'}
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

          {/* Quality Tiers Management (Super Admin Only) */}
          {isSuperAdmin && (
            <section className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/5 mt-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                  <Layers size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-primary tracking-tight">Quality Tiers Management</h3>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Super Admin Dictionary</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-surface-container-highest p-5 rounded-2xl border border-outline-variant/10 space-y-4">
                  <h4 className="text-xs font-black text-on-surface uppercase tracking-wider">Add New Tier</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                      type="text" 
                      value={newTierName}
                      onChange={(e) => setNewTierName(e.target.value)}
                      placeholder="Name (e.g. Premium)"
                      className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                    <input 
                      type="text" 
                      value={newTierDesc}
                      onChange={(e) => setNewTierDesc(e.target.value)}
                      placeholder="Tooltip Description..."
                      className="md:col-span-2 w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                  <button 
                    onClick={handleCreateTier}
                    disabled={!newTierName || !newTierDesc}
                    className="bg-amber-500 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-all disabled:opacity-50"
                  >
                    Create Tier
                  </button>
                </div>

                <div className="space-y-3">
                  {qualityTiers.map(tier => (
                    <div key={tier.id} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <span className="inline-block px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded mb-2">
                          {tier.name}
                        </span>
                        {editingTierId === tier.id ? (
                          <input 
                            type="text" 
                            value={editingTierDesc}
                            onChange={(e) => setEditingTierDesc(e.target.value)}
                            className="w-full bg-surface-container-high border border-outline-variant/10 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          />
                        ) : (
                          <p className="text-xs text-on-surface-variant font-medium">{tier.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {editingTierId === tier.id ? (
                          <>
                            <button 
                              onClick={() => handleUpdateTierDesc(tier.id)}
                              className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button 
                              onClick={() => { setEditingTierId(null); setEditingTierDesc(''); }}
                              className="p-2 bg-error/5 text-error rounded-lg hover:bg-error/10 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => { setEditingTierId(tier.id); setEditingTierDesc(tier.description); }}
                              className="p-2 bg-secondary-container text-on-secondary-container rounded-lg hover:opacity-80 transition-opacity"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteTier(tier.id)}
                              className="p-2 bg-error/5 text-error rounded-lg hover:bg-error/10 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}



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
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Model</label>
                  <input 
                    type="text" 
                    value={smsModel}
                    onChange={(e) => setSmsModel(e.target.value)}
                    placeholder="e.g. iPhone 13"
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Repair</label>
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
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Price (Amount)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                  <input 
                    type="number" 
                    value={smsAmount}
                    onChange={(e) => setSmsAmount(e.target.value)}
                    placeholder="200"
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
                  {`Hi there, this is Ali Mobile Repair,\n\nThe ${smsRepair || '[Repair]'} for ${smsModel || '[Model]'} is $${smsAmount || '0'}.\n\nYou are welcome to walk in or book an appointment here: https://alimobile.com.au\nAddress: Kiosk C1 Ringwood Square Shopping Centre, Ringwood 3134\nPhone: 0481 058 514`}
                </div>
              )}
            </div>
          </section>


        </div>
      </div>

      {/* Failsafe Debug: shows raw user object when super admin check fails */}
      {!isSuperAdmin && (
        <details className="mt-4 opacity-30 hover:opacity-100 transition-opacity text-[10px] text-on-surface-variant">
          <summary className="cursor-pointer font-mono">🔍 Auth Debug (dev only)</summary>
          <pre className="mt-2 p-3 bg-surface-container-high rounded-xl overflow-auto max-h-40 font-mono text-[9px] leading-tight">
            {JSON.stringify(currentUser, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
