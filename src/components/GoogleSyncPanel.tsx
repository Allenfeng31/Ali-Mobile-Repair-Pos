import React, { useState, useEffect } from 'react';
import { X, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '../lib/api';

interface SyncLog {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  operation: 'create' | 'update';
  status: string;
  attempts: number;
  safe_error: string | null;
  created_at: string;
  updated_at: string;
  locked_at: string | null;
}

export function GoogleSyncPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'attention' | 'pending' | 'history'>('attention');
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSyncLogs();
      setLogs(res || []);
      setErrorMessage(null);
    } catch {
      setErrorMessage('Unable to load sync tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRetry = async (taskId: string) => {
    if (retryingId) return;
    setRetryingId(taskId);
    try {
      await api.retrySyncTask(taskId);
      await fetchLogs();
    } catch {
      setErrorMessage('Unable to retry this task. Please try again.');
    } finally {
      setRetryingId(null);
    }
  };

  const handleRecheck = async (taskId: string) => {
    if (retryingId) return;
    setRetryingId(taskId);
    try {
      await api.recheckSyncTask(taskId);
      await fetchLogs();
    } catch {
      setErrorMessage('Unable to recheck Google Contacts. Please try again.');
    } finally {
      setRetryingId(null);
    }
  };

  const now = new Date();

  // Categorize logs
  const needsAttention = logs.filter(log => {
    if (log.status === 'verification_required') return true;
    if (log.status === 'failed' && log.attempts < 5) return true;
    if (log.attempts >= 5 && log.status !== 'synced') return true;
    const isStale = log.status === 'processing' && log.locked_at && (now.getTime() - new Date(log.locked_at).getTime() > 5 * 60 * 1000);
    if (isStale) return true;
    return false;
  });

  const pending = logs.filter(log => {
    if (log.status === 'pending') return true;
    const isStale = log.status === 'processing' && log.locked_at && (now.getTime() - new Date(log.locked_at).getTime() > 5 * 60 * 1000);
    if (log.status === 'processing' && !isStale) return true;
    return false;
  });

  const history = logs.filter(log => log.status === 'synced');

  const getVisibleLogs = () => {
    if (activeTab === 'attention') return needsAttention;
    if (activeTab === 'pending') return pending;
    return history;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
      <div data-testid="google-sync-panel" className="bg-[var(--color-neu-bg)] w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-[var(--shadow-neu-pressed)] border border-black/5 flex flex-col overflow-x-hidden">
        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-black/5 bg-white/40">
          <div>
            <h2 className="text-2xl font-black text-black tracking-tight">Google Sync</h2>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mt-1">Background Task Monitor</p>
          </div>
          <button aria-label="Close Google Sync" onClick={onClose} className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-[var(--shadow-neu-sm)] text-gray-400 hover:text-black hover:scale-105 active:scale-95 transition-all">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        <div className="flex flex-wrap px-6 pt-4 gap-4 border-b border-black/5 bg-white/20">
          <button onClick={() => setActiveTab('attention')} className={cn("pb-4 font-black text-sm uppercase tracking-widest transition-colors relative", activeTab === 'attention' ? "text-red-600" : "text-gray-400")}>
            Needs Attention ({needsAttention.length})
            {activeTab === 'attention' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t-full" />}
          </button>
          <button onClick={() => setActiveTab('pending')} className={cn("pb-4 font-black text-sm uppercase tracking-widest transition-colors relative", activeTab === 'pending' ? "text-purple-600" : "text-gray-400")}>
            Pending ({pending.length})
            {activeTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-t-full" />}
          </button>
          <button onClick={() => setActiveTab('history')} className={cn("pb-4 font-black text-sm uppercase tracking-widest transition-colors relative", activeTab === 'history' ? "text-green-600" : "text-gray-400")}>
            Synced History ({history.length})
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 rounded-t-full" />}
          </button>
        </div>

        <div data-testid="sync-task-list" className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
          {errorMessage && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{errorMessage}</p>}
          {isLoading ? (
            <div data-testid="sync-loading" className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-black/5 rounded-2xl" />)}
            </div>
          ) : getVisibleLogs().length === 0 ? (
            <div className="py-20 text-center">
              <CheckCircle2 size={48} strokeWidth={2} className="mx-auto text-gray-300 mb-4" />
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No records found</p>
            </div>
          ) : (
            getVisibleLogs().map(log => (
              <div key={log.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-[var(--shadow-neu-sm)] border border-black/5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-black text-black text-lg">{log.customer_name}</h3>
                    <span className="text-[10px] font-black text-black/60 uppercase tracking-widest">{log.customer_phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest mt-2">
                    <span className={cn("px-2 py-1 rounded-lg",
                      log.status === 'synced' ? "bg-green-50 text-green-600" :
                      log.status === 'processing' ? "bg-purple-50 text-purple-600" :
                      log.status === 'verification_required' ? "bg-amber-50 text-amber-700" :
                      log.status === 'failed' ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"
                    )}>
                      {log.status}
                    </span>
                    <span className="text-gray-400">Attempts: {log.attempts}/5</span>
                    <span className="text-gray-400">{log.operation}</span>
                  </div>
                  {log.safe_error && (
                    <p className="text-[10px] font-bold text-red-500 mt-2 flex items-center gap-1">
                      <AlertCircle size={12} strokeWidth={3} /> {log.safe_error}
                    </p>
                  )}
                  <p className="text-[9px] font-black text-gray-400 mt-2 flex items-center gap-1">
                    <Clock size={10} strokeWidth={3} /> {log.status === 'verification_required' ? 'Last attempt' : 'Last updated'}: {new Date(log.updated_at || log.created_at).toLocaleString()}
                  </p>
                </div>

                {activeTab === 'attention' && log.status === 'verification_required' && (
                  <button
                    onClick={() => handleRecheck(log.id)}
                    disabled={retryingId === log.id}
                    aria-label={`Recheck Google for ${log.customer_name}`}
                    className="shrink-0 px-6 py-3 bg-amber-50 text-amber-700 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-amber-100 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={14} strokeWidth={3} className={retryingId === log.id ? "animate-spin" : ""} />
                    {retryingId === log.id ? 'Rechecking...' : 'Recheck Google'}
                  </button>
                )}

                {activeTab === 'attention' && log.status !== 'synced' && log.status !== 'verification_required' && log.attempts < 5 && (
                  <button
                    onClick={() => handleRetry(log.id)}
                    disabled={retryingId === log.id}
                    aria-label={`Retry sync task for ${log.customer_name}`}
                    className="shrink-0 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-100 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={14} strokeWidth={3} className={retryingId === log.id ? "animate-spin" : ""} />
                    {retryingId === log.id ? 'Retrying...' : 'Retry Now'}
                  </button>
                )}

                {log.attempts >= 5 && log.status !== 'synced' && (
                  <span className="shrink-0 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-200">
                    Limit Reached
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
