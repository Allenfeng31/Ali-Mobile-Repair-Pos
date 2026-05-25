"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { 
  Calendar, Users, Eye, MapPin, Smartphone, Monitor, 
  Phone, MessageSquare, Navigation, Trophy, ArrowUpRight, TrendingUp,
  Download, Filter, ChevronDown, Apple, Smartphone as AndroidIcon,
  Search, AlertCircle, CheckCircle2, Clock, Map, ChevronRight,
  TrendingDown, Info, Trash2, Laptop, ChevronUp, Tablet, Watch,
  Home, FileText, Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase'; // retained for potential future client-side use
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfDay, endOfDay, subDays, isSameDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const MELBOURNE_TZ = 'Australia/Melbourne';
const PROFESSIONAL_COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#8b5cf6', '#06b6d4'];

// --- Helper Components ---

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
      <Icon size={80} />
    </div>
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon size={20} className={color.replace('bg-', 'text-')} />
      </div>
      <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {trendUp ? <ArrowUpRight size={14} /> : <TrendingUp size={14} className="rotate-180" />}
        {trend}
      </span>
    </div>
    <h3 className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-1">{title}</h3>
    <p className="text-3xl font-bold text-slate-900 tabular-nums">{value}</p>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-lg ring-1 ring-black/5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm font-medium text-slate-600">{entry.name}</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// --- Main Dashboard ---

interface PricingHealthItem {
  name: string;
  views: number;
  actions: number;
  rate?: number;
}

interface KeywordVisitItem {
  keyword: string;
  visits: number;
}

