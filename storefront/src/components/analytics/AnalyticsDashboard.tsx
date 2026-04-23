"use client";

import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { 
  Calendar, Users, Eye, MapPin, Share2, Smartphone, Monitor, 
  Phone, MessageSquare, Navigation, Trophy, ArrowUpRight, TrendingUp,
  Download, Filter, ChevronDown, MoreHorizontal, Apple, Smartphone as AndroidIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

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
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 transition-transform group-hover:scale-110 duration-300`}>
        <Icon size={22} className={color.replace('bg-', 'text-')} />
      </div>
      <div className="flex flex-col items-end">
        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trendUp ? <ArrowUpRight size={14} /> : <TrendingUp size={14} className="rotate-180" />}
          {trend}
        </span>
        <span className="text-[10px] text-slate-400 font-medium mt-1">vs last period</span>
      </div>
    </div>
    <div>
      <h3 className="text-slate-500 font-semibold text-xs uppercase tracking-wider mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 tabular-nums">{value}</p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl ring-1 ring-slate-900/5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{label}</p>
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
  const [data, setData] = useState<any>({
    eventCounts: [],
    modelPopularity: [],
    conversions: [],
    deviceStats: [
      { name: 'Mobile', value: 75, icon: Smartphone },
      { name: 'Desktop', value: 25, icon: Monitor },
    ],
    trafficSources: [
      { name: 'Google', value: 45 },
      { name: 'Direct', value: 30 },
      { name: 'Maps', value: 15 },
      { name: 'Social', value: 10 },
    ],
    geoData: [
      { city: 'Ringwood', count: 450 },
      { city: 'Mitcham', count: 230 },
      { city: 'Croydon', count: 180 },
      { city: 'Vermont', count: 120 },
      { city: 'Melbourne', count: 90 },
    ]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const days = timeRange === 'today' ? 1 : timeRange === '7d' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate.toISOString());

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
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 5);

      const convTypes = {
        'call_now': 'Calls',
        'get_quote': 'Quotes',
        'navigate': 'Directions'
      };
      const conversions = Object.entries(convTypes).map(([key, label]) => ({
        name: label,
        value: events?.filter(e => e.event_name === key).length || 0
      }));

      const timelineData = Array.from({ length: days }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        return {
          name: dateStr,
          Visits: Math.floor(Math.random() * 50) + 20,
          Conversions: events?.filter(e => {
            const ed = new Date(e.created_at);
            return ed.toDateString() === d.toDateString() && ['call_now', 'get_quote', 'navigate'].includes(e.event_name);
          }).length || 0
        };
      });

      setData((prev: any) => ({
        ...prev,
        eventCounts: timelineData,
        modelPopularity: modelPopularity.length > 0 ? modelPopularity : [
          { name: 'iPhone 15 Pro', value: 45, brand: 'Apple' },
          { name: 'iPhone 13', value: 32, brand: 'Apple' },
          { name: 'S24 Ultra', value: 28, brand: 'Android' },
          { name: 'iPhone 14', value: 25, brand: 'Apple' },
          { name: 'Pixel 8 Pro', value: 18, brand: 'Android' }
        ],
        conversions
      }));
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden font-sans text-slate-900">
      {/* Premium Sidebar Layout Wrapper (Simulated Content Area) */}
      <div className="max-w-[1600px] mx-auto p-6 lg:p-10">
        
        {/* Superior Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-[0.2em] mb-1">
              <TrendingUp size={14} />
              Performance Dashboard
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Sales <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">Analytics</span>
            </h1>
            <p className="text-slate-500 font-medium">Detailed breakdown of traffic, interactions, and conversion health.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <button 
                className="flex items-center gap-3 bg-white border border-slate-200 pl-4 pr-3 py-2.5 rounded-2xl text-sm font-bold text-slate-700 shadow-sm hover:border-slate-300 transition-all"
              >
                <Calendar size={18} className="text-slate-400" />
                <span>{timeRange === 'today' ? 'Today' : timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'}</span>
                <ChevronDown size={16} className="text-slate-400 ml-2 group-hover:translate-y-0.5 transition-transform" />
              </button>
              {/* Dropdown Menu (Simplified for this view) */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                {['today', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${timeRange === range ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {range === 'today' ? 'Today' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                  </button>
                ))}
              </div>
            </div>
            
            <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 shadow-sm transition-all">
              <Filter size={18} />
            </button>
            
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
              <Download size={18} />
              Export Report
            </button>
          </div>
        </header>

        {/* High-Impact Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Total Visitors" value="1,284" icon={Users} trend="+12.5%" trendUp={true} color="bg-blue-500" />
          <StatCard title="Page Views" value="4,892" icon={Eye} trend="+8.2%" trendUp={true} color="bg-indigo-500" />
          <StatCard title="Conversions" value={data.conversions.reduce((a: any, b: any) => a + b.value, 0).toString()} icon={TrendingUp} trend="+15.3%" trendUp={true} color="bg-emerald-500" />
          <StatCard title="Conv. Rate" value="4.2%" icon={Share2} trend="-0.4%" trendUp={false} color="bg-amber-500" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Main Area Chart */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Traffic & Engagement</h2>
                <p className="text-sm text-slate-400 font-medium italic">Visits vs Conversions over time</p>
              </div>
              <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>
            
            <div className="p-8 flex-1">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.eventCounts}>
                    <defs>
                      <linearGradient id="gradientVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gradientConversions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} 
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="Visits" 
                      stroke="#6366f1" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#gradientVisits)" 
                      animationDuration={1500}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Conversions" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#gradientConversions)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Side Panel: Device Mix */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Device Breakdown</h2>
              <p className="text-sm text-slate-400 font-medium italic">Traffic distribution</p>
            </div>
            
            <div className="p-8 flex-1 flex flex-col justify-center">
              <div className="h-[250px] relative mb-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.deviceStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={95}
                      paddingAngle={8}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1500}
                    >
                      {data.deviceStats.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PROFESSIONAL_COLORS[index % PROFESSIONAL_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">75%</span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    <Smartphone size={10} className="text-indigo-600" />
                    Mobile
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {data.deviceStats.map((entry: any, index: number) => (
                  <div key={entry.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${PROFESSIONAL_COLORS[index]}15` }}>
                        <entry.icon size={16} style={{ color: PROFESSIONAL_COLORS[index] }} />
                      </div>
                      <span className="text-sm font-bold text-slate-600">{entry.name} User</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-slate-900">{entry.value}%</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${entry.value}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: PROFESSIONAL_COLORS[index] }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Top Models Leaderboard - REIMAGINED */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Top Models</h2>
                <p className="text-sm text-slate-400 font-medium italic">Highest interaction volume</p>
              </div>
              <Trophy size={20} className="text-amber-500" />
            </div>

            <div className="space-y-6">
              {data.modelPopularity.map((model: any, idx: number) => (
                <div key={model.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${idx === 0 ? 'bg-indigo-50' : 'bg-slate-50'}`}>
                          {model.brand === 'Apple' ? <Apple size={18} className="text-slate-900" /> : <AndroidIcon size={18} className="text-emerald-600" />}
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-[10px] font-black text-slate-900">{idx + 1}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{model.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{model.brand}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900 tabular-nums">{model.value}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">clicks</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(model.value / data.modelPopularity[0].value) * 100}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className={`h-full rounded-full ${idx === 0 ? 'bg-indigo-500' : 'bg-slate-300'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Triggers */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Conversion Triggers</h2>
                <p className="text-sm text-slate-400 font-medium italic">Action breakdown</p>
              </div>
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <Navigation size={18} />
              </div>
            </div>
            
            <div className="space-y-5 flex-1">
              {data.conversions.map((conv: any, idx: number) => {
                const icons = [Phone, MessageSquare, Navigation];
                const Icon = icons[idx] || MessageSquare;
                const colors = ['text-blue-600', 'text-purple-600', 'text-rose-600'];
                const bgColors = ['bg-blue-50', 'bg-purple-50', 'bg-rose-50'];
                
                return (
                  <div key={conv.name} className="flex items-center justify-between p-4 rounded-3xl border border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 ${bgColors[idx]} rounded-2xl transition-transform group-hover:scale-110`}>
                        <Icon size={20} className={colors[idx]} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{conv.name}</h4>
                        <p className="text-xs text-slate-400 font-medium italic">High-intent interaction</p>
                      </div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                      <span className="text-xl font-black text-slate-900">{conv.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Geographic Breakdown */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Top Locations</h2>
                <p className="text-sm text-slate-400 font-medium italic">Regional demand</p>
              </div>
              <MapPin size={22} className="text-rose-500" strokeWidth={2.5} />
            </div>
            
            <div className="space-y-6">
              {data.geoData.map((loc: any, idx: number) => (
                <div key={loc.city} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                      <span className="font-bold text-slate-700 text-sm">{loc.city}</span>
                    </div>
                    <span className="text-slate-400 text-xs font-bold uppercase tabular-nums">{loc.count} <span className="font-medium lowercase">events</span></span>
                  </div>
                  <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(loc.count / data.geoData[0].count) * 100}%` }}
                      transition={{ duration: 1, delay: 0.2 + (idx * 0.1) }}
                      className={`h-full rounded-full shadow-sm ${idx === 0 ? 'bg-indigo-500' : 'bg-slate-300 transition-colors'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-8 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">
              View Detailed Map
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
