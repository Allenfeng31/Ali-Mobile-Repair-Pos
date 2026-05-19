// src/views/Reports.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Wrench,
  PiggyBank,
  Receipt,
  Calendar,
  Download,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Wallet,
  X,
  Eye,
  Banknote,
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
  List,
  Printer,
  Package,
  ArrowRight,
  Globe,
  MousePointerClick,
  Smartphone,
  PhoneCall,
  MessageSquare,
  ExternalLink,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPieChart,
  Pie
} from 'recharts';
import { cn } from '@/lib/utils';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { InvoiceModal } from '../components/InvoiceModal';
import { useScrollLock } from '../hooks/useScrollLock';
import { useAuthStore } from '../hooks/useAuthStore';
import { supabase } from '../lib/supabase';
import { Lock } from 'lucide-react';

interface ReportsViewProps {
  orders: Order[];
  setOrders?: React.Dispatch<React.SetStateAction<Order[]>>;
  t: (section: string, key: string) => string;
}

export function ReportsView({ orders, setOrders, t }: ReportsViewProps) {
  const { permissions } = useAuthStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);

  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showSurchargeModal, setShowSurchargeModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [breakdownType, setBreakdownType] = useState<'all' | 'repair' | 'accessory'>('all');

  const [searchOrderQuery, setSearchOrderQuery] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // ─── Web Analytics State ─────────────────────────────────────
  const [analyticsEvents, setAnalyticsEvents] = useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsRange, setAnalyticsRange] = useState<'today' | '7d' | '30d'>('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [analyticsRange]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const now = new Date();
      let startISO: string;
      if (analyticsRange === 'today') {
        const s = new Date(now); s.setHours(0, 0, 0, 0);
        startISO = s.toISOString();
      } else if (analyticsRange === '7d') {
        const s = new Date(now); s.setDate(s.getDate() - 7); s.setHours(0, 0, 0, 0);
        startISO = s.toISOString();
      } else {
        const s = new Date(now); s.setDate(s.getDate() - 30); s.setHours(0, 0, 0, 0);
        startISO = s.toISOString();
      }

      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startISO)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Reports] Analytics fetch error:', error);
        setAnalyticsEvents([]);
      } else {
        setAnalyticsEvents(data || []);
      }
    } catch (err) {
      console.error('[Reports] Analytics fetch failed:', err);
      setAnalyticsEvents([]);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Computed analytics metrics
  const analyticsStats = useMemo(() => {
    const totalPageViews = analyticsEvents.filter(e => e.event_type === 'page_view' || e.event_type === 'view').length;
    const totalClicks = analyticsEvents.filter(e => e.event_type === 'click').length;
    const totalConversions = analyticsEvents.filter(e => e.event_type === 'conversion').length;
    const uniqueSessions = new Set(analyticsEvents.map(e => e.session_id).filter(Boolean)).size;

    // Model click volumes
    const modelClickMap: Record<string, number> = {};
    analyticsEvents.filter(e => e.event_name === 'model_click' && e.model_name).forEach(e => {
      modelClickMap[e.model_name] = (modelClickMap[e.model_name] || 0) + 1;
    });
    const modelClicks = Object.entries(modelClickMap)
      .map(([model, clicks]) => ({ model, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    // Conversion breakdown
    const conversionMap: Record<string, number> = {};
    analyticsEvents.filter(e => e.event_type === 'conversion').forEach(e => {
      conversionMap[e.event_name] = (conversionMap[e.event_name] || 0) + 1;
    });

    // Device type breakdown
    const deviceMap: Record<string, number> = {};
    analyticsEvents.forEach(e => {
      const device = e.device_type || 'Unknown';
      deviceMap[device] = (deviceMap[device] || 0) + 1;
    });

    return { totalPageViews, totalClicks, totalConversions, uniqueSessions, modelClicks, conversionMap, deviceMap };
  }, [analyticsEvents]);

  useScrollLock(
    !!selectedOrder ||
    showInvoiceModal ||
    showRevenueModal ||
    showSurchargeModal ||
    showTaxModal
  );

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const orderDate = new Date(o.timestamp);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (orderDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }
      return true;
    });
  }, [orders, startDate, endDate]);

  const validOrders = useMemo(() => filteredOrders.filter(o => o.status !== 'refunded'), [filteredOrders]);

  const stats = useMemo(() => {
    const totalRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);
    const totalProfit = validOrders.reduce((acc, o) => acc + o.profit, 0);
    const cashTotal = validOrders.reduce((acc, o) => acc + (o.paymentMethod === 'cash' || !o.paymentMethod ? o.total : 0), 0);
    const eftposTotal = validOrders.reduce((acc, o) => acc + (o.paymentMethod === 'eftpos' ? o.total : 0), 0);
    const surchargeTotal = validOrders.reduce((acc, o) => acc + (o.surcharge || 0), 0);
    const taxTotal = validOrders.reduce((acc, o) => acc + (o.tax || 0), 0);
    const repairsCount = validOrders.filter(o => o.type === 'repair').length;
    const repairRevenue = validOrders.filter(o => o.type === 'repair').reduce((acc, o) => acc + o.total, 0);
    const accessoryRevenue = validOrders.filter(o => o.type !== 'repair').reduce((acc, o) => acc + o.total, 0);
    const avgTicket = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

    return {
      totalRevenue,
      totalProfit,
      cashTotal,
      eftposTotal,
      surchargeTotal,
      taxTotal,
      repairRevenue,
      accessoryRevenue,
      repairsCount,
      avgTicket
    };
  }, [validOrders]);

  const revenueBreakdown = useMemo(() => {
    const itemsMap: Record<string, { name: string, qty: number, total: number }> = {};
    validOrders.forEach(order => {
      if (breakdownType === 'repair' && order.type !== 'repair') return;
      if (breakdownType === 'accessory' && order.type === 'repair') return;

      order.items.forEach(item => {
        if (!itemsMap[item.name]) {
          itemsMap[item.name] = { name: item.name, qty: 0, total: 0 };
        }
        itemsMap[item.name].qty += item.qty;
        itemsMap[item.name].total += (item.qty * item.price);
      });
    });
    return Object.values(itemsMap).sort((a, b) => b.total - a.total);
  }, [validOrders, breakdownType]);

  const chartData = useMemo(() => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const data = days.map(day => ({ day, revenue: 0, profit: 0 }));

    validOrders.forEach(order => {
      const date = new Date(order.timestamp);
      const dayIndex = date.getDay();
      data[dayIndex].revenue += order.total;
      data[dayIndex].profit += order.profit;
    });

    return [...data.slice(1), data[0]];
  }, [validOrders]);

  const serviceSplit = useMemo(() => {
    const categories: Record<string, number> = {};
    validOrders.forEach(order => {
      order.items.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + (item.price * item.qty);
      });
    });

    const total = Object.values(categories).reduce((acc, v) => acc + v, 0);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    return Object.entries(categories).map(([name, value], i) => ({
      name,
      value: total > 0 ? Math.round((value / total) * 100) : 0,
      amount: value,
      color: colors[i % colors.length]
    }));
  }, [validOrders]);

  const repairStats = useMemo(() => {
    const repairs = validOrders.filter(o => o.type === 'repair');
    const breakdown: Record<string, { units: number, value: number }> = {};

    repairs.forEach(order => {
      order.items.forEach(item => {
        if (!breakdown[item.name]) {
          breakdown[item.name] = { units: 0, value: 0 };
        }
        breakdown[item.name].units += item.qty;
        breakdown[item.name].value += (item.price * item.qty);
      });
    });

    return Object.entries(breakdown)
      .map(([label, data]) => ({ label, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }, [validOrders]);

  const handleRefund = async () => {
    if (!selectedOrder) return;
    if (confirm(t('term', 'refundConfirm') || "Are you sure you want to refund this order? It will be removed from all totals.")) {
      try {
        const { api } = await import('../lib/api');
        const settings = await api.getSettings();
        const currentRefunded = settings.ali_pos_refunded_orders ? JSON.parse(settings.ali_pos_refunded_orders) : [];
        if (!currentRefunded.includes(selectedOrder.id)) {
          currentRefunded.push(selectedOrder.id);
          await api.updateSetting('ali_pos_refunded_orders', JSON.stringify(currentRefunded));
        }

        const updatedOrders = orders.map(o => o.id === selectedOrder.id ? { ...o, status: 'refunded' as const } : o);
        if (setOrders) setOrders(updatedOrders);
        setSelectedOrder({ ...selectedOrder, status: 'refunded' });
      } catch (err: any) {
        console.error(err);
        alert("Refund failed: " + err.message);
      }
    }
  };

  const searchedOrders = useMemo(() => {
    if (!searchOrderQuery.trim()) return filteredOrders;
    return filteredOrders.filter(o =>
      (o.id || '').toLowerCase().includes(searchOrderQuery.toLowerCase())
    );
  }, [filteredOrders, searchOrderQuery]);

  const totalPages = Math.ceil(searchedOrders.length / ITEMS_PER_PAGE);
  const displayedOrders = searchedOrders.slice((orderPage - 1) * ITEMS_PER_PAGE, orderPage * ITEMS_PER_PAGE);

  if (permissions?.can_view_full_sales_report === false) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-neu-bg)] rounded-[3rem] shadow-[var(--shadow-neu-flat)]">
        <div className="w-20 h-20 rounded-3xl bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] flex items-center justify-center text-blue-600 mb-6">
          <Lock size={40} strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-black text-black mb-2">Access Restricted</h2>
        <p className="text-gray-600 font-bold text-center max-w-md px-6">
          You do not have permission to view full sales reports. Please contact your administrator for access.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* Sticky Report Filter Panel (Operational Controls) */}
      <aside className="lg:col-span-3 order-first relative h-auto lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar p-6 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[3rem] space-y-8 border border-white/20">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Calendar size={18} strokeWidth={3} />
            </div>
            <h3 className="text-sm font-black text-black uppercase tracking-widest">Report Period</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">From Date</label>
              <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl p-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-transparent px-4 py-3 text-sm font-black text-black outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">To Date</label>
              <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl p-1">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-transparent px-4 py-3 text-sm font-black text-black outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Quick Presets</label>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => {
                const today = new Date();
                setStartDate(today.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="w-full py-4 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-black font-black text-sm rounded-2xl active:shadow-[var(--shadow-neu-pressed)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Today
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const lastWeek = new Date();
                lastWeek.setDate(today.getDate() - 7);
                setStartDate(lastWeek.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="w-full py-4 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-black font-black text-sm rounded-2xl active:shadow-[var(--shadow-neu-pressed)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="w-full py-4 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-red-600 font-black text-sm rounded-2xl active:shadow-[var(--shadow-neu-pressed)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              All Time
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <div className="bg-blue-600/5 p-5 rounded-[2rem] space-y-3 border border-blue-600/10">
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Global Export</h4>
            <p className="text-[10px] font-bold text-gray-600 leading-relaxed">Download full period financial CSV for accounting.</p>
            <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
              <Download size={14} strokeWidth={3} />
              Export CSV
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:col-span-9 space-y-10">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <span className="text-gray-600 font-black text-[10px] uppercase tracking-widest ml-1">Performance Analytics</span>
            <h2 className="text-5xl font-black tracking-tight text-black mt-1 [text-shadow:-4px_4px_6px_var(--color-neu-shadow-dark)]">
              Sales Reports
            </h2>
          </div>
          <button
            onClick={() => window.open('https://ali-mobile-repair-pos.vercel.app/dashboard/analytics', '_blank')}
            className="flex items-center gap-3 px-6 py-4 bg-[var(--color-neu-bg)] text-blue-600 font-black text-xs uppercase tracking-widest rounded-2xl shadow-[var(--shadow-neu-flat)] hover:shadow-[var(--shadow-neu-floating)] active:scale-[0.98] active:shadow-[var(--shadow-neu-pressed)] transition-all border border-white/20 mb-1"
          >
            <ExternalLink size={18} strokeWidth={3} />
            View Full Web Analytics
          </button>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            trend="Total Sales"
            icon={Wallet}
            color="primary"
            onClick={() => { setBreakdownType('all'); setShowRevenueModal(true); }}
          />
          <StatCard
            label="Repair Revenue"
            value={`$${stats.repairRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            trend={`${stats.repairsCount} Repaired`}
            icon={Wrench}
            color="primary"
            onClick={() => { setBreakdownType('repair'); setShowRevenueModal(true); }}
          />
          <StatCard
            label="Accessory Revenue"
            value={`$${stats.accessoryRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            trend="Add-ons"
            icon={Package}
            color="primary"
            onClick={() => { setBreakdownType('accessory'); setShowRevenueModal(true); }}
          />
          <StatCard
            label="Card Surcharges"
            value={`$${stats.surchargeTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            trend="1.5% Applied"
            icon={CreditCard}
            color="secondary"
            onClick={() => setShowSurchargeModal(true)}
          />
          <StatCard
            label="GST Liabilities"
            value={`$${stats.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            trend="Tax (10%)"
            icon={Receipt}
            color="secondary"
            onClick={() => setShowTaxModal(true)}
          />
          <StatCard
            label="Net Profit"
            value={`$${stats.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            trend={`${Math.round((stats.totalProfit / (stats.totalRevenue || 1)) * 100)}% Margin`}
            icon={PiggyBank}
            color="tertiary"
          />
          <StatCard
            label="Average Ticket"
            value={`$${stats.avgTicket.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            trend="Per Transaction"
            icon={TrendingUp}
            color="primary"
          />
          <StatCard
            label="Cash Collections"
            value={`$${stats.cashTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            trend="Manual Settle"
            icon={Banknote}
            color="primary"
          />
        </div>

        {/* Charts & Order Journal Section */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main Visual Trends (Extruded Container) */}
          <div className="xl:col-span-8 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] p-8 rounded-[3rem] border border-white/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <h3 className="text-xl font-black text-black tracking-tight">Weekly Sales Velocity</h3>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Profit</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#4b5563' }}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#4b5563' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                    contentStyle={{
                      borderRadius: '24px',
                      border: 'none',
                      backgroundColor: 'var(--color-neu-bg)',
                      boxShadow: 'var(--shadow-neu-floating)',
                      padding: '16px'
                    }}
                    itemStyle={{ fontSize: '12px', fontWeight: '900' }}
                  />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={28} />
                  <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Journal (Recessed Container) */}
          <div className="xl:col-span-4 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[3rem] overflow-hidden flex flex-col border border-black/5">
            <div className="p-8 pb-4 space-y-6">
              <div>
                <h3 className="text-xl font-black text-black">Order Journal</h3>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">
                  {searchedOrders.length} Verified Records
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 stroke-[3px]" />
                <input
                  type="text"
                  placeholder="Find Transaction ID..."
                  value={searchOrderQuery}
                  onChange={(e) => { setSearchOrderQuery(e.target.value); setOrderPage(1); }}
                  className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl pl-12 pr-4 py-4 text-sm font-black text-black placeholder:text-gray-400/50 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-4 space-y-4 custom-scrollbar">
              {displayedOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] p-5 rounded-2xl flex justify-between items-center group cursor-pointer active:scale-[0.98] active:shadow-[var(--shadow-neu-pressed)] transition-all"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={cn(
                      "w-3 h-3 rounded-full shrink-0",
                      order.type === 'repair' ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" : "bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.4)]"
                    )} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-black">#{order.id}</span>
                        {order.status === 'refunded' && (
                          <span className="bg-red-500/10 text-red-600 px-1.5 py-0.5 rounded-lg text-[8px] font-black tracking-widest uppercase">Refunded</span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 truncate block mt-1">
                        {order.items.map(item => item.name).join(', ')}
                      </span>
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-tighter mt-1 truncate">
                        {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.items.length} Items
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-2">
                          {order.paymentMethod || 'CASH'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-base font-black", order.status === 'refunded' ? "text-gray-400 line-through" : "text-black")}>
                      ${order.total.toFixed(2)}
                    </p>
                    <ArrowRight size={14} className="text-blue-600 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" strokeWidth={3} />
                  </div>
                </motion.div>
              ))}
              {searchedOrders.length === 0 && (
                <div className="text-center py-20">
                  <Receipt className="mx-auto text-gray-300 mb-4" size={48} strokeWidth={1} />
                  <p className="text-gray-500 text-xs font-black uppercase tracking-widest">No matched records</p>
                </div>
              )}
            </div>

            {totalPages > 0 && (
              <div className="p-6 bg-[var(--color-neu-bg)] border-t border-black/5 flex justify-between items-center">
                <button
                  onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                  disabled={orderPage === 1}
                  className="w-10 h-10 flex items-center justify-center bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-xl disabled:opacity-20 transition-all text-blue-600 active:shadow-[var(--shadow-neu-pressed)]"
                >
                  <ChevronLeft size={20} strokeWidth={3} />
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-black">
                  {orderPage} / {totalPages}
                </span>
                <button
                  onClick={() => setOrderPage(p => Math.min(totalPages, p + 1))}
                  disabled={orderPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-xl disabled:opacity-20 transition-all text-blue-600 active:shadow-[var(--shadow-neu-pressed)]"
                >
                  <ChevronRight size={20} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Global Service Distribution */}
        <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[3rem] p-10 border border-white/20">
          <h3 className="text-2xl font-black mb-10 text-black tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl shadow-[var(--shadow-neu-sm)] flex items-center justify-center text-blue-600">
              <PieChartIcon size={24} strokeWidth={3} />
            </div>
            Service Mix Breakdown
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              {serviceSplit.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-sm)] rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.color, boxShadow: `0 0 10px ${s.color}66` }}></div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-black">{s.name}</span>
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{s.value}% Concentration</span>
                    </div>
                  </div>
                  <span className="text-lg font-black text-black">${s.amount.toLocaleString()}</span>
                </div>
              ))}
              {serviceSplit.length === 0 && <p className="text-gray-600 text-sm italic font-bold">No active transactions to categorize.</p>}
            </div>

            <div className="flex flex-col items-center justify-center relative">
              <div className="w-72 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={serviceSplit}
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {serviceSplit.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global</span>
                  <span className="text-3xl font-black text-blue-600 tracking-tighter">MIX</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* Web Analytics — Website Clicks & Phone Model Volumes      */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[3rem] p-10 border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <h3 className="text-2xl font-black text-black tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl shadow-[var(--shadow-neu-sm)] flex items-center justify-center text-blue-600">
                <Globe size={24} strokeWidth={3} />
              </div>
              Website Analytics
            </h3>
            <div className="flex gap-2">
              {(['today', '7d', '30d'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setAnalyticsRange(range)}
                  className={cn(
                    "px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                    analyticsRange === range
                      ? "bg-blue-600 text-white shadow-[0_8px_16px_rgba(37,99,235,0.3)]"
                      : "bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-gray-600 active:shadow-[var(--shadow-neu-pressed)]"
                  )}
                >
                  {range === 'today' ? 'Today' : range === '7d' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
          </div>

          {analyticsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : analyticsEvents.length === 0 ? (
            <div className="text-center py-16">
              <Globe className="mx-auto text-gray-300 mb-4" size={48} strokeWidth={1.5} />
              <p className="text-gray-500 text-sm font-black uppercase tracking-widest">No analytics data for this period</p>
              <p className="text-gray-400 text-xs font-bold mt-2">Website events will appear here once tracked.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Analytics Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-3xl p-6 border border-black/5">
                  <div className="flex items-center gap-3 mb-3">
                    <Eye size={18} strokeWidth={3} className="text-blue-600" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Page Views</span>
                  </div>
                  <p className="text-3xl font-black text-black">{analyticsStats.totalPageViews.toLocaleString()}</p>
                </div>
                <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-3xl p-6 border border-black/5">
                  <div className="flex items-center gap-3 mb-3">
                    <MousePointerClick size={18} strokeWidth={3} className="text-purple-600" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Clicks</span>
                  </div>
                  <p className="text-3xl font-black text-black">{analyticsStats.totalClicks.toLocaleString()}</p>
                </div>
                <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-3xl p-6 border border-black/5">
                  <div className="flex items-center gap-3 mb-3">
                    <PhoneCall size={18} strokeWidth={3} className="text-green-600" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Conversions</span>
                  </div>
                  <p className="text-3xl font-black text-black">{analyticsStats.totalConversions.toLocaleString()}</p>
                </div>
                <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-3xl p-6 border border-black/5">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp size={18} strokeWidth={3} className="text-orange-600" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Unique Visitors</span>
                  </div>
                  <p className="text-3xl font-black text-black">{analyticsStats.uniqueSessions.toLocaleString()}</p>
                </div>
              </div>

              {/* Two-column: Model Clicks + Conversion Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Phone Model Click Volumes */}
                <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-3xl p-8 border border-black/5">
                  <div className="flex items-center gap-3 mb-6">
                    <Smartphone size={20} strokeWidth={3} className="text-blue-600" />
                    <h4 className="text-lg font-black text-black">Top Phone Model Clicks</h4>
                  </div>
                  {analyticsStats.modelClicks.length === 0 ? (
                    <p className="text-gray-400 text-sm font-bold italic py-8 text-center">No model click data yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {analyticsStats.modelClicks.map((item, i) => {
                        const maxClicks = analyticsStats.modelClicks[0]?.clicks || 1;
                        const pct = Math.round((item.clicks / maxClicks) * 100);
                        return (
                          <div key={item.model} className="flex items-center gap-4">
                            <span className="w-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">#{i + 1}</span>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm font-black text-black truncate">{item.model}</span>
                                <span className="text-sm font-black text-blue-600 ml-2 shrink-0">{item.clicks}</span>
                              </div>
                              <div className="h-2 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.6, delay: i * 0.05 }}
                                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Conversion Breakdown + Device Split */}
                <div className="space-y-8">
                  {/* Conversion Actions */}
                  <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-3xl p-8 border border-black/5">
                    <div className="flex items-center gap-3 mb-6">
                      <MousePointerClick size={20} strokeWidth={3} className="text-green-600" />
                      <h4 className="text-lg font-black text-black">Conversion Actions</h4>
                    </div>
                    {Object.keys(analyticsStats.conversionMap).length === 0 ? (
                      <p className="text-gray-400 text-sm font-bold italic py-4 text-center">No conversions recorded yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(analyticsStats.conversionMap)
                          .sort(([, a], [, b]) => b - a)
                          .map(([name, count]) => (
                            <div key={name} className="flex items-center justify-between p-4 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-sm)] rounded-2xl">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-sm font-black text-black capitalize">{name.replace(/_/g, ' ')}</span>
                              </div>
                              <span className="text-lg font-black text-green-600">{count}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Device Split */}
                  <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-3xl p-8 border border-black/5">
                    <div className="flex items-center gap-3 mb-6">
                      <Smartphone size={20} strokeWidth={3} className="text-purple-600" />
                      <h4 className="text-lg font-black text-black">Device Breakdown</h4>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(analyticsStats.deviceMap)
                        .sort(([, a], [, b]) => b - a)
                        .map(([device, count]) => {
                          const total = analyticsEvents.length || 1;
                          const pct = Math.round((count / total) * 100);
                          return (
                            <div key={device} className="flex items-center justify-between p-4 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-sm)] rounded-2xl">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-3 h-3 rounded-full",
                                  device === 'Mobile' ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" :
                                  device === 'Desktop' ? "bg-purple-500 shadow-[0_0_8px_rgba(147,51,234,0.5)]" :
                                  "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                                )} />
                                <span className="text-sm font-black text-black">{device}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{pct}%</span>
                                <span className="text-lg font-black text-black">{count}</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {/* Revenue Breakdown Modal */}
        {showRevenueModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRevenueModal(false)} className="absolute inset-0 bg-black/40" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-[var(--color-neu-bg)] rounded-[3rem] shadow-[var(--shadow-neu-floating)] overflow-hidden border border-white/20 flex flex-col max-h-[85vh]">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-3xl shadow-[var(--shadow-neu-flat)] flex items-center justify-center text-blue-600">
                    <List size={24} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-black">
                      {breakdownType === 'repair' ? 'Repair Unit Sales' : breakdownType === 'accessory' ? 'Product Velocity' : 'Revenue Breakdown'}
                    </h3>
                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest">Summary Audit Log</p>
                  </div>
                </div>
                <button onClick={() => setShowRevenueModal(false)} className="w-10 h-10 rounded-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] flex items-center justify-center text-gray-600 hover:text-red-500 active:shadow-[var(--shadow-neu-pressed)] transition-all">
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                <div className="grid grid-cols-12 text-[10px] font-black uppercase tracking-widest text-gray-600 px-4 mb-2">
                  <div className="col-span-7">Category Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-3 text-right">Revenue</div>
                </div>

                {revenueBreakdown.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-sm)] p-5 rounded-2xl items-center border border-white/10">
                    <div className="col-span-7 font-black text-sm text-black leading-tight">{item.name}</div>
                    <div className="col-span-2 text-center text-sm font-black text-gray-600">{item.qty}</div>
                    <div className="col-span-3 text-right font-black text-blue-600">${item.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-gray-50/50 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-black text-gray-600 uppercase tracking-widest">Net Sales (Excl. Fees)</span>
                  <span className="text-3xl font-black text-black">
                    ${(breakdownType === 'repair' ? stats.repairRevenue : breakdownType === 'accessory' ? stats.accessoryRevenue : stats.totalRevenue).toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Generic Breakdown Modal for Surcharge/Tax */}
        {(showSurchargeModal || showTaxModal) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowSurchargeModal(false); setShowTaxModal(false); }} className="absolute inset-0 bg-black/40" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-[var(--color-neu-bg)] rounded-[3rem] shadow-[var(--shadow-neu-floating)] overflow-hidden border border-white/20 flex flex-col max-h-[85vh]">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-3xl shadow-[var(--shadow-neu-flat)] flex items-center justify-center text-blue-600">
                    {showSurchargeModal ? <CreditCard size={24} strokeWidth={3} /> : <Receipt size={24} strokeWidth={3} />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-black">
                      {showSurchargeModal ? 'Surcharge Audit' : 'Tax Liability Log'}
                    </h3>
                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest">Financial Transparency</p>
                  </div>
                </div>
                <button onClick={() => { setShowSurchargeModal(false); setShowTaxModal(false); }} className="w-10 h-10 rounded-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] flex items-center justify-center text-gray-600 hover:text-red-500 active:shadow-[var(--shadow-neu-pressed)] transition-all">
                  <X size={20} strokeWidth={3} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                <div className="grid grid-cols-12 text-[10px] font-black uppercase tracking-widest text-gray-600 px-4 mb-2">
                  <div className="col-span-5">Order ID</div>
                  <div className="col-span-3 text-center">Net Amount</div>
                  <div className="col-span-4 text-right">{showSurchargeModal ? 'Fee (1.5%)' : 'GST (1/11th)'}</div>
                </div>
                {validOrders.filter(o => showSurchargeModal ? (o.surcharge || 0) > 0 : true).map((order, i) => (
                  <div key={i} className="grid grid-cols-12 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-sm)] p-5 rounded-2xl items-center border border-white/10">
                    <div className="col-span-5">
                      <p className="font-black text-sm text-black">#{order.id}</p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase">{new Date(order.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div className="col-span-3 text-center text-sm font-black text-gray-600">
                      ${(order.total - (showSurchargeModal ? order.surcharge : order.tax)).toFixed(2)}
                    </div>
                    <div className="col-span-4 text-right font-black text-black">
                      +${(showSurchargeModal ? order.surcharge : order.tax).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-black text-gray-600 uppercase tracking-widest">Total Liability</span>
                <span className="text-3xl font-black text-black">${(showSurchargeModal ? stats.surchargeTotal : stats.taxTotal).toFixed(2)}</span>
              </div>
            </motion.div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-black/40" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-[var(--color-neu-bg)] rounded-[3rem] shadow-[var(--shadow-neu-floating)] overflow-hidden border border-white/20">
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-black text-black tracking-tight">Audit Details</h3>
                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest mt-1">Transaction #{selectedOrder.id}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 rounded-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] flex items-center justify-center text-gray-600 hover:text-red-500 transition-all">
                    <X size={20} strokeWidth={3} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-3xl p-6 space-y-4">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-black truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{item.qty} x ${item.price.toFixed(2)}</p>
                        </div>
                        <span className="font-black text-sm text-black ml-4">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 px-4">
                    <div className="flex justify-between text-xs font-bold text-gray-600 uppercase tracking-widest">
                      <span>Base Total</span>
                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-600 uppercase tracking-widest">
                      <span>GST (10%)</span>
                      <span>${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    {selectedOrder.surcharge > 0 && (
                      <div className="flex justify-between text-xs font-black text-blue-600 uppercase tracking-widest">
                        <span>Card Fee</span>
                        <span>+${selectedOrder.surcharge.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-4 border-t border-gray-200">
                      <span className="text-lg font-black text-black">TOTAL PAID</span>
                      <span className="text-3xl font-black text-black">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-green-600/5 p-5 rounded-2xl border border-green-600/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <PiggyBank size={20} className="text-green-600" strokeWidth={3} />
                      <span className="text-xs font-black text-green-700 uppercase tracking-widest">Net Profit</span>
                    </div>
                    <span className="text-xl font-black text-green-700">+${selectedOrder.profit.toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="py-5 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-black font-black text-sm rounded-2xl active:shadow-[var(--shadow-neu-pressed)] transition-all flex justify-center items-center gap-2"
                  >
                    <Printer size={18} strokeWidth={3} />
                    Receipt
                  </button>
                  {selectedOrder.status !== 'refunded' && (
                    <button
                      onClick={handleRefund}
                      className="py-5 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-red-600 font-black text-sm rounded-2xl active:shadow-[var(--shadow-neu-pressed)] transition-all flex justify-center items-center gap-2"
                    >
                      Refund
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        order={selectedOrder}
        t={t}
      />
    </div>
  );
}

function StatCard({ label, value, trend, icon: Icon, color, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-[var(--color-neu-bg)] p-8 rounded-[2.5rem] flex flex-col justify-between shadow-[var(--shadow-neu-flat)] transition-all group border border-white/20",
        onClick ? "cursor-pointer active:scale-[0.98] active:shadow-[var(--shadow-neu-pressed)]" : "cursor-default"
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest ml-1">{label}</span>
        <div className={cn(
          "w-12 h-12 rounded-2xl shadow-[var(--shadow-neu-sm)] flex items-center justify-center transition-all group-hover:scale-110",
          color === 'primary' ? "text-blue-600" :
            color === 'secondary' ? "text-gray-600" :
              "text-green-600"
        )}>
          <Icon size={24} strokeWidth={3} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-black tracking-tight">{value}</p>
        {trend && (
          <div className="flex items-center gap-1.5 mt-2 ml-1">
            <span className="text-[11px] font-black text-gray-500 uppercase tracking-tighter">{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}
