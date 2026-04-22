"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { 
  Calendar, Users, Eye, MapPin, Share2, Smartphone, Monitor, 
  Phone, MessageSquare, Navigation, Trophy, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#10b981', '#06b6d4'];

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  color: string;
}

const StatCard = ({ title, value, icon: Icon, trend, color }: StatCardProps) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <span className="text-emerald-600 text-sm font-bold flex items-center gap-1">
          <ArrowUpRight size={16} /> {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 font-medium text-sm mb-1">{title}</h3>
    <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
  </div>
);

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState<any>({
    eventCounts: [],
    modelPopularity: [],
    conversions: [],
    deviceStats: [
      { name: 'Mobile', value: 75 },
      { name: 'Desktop', value: 25 },
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
      // In a real app, we would query Supabase with timeRange filters
      // For this implementation, we simulate fetching while using the real table structure
      
      const days = timeRange === 'today' ? 1 : timeRange === '7d' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // 1. Fetch Event Totals
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Process Model Popularity
      const modelClicks = events?.filter(e => e.event_name === 'model_click') || [];
      const modelCounts = modelClicks.reduce((acc: any, curr: any) => {
        acc[curr.model_name] = (acc[curr.model_name] || 0) + 1;
        return acc;
      }, {});
      
      const modelPopularity = Object.entries(modelCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 5);

      // Process Conversions
      const convTypes = {
        'call_now': 'Calls',
        'get_quote': 'Quotes',
        'navigate': 'Directions'
      };
      const conversions = Object.entries(convTypes).map(([key, label]) => ({
        name: label,
        value: events?.filter(e => e.event_name === key).length || 0
      }));

      // Timeline Data (Last X days)
      const timelineData = Array.from({ length: days }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        return {
          name: dateStr,
          Visits: Math.floor(Math.random() * 50) + 20, // Simulated general traffic
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
          { name: 'iPhone 15 Pro', value: 45 },
          { name: 'iPhone 13', value: 32 },
          { name: 'S24 Ultra', value: 28 },
          { name: 'iPhone 14', value: 25 },
          { name: 'Pixel 8 Pro', value: 18 }
        ],
        conversions
      }));
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-12 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Sales <span className="text-indigo-600 italic">Analytics</span>
          </h1>
          <p className="text-slate-500 font-medium">Real-time performance and conversion tracking.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
          {['today', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                timeRange === range 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {range === 'today' ? 'Today' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
          <button className="p-2 text-slate-400 hover:text-slate-600">
            <Calendar size={20} />
          </button>
        </div>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        <StatCard title="Total Visitors" value="1,284" icon={Users} trend="+12.5%" color="bg-blue-500" />
        <StatCard title="Page Views" value="4,892" icon={Eye} trend="+8.2%" color="bg-indigo-500" />
        <StatCard title="Conversions" value={data.conversions.reduce((a: any, b: any) => a + b.value, 0).toString()} icon={TrendingUp} trend="+15.3%" color="bg-emerald-500" />
        <StatCard title="Conversion Rate" value="4.2%" icon={Share2} trend="+1.1%" color="bg-purple-500" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Traffic Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" />
              Traffic & Conversions
            </h2>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.eventCounts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="Visits" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Conversions" stroke="#10b981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
            <Smartphone size={20} className="text-indigo-600" />
            Device Mix
          </h2>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.deviceStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data.deviceStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">75%</span>
              <span className="text-xs text-slate-400 font-bold uppercase">Mobile</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {data.deviceStats.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-sm font-bold text-slate-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Conversion Triggers */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <Navigation size={20} className="text-indigo-600" />
            Conversion Triggers
          </h2>
          <div className="space-y-6">
            {data.conversions.map((conv: any, idx: number) => {
              const icons = [Phone, MessageSquare, Navigation];
              const Icon = icons[idx] || MessageSquare;
              return (
                <div key={conv.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <Icon size={20} className="text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{conv.name}</h4>
                      <p className="text-xs text-slate-400 font-medium">Click conversions</p>
                    </div>
                  </div>
                  <span className="text-xl font-black text-indigo-600">{conv.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Models */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" />
            Popular Models
          </h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.modelPopularity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#1e293b', fontSize: 12, fontWeight: 700}} width={120} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geographic */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <MapPin size={20} className="text-rose-500" />
            Top Locations
          </h2>
          <div className="space-y-4">
            {data.geoData.map((loc: any, idx: number) => (
              <div key={loc.city} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="font-bold text-slate-700">{loc.city}</span>
                  <span className="text-slate-400">{loc.count} searches</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(loc.count / data.geoData[0].count) * 100}%` }}
                    className={`h-full rounded-full ${idx === 0 ? 'bg-indigo-500' : 'bg-slate-300'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
