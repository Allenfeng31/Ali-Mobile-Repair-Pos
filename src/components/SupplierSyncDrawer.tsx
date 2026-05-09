import React, { useState } from 'react';
import { 
  X, 
  CloudDownload, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Settings,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SupplierSyncDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

export const SupplierSyncDrawer: React.FC<SupplierSyncDrawerProps> = ({ 
  isOpen, 
  onClose, 
  onSyncComplete 
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStarted, setSyncStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startBackgroundSync = async () => {
    setIsSyncing(true);
    setError(null);
    setSyncStarted(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/scraper/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to start sync');
      
      setSyncStarted(true);
      // Wait 3 seconds then close
      setTimeout(() => {
        onClose();
        if (onSyncComplete) onSyncComplete();
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-[101] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Settings className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Supplier Price Sync</h2>
                  <p className="text-xs text-slate-400">Background Worker Control Center</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
              {!syncStarted ? (
                <div className="space-y-8 max-w-xs">
                  <div className="relative">
                    <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                      <CloudDownload className={`w-12 h-12 ${isSyncing ? 'text-indigo-400 animate-bounce' : 'text-slate-400'}`} />
                    </div>
                    {isSyncing && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-28 h-28 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">One-Click Full Sync</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Launch a comprehensive background synchronization of all device models, parts, and prices from The Parts Home catalog.
                    </p>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-left space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <p className="text-xs text-slate-300">Automated multi-category scraping</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <p className="text-xs text-slate-300">Strict historical auto-mapping</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <p className="text-xs text-slate-300">Silent background execution</p>
                    </div>
                  </div>

                  <button
                    onClick={startBackgroundSync}
                    disabled={isSyncing}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group"
                  >
                    {isSyncing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CloudDownload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    )}
                    {isSyncing ? 'Launching Worker...' : 'Run Full Catalog Sync'}
                  </button>

                  {error && (
                    <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-400/10 p-3 rounded-lg border border-rose-400/20">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                </div>
              ) : (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-6 max-w-xs"
                >
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Sync Initiated</h3>
                    <p className="text-slate-400">
                      The background worker has started the full catalog sync. This may take 10-15 minutes.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 text-indigo-400 text-sm">
                      <History className="w-4 h-4" />
                      <span>Closing window in 3s...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-900/80">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <p>© 2026 Ali Mobile Repair</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Backend Ready</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
