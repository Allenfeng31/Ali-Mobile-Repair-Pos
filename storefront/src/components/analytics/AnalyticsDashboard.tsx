"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { 
  Calendar, Users, Eye, MapPin, Smartphone, Monitor, 
  Phone, MessageSquare, Navigation, Trophy, ArrowUpRight, TrendingUp,
  Download, Filter, ChevronDown, Apple, Smartphone as AndroidIcon,
  Search, AlertCircle, CheckCircle2, Clock, Map, ChevronRight,
  TrendingDown, Info, Trash2, Laptop
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfDay, endOfDay, subDays, isWithinInterval, parseISO, isSameDay } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

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

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d'); // 'today', '7d', '30d', 'custom'
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  const [data, setData] = useState<any>({
    eventCounts: [],
    modelPopularity: [],
    conversions: [],
    pricingHealth: [],
    topLocations: [],
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
      const nowMelbourne = toZonedTime(new Date(), MELBOURNE_TZ);
      
      let currentStart: Date;
      let currentEnd: Date = endOfDay(nowMelbourne);

      if (timeRange === 'today') {
        currentStart = startOfDay(nowMelbourne);
      } else if (timeRange === '7d') {
        currentStart = startOfDay(subDays(nowMelbourne, 6));
      } else if (timeRange === '30d') {
        currentStart = startOfDay(subDays(nowMelbourne, 29));
      } else {
        currentStart = startOfDay(toZonedTime(new Date(startDate), MELBOURNE_TZ));
        currentEnd = endOfDay(toZonedTime(new Date(endDate), MELBOURNE_TZ));
      }

      // Period Duration for PoP
      const durationMs = currentEnd.getTime() - currentStart.getTime();
      const previousEnd = new Date(currentStart.getTime() - 1);
      const previousStart = new Date(previousEnd.getTime() - durationMs);

      // Fetch combined range
      const { data: allEvents, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', previousStart.toISOString())
        .lte('created_at', currentEnd.toISOString());

      if (error) throw error;
      if (!allEvents) return;

      const currentEvents = allEvents.filter(e => new Date(e.created_at) >= currentStart);
      const previousEvents = allEvents.filter(e => new Date(e.created_at) < currentStart);

      // 1. Timeline Data (Current Period)
      const diffDays = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
      const timelineData = Array.from({ length: diffDays + 1 }).map((_, i) => {
        const d = subDays(currentEnd, diffDays - i);
        const dateStr = format(d, 'MMM d');
        const dayEvents = currentEvents.filter(e => isSameDay(toZonedTime(new Date(e.created_at), MELBOURNE_TZ), d));
        return {
          name: dateStr,
          Visits: dayEvents.length,
          Conversions: dayEvents.filter(e => ['call_now', 'get_quote', 'book_repair'].includes(e.event_name)).length
        };
      });

      // 2. Model Popularity
      const modelClicks = currentEvents.filter(e => e.event_name === 'model_click');
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
        { name: 'Calls', value: currentEvents.filter(e => e.event_name === 'call_now').length, icon: Phone },
        { name: 'Quotes', value: currentEvents.filter(e => e.event_name === 'get_quote').length, icon: MessageSquare },
        { name: 'Bookings', value: currentEvents.filter(e => e.event_name === 'book_repair').length, icon: Clock },
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
      currentEvents.forEach(e => {
        const category = e.metadata?.repairCategory;
        if (e.model_name && category) {
          const key = `${e.model_name} - ${category}`;
          if (!healthMap.has(key)) healthMap.set(key, { name: key, views: 0, actions: 0 });
          const item = healthMap.get(key);
          if (item) {
            if (e.event_name === 'repair_view') item.views++;
            if (['call_now', 'get_quote', 'book_repair'].includes(e.event_name)) item.actions++;
          }
        }
      });

      const pricingHealth = Array.from(healthMap.values())
        .map((item: PricingHealthItem) => ({
          ...item,
          rate: item.views > 0 ? (item.actions / item.views) * 100 : 0
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

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
      const currentVisits = currentEvents.filter(e => e.event_type === 'click' || e.event_type === 'view').length;
      const currentConversionsTotal = currentEvents.filter(e => ['call_now', 'get_quote', 'book_repair'].includes(e.event_name)).length;
      const currentConvRate = currentVisits > 0 ? (currentConversionsTotal / currentVisits) * 100 : 0;

      const prevVisits = previousEvents.filter(e => e.event_type === 'click' || e.event_type === 'view').length;
      const prevConversionsTotal = previousEvents.filter(e => ['call_now', 'get_quote', 'book_repair'].includes(e.event_name)).length;
      const prevConvRate = prevVisits > 0 ? (prevConversionsTotal / prevVisits) * 100 : 0;

      setData({
        eventCounts: timelineData,
        modelPopularity,
        conversions,
        pricingHealth,
        topLocations,
        deviceUsage,
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
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
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

        {/* Pricing Health Row */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Model & Repair Detail</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Price Views</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Conversions</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.pricingHealth.length > 0 ? data.pricingHealth.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-indigo-600 transition-colors shadow-sm">
                          {item.name.toLowerCase().includes('iphone') ? <Apple size={18} /> : <AndroidIcon size={18} />}
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
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium">Not enough data to calculate pricing health.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
