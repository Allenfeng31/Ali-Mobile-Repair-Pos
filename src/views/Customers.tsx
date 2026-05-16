import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  Edit3, 
  MessageSquare, 
  Laptop, 
  Smartphone, 
  ChevronRight,
  MoreVertical,
  Star,
  X,
  Check,
  Clock,
  Droplets,
  Mail,
  Phone,
  Trash2,
  QrCode,
  Copy,
  Package,
  Printer,
  DollarSign,
  Scan,
  Users,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Customer } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { RepairTicketModal } from '../components/RepairTicketModal';
import { api } from '../lib/api';
import { OCRImeiScanner } from '../components/OCRImeiScanner';
import { useScrollLock } from '../hooks/useScrollLock';
import { useAuthStore } from '../hooks/useAuthStore';

const getCustomerOverallStatus = (customer: Customer) => {
  if (customer.repairs.some(r => r.status === 'Urgent')) return 'Urgent';
  if (customer.repairs.some(r => r.status === 'In Processing' || r.status === 'waiting for pay')) return 'In Processing';
  if (customer.repairs.some(r => r.status === 'Ready for Pickup')) return 'Ready for Pickup';
  return 'Completed';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Urgent': return 'error';
    case 'In Processing':
    case 'waiting for pay': return 'tertiary';
    case 'Ready for Pickup': return 'success';
    case 'Completed': return 'surface';
    default: return 'surface';
  }
};

