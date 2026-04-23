"use client";

import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  Calendar, Users, Eye, MapPin, Smartphone, Monitor, 
  Phone, MessageSquare, Navigation, Trophy, ArrowUpRight, TrendingUp,
  Download, Filter, ChevronDown, Apple, Smartphone as AndroidIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { format, startOfDay, subDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const MELBOURNE_TZ = 'Australia/Melbourne';
const PROFESSIONAL_COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#8b5cf6', '#06b6d4'];

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: string;
  trendUp: boolean;
  color: string;
}

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color }: StatCardProps) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
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

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    eventCounts: [],
    modelPopularity: [],
    conversions: [],
    deviceStats: [
      { name: 'Mobile', value: 75, icon: Smartphone },
      { name: 'Desktop', value: 25, icon: Monitor },
    ],
    geoData: [
      { city: 'Ringwood', count: 0 },
      { city: 'Mitcham', count: 0 },
      { city: 'Croydon', count: 0 },
      { city: 'Vermont', count: 0 },
    ]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const nowMelbourne = toZonedTime(new Date(), MELBOURNE_TZ);
      const todayStartMelbourne = startOfDay(nowMelbourne);
      
      let startDateMelbourne;
      if (timeRange === 'today') {
        startDateMelbourne = todayStartMelbourne;
      } else if (timeRange === '7d') {
        startDateMelbourne = subDays(todayStartMelbourne, 7);
      } else {
        startDateMelbourne = subDays(todayStartMelbourne, 30);
      }

      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDateMelbourne.toISOString());

      if (error) throw error;

      const modelClicks = events?.filter(e => e.event_name === 'model_click') || [];
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

      const conversions = [
        { name: 'Calls', value: events?.filter(e => e.event_name === 'call_now').length || 0, icon: Phone },
        { name: 'Quotes', value: events?.filter(e => e.event_name === 'get_quote').length || 0, icon: MessageSquare },
        { name: 'Directions', value: events?.filter(e => e.event_name === 'navigate').length || 0, icon: Navigation },
      ];

      const days = timeRange === 'today' ? 1 : timeRange === '7d' ? 7 : 30;
      const timelineData = Array.from({ length: days }).map((_, i) => {
        const d = subDays(todayStartMelbourne, days - 1 - i);
        const dateStr = format(d, days === 1 ? 'HH:mm' : 'MMM d');
        
        return {
          name: dateStr,
          Visits: events?.filter(e => {
            const ed = toZonedTime(new Date(e.created_at), MELBOURNE_TZ);
            return startOfDay(ed).getTime() === d.getTime();
          }).length || 0,
          Conversions: events?.filter(e => {
            const ed = toZonedTime(new Date(e.created_at), MELBOURNE_TZ);
            return startOfDay(ed).getTime() === d.getTime() && ['call_now', 'get_quote', 'navigate'].includes(e.event_name);
          }).length || 0
        };
      });

      setData((prev: any) => ({
        ...prev,
        eventCounts: timelineData,
        modelPopularity,
        conversions,
      }));
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Sales <span className="text-indigo-600 italic">Analytics</span>
            </h1>
            <p className="text-slate-500 font-medium">Business performance & customer insights for Melbourne HQ.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
              {['today', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    timeRange === range 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {range === 'today' ? 'Today' : range === '7d' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Visitors" value="1,284" icon={Users} trend="+12.5%" trendUp={true} color="bg-blue-500" />
          <StatCard title="Page Views" value="4,892" icon={Eye} trend="+8.2%" trendUp={true} color="bg-indigo-500" />
          <StatCard title="Conversions" value={data.conversions.reduce((a: any, b: any) => a + b.value, 0).toString()} icon={TrendingUp} trend="+15.3%" trendUp={true} color="bg-emerald-500" />
          <StatCard title="Conv. Rate" value="4.2%" icon={MapPin} trend="-0.4%" trendUp={false} color="bg-amber-500" />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Engagement Timeline</h2>
              <p className="text-sm text-slate-400 font-medium">Daily traffic vs interaction volume</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-2"><div className="w-3 h-1 bg-indigo-600 rounded-full"/> Visits</div>
              <div className="flex items-center gap-2"><div className="w-3 h-1 bg-emerald-500 rounded-full"/> Conversions</div>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.eventCounts}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Visits" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                <Area type="monotone" dataKey="Conversions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorConversions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">Popular Models</h2>
              <Trophy size={20} className="text-amber-500" />
            </div>
            <div className="space-y-6">
              {data.modelPopularity.length > 0 ? data.modelPopularity.map((model: any, idx: number) => (
                <div key={model.name} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                        {model.brand === 'Apple' ? <Apple size={18} className="text-slate-900" /> : <AndroidIcon size={18} className="text-emerald-600" />}
                      </div>
                      <span className="font-bold text-slate-900">{model.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900 tabular-nums">{model.value} clicks</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                      style={{ width: `${(model.value / data.modelPopularity[0].value) * 100}%` }}
                    />
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center text-slate-400 text-sm font-medium">No click data for this period</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">Conversion Triggers</h2>
              <TrendingUp size={20} className="text-indigo-600" />
            </div>
            <div className="space-y-4">
              {data.conversions.map((conv: any) => (
                <div key={conv.name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                      <conv.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{conv.name}</h4>
                      <p className="text-xs text-slate-400 font-medium">Direct customer interaction</p>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tabular-nums">
                    {conv.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
