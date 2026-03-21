import React, { useState, useMemo } from 'react';
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
  Printer
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
  PieChart,
  Pie
} from 'recharts';
import { cn } from '@/lib/utils';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { InvoiceModal } from '../components/InvoiceModal';

interface ReportsViewProps {
  orders: Order[];
  setOrders?: React.Dispatch<React.SetStateAction<Order[]>>;
  t: (section: string, key: string) => string;
}

export function ReportsView({ orders, setOrders, t }: ReportsViewProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  
  // Search and Pagination states
  const [searchOrderQuery, setSearchOrderQuery] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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
    const repairsCount = validOrders.filter(o => o.type === 'repair').length;
    const avgTicket = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

    return {
      totalRevenue,
      totalProfit,
      cashTotal,
      eftposTotal,
      repairsCount,
      avgTicket
    };
  }, [validOrders]);

  const revenueBreakdown = useMemo(() => {
    const itemsMap: Record<string, {name: string, qty: number, total: number}> = {};
    validOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemsMap[item.name]) {
          itemsMap[item.name] = { name: item.name, qty: 0, total: 0 };
        }
        itemsMap[item.name].qty += item.qty;
        itemsMap[item.name].total += (item.qty * item.price);
      });
    });
    return Object.values(itemsMap).sort((a,b) => b.total - a.total);
  }, [validOrders]);

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
    const colors = ['#004253', '#005b71', '#8dd0e9', '#007a94', '#4db6d1'];

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
    if (!searchOrderQuery.trim()) return orders;
    return orders.filter(o => 
      o.id.toLowerCase().includes(searchOrderQuery.toLowerCase())
    );
  }, [orders, searchOrderQuery]);

  const totalPages = Math.ceil(searchedOrders.length / ITEMS_PER_PAGE);
  const displayedOrders = searchedOrders.slice((orderPage - 1) * ITEMS_PER_PAGE, orderPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
        <div>
          <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-widest">Performance Analytics</span>
          <h2 className="text-4xl font-extrabold tracking-tight text-primary mt-1">Sales Reports</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/10">
            <span className="text-xs font-bold text-on-surface-variant">From:</span>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-sm font-bold text-on-surface outline-none"
            />
          </div>
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/10">
            <span className="text-xs font-bold text-on-surface-variant">To:</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-sm font-bold text-on-surface outline-none"
            />
          </div>
          <button 
            onClick={() => {
              const today = new Date();
              const lastWeek = new Date();
              lastWeek.setDate(today.getDate() - 7);
              setStartDate(lastWeek.toISOString().split('T')[0]);
              setEndDate(today.toISOString().split('T')[0]);
            }}
            className="bg-surface-container-low text-on-surface px-4 py-2.5 rounded-xl text-sm font-bold border border-outline-variant/10 transition-transform active:scale-95"
          >
            Last 7 Days
          </button>
          <button 
            onClick={() => { setStartDate(''); setEndDate(''); }}
            className="bg-surface-container-lowest text-on-surface px-4 py-2.5 rounded-xl text-sm font-bold border border-outline-variant/10 transition-transform active:scale-95"
          >
            Clear Target
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div onClick={() => setShowRevenueModal(true)} className="cursor-pointer">
          <StatCard 
            label="Total Revenue (Click for Breakdown)" 
            value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
            trend="" 
            trendLabel="" 
            icon={Wallet} 
            color="primary"
          />
        </div>
        <StatCard 
          label="Cash Revenue" 
          value={`$${stats.cashTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          trend="" 
          trendLabel="" 
          icon={Banknote} 
          color="primary"
        />
        <StatCard 
          label="EFTPOS Revenue" 
          value={`$${stats.eftposTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          trend="" 
          trendLabel="" 
          icon={CreditCard} 
          color="primary"
        />
        <StatCard 
          label="Repairs Done" 
          value={stats.repairsCount.toString()} 
          trend="" 
          trendLabel="" 
          icon={Wrench} 
          color="secondary"
        />
        <StatCard 
          label="Est. Profit" 
          value={`$${stats.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          trend={`${Math.round((stats.totalProfit / (stats.totalRevenue || 1)) * 100)}%`} 
          trendLabel="Margin" 
          icon={PiggyBank} 
          color="tertiary"
        />
        <StatCard 
          label="Avg Ticket" 
          value={`$${stats.avgTicket.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          trend="" 
          trendLabel="" 
          icon={Receipt} 
          color="primary"
        />
      </div>

      {/* Charts & Journal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-bold text-on-surface">Weekly Sales Trends</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-fixed-dim"></div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Profit</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#bfc8cc" opacity={0.3} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#40484c' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#40484c' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f1f4f5' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="#004253" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="profit" fill="#8dd0e9" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Journal / Orders List */}
        <div className="bg-surface-container-low rounded-3xl overflow-hidden flex flex-col border border-outline-variant/5">
          <div className="p-6 pb-2 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-on-surface">Filtered Orders</h3>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Showing {searchedOrders.length} transactions</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search Order ID..." 
                value={searchOrderQuery}
                onChange={(e) => { setSearchOrderQuery(e.target.value); setOrderPage(1); }}
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl pl-9 pr-4 py-3 text-sm font-bold placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {displayedOrders.map((order) => (
              <div 
                key={order.id} 
                className="relative pl-6 border-l-2 border-outline-variant/20 group cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className={cn(
                  "absolute -left-[9px] top-0 w-4 h-4 rounded-full ring-4 ring-surface-container-low transition-transform group-hover:scale-125",
                  order.type === 'repair' ? "bg-primary" : "bg-tertiary"
                )}></div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase mb-1 flex items-center gap-2">
                      {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • <span className="text-primary">{order.paymentMethod ? order.paymentMethod.toUpperCase() : 'CASH'}</span>
                      {order.status === 'refunded' && <span className="bg-error/10 text-error px-1.5 py-0.5 rounded text-[8px] tracking-widest">REFUNDED</span>}
                    </p>
                    <p className={cn("text-sm font-bold leading-tight", order.status === 'refunded' ? "text-on-surface-variant line-through" : "text-on-surface")}>
                      Order: #{order.id}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1 truncate max-w-[150px]">
                      {order.items.map(i => i.name).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-sm font-black", order.status === 'refunded' ? "text-on-surface-variant line-through" : "text-primary")}>
                      ${order.total.toFixed(2)}
                    </p>
                    <button className="text-[10px] font-bold text-primary flex items-center justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye size={10} /> Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {searchedOrders.length === 0 && (
              <div className="text-center py-10">
                <p className="text-on-surface-variant text-xs font-bold">{searchOrderQuery ? 'No matching orders found' : 'No orders yet today'}</p>
              </div>
            )}
          </div>
          
          {totalPages > 0 && (
            <div className="p-4 border-t border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest">
              <button 
                onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                disabled={orderPage === 1}
                className="text-xs font-bold text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-outline-variant/10 px-4 py-2 bg-primary/10 rounded-xl transition-all flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Page {orderPage} / {totalPages}
              </span>
              <button 
                onClick={() => setOrderPage(p => Math.min(totalPages, p + 1))}
                disabled={orderPage === totalPages}
                className="text-xs font-bold text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-outline-variant/10 px-4 py-2 bg-primary/10 rounded-xl transition-all flex items-center gap-1"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Service Breakdown */}
      <div className="bg-surface-container-low rounded-[2rem] p-8 md:p-12 mb-16 border border-outline-variant/10">
        <h3 className="text-2xl font-extrabold mb-10 text-on-surface tracking-tight">Revenue by Service Type</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
          <div className="space-y-8">
            {repairStats.map((s, i) => (
              <div key={i} className="flex justify-between items-end border-b border-outline-variant/20 pb-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-on-surface">{s.label}</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{s.units} Units</span>
                </div>
                <span className="text-xl font-black text-primary">${s.value.toLocaleString()}</span>
              </div>
            ))}
            {repairStats.length === 0 && <p className="text-on-surface-variant text-sm italic">No repair data available</p>}
          </div>

          <div className="lg:col-span-2 flex flex-col md:flex-row justify-center items-center gap-12 p-10 bg-white/40 backdrop-blur-md rounded-3xl border border-white/20">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceSplit}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {serviceSplit.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Service</span>
                <span className="text-sm font-black text-primary">Split</span>
              </div>
            </div>
            <div className="space-y-4">
              {serviceSplit.map((s, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-md" style={{ backgroundColor: s.color }}></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-on-surface">{s.name}</span>
                    <span className="text-[10px] font-bold text-on-surface-variant">{s.value}% of total</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown Modal */}
      <AnimatePresence>
        {showRevenueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRevenueModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-surface-container-lowest rounded-[2rem] shadow-2xl overflow-hidden border border-outline-variant/10 flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center text-primary">
                    <List size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-on-surface">Revenue Breakdown</h3>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                      {startDate} to {endDate}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRevenueModal(false)}
                  className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-surface-container-lowest custom-scrollbar space-y-4">
                <div className="grid grid-cols-12 text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-4 mb-2">
                  <div className="col-span-6">Product / Service Name</div>
                  <div className="col-span-3 text-center">Unit Qty</div>
                  <div className="col-span-3 text-right">Total Value</div>
                </div>
                
                {revenueBreakdown.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 bg-surface-container-low p-4 rounded-xl items-center border border-outline-variant/5 hover:border-primary/20 transition-colors">
                    <div className="col-span-6 font-bold text-sm text-on-surface leading-tight pr-2">{item.name}</div>
                    <div className="col-span-3 text-center text-sm font-bold text-on-surface-variant">{item.qty}</div>
                    <div className="col-span-3 text-right font-black text-primary">${item.total.toFixed(2)}</div>
                  </div>
                ))}

                {revenueBreakdown.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-on-surface-variant text-sm font-bold italic">No items sold in this period.</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-surface-container-low border-t border-outline-variant/10 flex justify-between items-center">
                <span className="text-sm font-medium text-on-surface-variant">Combined Revenue</span>
                <span className="text-2xl font-black text-primary">${stats.totalRevenue.toFixed(2)}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container-lowest rounded-[2rem] shadow-2xl overflow-hidden border border-outline-variant/10"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-on-surface">Order Details</h3>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">#{selectedOrder.id} • {new Date(selectedOrder.timestamp).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-surface-container-low rounded-2xl p-4 space-y-3">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-on-surface">{item.name}</p>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{item.qty} x ${item.price.toFixed(2)}</p>
                        </div>
                        <span className="font-bold text-sm">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                    <div className="space-y-2 px-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant font-medium">Subtotal (Excl. GST)</span>
                        <span className="font-bold">${selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant font-medium">GST (10%)</span>
                        <span className="font-bold">${selectedOrder.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-4 border-t border-outline-variant/20">
                        <span className="text-lg font-black">Total Paid</span>
                        <span className="text-2xl font-black text-primary">${selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>

                  <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <PiggyBank size={18} className="text-teal-600" />
                      <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">Estimated Profit</span>
                    </div>
                    <span className="text-lg font-black text-teal-700">+${selectedOrder.profit.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button 
                    onClick={() => setShowInvoiceModal(true)}
                    className="flex-1 py-4 bg-surface-container-highest text-on-surface rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex justify-center items-center gap-2"
                  >
                    <Printer size={18} />
                    {t('term', 'printReceipt')}
                  </button>
                  {selectedOrder.status !== 'refunded' && (
                    <button 
                      onClick={handleRefund}
                      className="flex-1 py-4 bg-error/10 text-error rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex justify-center items-center gap-2"
                    >
                      {t('term', 'refundBtn') || "Refund Order"}
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 py-4 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
                  >
                    Close Details
                  </button>
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

function StatCard({ label, value, trend, trendLabel, icon: Icon, color }: any) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl flex flex-col justify-between shadow-sm border border-outline-variant/10 hover:shadow-md transition-all group">
      <div className="flex justify-between items-start">
        <span className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest">{label}</span>
        <div className={cn(
          "p-2.5 rounded-xl transition-transform group-hover:scale-110",
          color === 'primary' ? "bg-primary-container/10 text-primary" : 
          color === 'secondary' ? "bg-secondary-container/30 text-secondary" : 
          "bg-tertiary-container/20 text-tertiary"
        )}>
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-6">
        <p className="text-3xl font-black text-on-surface tracking-tight">{value}</p>
        {trend && (
          <div className="flex items-center gap-1.5 mt-1.5">
            {trend.includes('+') ? (
              <ArrowUpRight size={14} className="text-teal-600" />
            ) : null}
            <span className={cn(
              "text-[11px] font-black",
              trend.includes('+') ? "text-teal-600" : "text-on-surface-variant"
            )}>{trend}</span>
            <span className="text-[10px] font-bold text-on-surface-variant ml-0.5">{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
