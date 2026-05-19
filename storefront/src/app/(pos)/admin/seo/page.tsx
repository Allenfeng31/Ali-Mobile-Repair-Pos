"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { 
  Radar, 
  ArrowLeft, 
  Check, 
  X, 
  Sparkles, 
  ShieldAlert, 
  Clock, 
  Search,
  Database,
  ThumbsUp,
  Skull
} from 'lucide-react';
import Link from 'next/link';

interface KeywordRecord {
  id: string;
  keyword: string;
  source?: string | null;
  search_weight?: number | null;
  created_at?: string;
  updated_at?: string;
  status: 'pending' | 'approved' | 'blocked';
}

interface ScoutSummary {
  discovered: number;
  blockedByRisk: number;
  timestamp: string;
}

export default function SeoGeoScoutConsole() {
  const [keywords, setKeywords] = useState<KeywordRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'blocked'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScouting, setIsScouting] = useState(false);
  const [scoutSummary, setScoutSummary] = useState<ScoutSummary | null>(null);

  const loadRealKeywords = useCallback(async () => {
    try {
      const res = await fetch(`/api/seo/scout?t=${Date.now()}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      const json = await res.json();

      if (res.ok && json.status === 'SUCCESS') {
        setKeywords(Array.isArray(json.data) ? json.data : []);
      } else {
        console.error('Failed to load real keywords:', json.error || json.message);
      }
    } catch (err) {
      console.error('Failed to load real keywords:', err);
    }
  }, []);

  useEffect(() => {
    void loadRealKeywords();
  }, [loadRealKeywords]);

  const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'blocked') => {
    if (!id) {
      console.error('CRITICAL: Keyword ID is missing!');
      return;
    }
    console.log(`[Triage Attempt] Sending PUT for ID: ${id} to status: ${newStatus}`);

    // Optimistic UI update: instantly hide the row
    setKeywords(prev => prev.filter(k => k.id !== id));

    try {
      const res = await fetch('/api/seo/scout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        credentials: 'include',
        body: JSON.stringify({ id, status: newStatus })
      });

      if (res.ok) {
        await loadRealKeywords();
      } else {
        console.error('PUT Failed:', await res.text());
        await loadRealKeywords();
      }
    } catch (err) {
      console.error('Triage update failed:', err);
      await loadRealKeywords();
    }
  };

  const handleTriggerScout = async () => {
    setIsScouting(true);
    try {
      console.info('[seo-scout] Client request origin audit:', {
        origin: window.location.origin,
        hostname: window.location.hostname,
        port: window.location.port || '(default)',
        target: `${window.location.origin}/api/seo/scout`,
      });

      const res = await fetch('/api/seo/scout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ forceRun: true }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'SUCCESS') {
        // Successfully swept long-tail keywords!
        setScoutSummary({
          discovered: data.data.discovered,
          blockedByRisk: data.data.blockedByRisk,
          timestamp: data.data.timestamp
        });
        alert(`Scout completed! Discovered: ${data.data.discovered}, Blocked: ${data.data.blockedByRisk}`);
        await loadRealKeywords();
      } else {
        alert(`Scout failed or locked: ${data.error || data.message}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsScouting(false);
    }
  };

  // Metrics calculations
  const totalDiscovered = keywords.length;
  const builderQueueSize = keywords.filter(kw => kw.status === 'approved').length;
  const violationsBlocked = keywords.filter(kw => kw.status === 'blocked').length;

  // Filtered keywords to display
  const filteredKeywords = keywords.filter(kw => {
    const matchesTab = kw.status === activeTab;
    const matchesSearch = kw.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (kw.source || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const formatDiscoveredAt = (value?: string) => {
    if (!value) return 'Unknown';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown';

    return new Intl.DateTimeFormat('en-AU', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-8 text-slate-800 antialiased font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Ribbon */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="w-12 h-12 bg-[#f0f4f8] rounded-2xl flex items-center justify-center text-slate-600 
                       shadow-[4px_4px_10px_#d1d9e6,-4px_-4px_10px_#ffffff] 
                       hover:shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] 
                       transition-all border border-white/20 outline-none"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <span className="p-2 bg-[#f0f4f8] rounded-xl shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] text-cyan-500">
                  <Radar className="w-8 h-8" strokeWidth={2.5} />
                </span>
                SEO & GEO <span className="text-cyan-500 italic font-medium">Scout</span>
              </h1>
              <p className="text-sm text-slate-500 font-bold tracking-tight mt-1">SEO & GEO Keyword Intelligence Console</p>
            </div>
          </div>
          <div className="text-[10px] font-black uppercase tracking-wider text-cyan-600 bg-[#f0f4f8] px-4 py-2 rounded-full border border-white/40 shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff]">
            Super Admin Access Enabled
          </div>
        </header>

        {/* Top Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Card 1: Total Discovered */}
          <div className="bg-[#f0f4f8] p-6 rounded-[2rem] border border-white/40 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] flex items-center justify-between group">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Total Discovered</h3>
              <p className="text-4xl font-extrabold text-slate-800 tabular-nums">{totalDiscovered}</p>
            </div>
            <div className="w-14 h-14 bg-[#f0f4f8] rounded-2xl flex items-center justify-center text-cyan-500 shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]">
              <Database className="w-6 h-6" strokeWidth={2.5} />
            </div>
          </div>

          {/* Card 2: Builder Queue Size */}
          <div className="bg-[#f0f4f8] p-6 rounded-[2rem] border border-white/40 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] flex items-center justify-between group">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Builder Queue Size</h3>
              <p className="text-4xl font-extrabold text-emerald-600 tabular-nums">{builderQueueSize}</p>
            </div>
            <div className="w-14 h-14 bg-[#f0f4f8] rounded-2xl flex items-center justify-center text-emerald-500 shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]">
              <Sparkles className="w-6 h-6" strokeWidth={2.5} />
            </div>
          </div>

          {/* Card 3: AI Violations Blocked */}
          <div className="bg-[#f0f4f8] p-6 rounded-[2rem] border border-white/40 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] flex items-center justify-between group">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">AI Violations Blocked</h3>
              <p className="text-4xl font-extrabold text-rose-600 tabular-nums">{violationsBlocked}</p>
            </div>
            <div className="w-14 h-14 bg-[#f0f4f8] rounded-2xl flex items-center justify-center text-rose-500 shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]">
              <ShieldAlert className="w-6 h-6" strokeWidth={2.5} />
            </div>
          </div>

        </section>

        {/* Main Triage Console */}
        <main className="bg-[#f0f4f8] rounded-[2.5rem] border border-white/40 shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] p-8 overflow-hidden">
          
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200">
            
            {/* Filter Tabs */}
            <div className="flex bg-[#f0f4f8] p-1.5 rounded-2xl shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] border border-white/10 shrink-0">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black rounded-xl transition-all outline-none ${
                  activeTab === 'pending'
                    ? 'bg-[#f0f4f8] text-amber-600 shadow-[2px_2px_5px_#d1d9e6,-2px_-2px_5px_#ffffff] border border-white/40'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Clock className="w-4 h-4" />
                PENDING ({keywords.filter(k => k.status === 'pending').length})
              </button>
              
              <button
                onClick={() => setActiveTab('approved')}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black rounded-xl transition-all outline-none ${
                  activeTab === 'approved'
                    ? 'bg-[#f0f4f8] text-emerald-600 shadow-[2px_2px_5px_#d1d9e6,-2px_-2px_5px_#ffffff] border border-white/40'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                APPROVED ({keywords.filter(k => k.status === 'approved').length})
              </button>

              <button
                onClick={() => setActiveTab('blocked')}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black rounded-xl transition-all outline-none ${
                  activeTab === 'blocked'
                    ? 'bg-[#f0f4f8] text-rose-600 shadow-[2px_2px_5px_#d1d9e6,-2px_-2px_5px_#ffffff] border border-white/40'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Skull className="w-4 h-4" />
                BLOCKED ({keywords.filter(k => k.status === 'blocked').length})
              </button>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={handleTriggerScout}
                disabled={isScouting}
                className={`flex items-center justify-center gap-2 rounded-2xl bg-[#f0f4f8] px-5 py-3.5 text-xs font-black uppercase tracking-wider text-cyan-600 transition-all border border-white/40 outline-none ${
                  isScouting
                    ? 'cursor-wait shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] opacity-80'
                    : 'shadow-[4px_4px_10px_#d1d9e6,-4px_-4px_10px_#ffffff] hover:shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]'
                }`}
              >
                <Radar className="w-4 h-4" strokeWidth={2.5} />
                {isScouting ? 'Scouting Google Suggest...' : 'Trigger Scout'}
              </button>
              {scoutSummary && (
                <p className="mt-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Last sweep: {scoutSummary.timestamp}
                </p>
              )}
            </div>

            {/* Live Search Box */}
            <div className="relative flex-1 max-w-md w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search keywords or sources..."
                className="w-full bg-[#f0f4f8] text-sm text-slate-800 font-bold placeholder:text-slate-400/80 px-5 py-3.5 pl-12 rounded-2xl
                         shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] border-none outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
              <Search className="absolute left-4 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

          </div>

          {/* Ingestion Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="pb-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Keyword Context</th>
                  <th className="pb-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingestion Source</th>
                  <th className="pb-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Score / Weight</th>
                  <th className="pb-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Discovered At</th>
                  <th className="pb-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Triage Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredKeywords.length > 0 ? (
                  filteredKeywords.map(item => (
                    <tr key={item.id} className="border-b border-slate-200/50 hover:bg-slate-100/30 transition-colors group">
                      
                      {/* Keyword */}
                      <td className="py-5 px-4">
                        <div className="font-extrabold text-slate-800 text-sm tracking-tight">
                          {item.keyword}
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-5 px-4">
                        <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-[#f0f4f8] rounded-full text-slate-500 border border-white/50 shadow-[1px_1px_3px_#d1d9e6,-1px_-1px_3px_#ffffff]">
                          {item.source || 'SEO Scout'}
                        </span>
                      </td>

                      {/* Weight */}
                      <td className="py-5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 text-xs font-black rounded-lg ${
                          (item.search_weight || 0) >= 85 
                            ? 'bg-emerald-50 text-emerald-600 shadow-[inset_1px_1px_3px_#d1d9e6,inset_-1px_-1px_3px_#ffffff]' 
                            : 'bg-cyan-50 text-cyan-600 shadow-[inset_1px_1px_3px_#d1d9e6,inset_-1px_-1px_3px_#ffffff]'
                        }`}>
                          {item.search_weight || 0}
                        </span>
                      </td>

                      {/* Discovered At */}
                      <td className="py-5 px-4">
                        <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDiscoveredAt(item.created_at || item.updated_at)}
                        </div>
                      </td>

                      {/* Triage Actions */}
                      <td className="py-5 px-4 text-right">
                        <div className="flex items-center justify-end gap-3.5">
                          
                          {item.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(item.id, 'approved')}
                                className="w-9 h-9 bg-[#f0f4f8] text-emerald-600 rounded-xl flex items-center justify-center 
                                         shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] 
                                         hover:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] 
                                         hover:text-emerald-500 active:bg-emerald-50 transition-all border border-white/20"
                                title="Approve & Push to Builder Queue"
                              >
                                <Check className="w-4 h-4" strokeWidth={3} />
                              </button>
                              
                              <button
                                onClick={() => handleStatusUpdate(item.id, 'blocked')}
                                className="w-9 h-9 bg-[#f0f4f8] text-rose-600 rounded-xl flex items-center justify-center 
                                         shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] 
                                         hover:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] 
                                         hover:text-rose-500 active:bg-rose-50 transition-all border border-white/20"
                                title="Block Keyword"
                              >
                                <X className="w-4 h-4" strokeWidth={3} />
                              </button>
                            </>
                          )}

                          {item.status === 'approved' && (
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg">
                              Queued
                            </span>
                          )}

                          {item.status === 'blocked' && (
                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-lg">
                              Blocked
                            </span>
                          )}

                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-bold">
                      No keyword records found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </main>

      </div>
    </div>
  );
}