interface SuburbConversionItem {
  suburb: string;
  views: number;
  homepageClicks: number;
  rate: number;
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d'); // 'today', '7d', '30d', 'custom'
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // --- Data Grid State ---
  const [activeTab, setActiveTab] = useState<'Phones'|'Tablets'|'Computers'|'Watches'>('Phones');
  const [sortConfig, setSortConfig] = useState<{ key: 'views'|'actions'|'rate'; direction: 'desc'|'asc' }>({ key: 'views', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 30;
  
  const [data, setData] = useState<any>({
    eventCounts: [],
    modelPopularity: [],
    conversions: [],
    pricingHealth: [],
    topLocations: [],
    appointmentFunnel: { bookingRequests: 0, confirmed: 0, arrived: 0, arrivalRate: 0 },
    keywordVisits: { top: [], bottom: [] },
    suburbConversions: [],
    weeklyReport: null,
    weeklyReportLoading: false,
    totalVisitors: 0,
    pageViews: 0,
    conversionRate: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, startDate, endDate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const growth = ((current - previous) / previous) * 100;
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // -----------------------------------------------------------
      // Fetch from server-side API route which uses Service Role Key
      // (bypasses RLS) and handles timezone conversion correctly.
      // -----------------------------------------------------------
      const params = new URLSearchParams({ timeRange });
      if (timeRange === 'custom') {
        params.set('startDate', startDate);
        params.set('endDate', endDate);
      }

      const res = await fetch(`/api/analytics?${params.toString()}`);
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `API responded ${res.status}`);
      }

      const { events: allEvents, currentStartUTC, appointments = [] } = await res.json();
      if (!allEvents || allEvents.length === 0) {
        console.warn('[dashboard] No events returned from API');
      }

      const currentStartDate = new Date(currentStartUTC);
      const currentEvents = allEvents.filter((e: any) => new Date(e.created_at) >= currentStartDate);
      const previousEvents = allEvents.filter((e: any) => new Date(e.created_at) < currentStartDate);

      // 1. Timeline Data (Current Period) — using Melbourne local dates for display
      const nowMelbourne = toZonedTime(new Date(), MELBOURNE_TZ);
      let localStart: Date;
      let localEnd: Date = endOfDay(nowMelbourne);

      if (timeRange === 'today') {
        localStart = startOfDay(nowMelbourne);
      } else if (timeRange === '7d') {
        localStart = startOfDay(subDays(nowMelbourne, 6));
      } else if (timeRange === '30d') {
        localStart = startOfDay(subDays(nowMelbourne, 29));
      } else {
        localStart = startOfDay(toZonedTime(new Date(startDate), MELBOURNE_TZ));
        localEnd = endOfDay(toZonedTime(new Date(endDate), MELBOURNE_TZ));
      }

      const diffDays = Math.ceil((localEnd.getTime() - localStart.getTime()) / (1000 * 60 * 60 * 24));
      const timelineData = Array.from({ length: diffDays + 1 }).map((_, i) => {
        const d = subDays(localEnd, diffDays - i);
        const dateStr = format(d, 'MMM d');
        const dayEvents = currentEvents.filter((e: any) => isSameDay(toZonedTime(new Date(e.created_at), MELBOURNE_TZ), d));
        return {
          name: dateStr,
          Visits: dayEvents.length,
          Conversions: dayEvents.filter((e: any) => ['call_now', 'get_quote', 'book_repair'].includes(e.event_name)).length
        };
      });

      // 2. Model Popularity
      const modelClicks = currentEvents.filter((e: any) => e.event_name === 'model_click');
      const modelCounts = modelClicks.reduce((acc: any, curr: any) => {
        acc[curr.model_name] = (acc[curr.model_name] || 0) + 1;
        return acc;
      }, {});
      
      const modelPopularity = Object.entries(modelCounts)
        .map(([name, value]) => ({ 
          name, 
          value, 
          brand: name.toLowerCase().includes('iphone') || name.toLowerCase().includes('ipad') ? 'Apple' : 'Android'
        }))
        .sort((a: any, b: any) => (b.value as number) - (a.value as number))
        .slice(0, 5);

      // 3. Conversion Triggers
      const conversions = [
        { name: 'Calls', value: currentEvents.filter((e: any) => e.event_name === 'call_now').length, icon: Phone },
        { name: 'Quotes', value: currentEvents.filter((e: any) => e.event_name === 'get_quote').length, icon: MessageSquare },
        { name: 'Bookings', value: currentEvents.filter((e: any) => e.event_name === 'book_repair').length, icon: Clock },
      ];

      // 4. Top Locations
      const locationCounts = currentEvents.reduce((acc: any, curr: any) => {
        if (curr.city) acc[curr.city] = (acc[curr.city] || 0) + 1;
        return acc;
      }, {});
      const topLocations = Object.entries(locationCounts)
        .map(([city, count]) => ({ city, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // 5. Pricing Health
      const healthMap = new globalThis.Map<string, PricingHealthItem>();
      currentEvents.forEach((e: any) => {
        const category = e.metadata?.repairCategory;
        if (e.model_name && category) {
          const key = `${e.model_name} - ${category}`;
          if (!healthMap.has(key)) healthMap.set(key, { name: key, views: 0, actions: 0 });
          const item = healthMap.get(key);
          if (item) {
            if (e.event_name === 'repair_view') item.views++;
            if (e.event_name === 'book_repair') item.actions++;
          }
        }
      });

      const pricingHealth = Array.from(healthMap.values())
        .map((item: PricingHealthItem) => ({
          ...item,
          rate: item.views > 0 ? (item.actions / item.views) * 100 : 0
        }));

      // 6. Device Usage Split
      const deviceCounts = currentEvents.reduce((acc: any, curr: any) => {
        const type = curr.device_type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      const totalEvents = currentEvents.length;
      const deviceUsage = Object.entries(deviceCounts).map(([name, value]) => ({
        name,
        value: value as number,
        percentage: totalEvents > 0 ? ((value as number) / totalEvents) * 100 : 0
      })).sort((a, b) => b.value - a.value);

      // Totals & Growth
      const currentVisits = currentEvents.filter((e: any) => e.event_type === 'click' || e.event_type === 'view').length;
      const currentConversionsTotal = currentEvents.filter((e: any) => ['call_now', 'get_quote', 'book_repair'].includes(e.event_name)).length;
      const currentConvRate = currentVisits > 0 ? (currentConversionsTotal / currentVisits) * 100 : 0;

      const prevVisits = previousEvents.filter((e: any) => e.event_type === 'click' || e.event_type === 'view').length;
      const prevConversionsTotal = previousEvents.filter((e: any) => ['call_now', 'get_quote', 'book_repair'].includes(e.event_name)).length;
      const prevConvRate = prevVisits > 0 ? (prevConversionsTotal / prevVisits) * 100 : 0;

      const appointmentStatuses = appointments.map((appointment: any) => String(appointment.status || '').toLowerCase().trim());
      const bookingRequests = appointmentStatuses.filter((status: string) => status !== 'declined').length;
      const confirmed = appointmentStatuses.filter((status: string) => status === 'confirmed' || status === 'arrived').length;
      const arrived = appointmentStatuses.filter((status: string) => status === 'arrived').length;
      const appointmentFunnel = {
        bookingRequests,
        confirmed,
        arrived,
        arrivalRate: confirmed > 0 ? (arrived / confirmed) * 100 : 0,
      };

      const suburbMap = new globalThis.Map<string, SuburbConversionItem>();
      currentEvents.forEach((event: any) => {
        if (event.event_name !== 'suburb_page_view' && event.event_name !== 'suburb_home_click') return;
        const suburb = String(event.metadata?.suburb || event.model_name || 'Unknown').trim();
        const item = suburbMap.get(suburb) || { suburb, views: 0, homepageClicks: 0, rate: 0 };
        if (event.event_name === 'suburb_page_view') item.views += 1;
        if (event.event_name === 'suburb_home_click') item.homepageClicks += 1;
        suburbMap.set(suburb, item);
      });
      const suburbConversions = Array.from(suburbMap.values())
        .map((item) => ({ ...item, rate: item.views > 0 ? (item.homepageClicks / item.views) * 100 : 0 }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      const keywordMap = new globalThis.Map<string, number>();
      currentEvents.forEach((event: any) => {
        if (event.event_name !== 'seo_keyword_view') return;
        const keyword = String(event.metadata?.keyword || event.model_name || 'Unknown keyword').trim();
        keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + 1);
      });
      const keywordItems = Array.from(keywordMap.entries())
        .map(([keyword, visits]) => ({ keyword, visits }))
        .sort((a, b) => b.visits - a.visits || a.keyword.localeCompare(b.keyword));
      const keywordVisits = {
        top: keywordItems.slice(0, 10),
        bottom: [...keywordItems].sort((a, b) => a.visits - b.visits || a.keyword.localeCompare(b.keyword)).slice(0, 10),
      };

      setData({
        eventCounts: timelineData,
        modelPopularity,
        conversions,
        pricingHealth,
        topLocations,
        deviceUsage,
        appointmentFunnel,
        suburbConversions,
        keywordVisits,
        totalVisitors: currentVisits,
        pageViews: currentEvents.length,
        conversionRate: currentConvRate,
        trends: {
          visits: calculateGrowth(currentVisits, prevVisits),
          events: calculateGrowth(currentEvents.length, previousEvents.length),
          conversions: calculateGrowth(currentConversionsTotal, prevConversionsTotal),
          rate: calculateGrowth(currentConvRate, prevConvRate),
          visitsUp: currentVisits >= prevVisits,
          eventsUp: currentEvents.length >= previousEvents.length,
          conversionsUp: currentConversionsTotal >= prevConversionsTotal,
          rateUp: currentConvRate >= prevConvRate
        }
      });

      fetchWeeklyReport();
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyReport = async () => {
    setData((prev: any) => ({ ...prev, weeklyReportLoading: true }));
    try {
      const res = await fetch('/api/analytics/weekly-report');
      if (!res.ok) throw new Error(`Weekly report API responded ${res.status}`);
      const json = await res.json();
      setData((prev: any) => ({
        ...prev,
        weeklyReport: json.report || null,
        weeklyReportLoading: false,
      }));
    } catch (error) {
      console.error('Failed to fetch weekly report:', error);
      setData((prev: any) => ({ ...prev, weeklyReportLoading: false }));
    }
  };

  const downloadWeeklyReport = () => {
    const report = data.weeklyReport;
    if (!report?.markdown) return;

    const blob = new Blob([report.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ali-mobile-weekly-report-${new Date(report.periodEnd || Date.now()).toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const generateWeeklyReportNow = async () => {
    setData((prev: any) => ({ ...prev, weeklyReportLoading: true }));
    try {
      const res = await fetch('/api/analytics/weekly-report', { method: 'POST' });
      if (!res.ok) throw new Error(`Weekly report API responded ${res.status}`);
      const json = await res.json();
      setData((prev: any) => ({
        ...prev,
        weeklyReport: json.report || null,
        weeklyReportLoading: false,
      }));
    } catch (error) {
      console.error('Failed to generate weekly report:', error);
      setData((prev: any) => ({ ...prev, weeklyReportLoading: false }));
    }
  };

  const handleRangeChange = (range: string) => {
    setTimeRange(range);
    if (range !== 'custom') {
      setIsDatePickerOpen(false);
    } else {
      setIsDatePickerOpen(true);
    }
  };

  // --- Data Grid Helpers ---
  const classifyDevice = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('ipad') || lower.includes('tab')) return 'Tablets';
    if (lower.includes('mac') || lower.includes('pc') || lower.includes('laptop') || lower.includes('surface')) return 'Computers';
    if (lower.includes('watch')) return 'Watches';
    return 'Phones';
  };

  const handleSort = (key: 'views' | 'actions' | 'rate') => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'desc' ? 'asc' : 'desc' }
        : { key, direction: 'desc' }
    );
    setCurrentPage(1);
  };

  const handleTabChange = (tab: 'Phones' | 'Tablets' | 'Computers' | 'Watches') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const { paginatedItems, totalPages, totalFiltered } = useMemo(() => {
    const allItems: PricingHealthItem[] = data.pricingHealth || [];
    // Filter
    const filtered = allItems.filter((item: PricingHealthItem) => classifyDevice(item.name) === activeTab);
    // Sort
    const sorted = [...filtered].sort((a: any, b: any) => {
      const aVal = a[sortConfig.key] ?? 0;
      const bVal = b[sortConfig.key] ?? 0;
      return sortConfig.direction === 'desc' ? bVal - aVal : aVal - bVal;
    });
    // Paginate
    const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = sorted.slice(startIdx, startIdx + ITEMS_PER_PAGE);
    return { paginatedItems, totalPages, totalFiltered: filtered.length };
  }, [data.pricingHealth, activeTab, sortConfig, currentPage]);

  const tabCounts = useMemo(() => {
    const allItems: PricingHealthItem[] = data.pricingHealth || [];
    return {
      Phones: allItems.filter((i: PricingHealthItem) => classifyDevice(i.name) === 'Phones').length,
      Tablets: allItems.filter((i: PricingHealthItem) => classifyDevice(i.name) === 'Tablets').length,
      Computers: allItems.filter((i: PricingHealthItem) => classifyDevice(i.name) === 'Computers').length,
      Watches: allItems.filter((i: PricingHealthItem) => classifyDevice(i.name) === 'Watches').length,
    };
  }, [data.pricingHealth]);

  const SortIndicator = ({ columnKey }: { columnKey: 'views' | 'actions' | 'rate' }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronDown size={12} className="text-slate-300 ml-1 inline-block" />;
    }
    return sortConfig.direction === 'desc'
      ? <ChevronDown size={12} className="text-indigo-600 ml-1 inline-block" />
      : <ChevronUp size={12} className="text-indigo-600 ml-1 inline-block" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header & Date Controls */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <TrendingUp size={20} />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Performance <span className="text-indigo-600 font-medium italic">IQ</span>
              </h1>
            </div>
            <p className="text-slate-500 font-medium flex items-center gap-2 text-sm">
              <MapPin size={14} className="text-indigo-400" /> Ringwood HQ • {MELBOURNE_TZ}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Ranges */}
            <div className="flex bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm overflow-hidden">
              {['today', '7d', '30d', 'custom'].map((range) => (
                <button
                  key={range}
                  onClick={() => handleRangeChange(range)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all capitalize ${
                    timeRange === range 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range}
                </button>
              ))}
            </div>

            {/* Custom Date Picker Popup */}
            <AnimatePresence>
              {timeRange === 'custom' && isDatePickerOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  ref={datePickerRef}
                  className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 absolute lg:right-6 top-44 lg:top-24 z-50 w-full max-w-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <Calendar size={18} className="text-indigo-600" /> Date Selection
                    </h4>
                    <button onClick={() => setIsDatePickerOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <Clock size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Date</label>
                      <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End Date</label>
                      <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setIsDatePickerOpen(false);
                      fetchAnalytics();
                    }}
                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                  >
                    Apply Range
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={fetchAnalytics}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
              title="Refresh Data"
            >
              <Download size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Interactions" 
            value={data.totalVisitors.toLocaleString()} 
            icon={Users} 
            trend={data.trends?.visits || '0%'} 
            trendUp={data.trends?.visitsUp} 
            color="bg-blue-600" 
          />
          <StatCard 
            title="Analytics Events" 
            value={data.pageViews.toLocaleString()} 
            icon={Eye} 
            trend={data.trends?.events || '0%'} 
            trendUp={data.trends?.eventsUp} 
            color="bg-indigo-600" 
          />
          <StatCard 
            title="Total Conversions" 
            value={data.conversions?.reduce((a: any, b: any) => a + b.value, 0).toString()} 
            icon={CheckCircle2} 
            trend={data.trends?.conversions || '0%'} 
            trendUp={data.trends?.conversionsUp} 
            color="bg-emerald-600" 
          />
          <StatCard 
            title="Conversion Rate" 
            value={`${data.conversionRate.toFixed(1)}%`} 
            icon={TrendingUp} 
            trend={data.trends?.rate || '0%'} 
            trendUp={data.trends?.rateUp} 
            color="bg-amber-600" 
          />
        </div>

        {/* Weekly Operations Snapshot */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 size={22} className="text-emerald-600" /> Arrival Funnel
                </h2>
                <p className="text-sm text-slate-400 font-medium">Arrived / confirmed appointments</p>
              </div>
              <div className="text-3xl font-black text-emerald-600 tabular-nums">
                {data.appointmentFunnel.arrivalRate.toFixed(1)}%
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                ['Requests', data.appointmentFunnel.bookingRequests],
                ['Confirmed', data.appointmentFunnel.confirmed],
                ['Arrived', data.appointmentFunnel.arrived],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
                  <div className="mt-2 text-2xl font-black text-slate-900 tabular-nums">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-2 bg-slate-950 rounded-3xl shadow-sm border border-slate-800 p-8 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:36px_36px] opacity-30" />
            <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-blue-300 text-xs font-black uppercase tracking-[0.2em] mb-3">
                  <Sparkles size={16} /> Gemini Operations Analyst
                </div>
                <h2 className="text-2xl font-black tracking-tight">Weekly report preview</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300 max-w-2xl">
                  Sunday 9am report using sales, repair-page demand, arrivals, suburb movement, and SEO keyword landing-page visits.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <button
                  type="button"
                  onClick={generateWeeklyReportNow}
                  disabled={data.weeklyReportLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white ring-1 ring-white/15 transition hover:bg-white/15 disabled:cursor-wait disabled:text-slate-400"
                >
                  <Sparkles size={18} />
                  Generate now
                </button>
                <button
                  type="button"
                  onClick={downloadWeeklyReport}
                  disabled={!data.weeklyReport?.markdown}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  <FileText size={18} />
                  Download .md
                </button>
              </div>
            </div>
            <div className="relative mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              {data.weeklyReportLoading ? (
                <p className="text-sm font-medium text-slate-300">Building report...</p>
              ) : data.weeklyReport?.json?.aiRecommendations ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Revenue</div>
                      <div className="mt-2 text-2xl font-black tabular-nums">
                        ${Math.round(data.weeklyReport.json.revenue.current).toLocaleString()}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vs last week</div>
                      <div className="mt-2 text-2xl font-black tabular-nums">
                        {data.weeklyReport.json.revenue.vsPreviousPct?.toFixed(1) ?? '0.0'}%
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vs last year</div>
                      <div className="mt-2 text-2xl font-black tabular-nums">
                        {data.weeklyReport.json.revenue.vsLastYearPct?.toFixed(1) ?? '0.0'}%
                      </div>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-200">
                    {data.weeklyReport.json.aiRecommendations}
                  </pre>
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-300">No stored weekly report yet. Generate one manually or wait for Sunday 9am.</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Engagement Timeline</h2>
                <p className="text-sm text-slate-400 font-medium">Daily traffic vs interaction volume</p>
              </div>
              <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-600 rounded-full"/> Visits</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"/> Conversions</div>
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.eventCounts}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Visits" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorVisits)" />
                  <Area type="monotone" dataKey="Conversions" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorConversions)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {/* Device Distribution Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Laptop size={22} className="text-indigo-600" /> Device Distribution
                </h2>
              </div>
              
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.deviceUsage}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.deviceUsage?.map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === 'Mobile' ? '#6366f1' : entry.name === 'Desktop' ? '#94a3b8' : '#10b981'} 
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900">
                    {Math.round(data.deviceUsage?.find((d: any) => d.name === 'Mobile')?.percentage || 0)}%
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {data.deviceUsage?.map((d: any) => (
                  <div key={d.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${d.name === 'Mobile' ? 'bg-indigo-600' : d.name === 'Desktop' ? 'bg-slate-400' : 'bg-emerald-500'}`} />
                      <span className="text-xs font-bold text-slate-600">{d.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">{Math.round(d.percentage)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversion Triggers Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900">Conversion Triggers</h2>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <TargetIcon size={18} />
                </div>
              </div>
              <div className="space-y-4">
                {data.conversions.map((conv: any) => (
                  <div key={conv.name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white rounded-xl shadow-sm">
                        <conv.icon size={18} className="text-indigo-600" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{conv.name}</h4>
                    </div>
                    <div className="text-xl font-black text-slate-900 tabular-nums">
                      {conv.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Health Data Grid */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="text-indigo-600" size={24} /> Pricing Health & Conversions
              </h2>
              <p className="text-sm text-slate-400 font-medium">Analyzing Model + Repair Category performance</p>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl border border-amber-100 text-xs font-bold">
              <TrendingDown size={14} /> Flagging items under 2.0% Conversion
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-8 pt-6 pb-2">
            <div className="flex gap-2 flex-wrap">
              {([
                { key: 'Phones' as const, icon: Smartphone, label: 'Phones' },
                { key: 'Tablets' as const, icon: Tablet, label: 'Tablets' },
                { key: 'Computers' as const, icon: Monitor, label: 'Computers' },
                { key: 'Watches' as const, icon: Watch, label: 'Watches' },
              ]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.key
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-slate-100'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    activeTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/60 text-slate-400'
                  }`}>
                    {tabCounts[tab.key]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sortable Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Model & Repair Detail</th>
                  <th className="px-8 py-4 text-center">
                    <button onClick={() => handleSort('views')} className={`text-[10px] font-black uppercase tracking-widest transition-colors inline-flex items-center gap-0.5 ${
                      sortConfig.key === 'views' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                    }`}>
                      Price Views <SortIndicator columnKey="views" />
                    </button>
                  </th>
                  <th className="px-8 py-4 text-center">
                    <button onClick={() => handleSort('actions')} className={`text-[10px] font-black uppercase tracking-widest transition-colors inline-flex items-center gap-0.5 ${
                      sortConfig.key === 'actions' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                    }`}>
                      Bookings <SortIndicator columnKey="actions" />
                    </button>
                  </th>
                  <th className="px-8 py-4 text-right">
                    <button onClick={() => handleSort('rate')} className={`text-[10px] font-black uppercase tracking-widest transition-colors inline-flex items-center gap-0.5 ml-auto ${
                      sortConfig.key === 'rate' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                    }`}>
                      Conversion Rate <SortIndicator columnKey="rate" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedItems.length > 0 ? paginatedItems.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-indigo-600 transition-colors shadow-sm">
                          {item.name.toLowerCase().includes('iphone') || item.name.toLowerCase().includes('ipad') || item.name.toLowerCase().includes('mac') || item.name.toLowerCase().includes('watch')
                            ? <Apple size={18} />
                            : <AndroidIcon size={18} />}
                        </div>
                        <span className="font-bold text-slate-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center font-bold text-slate-500 tabular-nums">{item.views}</td>
                    <td className="px-8 py-5 text-center font-bold text-slate-900 tabular-nums">{item.actions}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`text-lg font-black tabular-nums ${item.rate < 2 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {item.rate.toFixed(1)}%
                        </span>
                        {item.rate < 2 && (
                          <span className="flex items-center gap-1 text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase">
                            <AlertCircle size={10} /> Needs Review
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium">No data for the {activeTab} category in this time range.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalFiltered > 0 && (
            <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalFiltered)}–{Math.min(currentPage * ITEMS_PER_PAGE, totalFiltered)} of {totalFiltered} items
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentPage === 1
                      ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                      : 'bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100'
                  }`}
                >
                  <ChevronDown size={14} className="rotate-90" /> Prev
                </button>
                <span className="text-sm font-bold text-slate-700 tabular-nums">
                  Page {currentPage} <span className="text-slate-400 font-medium">of</span> {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentPage === totalPages
                      ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                      : 'bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100'
                  }`}
                >
                  Next <ChevronDown size={14} className="-rotate-90" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Row: Models & Geolocation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Trophy size={22} className="text-amber-500" /> Popular Demand
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">By Search Volume</span>
            </div>
            <div className="space-y-6">
              {data.modelPopularity.map((model: any, idx: number) => (
                <div key={model.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-indigo-200">#0{idx + 1}</span>
                      <span className="font-bold text-slate-900">{model.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900 tabular-nums">{model.value} clicks</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(model.value / data.modelPopularity[0].value) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Map size={22} className="text-indigo-600" /> Top Repair Hotspots
              </h2>
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" /> Live Now
              </div>
            </div>
            <div className="space-y-5">
              {data.topLocations.length > 0 ? data.topLocations.map((loc: any, idx: number) => (
                <div key={loc.city} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 font-bold text-xs uppercase">
                        {loc.city.substring(0, 2)}
                      </div>
                      <span className="font-bold text-slate-900">{loc.city}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-500 tabular-nums">{loc.count} sessions</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(loc.count / data.topLocations[0].count) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              )) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3 border-2 border-dashed border-slate-100 rounded-2xl">
                  <MapPin size={32} opacity={0.3} />
                  <p className="text-sm font-medium">Gathering location insights...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEO & Suburb Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Search size={22} className="text-indigo-600" /> SEO Keyword Visits
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Landing-page sessions</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-emerald-600">Top 10</h3>
                <div className="space-y-3">
                  {data.keywordVisits.top.length ? data.keywordVisits.top.map((item: KeywordVisitItem, idx: number) => (
                    <div key={item.keyword} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3">
                      <span className="min-w-0 truncate text-sm font-bold text-slate-800">#{idx + 1} {item.keyword}</span>
                      <span className="shrink-0 text-sm font-black text-slate-900 tabular-nums">{item.visits}</span>
                    </div>
                  )) : (
                    <p className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm font-medium text-slate-400">No SEO keyword visits yet.</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-rose-600">Lowest 10</h3>
                <div className="space-y-3">
                  {data.keywordVisits.bottom.length ? data.keywordVisits.bottom.map((item: KeywordVisitItem) => (
                    <div key={item.keyword} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3">
                      <span className="min-w-0 truncate text-sm font-bold text-slate-800">{item.keyword}</span>
                      <span className="shrink-0 text-sm font-black text-slate-900 tabular-nums">{item.visits}</span>
                    </div>
                  )) : (
                    <p className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm font-medium text-slate-400">No SEO keyword visits yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Home size={22} className="text-indigo-600" /> Suburb to Homepage
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suburb page movement</span>
            </div>
            <div className="space-y-4">
              {data.suburbConversions.length ? data.suburbConversions.map((item: SuburbConversionItem) => (
                <div key={item.suburb} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900">{item.suburb}</span>
                    <span className="text-lg font-black text-indigo-600 tabular-nums">{item.rate.toFixed(1)}%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>{item.homepageClicks} homepage clicks</span>
                    <span>{item.views} suburb views</span>
                  </div>
                </div>
              )) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3 border-2 border-dashed border-slate-100 rounded-2xl">
                  <Home size={32} opacity={0.3} />
                  <p className="text-sm font-medium">Suburb page tracking starts from the next visits.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TargetIcon = ({ size, className }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
