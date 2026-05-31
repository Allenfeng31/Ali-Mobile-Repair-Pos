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
    ? (currentUser?.app_metadata?.role || '')
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
    <div className="space-y-10 min-h-screen bg-neu-bg p-4 md:p-8">
      {/* Header */}
      <div className="mb-10 text-left">
        <h2 className="text-3xl font-extrabold text-blue-600 tracking-tight mb-2">System Settings</h2>
        <p className="text-gray-600 font-body">Manage your hardware connections and document preferences.</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Left Column */}
        <div className="md:col-span-5 flex flex-col gap-10">

          {/* Account Security & Profile */}
          <section className="bg-neu-bg rounded-[2rem] p-8 shadow-neu-flat border-none">
            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-6">Employee Information</h3>
            
            <div className="space-y-8">
              <div className="flex gap-6 items-center mb-2">
                <div className="w-20 h-20 rounded-3xl bg-neu-bg shadow-neu-flat flex items-center justify-center text-blue-600 font-black text-3xl uppercase">
                  {(currentUser?.username || 'A').charAt(0)}
                </div>
                <div>
                  <p className="text-xl font-black text-black leading-tight">{currentUser?.username || 'Employee'}</p>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">{currentUser?.role || 'Staff'}</p>
                </div>
              </div>

              <div className="space-y-6 pt-2">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Update Name</label>
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter new display name..."
                    className="w-full bg-neu-bg shadow-neu-pressed rounded-2xl px-5 py-4 text-sm font-bold text-black placeholder:text-gray-400 focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Change Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password..."
                    className="w-full bg-neu-bg shadow-neu-pressed rounded-2xl px-5 py-4 text-sm font-bold text-black placeholder:text-gray-400 focus:outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={handleUpdateProfile}
                  className="w-full bg-neu-bg text-blue-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-neu-flat hover:opacity-90 active:shadow-neu-pressed transition-all flex items-center justify-center gap-3"
                >
                  {isSyncing ? <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> : <Save size={16} />}
                  Save Employee Updates
                </button>
              </div>

              <div className="h-0.5 bg-gray-300/20 my-8 shadow-inner"></div>

              <div className="flex items-center justify-between bg-neu-bg p-6 rounded-3xl shadow-neu-pressed">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-neu-bg shadow-neu-flat rounded-2xl text-red-500">
                    <LogOut size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-black uppercase tracking-wider">End Session</p>
                    <p className="text-[10px] font-bold text-gray-600 mt-0.5">Logout for security</p>
                  </div>
                </div>
                <button 
                  onClick={onLogout}
                  className="bg-neu-bg text-red-500 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-neu-flat hover:text-white hover:bg-red-500 active:shadow-neu-pressed transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </section>

          {/* Push Notifications */}
          <section className="bg-neu-bg rounded-[2rem] p-8 shadow-neu-flat border-none">
            <div className="flex items-center gap-3 mb-8">
              <div className={cn(
                "p-3 rounded-2xl transition-all shadow-neu-flat",
                pushEnabled ? "text-emerald-600" : "text-gray-400"
              )}>
                {pushEnabled ? <BellRing size={22} /> : <Bell size={22} />}
              </div>
              <div>
                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Push Notifications</h3>
                <p className="text-[10px] text-gray-600 mt-1">
                  {pushStatus === 'unsupported' && 'Not supported on this browser'}
                  {pushStatus === 'denied' && 'Blocked — check browser settings'}
                  {pushStatus === 'granted' && pushEnabled && 'Active — you will receive alerts'}
                  {pushStatus === 'granted' && !pushEnabled && 'Permission granted — tap to enable'}
                  {pushStatus === 'idle' && 'Enable to receive chat alerts on this device'}
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Status indicator */}
              <div className="flex items-center gap-4 p-5 rounded-3xl shadow-neu-pressed">
                <div className={cn(
                  "w-4 h-4 rounded-full flex-shrink-0 transition-all",
                  pushEnabled ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" : "bg-gray-300"
                )} />
                <span className={cn(
                  "text-sm font-bold",
                  pushEnabled ? "text-emerald-600" : "text-gray-600"
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
                  "w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:shadow-neu-pressed flex items-center justify-center gap-3 disabled:opacity-50",
                  pushEnabled 
                    ? "bg-neu-bg text-gray-600 shadow-neu-flat hover:text-red-500" 
                    : "bg-neu-bg text-emerald-600 shadow-neu-flat"
                )}
              >
                {pushLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : pushEnabled ? (
                  <BellOff size={18} />
                ) : (
                  <Bell size={18} />
                )}
                {pushEnabled ? 'Disable Notifications' : 'Enable Push Notifications'}
              </button>

              {/* Test button (only visible when enabled) */}
              {pushEnabled && (
                <button 
                  id="push-notification-test"
                  onClick={handleTestPush}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-neu-flat active:shadow-neu-pressed",
                    testPushSent 
                      ? "text-emerald-600"
                      : "text-blue-600"
                  )}
                >
                  {testPushSent ? <CheckCircle2 size={16} /> : <BellRing size={16} />}
                  {testPushSent ? 'Test Notification Sent!' : 'Send Test Notification'}
                </button>
              )}

              {pushStatus === 'denied' && (
                <div className="p-4 rounded-2xl shadow-neu-pressed">
                  <p className="text-[10px] text-red-500 font-bold leading-relaxed text-center">
                    ⚠️ Notifications are blocked. Open your browser settings and allow notifications for this site, then try again.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* SMS Alerts Toggle */}
          <section id="sms-alerts-section" className="bg-neu-bg rounded-[2rem] p-8 shadow-neu-flat border-none">
            <div className="flex items-center gap-3 mb-8">
              <div className={cn(
                "p-3 rounded-2xl transition-all shadow-neu-flat",
                smsAlertsEnabled ? "text-amber-600" : "text-gray-400"
              )}>
                {smsAlertsEnabled ? <SmartphoneNfc size={22} /> : <Smartphone size={22} />}
              </div>
              <div>
                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">SMS Alerts</h3>
                <p className="text-[10px] text-gray-600 mt-1">
                  Receive text messages for new customer chats
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Status indicator */}
              <div className="flex items-center gap-4 p-5 rounded-3xl shadow-neu-pressed">
                <div className={cn(
                  "w-4 h-4 rounded-full flex-shrink-0 transition-all",
                  smsAlertsEnabled ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse" : "bg-gray-300"
                )} />
                <span className={cn(
                  "text-sm font-bold",
                  smsAlertsEnabled ? "text-amber-600" : "text-gray-600"
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
                  "w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:shadow-neu-pressed flex items-center justify-center gap-3 disabled:opacity-50",
                  smsAlertsEnabled
                    ? "bg-neu-bg text-gray-600 shadow-neu-flat hover:text-red-500"
                    : "bg-neu-bg text-amber-600 shadow-neu-flat"
                )}
              >
                {smsToggleLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : smsAlertsEnabled ? (
                  <BellOff size={18} />
                ) : (
                  <Smartphone size={18} />
                )}
                {smsAlertsEnabled ? 'Disable SMS Alerts' : 'Enable SMS Alerts'}
              </button>

              {/* Cost-saving info */}
              <div className="px-1 text-center">
                <p className="text-[10px] text-gray-500 leading-relaxed italic">
                  💡 Turn this off to stop receiving text messages and save Twilio credits.
                  Push notifications will still work.
                </p>
              </div>
            </div>
          </section>

          {/* Google Contacts Sync */}
          <section id="google-sync-section" className="bg-neu-bg rounded-[2rem] p-8 shadow-neu-flat border-none">
            <div className="flex items-center gap-3 mb-8">
              <div className={cn(
                "p-3 rounded-2xl transition-all shadow-neu-flat",
                googleSyncEnabled ? "text-blue-600" : "text-gray-400"
              )}>
                <Users size={22} />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Google Contacts Sync</h3>
                <p className="text-[10px] text-gray-600 mt-1">
                  Automatically add new customers to Google Contacts
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-5 rounded-3xl shadow-neu-pressed">
                <div className={cn(
                  "w-4 h-4 rounded-full flex-shrink-0 transition-all",
                  googleSyncEnabled ? "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)] animate-pulse" : "bg-gray-300"
                )} />
                <span className={cn(
                  "text-sm font-bold",
                  googleSyncEnabled ? "text-blue-600" : "text-gray-600"
                )}>
                  {googleSyncEnabled ? 'Auto-Sync Active' : 'Auto-Sync Off'}
                </span>
              </div>

              <button
                id="google-sync-toggle"
                onClick={handleToggleGoogleSync}
                disabled={googleSyncLoading}
                className={cn(
                  "w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:shadow-neu-pressed flex items-center justify-center gap-3 disabled:opacity-50",
                  googleSyncEnabled
                    ? "bg-neu-bg text-gray-600 shadow-neu-flat hover:text-red-500"
                    : "bg-neu-bg text-blue-600 shadow-neu-flat"
                )}
              >
                {googleSyncLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Users size={18} />
                )}
                {googleSyncEnabled ? 'Disable Auto-Sync' : 'Enable Auto-Sync'}
              </button>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="md:col-span-7 flex flex-col gap-10">
          <section className="bg-neu-bg rounded-[2.5rem] p-10 shadow-neu-flat border-none flex flex-col h-full">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-neu-bg shadow-neu-flat rounded-2xl">
                <Receipt className="text-blue-600" size={24} />
              </div>
              <h3 className="text-2xl font-black text-black tracking-tight">Invoice Templates</h3>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 flex-grow">
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] pl-1">Invoice Header</label>
                  <textarea 
                    className="w-full bg-neu-bg shadow-neu-pressed rounded-3xl text-sm p-6 focus:outline-none transition-all resize-none font-bold text-black h-40" 
                    value={header}
                    onChange={(e) => setHeader(e.target.value)}
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] pl-1">Footer Disclaimer</label>
                  <textarea 
                    className="w-full bg-neu-bg shadow-neu-pressed rounded-3xl text-sm p-6 focus:outline-none transition-all resize-none font-bold text-black h-40" 
                    value={footer}
                    onChange={(e) => setFooter(e.target.value)}
                  />
                </div>
                <div className="flex gap-6 pt-4">
                  <button 
                    onClick={handleSave}
                    className="flex-1 bg-neu-bg text-blue-600 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-neu-flat hover:opacity-90 active:shadow-neu-pressed transition-all"
                  >
                    {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                    {isSaved ? 'SAVED' : 'SAVE CHANGES'}
                  </button>
                  <button className="bg-neu-bg text-gray-600 p-5 rounded-2xl shadow-neu-flat hover:text-blue-600 active:shadow-neu-pressed transition-all">
                    <Eye size={24} />
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="relative hidden xl:block">
                <div className="absolute inset-0 bg-neu-bg rounded-[2rem] shadow-neu-pressed opacity-50"></div>
                <div className="relative bg-white/95 rounded-[2rem] p-10 shadow-xl h-full flex flex-col border border-white/50">
                  <div className="w-20 h-2 bg-gray-100 rounded-full mx-auto mb-10 shadow-inner"></div>
                  <div className="text-center mb-12">
                    <p className="text-[12px] font-black text-black leading-tight tracking-widest uppercase">{header.split('\n')[0]}</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-2">{header.split('\n')[1]}</p>
                  </div>
                  <div className="flex-grow space-y-5">
                    <div className="flex justify-between border-b border-gray-100 pb-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Qty 1 - iPhone 13 OLED</span>
                      <span className="text-[10px] font-black text-black">$189.00</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Labor Fee</span>
                      <span className="text-[10px] font-black text-black">$65.00</span>
                    </div>
                    <div className="pt-6 flex justify-between">
                      <span className="text-[12px] font-black text-black uppercase tracking-[0.2em]">TOTAL</span>
                      <span className="text-[12px] font-black text-blue-600">$254.00</span>
                    </div>
                  </div>
                  <div className="mt-12 text-center">
                    <p className="text-[9px] font-bold text-gray-400 leading-relaxed italic px-4">"{footer.substring(0, 80)}..."</p>
                    <div className="mt-10 flex flex-col items-center gap-2">
                      <div className="w-full h-10 bg-gray-50 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
                        <div className="flex gap-1 opacity-60">
                          {[...Array(20)].map((_, i) => (
                            <div key={i} className={cn("w-1 bg-gray-400", i % 3 === 0 ? "h-6" : "h-4")}></div>
                          ))}
                        </div>
                      </div>
                      <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">RP-8829-X9</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quality Tiers Management (Super Admin Only) */}
          {isSuperAdmin && (
            <section className="bg-neu-bg rounded-[2.5rem] p-10 shadow-neu-flat border-none mt-4">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-neu-bg shadow-neu-flat rounded-2xl text-amber-600">
                  <Layers size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-black tracking-tight">Quality Tiers</h3>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">Super Admin Dictionary</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-neu-bg p-8 rounded-[2rem] shadow-neu-pressed space-y-6">
                  <h4 className="text-xs font-black text-black uppercase tracking-wider pl-1">Add New Tier</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <input 
                      type="text" 
                      value={newTierName}
                      onChange={(e) => setNewTierName(e.target.value)}
                      placeholder="Name (e.g. Premium)"
                      className="w-full bg-neu-bg shadow-neu-pressed rounded-2xl px-5 py-4 text-sm font-bold text-black focus:outline-none transition-all"
                    />
                    <input 
                      type="text" 
                      value={newTierDesc}
                      onChange={(e) => setNewTierDesc(e.target.value)}
                      placeholder="Tooltip Description..."
                      className="md:col-span-2 w-full bg-neu-bg shadow-neu-pressed rounded-2xl px-5 py-4 text-sm font-bold text-black focus:outline-none transition-all"
                    />
                  </div>
                  <button 
                    onClick={handleCreateTier}
                    disabled={!newTierName || !newTierDesc}
                    className="bg-neu-bg text-amber-600 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-neu-flat hover:opacity-90 active:shadow-neu-pressed transition-all disabled:opacity-50"
                  >
                    Create Tier
                  </button>
                </div>

                <div className="space-y-4">
                  {qualityTiers.map(tier => (
                    <div key={tier.id} className="bg-neu-bg p-6 rounded-3xl shadow-neu-flat flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-neu-floating">
                      <div className="flex-1">
                        <span className="inline-block px-3 py-1 bg-neu-bg shadow-neu-pressed text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-lg mb-3">
                          {tier.name}
                        </span>
                        {editingTierId === tier.id ? (
                          <input 
                            type="text" 
                            value={editingTierDesc}
                            onChange={(e) => setEditingTierDesc(e.target.value)}
                            className="w-full bg-neu-bg shadow-neu-pressed rounded-xl px-4 py-3 text-sm font-bold text-black focus:outline-none"
                          />
                        ) : (
                          <p className="text-xs text-gray-600 font-bold leading-relaxed">{tier.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {editingTierId === tier.id ? (
                          <>
                            <button 
                              onClick={() => handleUpdateTierDesc(tier.id)}
                              className="p-3 bg-neu-bg shadow-neu-flat text-emerald-600 rounded-2xl hover:bg-emerald-50 active:shadow-neu-pressed transition-all"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button 
                              onClick={() => { setEditingTierId(null); setEditingTierDesc(''); }}
                              className="p-3 bg-neu-bg shadow-neu-flat text-red-500 rounded-2xl hover:bg-red-50 hover:text-red-600 active:shadow-neu-pressed transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => { setEditingTierId(tier.id); setEditingTierDesc(tier.description); }}
                              className="p-3 bg-neu-bg shadow-neu-flat text-blue-600 rounded-2xl hover:opacity-80 active:shadow-neu-pressed transition-all"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteTier(tier.id)}
                              className="p-3 bg-neu-bg shadow-neu-flat text-red-500 rounded-2xl hover:text-red-600 active:shadow-neu-pressed transition-all"
                            >
                              <Trash2 size={18} />
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
          <section className="bg-neu-bg rounded-[2.5rem] p-10 shadow-neu-flat border-none">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-neu-bg shadow-neu-flat rounded-2xl text-blue-600">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-2xl font-black text-black tracking-tight">Quick SMS Generator</h3>
            </div>

            <div className="space-y-8">
              <p className="text-sm font-bold text-gray-600 leading-relaxed pl-1">
                Generate a ready-to-send SMS with repair quote and shop details.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Model</label>
                  <input 
                    type="text" 
                    value={smsModel}
                    onChange={(e) => setSmsModel(e.target.value)}
                    placeholder="e.g. iPhone 13"
                    className="w-full bg-neu-bg shadow-neu-pressed rounded-2xl px-6 py-5 text-sm font-bold text-black focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Repair</label>
                  <input 
                    type="text" 
                    value={smsRepair}
                    onChange={(e) => setSmsRepair(e.target.value)}
                    placeholder="e.g. Screen Replacement"
                    className="w-full bg-neu-bg shadow-neu-pressed rounded-2xl px-6 py-5 text-sm font-bold text-black focus:outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Price (Amount)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black">$</span>
                  <input 
                    type="number" 
                    value={smsAmount}
                    onChange={(e) => setSmsAmount(e.target.value)}
                    placeholder="200"
                    className="w-full bg-neu-bg shadow-neu-pressed rounded-2xl pl-12 pr-6 py-5 text-sm font-bold text-black focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleCopySMS}
                  className={cn(
                    "w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:shadow-neu-pressed flex items-center justify-center gap-3 shadow-neu-flat",
                    isCopied 
                      ? "text-emerald-600" 
                      : "text-blue-600"
                  )}
                >
                  {isCopied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  {isCopied ? 'Copied to Clipboard!' : 'Generate & Copy SMS'}
                </button>
              </div>

              {/* Preview Box */}
              {(smsModel || smsRepair || smsAmount) && (
                <div className="mt-10 p-8 bg-neu-bg rounded-[2rem] shadow-neu-pressed text-sm whitespace-pre-wrap font-bold text-gray-600 leading-relaxed">
                  {`Hi there, this is Ali Mobile Repair,\n\nThe ${smsRepair || '[Repair]'} for ${smsModel || '[Model]'} is $${smsAmount || '0'}.\n\nYou are welcome to walk in or book an appointment here: https://alimobile.com.au\nAddress: Kiosk C1 Ringwood Square Shopping Centre, Ringwood 3134\nPhone: 0481 058 514`}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Failsafe Debug: shows raw user object when super admin check fails */}
      {!isSuperAdmin && (
        <details className="mt-8 opacity-40 hover:opacity-100 transition-opacity text-[10px] text-gray-500">
          <summary className="cursor-pointer font-mono p-2">🔍 Auth Debug (dev only)</summary>
          <pre className="mt-4 p-6 bg-neu-bg shadow-neu-pressed rounded-3xl overflow-auto max-h-60 font-mono text-[9px] leading-relaxed text-gray-600">
            {JSON.stringify(currentUser, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