export function CustomersView() {
  const { permissions } = useAuthStore();
  const t = (_section: string, key: string) => key; // Simplified for now
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [hostIp, setHostIp] = useState('localhost');
  
  const [selectedId, setSelectedId] = useState<string>('');
  
  // Fetch customer data
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getCustomers();
        if (data && data.length > 0) {
          setCustomers(data);
          // Set initial selection to first customer if none selected
          if (!selectedId) setSelectedId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
    api.getIp().then(ipRes => {
      if (ipRes?.ip) setHostIp(ipRes.ip);
    }).catch(() => {});
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSyncedOnly, setFilterSyncedOnly] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingAllOrders, setIsViewingAllOrders] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<any>(null);
  const [isEditingRepair, setIsEditingRepair] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isConfirmingDeleteRepair, setIsConfirmingDeleteRepair] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [partNotifiedId, setPartNotifiedId] = useState<string | null>(null);
  const [sendingReviewId, setSendingReviewId] = useState<string | null>(null);
  const [scannerTarget, setScannerTarget] = useState<'add' | 'repair' | null>(null);
  const [upsells, setUpsells] = useState<any[]>([]);
  const [selectedUpsells, setSelectedUpsells] = useState<string[]>([]);

  useEffect(() => {
    api.getUpsells().then(setUpsells).catch(console.error);
  }, []);

  useScrollLock(
    isAdding || 
    isEditing || 
    isViewingAllOrders || 
    !!selectedRepair || 
    isConfirmingDelete || 
    isConfirmingDeleteRepair || 
    showQR || 
    isTicketModalOpen || 
    !!scannerTarget
  );

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    repairItem: '',
    modelNumber: '',
    price: '',
    liquidDamage: false,
    password: '',
    imei: '',
    remark: '',
    deposit: ''
  });

  const [repairFormData, setRepairFormData] = useState({
    repairItem: '',
    modelNumber: '',
    price: '',
    liquidDamage: false,
    password: '',
    imei: '',
    remark: '',
    deposit: '',
    status: 'In Processing'
  });

  const getLatestTimestamp = (customer: Customer) => {
    if (customer.repairs.length === 0) return 0;
    return Math.max(...customer.repairs.map(r => new Date(r.timestamp).getTime()));
  };

  const sortedCustomers = [...customers].map(c => ({
    ...c,
    repairs: [...c.repairs].sort((a, b) => {
      const priority: Record<string, number> = { 'Urgent': 1, 'In Processing': 1, 'waiting for pay': 1, 'Ready for Pickup': 1, 'Completed': 2 };
      if (priority[a.status] !== priority[b.status]) {
        return priority[a.status] - priority[b.status];
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    })
  })).sort((a, b) => {
    const statusA = getCustomerOverallStatus(a);
    const statusB = getCustomerOverallStatus(b);
    const priority: Record<string, number> = { 'Urgent': 1, 'In Processing': 1, 'waiting for pay': 1, 'Ready for Pickup': 1, 'Completed': 2 };
    
    if (priority[statusA] !== priority[statusB]) {
      return priority[statusA] - priority[statusB];
    }
    return getLatestTimestamp(b) - getLatestTimestamp(a);
  });

  const filteredCustomers = sortedCustomers.filter(c => {
    const query = searchQuery.toLowerCase();
    const hasRepairMatch = c.repairs.some(r => 
      (r.repairItem || '').toLowerCase().includes(query) || 
      (r.modelNumber || '').toLowerCase().includes(query)
    );
    const matchesSearch = (
      (c.name || '').toLowerCase().includes(query) ||
      (c.phone || '').toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query) ||
      (c.id || '').toLowerCase().includes(query) ||
      hasRepairMatch
    );
    
    if (filterSyncedOnly && !c.synced_to_google) return false;
    return matchesSearch;
  });

  const inProcessingCustomers = filteredCustomers.filter(c => getCustomerOverallStatus(c) !== 'Completed');
  const completedCustomers = filteredCustomers.filter(c => getCustomerOverallStatus(c) === 'Completed');

  const selectedCustomer = sortedCustomers.find(c => c.id === selectedId) || null;

  const handleCopyPhone = () => {
    if (!selectedCustomer) return;
    navigator.clipboard.writeText(selectedCustomer.phone).then(() => {
      setPhoneCopied(true);
      setTimeout(() => { setPhoneCopied(false); setShowPhonePopup(false); }, 1500);
    });
  };

  const handleSendReview = async (customer?: Customer) => {
    const target = customer || selectedCustomer;
    if (!target) return;
    
    setSendingReviewId(target.id);
    try {
      const response = await api.sendSms(target.phone, 'review', { 
        customerName: target.name,
        customerId: target.id
      });
      
      if (response && response.lastReviewSent) {
        setCustomers(prev => prev.map(c => 
          c.id === target.id ? { ...c, lastReviewSent: response.lastReviewSent } : c
        ));
      }

      setReviewSent(true);
      setTimeout(() => { 
        setReviewSent(false); 
        setShowPhonePopup(false); 
        setSendingReviewId(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to send review SMS:', err);
      setSendingReviewId(null);
    }
  };

  const handleNotifyPart = async (repair: any, customer: Customer) => {
    if (!repair || !customer) return;
    setPartNotifiedId(repair.id);
    try {
      await api.sendSms(customer.phone, 'partArrived', { 
        customerName: customer.name,
        deviceModel: repair.modelNumber 
      });
      setTimeout(() => setPartNotifiedId(null), 3000);
    } catch (err) {
      console.error('Failed to send part arrival SMS:', err);
      setPartNotifiedId(null);
    }
  };
  
  const getPortalUrl = () => {
    const origin = window.location.origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return origin.replace(/localhost|127\.0\.0\.1/, hostIp) + '/portal';
    }
    return origin + '/portal';
  };

  const toggleUpsell = (upsell: any) => {
    const isSelected = selectedUpsells.includes(upsell.id);
    const currentPrice = parseFloat(formData.price) || 0;
    const bundlePrice = parseFloat(upsell.bundle_price) || 0;

    if (isSelected) {
      setSelectedUpsells(selectedUpsells.filter(id => id !== upsell.id));
      setFormData({ ...formData, price: (currentPrice - bundlePrice).toFixed(2) });
    } else {
      setSelectedUpsells([...selectedUpsells, upsell.id]);
      setFormData({ ...formData, price: (currentPrice + bundlePrice).toFixed(2) });
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const existingCustomerIndex = customers.findIndex(c => c.phone === formData.phone);
    
    try {
      if (existingCustomerIndex !== -1) {
        const existingCustomer = customers[existingCustomerIndex];
        const newRepairForApi = {
          id: 'R-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
          customer_id: existingCustomer.id,
          timestamp: new Date().toISOString(),
          repairItem: formData.repairItem,
          modelNumber: formData.modelNumber,
          price: parseFloat(formData.price) || 0,
          liquidDamage: formData.liquidDamage,
          password: formData.password,
          imei: formData.imei,
          remark: formData.remark,
          deposit: parseFloat(formData.deposit) || 0,
          status: 'In Processing'
        };

        const createdRepair = await api.createRepair(newRepairForApi);
        const updatedRepairs = [createdRepair, ...existingCustomer.repairs];
        const newTotalSpent = updatedRepairs.reduce((sum, r) => sum + r.price, 0);
        const newStatus = getCustomerOverallStatus({...existingCustomer, repairs: updatedRepairs});
        
        await api.updateCustomer(existingCustomer.id, {
          totalSpent: newTotalSpent,
          status: newStatus,
          statusColor: getStatusColor(newStatus),
          lastVisit: 'Today'
        });

        const updatedCustomer = {
          ...existingCustomer,
          repairs: updatedRepairs,
          totalSpent: newTotalSpent,
          status: newStatus,
          statusColor: getStatusColor(newStatus),
          lastVisit: 'Today'
        };

        const updatedCustomers = [...customers];
        updatedCustomers[existingCustomerIndex] = updatedCustomer;
        setCustomers(updatedCustomers);
        setSelectedId(existingCustomer.id);
      } else {
        const initials = formData.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const price = parseFloat(formData.price) || 0;
        
        const customerForApi = {
          id: Math.random().toString(36).substr(2, 9).toUpperCase(),
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          initials,
          status: 'In Processing',
          statusColor: 'tertiary',
          lastVisit: 'Today',
          totalSpent: price
        };

        const createdCustomer = await api.createCustomer(customerForApi);
        const newRepairForApi = {
          id: 'R-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
          customer_id: createdCustomer.id,
          timestamp: new Date().toISOString(),
          repairItem: formData.repairItem,
          modelNumber: formData.modelNumber,
          price: price,
          liquidDamage: formData.liquidDamage,
          password: formData.password,
          imei: formData.imei,
          remark: (() => {
            let finalRemark = formData.remark;
            if (selectedUpsells.length > 0) {
              const accessoryNames = upsells
                .filter(u => selectedUpsells.includes(u.id))
                .map(u => u.name)
                .join(', ');
              finalRemark = finalRemark ? `${finalRemark} | Requested Accessories: ${accessoryNames}` : `Requested Accessories: ${accessoryNames}`;
            }
            return finalRemark;
          })(),
          deposit: parseFloat(formData.deposit) || 0,
          status: 'In Processing'
        };

        const createdRepair = await api.createRepair(newRepairForApi);
        createdCustomer.repairs = [createdRepair];
        setCustomers([createdCustomer, ...customers]);
        setSelectedId(createdCustomer.id);
      }
      setIsAdding(false);
      resetForm();
    } catch (err) {
      console.error('Failed to add customer/repair:', err);
      alert('Failed to save to database. Check console for details.');
    }
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const initials = formData.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const updateData = { name: formData.name, phone: formData.phone, email: formData.email, initials };
    
    try {
      await api.updateCustomer(selectedId, updateData);
      setCustomers(customers.map(c => c.id === selectedId ? { ...c, ...updateData } : c));
      setIsEditing(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Failed to update customer');
    }
  };

  const handleDeleteCustomer = async () => {
    if (permissions?.can_delete_customers === false) {
      alert('You do not have permission to delete customers.');
      return;
    }
    try {
      await api.deleteCustomer(selectedId);
      const updatedCustomers = customers.filter(c => c.id !== selectedId);
      setCustomers(updatedCustomers);
      setIsConfirmingDelete(false);
      setIsEditing(false);
      if (updatedCustomers.length > 0) {
        setSelectedId(updatedCustomers[0].id);
      } else {
        setSelectedId('');
      }
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Failed to delete customer');
    }
  };

  const resetForm = () => {
    setSelectedUpsells([]);
    setFormData({
      name: '', phone: '', email: '', repairItem: '', modelNumber: '',
      price: '', liquidDamage: false, password: '', imei: '', remark: '', deposit: ''
    });
  };

  const openEditModal = () => {
    if (!selectedCustomer) return;
    setFormData({
      name: selectedCustomer.name, phone: selectedCustomer.phone, email: selectedCustomer.email,
      repairItem: '', modelNumber: '', price: '', liquidDamage: false,
      password: '', imei: '', remark: '', deposit: ''
    });
    setIsEditing(true);
  };

  const openEditRepairModal = (repair: any) => {
    setRepairFormData({
      repairItem: repair.repairItem, modelNumber: repair.modelNumber, price: repair.price.toString(),
      liquidDamage: repair.liquidDamage, password: repair.password || '', imei: repair.imei || '',
      remark: repair.remark || '', deposit: (repair.deposit || 0).toString(), status: repair.status
    });
    setIsEditingRepair(true);
  };

  const toggleRepairStatus = async (customerId: string, repairId: string, currentStatus: string) => {
    if (currentStatus !== 'In Processing' && currentStatus !== 'waiting for pay') return;
    try {
      const nextStatus = 'Completed';
      await api.updateRepair(repairId, { status: nextStatus });
      
      let smsCustomer: Customer | undefined;
      let smsRepairItem = 'your device';

      const updatedCustomers = customers.map(c => {
        if (c.id === customerId) {
          smsCustomer = c;
          const updatedRepairs = c.repairs.map(r => {
            if (r.id === repairId) {
              smsRepairItem = r.modelNumber || r.repairItem;
              return { ...r, status: nextStatus as any };
            }
            return r;
          });
          const newStatus = getCustomerOverallStatus({...c, repairs: updatedRepairs});
          api.updateCustomer(customerId, {
            status: newStatus, statusColor: getStatusColor(newStatus)
          }).catch(console.error);
          return { ...c, repairs: updatedRepairs, status: newStatus, statusColor: getStatusColor(newStatus) };
        }
        return c;
      });

      if (smsCustomer?.phone) {
        api.sendSms(smsCustomer.phone, 'completed', {
          customerName: smsCustomer.name, deviceModel: smsRepairItem
        }).catch(() => {});
      }
      setCustomers(updatedCustomers);
    } catch (err) {
      console.error(err);
      alert('Failed to update repair status');
    }
  };

  const handleUpdateRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepair) return;

    const updateData = {
      repairItem: repairFormData.repairItem, modelNumber: repairFormData.modelNumber,
      price: parseFloat(repairFormData.price) || 0, liquidDamage: repairFormData.liquidDamage,
      password: repairFormData.password, imei: repairFormData.imei, remark: repairFormData.remark,
      deposit: parseFloat(repairFormData.deposit) || 0, status: repairFormData.status
    };

    try {
      await api.updateRepair(selectedRepair.id, updateData);
      const updatedCustomers = customers.map(c => {
        if (c.id === selectedId) {
          const updatedRepairs = c.repairs.map(r => r.id === selectedRepair.id ? { ...r, ...updateData } : r);
          const newTotalSpent = updatedRepairs.reduce((sum, r) => sum + r.price, 0);
          const newStatus = getCustomerOverallStatus({...c, repairs: updatedRepairs});
          api.updateCustomer(selectedId, {
            totalSpent: newTotalSpent, status: newStatus, statusColor: getStatusColor(newStatus)
          }).catch(console.error);
          return { ...c, repairs: updatedRepairs, totalSpent: newTotalSpent, status: newStatus, statusColor: getStatusColor(newStatus) };
        }
        return c;
      });
      setCustomers(updatedCustomers);
      setIsEditingRepair(false);
      setSelectedRepair(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update repair');
    }
  };

  const handleDeleteRepair = async () => {
    if (!selectedRepair) return;
    if (permissions?.can_delete_customers === false) {
      alert('You do not have permission to delete repair records.');
      return;
    }
    try {
      await api.deleteRepair(selectedRepair.id);
      const updatedCustomers = customers.map(c => {
        if (c.id === selectedId) {
          const updatedRepairs = c.repairs.filter(r => r.id !== selectedRepair.id);
          const newTotalSpent = updatedRepairs.reduce((sum, r) => sum + r.price, 0);
          const newStatus = getCustomerOverallStatus({...c, repairs: updatedRepairs});
          api.updateCustomer(selectedId, {
            totalSpent: newTotalSpent, status: newStatus, statusColor: getStatusColor(newStatus)
          }).catch(console.error);
          return { ...c, repairs: updatedRepairs, totalSpent: newTotalSpent, status: newStatus, statusColor: getStatusColor(newStatus) };
        }
        return c;
      });
      setCustomers(updatedCustomers);
      setIsConfirmingDeleteRepair(false);
      setIsEditingRepair(false);
      setSelectedRepair(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete repair');
    }
  };

  const renderCustomerCard = (customer: Customer) => {
    const isActive = selectedId === customer.id;
    const overallStatus = getCustomerOverallStatus(customer);

    return (
      <div 
        key={customer.id}
        onClick={() => setSelectedId(customer.id)}
        className={cn(
          "p-6 rounded-[2.5rem] transition-all cursor-pointer group border border-white/20",
          isActive 
            ? "bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] scale-[0.98]" 
            : "bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] hover:shadow-[var(--shadow-neu-pressed)] active:scale-[0.98]"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all shadow-[var(--shadow-neu-sm)]",
              isActive ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]" : "bg-[var(--color-neu-bg)] text-blue-600"
            )}>
              {customer.initials}
            </div>
            <div>
              <h3 className="font-black text-black text-lg tracking-tight leading-none mb-2">{customer.name}</h3>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{customer.phone}</span>
                {customer.repairs.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                      {customer.repairs[0].modelNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <span className={cn(
                "text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-[var(--shadow-neu-sm)] border border-white/20",
                overallStatus === 'Urgent' ? "bg-red-50 text-red-600" :
                overallStatus === 'In Processing' ? "bg-purple-50 text-purple-600" :
                overallStatus === 'Ready for Pickup' ? "bg-green-50 text-green-600" :
                "bg-gray-50 text-gray-600"
              )}>
                {overallStatus}
              </span>
              <p className="text-[10px] font-black text-black mt-2.5">Total: ${customer.totalSpent.toFixed(2)}</p>
            </div>
            <ArrowRight size={20} className={cn("transition-all", isActive ? "text-blue-600 translate-x-1" : "text-gray-300")} strokeWidth={3} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* Left Column: List */}
      <section className="lg:col-span-7 space-y-10 order-2 lg:order-1">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <span className="text-gray-600 font-black text-[10px] uppercase tracking-widest ml-1">Client Relations</span>
            <h2 className="text-5xl font-black tracking-tight text-black mt-1 [text-shadow:-4px_4px_6px_var(--color-neu-shadow-dark)]">
              Customers
            </h2>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-blue-600 px-8 py-4 rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 active:scale-[0.98] active:shadow-[var(--shadow-neu-pressed)] transition-all border border-white/20"
          >
            <UserPlus size={20} strokeWidth={3} />
            Add New Client
          </button>
        </div>

        {/* Search & Filter (Recessed Bar) */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} strokeWidth={3} />
            <input 
              className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[2rem] py-5 pl-14 pr-6 outline-none text-black font-black text-sm placeholder:text-gray-400/50 transition-all border border-black/5" 
              placeholder="Search by name, phone, email or device..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setFilterSyncedOnly(!filterSyncedOnly)}
            className={cn(
              "px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-white/20",
              filterSyncedOnly 
                ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]" 
                : "bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-gray-600 active:shadow-[var(--shadow-neu-pressed)]"
            )}
          >
            {filterSyncedOnly ? <Check size={16} strokeWidth={4} /> : <Users size={16} strokeWidth={3} />}
            Google Sync Only
          </button>
        </div>

        {/* List Containers */}
        <div className="space-y-12">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[2.5rem] animate-pulse" />
              ))}
            </div>
          ) : filteredCustomers.length > 0 ? (
            <>
              {inProcessingCustomers.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 px-4">
                    <h3 className="text-xs font-black text-black uppercase tracking-widest">Active Tickets</h3>
                    <div className="h-px flex-1 bg-black/5" />
                    <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase">
                      {inProcessingCustomers.length} Orders
                    </span>
                  </div>
                  <div className="space-y-6">
                    {inProcessingCustomers.map(customer => renderCustomerCard(customer))}
                  </div>
                </div>
              )}

              {completedCustomers.length > 0 && (
                <div className="space-y-6 pt-4">
                  <div className="flex items-center gap-4 px-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">History Archive</h3>
                    <div className="h-px flex-1 bg-black/5" />
                    <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase">
                      {completedCustomers.length} Records
                    </span>
                  </div>
                  <div className="space-y-6">
                    {completedCustomers.map(customer => renderCustomerCard(customer))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-32 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[3rem] border border-black/5">
              <Users className="mx-auto text-gray-200 mb-6" size={80} strokeWidth={1} />
              <p className="text-gray-500 font-black text-xs uppercase tracking-widest">No matched client records</p>
            </div>
          )}
        </div>
      </section>

      {/* Right Column: Detail (Sticky Panel Architecture) */}
      <aside className="lg:col-span-5 order-1 lg:order-2 sticky top-6 h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar p-1">
        <AnimatePresence mode="wait">
          {!selectedCustomer ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[3rem] p-12 text-center border border-black/5 flex flex-col items-center justify-center min-h-[400px]"
            >
              <div className="w-24 h-24 rounded-[2rem] shadow-[var(--shadow-neu-flat)] flex items-center justify-center text-gray-300 mb-8">
                <Users size={40} />
              </div>
              <h3 className="text-xl font-black text-black">Select a Customer</h3>
              <p className="text-xs font-bold text-gray-500 mt-2">Pick a client from the list to view profile and repair logs.</p>
            </motion.div>
          ) : (
          <motion.div 
            key={selectedCustomer.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[3rem] overflow-hidden border border-white/20"
          >
            {/* Header Visual */}
            <div className="h-40 bg-blue-600 relative p-8 flex items-end">
              <div className="absolute top-6 right-6 flex gap-3">
                <button 
                  onClick={openEditModal}
                  className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all border border-white/10"
                >
                  <Edit3 size={20} strokeWidth={3} />
                </button>
              </div>
              <div className="absolute -bottom-10 left-8 w-24 h-24 rounded-[2rem] bg-white shadow-[var(--shadow-neu-floating)] flex items-center justify-center font-black text-4xl text-blue-600 border-[6px] border-[var(--color-neu-bg)]">
                {selectedCustomer.initials}
              </div>
            </div>

            <div className="px-10 pb-12 pt-16 space-y-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black text-black tracking-tight">{selectedCustomer.name}</h2>
                    <Star size={20} className="text-blue-600 fill-blue-600" />
                  </div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1.5">ID: #{selectedCustomer.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] p-5 rounded-3xl border border-black/5">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Primary Email</p>
                  <p className="text-xs font-black text-black truncate">{selectedCustomer.email || 'No email set'}</p>
                </div>
                <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] p-5 rounded-3xl border border-black/5">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Lifetime Value</p>
                  <p className="text-lg font-black text-blue-600 leading-none">${selectedCustomer.totalSpent.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-3xl border border-white/20 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-[var(--shadow-neu-sm)]">
                    <Phone size={20} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Mobile Number</p>
                    <p className="text-base font-black text-black">{selectedCustomer.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPhonePopup(true)}
                  className="w-10 h-10 rounded-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] flex items-center justify-center text-blue-600 active:shadow-[var(--shadow-neu-pressed)] transition-all"
                >
                  <ArrowRight size={20} strokeWidth={3} />
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6 px-2">
                  <h3 className="text-xs font-black text-black uppercase tracking-widest">Repair Journey</h3>
                  <button 
                    onClick={() => setIsViewingAllOrders(true)}
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                  >
                    View History
                  </button>
                </div>
                <div className="space-y-4">
                  {selectedCustomer.repairs.slice(0, 3).map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedRepair(item)}
                      className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] p-5 rounded-3xl flex gap-5 items-center border border-white/20 hover:shadow-[var(--shadow-neu-pressed)] transition-all cursor-pointer group active:scale-[0.98]"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-sm)] flex items-center justify-center text-gray-600 group-hover:text-blue-600 transition-colors shrink-0">
                        <Smartphone size={24} strokeWidth={3} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-sm text-black truncate leading-tight mb-1">{item.repairItem}</h4>
                          <span className="text-[10px] font-black text-gray-500 shrink-0">
                            {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Model: {item.modelNumber}</p>
                            {(item.deposit || 0) > 0 && (
                              <p className="text-[9px] font-black text-green-600 mt-1">💰 Deposit: ${item.deposit.toFixed(2)}</p>
                            )}
                          </div>
                          <p className="text-base font-black text-black leading-none">${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {selectedCustomer.repairs.length === 0 && (
                    <div className="text-center py-10 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-3xl border border-black/5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Repairs Logged</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-black/5 flex gap-4">
                <button 
                  onClick={() => setIsViewingAllOrders(true)}
                  className="flex-1 py-5 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-black rounded-2xl font-black text-xs uppercase tracking-widest active:shadow-[var(--shadow-neu-pressed)] transition-all border border-white/20"
                >
                  Full Activity Audit
                </button>
                <button className="w-20 py-5 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-blue-600 rounded-2xl flex items-center justify-center active:shadow-[var(--shadow-neu-pressed)] transition-all border border-white/20">
                  <MessageSquare size={24} strokeWidth={3} />
                </button>
              </div>
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* Phone Action Popup */}
      <AnimatePresence>
        {showPhonePopup && selectedCustomer && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPhonePopup(false)} className="absolute inset-0 bg-black/40" />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative z-10 w-full max-w-sm bg-[var(--color-neu-bg)] rounded-[3rem] shadow-[var(--shadow-neu-floating)] overflow-hidden border border-white/20"
            >
              <div className="bg-blue-600 p-8 text-white">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Direct Contact</p>
                <p className="text-3xl font-black tracking-tight">{selectedCustomer.name}</p>
                <p className="text-sm font-black opacity-80 mt-1">{selectedCustomer.phone}</p>
              </div>

              <div className="p-6 space-y-4">
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="flex items-center gap-5 p-5 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[2rem] hover:shadow-[var(--shadow-neu-pressed)] transition-all group active:scale-95 border border-white/20"
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-[var(--shadow-neu-sm)]">
                    <Phone size={22} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="font-black text-sm text-black">Voice Call</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Open System Dialler</p>
                  </div>
                </a>

                <button
                  onClick={handleCopyPhone}
                  className="flex items-center gap-5 p-5 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[2rem] hover:shadow-[var(--shadow-neu-pressed)] transition-all group active:scale-95 border border-white/20 w-full text-left"
                >
                  <div className="w-12 h-12 bg-gray-50 text-gray-600 rounded-2xl flex items-center justify-center shadow-[var(--shadow-neu-sm)]">
                    {phoneCopied ? <Check size={22} strokeWidth={4} className="text-green-600" /> : <Copy size={22} strokeWidth={3} />}
                  </div>
                  <div>
                    <p className="font-black text-sm text-black">{phoneCopied ? 'Copied' : 'Copy Number'}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Save to Clipboard</p>
                  </div>
                </button>

                <button
                  onClick={() => handleSendReview()}
                  className="flex items-center gap-5 p-5 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[2rem] hover:shadow-[var(--shadow-neu-pressed)] transition-all group active:scale-95 border border-white/20 w-full text-left"
                >
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-[var(--shadow-neu-sm)]">
                    {reviewSent ? <Check size={22} strokeWidth={4} className="text-green-600" /> : <Star size={22} strokeWidth={3} className="fill-amber-500" />}
                  </div>
                  <div>
                    <p className="font-black text-sm text-black">{reviewSent ? 'Link Sent' : 'Request Review'}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Send Google SMS</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowPhonePopup(false)}
                className="w-full p-6 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-black transition-colors border-t border-black/5"
              >
                Dismiss
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Customer Modal */}
      <AnimatePresence>
        {(isAdding || isEditing) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsAdding(false); setIsEditing(false); resetForm(); }} className="absolute inset-0 bg-black/40" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--color-neu-bg)] rounded-[3rem] shadow-[var(--shadow-neu-floating)] overflow-hidden border border-white/20"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-3xl font-black text-black tracking-tight">
                      {isEditing ? 'Profile Audit' : 'New Intake'}
                    </h3>
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mt-1">
                      {isEditing ? 'Update existing client core data' : 'Register a new repair ticket'}
                    </p>
                  </div>
                  <button 
                    onClick={() => { setIsAdding(false); setIsEditing(false); resetForm(); }}
                    className="w-12 h-12 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-2xl flex items-center justify-center text-gray-600 hover:text-red-500 active:shadow-[var(--shadow-neu-pressed)] transition-all"
                  >
                    <X size={24} strokeWidth={3} />
                  </button>
                </div>

                <form onSubmit={isEditing ? handleEditCustomer : handleAddCustomer} className="space-y-8 max-h-[70vh] overflow-y-auto px-2 custom-scrollbar">
                  <div className="space-y-6">
                    {!isEditing && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Session Timestamp</label>
                        <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] p-5 rounded-[1.5rem] flex items-center gap-4 text-black border border-black/5">
                          <Clock size={20} strokeWidth={3} className="text-blue-600" />
                          <span className="text-sm font-black">{new Date().toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Legal Name</label>
                      <input 
                        type="text"
                        placeholder="John Doe"
                        required
                        className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[1.5rem] p-5 outline-none text-black font-black text-sm placeholder:text-gray-400/50 border border-black/5"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Phone</label>
                        <input 
                          type="tel"
                          placeholder="+61 400 000 000"
                          required
                          className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[1.5rem] p-5 outline-none text-black font-black text-sm placeholder:text-gray-400/50 border border-black/5"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Email</label>
                        <input 
                          type="email"
                          placeholder="client@mail.com"
                          className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[1.5rem] p-5 outline-none text-black font-black text-sm placeholder:text-gray-400/50 border border-black/5"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>

                    {!isEditing && (
                      <>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Repair Target</label>
                            <input 
                              type="text"
                              placeholder="e.g. Screen Fix"
                              required
                              className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[1.5rem] p-5 outline-none text-black font-black text-sm placeholder:text-gray-400/50 border border-black/5"
                              value={formData.repairItem}
                              onChange={(e) => setFormData({...formData, repairItem: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Model Code</label>
                            <input 
                              type="text"
                              placeholder="e.g. iPhone 15 Pro"
                              required
                              className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[1.5rem] p-5 outline-none text-black font-black text-sm placeholder:text-gray-400/50 border border-black/5"
                              value={formData.modelNumber}
                              onChange={(e) => setFormData({...formData, modelNumber: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Price ($)</label>
                            <input 
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              required
                              className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[1.5rem] p-5 outline-none text-black font-black text-sm placeholder:text-gray-400/50 border border-black/5"
                              value={formData.price}
                              onChange={(e) => setFormData({...formData, price: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Device Passcode</label>
                            <input 
                              type="text"
                              placeholder="None"
                              className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[1.5rem] p-5 outline-none text-black font-black text-sm placeholder:text-gray-400/50 border border-black/5"
                              value={formData.password}
                              onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">IMEI / Serial</label>
                          <div className="flex gap-4">
                            <input 
                              type="text"
                              placeholder="Scan or Type..."
                              className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[1.5rem] p-5 outline-none text-black font-black text-sm placeholder:text-gray-400/50 border border-black/5"
                              value={formData.imei}
                              onChange={(e) => setFormData({...formData, imei: e.target.value})}
                            />
                            <button
                              type="button"
                              onClick={() => setScannerTarget('add')}
                              className="w-16 h-16 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-blue-600 rounded-[1.5rem] flex items-center justify-center shrink-0 active:shadow-[var(--shadow-neu-pressed)] transition-all border border-white/20"
                            >
                              <Scan size={24} strokeWidth={3} />
                            </button>
                          </div>
                        </div>

                        {upsells.length > 0 && (
                          <div className="space-y-4 pt-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Bundled Accessories</label>
                            <div className="grid grid-cols-2 gap-4">
                              {upsells.map(upsell => (
                                <button
                                  key={upsell.id}
                                  type="button"
                                  onClick={() => toggleUpsell(upsell)}
                                  className={cn(
                                    "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                                    selectedUpsells.includes(upsell.id)
                                      ? "bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] border-blue-600/30"
                                      : "bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] border-white/20"
                                  )}
                                >
                                  <div className={cn(
                                    "w-6 h-6 rounded-lg shadow-[var(--shadow-neu-sm)] flex items-center justify-center shrink-0",
                                    selectedUpsells.includes(upsell.id) ? "bg-blue-600 text-white" : "bg-[var(--color-neu-bg)]"
                                  )}>
                                    {selectedUpsells.includes(upsell.id) && <Check size={14} strokeWidth={4} />}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[9px] font-black text-black truncate uppercase leading-none mb-1">{upsell.name}</p>
                                    <p className="text-[11px] font-black text-blue-600 tracking-tighter">+${upsell.bundle_price}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <DollarSign size={14} className="text-green-600" strokeWidth={3} />
                            Deposit / Pre-payment
                          </label>
                          <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-green-600 font-black text-base">$</span>
                            <input 
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[1.5rem] p-5 pl-10 outline-none text-black font-black text-sm placeholder:text-gray-400/50 border border-green-200/30"
                              value={formData.deposit}
                              onChange={(e) => setFormData({...formData, deposit: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Internal Remarks</label>
                          <textarea 
                            placeholder="Special tech notes..."
                            className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[1.5rem] p-5 outline-none text-black font-black text-sm placeholder:text-gray-400/50 border border-black/5 min-h-[120px] resize-none"
                            value={formData.remark}
                            onChange={(e) => setFormData({...formData, remark: e.target.value})}
                          />
                        </div>

                        <div className="flex items-center justify-between p-6 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[2rem] border border-white/20">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl shadow-[var(--shadow-neu-sm)] flex items-center justify-center transition-colors",
                              formData.liquidDamage ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-400"
                            )}>
                              <Droplets size={24} strokeWidth={3} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-black">Liquid Damage</p>
                              <p className="text-[10px] font-bold text-gray-500 uppercase">Critical assessment</p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, liquidDamage: !formData.liquidDamage})}
                            className={cn(
                              "w-14 h-7 rounded-full relative transition-all duration-300 shadow-[var(--shadow-neu-sm)]",
                              formData.liquidDamage ? "bg-red-600" : "bg-gray-200"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300",
                              formData.liquidDamage ? "left-8" : "left-1"
                            )} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-6 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-6">
                      <button 
                        type="button"
                        onClick={() => { setIsAdding(false); setIsEditing(false); resetForm(); }}
                        className="py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] active:shadow-[var(--shadow-neu-pressed)] transition-all border border-white/20"
                      >
                        Abort
                      </button>
                      <button 
                        type="submit"
                        className="py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 transition-all"
                      >
                        {isEditing ? 'Sync Profile' : 'Commit Ticket'}
                      </button>
                    </div>
                    {isEditing && (
                      <button 
                        type="button"
                        onClick={() => setIsConfirmingDelete(true)}
                        className="w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-red-600 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] active:shadow-[var(--shadow-neu-pressed)] transition-all border border-red-200/20 flex items-center justify-center gap-3"
                      >
                        <Trash2 size={16} strokeWidth={3} />
                        Delete Customer Profile
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Repair Detail Modal (Recessed Audit Log) */}
      <AnimatePresence>
        {selectedRepair && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setSelectedRepair(null); setIsEditingRepair(false); }} className="absolute inset-0 bg-black/40" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-[var(--color-neu-bg)] rounded-[3rem] shadow-[var(--shadow-neu-floating)] overflow-hidden border border-white/20 flex flex-col max-h-[90vh]"
            >
              <div className="p-10 pb-4">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-black tracking-tight">
                    {isEditingRepair ? 'Edit Log' : 'Audit Details'}
                  </h3>
                  <button onClick={() => { setSelectedRepair(null); setIsEditingRepair(false); }} className="w-10 h-10 rounded-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] flex items-center justify-center text-gray-500 active:shadow-[var(--shadow-neu-pressed)]">
                    <X size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
                {isEditingRepair ? (
                  <form onSubmit={handleUpdateRepair} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Repair Target</label>
                      <input 
                        type="text"
                        className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[1.5rem] p-5 outline-none text-black font-black text-sm border border-black/5"
                        value={repairFormData.repairItem}
                        onChange={(e) => setRepairFormData({...repairFormData, repairItem: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Model Code</label>
                      <input 
                        type="text"
                        className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[1.5rem] p-5 outline-none text-black font-black text-sm border border-black/5"
                        value={repairFormData.modelNumber}
                        onChange={(e) => setRepairFormData({...repairFormData, modelNumber: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Price ($)</label>
                        <input 
                          type="number"
                          step="0.01"
                          className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[1.5rem] p-5 outline-none text-black font-black text-sm border border-black/5"
                          value={repairFormData.price}
                          onChange={(e) => setRepairFormData({...repairFormData, price: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Workflow Status</label>
                        <select 
                          className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[1.5rem] p-5 outline-none text-black font-black text-sm border border-black/5 appearance-none"
                          value={repairFormData.status}
                          onChange={(e) => setRepairFormData({...repairFormData, status: e.target.value})}
                        >
                          <option value="In Processing">In Processing</option>
                          <option value="Urgent">Urgent</option>
                          <option value="Completed">Completed</option>
                          <option value="waiting for pay">Waiting Part/Pay</option>
                          <option value="Ready for Pickup">Ready for Pickup</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Passcode</label>
                        <input 
                          type="text"
                          className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[1.5rem] p-5 outline-none text-black font-black text-sm border border-black/5"
                          value={repairFormData.password}
                          onChange={(e) => setRepairFormData({...repairFormData, password: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">IMEI / SN</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[1.5rem] p-5 outline-none text-black font-black text-sm border border-black/5"
                            value={repairFormData.imei}
                            onChange={(e) => setRepairFormData({...repairFormData, imei: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Remarks</label>
                      <textarea 
                        className="w-full bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[1.5rem] p-5 outline-none text-black font-black text-sm border border-black/5 min-h-[100px] resize-none"
                        value={repairFormData.remark}
                        onChange={(e) => setRepairFormData({...repairFormData, remark: e.target.value})}
                      />
                    </div>

                    <div className="pt-6 flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-6">
                        <button 
                          type="button"
                          onClick={() => setIsEditingRepair(false)}
                          className="py-5 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/20 active:shadow-[var(--shadow-neu-pressed)]"
                        >
                          Abort
                        </button>
                        <button 
                          type="submit"
                          className="py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95"
                        >
                          Save Log
                        </button>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIsConfirmingDeleteRepair(true)}
                        className="w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-red-600 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] active:shadow-[var(--shadow-neu-pressed)] transition-all flex items-center justify-center gap-3 border border-red-200/20"
                      >
                        <Trash2 size={16} strokeWidth={3} />
                        Purge Record
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-8">
                    <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] p-8 rounded-[2.5rem] border border-black/5">
                      <div className="flex items-center gap-6 mb-8">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-[var(--shadow-neu-sm)]">
                          <Smartphone size={32} strokeWidth={3} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-2xl font-black text-black leading-tight tracking-tight mb-1">{selectedRepair.repairItem}</h4>
                          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{selectedRepair.modelNumber}</p>
                        </div>
                        <button 
                          onClick={() => setIsTicketModalOpen(true)}
                          className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-90 transition-all shrink-0"
                        >
                          <Printer size={20} strokeWidth={3} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] p-5 rounded-3xl border border-white/20">
                          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 leading-none">Workflow Status</p>
                          <span 
                            onClick={(e) => { e.stopPropagation(); toggleRepairStatus(selectedCustomer.id, selectedRepair.id, selectedRepair.status); }}
                            className={cn(
                              "text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest transition-all shadow-[var(--shadow-neu-sm)]",
                              selectedRepair.status === 'Urgent' ? "bg-red-50 text-red-600" :
                              selectedRepair.status === 'In Processing' ? "bg-purple-50 text-purple-600 cursor-pointer hover:scale-105" :
                              "bg-gray-100 text-gray-600"
                            )}
                          >
                            {selectedRepair.status}
                          </span>
                        </div>
                        <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] p-5 rounded-3xl border border-white/20">
                          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 leading-none">Billable Value</p>
                          <p className="text-lg font-black text-blue-600 leading-none">${selectedRepair.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {(selectedRepair.deposit || 0) > 0 && (
                      <div className="bg-green-50/50 p-8 rounded-[2.5rem] shadow-[var(--shadow-neu-flat)] border border-green-200/30 flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                            <DollarSign size={24} strokeWidth={3} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Initial Deposit</p>
                            <p className="text-2xl font-black text-black leading-none mt-1">${selectedRepair.deposit.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="pt-6 border-t border-green-200/20 flex justify-between items-center">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Final Balance Due</span>
                          <span className="text-xl font-black text-green-700">${(selectedRepair.price - selectedRepair.deposit).toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] p-5 rounded-3xl border border-black/5">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 leading-none">Device Access</p>
                        <p className="text-sm font-black text-black">{selectedRepair.password || 'None'}</p>
                      </div>
                      <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] p-5 rounded-3xl border border-black/5">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 leading-none">Tracking ID</p>
                        <p className="text-sm font-black text-black truncate">{selectedRepair.imei || 'N/A'}</p>
                      </div>
                    </div>

                    <div className={cn(
                      "p-6 rounded-[2rem] flex items-center gap-4 shadow-[var(--shadow-neu-sm)] border border-white/20",
                      selectedRepair.liquidDamage ? "bg-red-50/50 text-red-600" : "bg-green-50/50 text-green-600"
                    )}>
                      <Droplets size={20} strokeWidth={3} />
                      <span className="text-xs font-black uppercase tracking-widest">
                        {selectedRepair.liquidDamage ? 'Water Damage Detected' : 'No Liquid Contact'}
                      </span>
                    </div>

                    {selectedRepair.remark && (
                      <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] p-6 rounded-[2rem] border border-black/5">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Technical Journal</p>
                        <p className="text-sm font-black text-black whitespace-pre-wrap leading-relaxed">{selectedRepair.remark}</p>
                      </div>
                    )}

                    <div className="pt-6 flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-6">
                        <button 
                          onClick={() => openEditRepairModal(selectedRepair)}
                          className="py-5 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-black rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 border border-white/20 active:shadow-[var(--shadow-neu-pressed)]"
                        >
                          <Edit3 size={18} strokeWidth={3} />
                          Modify Log
                        </button>
                        <button 
                          onClick={() => setSelectedRepair(null)}
                          className="py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95"
                        >
                          Dismiss
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => handleNotifyPart(selectedRepair, selectedCustomer)}
                        disabled={partNotifiedId === selectedRepair.id}
                        className={cn(
                          "w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[var(--shadow-neu-flat)] border border-white/20 active:shadow-[var(--shadow-neu-pressed)]",
                          partNotifiedId === selectedRepair.id 
                            ? "bg-green-600 text-white" 
                            : "bg-amber-50 text-amber-600"
                        )}
                      >
                        {partNotifiedId === selectedRepair.id ? (
                          <><Check size={18} strokeWidth={4} /> SMS Notification Sent</>
                        ) : (
                          <><Package size={18} strokeWidth={3} /> Notify Part Arrival</>
                        )}
                      </button>

                      <button 
                        onClick={() => setIsConfirmingDeleteRepair(true)}
                        className="w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-red-600 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] active:shadow-[var(--shadow-neu-pressed)] transition-all border border-red-200/20 flex items-center justify-center gap-3"
                      >
                        <Trash2 size={18} strokeWidth={3} />
                        Purge Record
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View All Orders Modal (Recessed List Layout) */}
      <AnimatePresence>
        {isViewingAllOrders && (
          <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsViewingAllOrders(false)} className="absolute inset-0 bg-black/40" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[var(--color-neu-bg)] rounded-[3rem] shadow-[var(--shadow-neu-floating)] overflow-hidden border border-white/20"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-3xl font-black text-black tracking-tight">Audit Trail</h3>
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mt-1">Full transaction history for {selectedCustomer.name}</p>
                  </div>
                  <button 
                    onClick={() => setIsViewingAllOrders(false)}
                    className="w-12 h-12 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-2xl flex items-center justify-center text-gray-500 active:shadow-[var(--shadow-neu-pressed)]"
                  >
                    <X size={24} strokeWidth={3} />
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-6 custom-scrollbar px-2">
                  {selectedCustomer.repairs.map((repair) => (
                    <div 
                      key={repair.id}
                      onClick={() => {
                        setSelectedRepair(repair);
                        setIsViewingAllOrders(false);
                      }}
                      className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] p-6 rounded-[2rem] flex items-center justify-between border border-white/20 hover:shadow-[var(--shadow-neu-pressed)] transition-all cursor-pointer group active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-sm)] flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors">
                          <Smartphone size={24} strokeWidth={3} />
                        </div>
                        <div>
                          <h4 className="font-black text-black text-base mb-1 tracking-tight">{repair.repairItem}</h4>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">{repair.modelNumber}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-3">
                        <div className="flex items-center gap-4">
                          <p className="font-black text-black text-xl leading-none">${repair.price.toFixed(2)}</p>
                          <ArrowRight size={18} className="text-blue-600 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className={cn(
                              "text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-[var(--shadow-neu-sm)] border border-white/10",
                              repair.status === 'Urgent' ? "bg-red-50 text-red-600" :
                              (repair.status === 'In Processing' || repair.status === 'waiting for pay') ? "bg-purple-50 text-purple-600" :
                              repair.status === 'Ready for Pickup' ? "bg-green-50 text-green-600" :
                              "bg-gray-50 text-gray-400"
                            )}>
                            {repair.status}
                          </span>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                            {new Date(repair.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-8 border-t border-black/5 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">Lifetime Total</p>
                    <p className="text-3xl font-black text-blue-600 leading-none">${selectedCustomer.totalSpent.toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => setIsViewingAllOrders(false)}
                    className="px-10 py-5 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-black font-black text-[10px] uppercase tracking-widest rounded-2xl active:shadow-[var(--shadow-neu-pressed)] transition-all border border-white/20"
                  >
                    Close History
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal (Safety Red) */}
      <AnimatePresence>
        {isConfirmingDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsConfirmingDelete(false)} className="absolute inset-0 bg-black/40" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-[var(--color-neu-bg)] rounded-[3rem] shadow-[var(--shadow-neu-floating)] overflow-hidden border border-white/20 p-10 text-center"
            >
              <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2rem] shadow-[var(--shadow-neu-flat)] flex items-center justify-center mx-auto mb-8 border border-red-200/30">
                <Trash2 size={44} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black text-black mb-3">Delete Profile?</h3>
              <p className="text-xs font-bold text-gray-500 leading-relaxed mb-10 px-4">
                This action is permanent and will delete all technical history for <span className="text-black font-black">{selectedCustomer.name}</span>.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <button 
                  onClick={() => setIsConfirmingDelete(false)}
                  className="py-5 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest active:shadow-[var(--shadow-neu-pressed)] border border-white/20"
                >
                  Abort
                </button>
                <button 
                  onClick={handleDeleteCustomer}
                  className="py-5 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-95"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Repair Confirmation Modal */}
      <AnimatePresence>
        {isConfirmingDeleteRepair && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsConfirmingDeleteRepair(false)} className="absolute inset-0 bg-black/40" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-[var(--color-neu-bg)] rounded-[3rem] shadow-[var(--shadow-neu-floating)] overflow-hidden border border-white/20 p-10 text-center"
            >
              <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2rem] shadow-[var(--shadow-neu-flat)] flex items-center justify-center mx-auto mb-8 border border-red-200/30">
                <Trash2 size={44} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black text-black mb-3">Purge Record?</h3>
              <p className="text-xs font-bold text-gray-500 leading-relaxed mb-10 px-4">
                Are you sure you want to remove this transaction log? This cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <button 
                  onClick={() => setIsConfirmingDeleteRepair(false)}
                  className="py-5 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest active:shadow-[var(--shadow-neu-pressed)] border border-white/20"
                >
                  Abort
                </button>
                <button 
                  onClick={handleDeleteRepair}
                  className="py-5 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-95"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Modal (Physical Card Presentation) */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowQR(false)} className="absolute inset-0 bg-black/40" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-sm bg-[var(--color-neu-bg)] rounded-[3rem] shadow-[var(--shadow-neu-floating)] p-10 flex flex-col items-center border border-white/20"
            >
               <h3 className="text-2xl font-black text-black mb-2 tracking-tight">Portal Sync</h3>
               <p className="text-center text-[10px] font-black text-gray-500 uppercase tracking-widest mb-10 leading-relaxed">Scan to drop-off or track tickets</p>
               
               <div className="p-6 bg-white rounded-[2.5rem] shadow-[var(--shadow-neu-floating)] mb-10 border border-black/5 transform hover:rotate-3 transition-transform">
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(getPortalUrl())}`} alt="Portal QR" className="w-52 h-52 rounded-2xl" />
               </div>

               <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center bg-blue-50 px-6 py-3 rounded-full shadow-[var(--shadow-neu-sm)] border border-blue-200/30">Awaiting External Scan</p>

               <button 
                  onClick={() => setShowQR(false)}
                  className="absolute top-6 right-6 w-10 h-10 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-full flex items-center justify-center text-gray-500 active:shadow-[var(--shadow-neu-pressed)]"
               >
                 <X size={20} strokeWidth={3} />
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAB (Floating Physical Button) */}
      <button 
        onClick={() => setShowQR(true)}
        className="fixed right-8 bottom-28 md:bottom-10 bg-blue-600 text-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-[0_10px_25px_rgba(37,99,235,0.4)] hover:scale-110 active:scale-90 transition-all z-[90] border-4 border-white/20"
      >
        <QrCode size={28} strokeWidth={2.5} />
      </button>

      <RepairTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        repair={selectedRepair}
        customer={selectedCustomer}
        t={t}
      />

      <AnimatePresence>
        {scannerTarget && (
          <OCRImeiScanner
            onScan={(text) => {
              if (scannerTarget === 'add') {
                setFormData(prev => ({ ...prev, imei: text }));
              } else if (scannerTarget === 'repair') {
                setRepairFormData(prev => ({ ...prev, imei: text }));
              }
            }}
            onClose={() => setScannerTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
