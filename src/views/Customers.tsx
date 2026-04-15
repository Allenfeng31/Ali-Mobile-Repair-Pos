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
  Scan
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Customer } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { RepairTicketModal } from '../components/RepairTicketModal';
import { api } from '../lib/api';
import { OCRImeiScanner } from '../components/OCRImeiScanner';
import { useScrollLock } from '../hooks/useScrollLock';

const INITIAL_CUSTOMERS: Customer[] = [
  { 
    id: '1', 
    name: 'Elias Henderson', 
    phone: '+1 (555) 012-4492', 
    email: 'elias.h@example.com',
    repairs: [
      {
        id: 'R1',
        timestamp: new Date().toISOString(),
        repairItem: 'Screen Replacement',
        modelNumber: 'iPhone 14 Pro Max',
        price: 450.00,
        liquidDamage: false,
        password: '1234',
        imei: '358293049283741',
        status: 'Completed'
      }
    ],
    status: 'Completed', 
    statusColor: 'surface', 
    lastVisit: '2 days ago', 
    initials: 'EH',
    totalSpent: 450.00
  },
  { 
    id: '2', 
    name: 'Adeline Miller', 
    phone: '+1 (555) 019-8831', 
    email: 'a.miller@design.co',
    repairs: [
      {
        id: 'R2',
        timestamp: new Date().toISOString(),
        repairItem: 'Logic Board Repair',
        modelNumber: 'MacBook Pro M1',
        price: 1492.00,
        liquidDamage: false,
        password: 'admin',
        imei: 'C02F9X8YMD6M',
        status: 'Completed'
      }
    ],
    status: 'Completed', 
    statusColor: 'surface', 
    lastVisit: '3 weeks ago', 
    initials: 'AM',
    totalSpent: 1492.00
  },
  { 
    id: '3', 
    name: 'Julian Weaver', 
    phone: '+1 (555) 014-2209', 
    email: 'j.weaver@tech.io',
    repairs: [
      {
        id: 'R3',
        timestamp: new Date().toISOString(),
        repairItem: 'Battery Replacement',
        modelNumber: 'Galaxy S22 Ultra',
        price: 120.00,
        liquidDamage: true,
        password: 'pattern',
        imei: '990000862471854',
        status: 'Urgent'
      }
    ],
    status: 'Urgent', 
    statusColor: 'error', 
    lastVisit: 'Today', 
    initials: 'JW',
    totalSpent: 120.00
  },
];

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
  const t = (section: string, key: string) => key; // Simplified for now
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [hostIp, setHostIp] = useState('localhost');
  
  const [selectedId, setSelectedId] = useState<string>('2');
  
  // Fetch customer data — load customers first (critical), then IP in background
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getCustomers();
        if (data && data.length > 0) {
          setCustomers(data);
        }
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
    // Load IP in background (non-blocking)
    api.getIp().then(ipRes => {
      if (ipRes?.ip) setHostIp(ipRes.ip);
    }).catch(() => {});
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Lock body scroll when any modal is open
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
    
    if (statusA === 'Completed') {
      return getLatestTimestamp(b) - getLatestTimestamp(a);
    }
    
    return getLatestTimestamp(b) - getLatestTimestamp(a);
  });

  const filteredCustomers = sortedCustomers.filter(c => {
    const query = searchQuery.toLowerCase();
    const hasRepairMatch = c.repairs.some(r => 
      (r.repairItem || '').toLowerCase().includes(query) || 
      (r.modelNumber || '').toLowerCase().includes(query)
    );
    return (
      (c.name || '').toLowerCase().includes(query) ||
      (c.phone || '').toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query) ||
      (c.id || '').toLowerCase().includes(query) ||
      hasRepairMatch
    );
  });

  const inProcessingCustomers = filteredCustomers.filter(c => getCustomerOverallStatus(c) !== 'Completed');
  const completedCustomers = filteredCustomers.filter(c => getCustomerOverallStatus(c) === 'Completed');

  const selectedCustomer = sortedCustomers.find(c => c.id === selectedId) || sortedCustomers[0] || null;

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
        // Update local state with the new timestamp
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
      // Use the dynamically detected host IP instead of hardcoded loopback
      return origin.replace(/localhost|127\.0\.0\.1/, hostIp) + '/portal';
    }
    return origin + '/portal';
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const existingCustomerIndex = customers.findIndex(c => c.phone === formData.phone);
    
    try {
      if (existingCustomerIndex !== -1) {
        // Existing customer
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
        // New customer
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
          remark: formData.remark,
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
    
    const updateData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      initials
    };
    
    try {
            await api.updateCustomer(selectedId, updateData);
      
      const updatedCustomers = customers.map(c => {
        if (c.id === selectedId) {
          return { ...c, ...updateData };
        }
        return c;
      });
      setCustomers(updatedCustomers);
      setIsEditing(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Failed to update customer');
    }
  };

  const handleDeleteCustomer = async () => {
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
    setFormData({
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
  };

  const openEditModal = () => {
    if (!selectedCustomer) return;
    setFormData({
      name: selectedCustomer.name,
      phone: selectedCustomer.phone,
      email: selectedCustomer.email,
      repairItem: '',
      modelNumber: '',
      price: '',
      liquidDamage: false,
      password: '',
      imei: '',
      remark: '',
      deposit: ''
    });
    setIsEditing(true);
  };

  const openEditRepairModal = (repair: any) => {
    setRepairFormData({
      repairItem: repair.repairItem,
      modelNumber: repair.modelNumber,
      price: repair.price.toString(),
      liquidDamage: repair.liquidDamage,
      password: repair.password || '',
      imei: repair.imei || '',
      remark: repair.remark || '',
      deposit: (repair.deposit || 0).toString(),
      status: repair.status
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
              const updatedRepair = { ...r, status: nextStatus as any };
              if (selectedRepair && selectedRepair.id === repairId) {
                setSelectedRepair(updatedRepair);
              }
              return updatedRepair;
            }
            return r;
          });
          
          const newStatus = getCustomerOverallStatus({...c, repairs: updatedRepairs});
          
          api.updateCustomer(customerId, {
            status: newStatus,
            statusColor: getStatusColor(newStatus)
          }).catch(console.error);
          
          return {
            ...c,
            repairs: updatedRepairs,
            status: newStatus,
            statusColor: getStatusColor(newStatus)
          };
        }
        return c;
      });

      // Fire completion SMS — non-blocking
      if (smsCustomer?.phone) {
        api.sendSms(smsCustomer.phone, 'completed', {
          customerName: smsCustomer.name,
          deviceModel: smsRepairItem
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
      repairItem: repairFormData.repairItem,
      modelNumber: repairFormData.modelNumber,
      price: parseFloat(repairFormData.price) || 0,
      liquidDamage: repairFormData.liquidDamage,
      password: repairFormData.password,
      imei: repairFormData.imei,
      remark: repairFormData.remark,
      deposit: parseFloat(repairFormData.deposit) || 0,
      status: repairFormData.status
    };

    try {
            await api.updateRepair(selectedRepair.id, updateData);
      
      const updatedCustomers = customers.map(c => {
        if (c.id === selectedId) {
          const updatedRepairs = c.repairs.map(r => {
            if (r.id === selectedRepair.id) {
              return { ...r, ...updateData };
            }
            return r;
          });
          
          const newTotalSpent = updatedRepairs.reduce((sum, r) => sum + r.price, 0);
          const newStatus = getCustomerOverallStatus({...c, repairs: updatedRepairs});
          
          api.updateCustomer(selectedId, {
            totalSpent: newTotalSpent,
            status: newStatus,
            statusColor: getStatusColor(newStatus)
          }).catch(console.error);
          
          return {
            ...c,
            repairs: updatedRepairs,
            totalSpent: newTotalSpent,
            status: newStatus,
            statusColor: getStatusColor(newStatus)
          };
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

    try {
            await api.deleteRepair(selectedRepair.id);
      
      const updatedCustomers = customers.map(c => {
        if (c.id === selectedId) {
          const updatedRepairs = c.repairs.filter(r => r.id !== selectedRepair.id);
          const newTotalSpent = updatedRepairs.reduce((sum, r) => sum + r.price, 0);
          const newStatus = getCustomerOverallStatus({...c, repairs: updatedRepairs});
          
          api.updateCustomer(selectedId, {
            totalSpent: newTotalSpent,
            status: newStatus,
            statusColor: getStatusColor(newStatus)
          }).catch(console.error);
          
          return {
            ...c,
            repairs: updatedRepairs,
            totalSpent: newTotalSpent,
            status: newStatus,
            statusColor: getStatusColor(newStatus)
          };
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
    const isExpanded = selectedId === customer.id;
    const overallStatus = getCustomerOverallStatus(customer);
    const statusColor = getStatusColor(overallStatus);

    return (
      <div 
        key={customer.id}
        className={cn(
          "rounded-2xl overflow-hidden transition-all duration-300 border border-outline-variant/10 shadow-sm",
          isExpanded 
            ? "bg-surface-container-low shadow-xl ring-1 ring-primary/20 scale-[1.01]" 
            : "bg-surface-container-lowest hover:bg-surface-container-high hover:shadow-md"
        )}
      >
        <div 
          onClick={() => setSelectedId(isExpanded ? '' : customer.id)}
          className="p-5 flex items-center justify-between cursor-pointer group/card"
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all",
              isExpanded ? "bg-primary text-on-primary rotate-3" : "bg-secondary-container text-on-secondary-container group-hover/card:rotate-3"
            )}>
              {customer.initials}
            </div>
            <div>
              <h3 className="font-bold text-on-surface">{customer.name}</h3>
              <div className="flex flex-col gap-1.5 mt-0.5">
                <p className="text-xs text-on-surface-variant font-bold">{customer.phone}</p>
                {customer.repairs.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-primary/70 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                      {new Date(customer.repairs[0].timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[10px] font-bold text-on-surface-variant/80 italic">
                      {customer.repairs[0].modelNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className={cn(
                "text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest transition-colors",
                statusColor === 'tertiary' ? "bg-tertiary-container text-on-tertiary-container border border-tertiary/10" :
                statusColor === 'error' ? "bg-error-container text-on-error-container border border-error/10" :
                "bg-surface-container-highest text-on-surface-variant border border-outline-variant/10"
              )}>
                {overallStatus}
              </span>
              <p className="text-[10px] font-bold text-on-surface-variant mt-1.5">Price: ${customer.totalSpent.toFixed(2)}</p>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={20} className="text-on-surface-variant" />
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="px-5 pb-6 pt-2 border-t border-outline-variant/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Contact Details</p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm font-bold text-on-surface bg-surface-container-low/50 p-2 rounded-lg">
                          <Mail size={16} className="text-primary" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                        <div className="flex items-center justify-between w-full bg-surface-container-low/50 p-2 rounded-lg">
                          <div className="flex items-center gap-3 text-sm font-bold text-on-surface">
                            <Phone size={16} className="text-primary" />
                            {customer.phone}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleSendReview(customer); }}
                              className={cn(
                                "px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 transition-all border",
                                sendingReviewId === customer.id 
                                  ? "bg-green-100 text-green-800 border-green-200" 
                                  : "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
                              )}
                            >
                              {sendingReviewId === customer.id ? (
                                <><Check size={12} /> Sent</>
                              ) : (
                                <><Star size={12} className="fill-amber-500 text-amber-500" /> Send Review</>
                              )}
                            </button>
                            {customer.lastReviewSent && (
                              <p className="text-[9px] font-black text-amber-600 mt-0.5 whitespace-nowrap">
                                Sent: {new Date(customer.lastReviewSent).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedId(customer.id); openEditModal(); }}
                        className="flex-1 bg-surface-container-highest text-on-surface-variant py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary hover:text-on-primary transition-all shadow-sm"
                      >
                        <Edit3 size={14} />
                        Edit Profile
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedId(customer.id); setIsViewingAllOrders(true); }}
                        className="flex-1 bg-secondary-container text-on-secondary-container py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm"
                      >
                        Recent Activity
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Live Repairs</p>
                    <div className="space-y-2">
                      {customer.repairs.slice(0, 2).map(repair => (
                        <div 
                          key={repair.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedRepair(repair); }}
                          className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 hover:border-primary/40 transition-all cursor-pointer flex justify-between items-center group/repair shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/5 rounded-lg text-primary group-hover/repair:bg-primary group-hover/repair:text-on-primary transition-colors">
                              <Smartphone size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-on-surface">{repair.repairItem}</p>
                              <p className="text-[10px] font-bold text-on-surface-variant">{repair.modelNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-primary">${repair.price.toFixed(2)}</p>
                            {(repair.deposit || 0) > 0 && (
                              <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-green-100 text-green-700 border border-green-200 block mt-0.5">
                                💰 Deposit: ${repair.deposit.toFixed(2)}
                              </span>
                            )}
                            <span 
                              onClick={(e) => { e.stopPropagation(); toggleRepairStatus(customer.id, repair.id, repair.status); }}
                              className={cn(
                                "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter transition-all shadow-sm block mt-1",
                                repair.status === 'In Processing' && "cursor-pointer hover:opacity-70 active:scale-95",
                                repair.status === 'Urgent' ? "bg-error-container text-on-error-container border border-error/5" :
                                repair.status === 'In Processing' ? "bg-tertiary-container text-on-tertiary-container border border-tertiary/5" :
                                "bg-surface-container-highest text-on-surface-variant border border-outline-variant/5"
                              )}
                            >
                              {repair.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {customer.repairs.length > 2 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedId(customer.id); setIsViewingAllOrders(true); }}
                          className="w-full text-[10px] font-black text-primary uppercase tracking-widest text-center py-2 hover:underline bg-primary/5 rounded-lg"
                        >
                          + {customer.repairs.length - 2} more records
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 relative">
      {/* Left Column: List */}
      <section className="flex-1 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-primary">Customers</h2>
            <p className="text-on-surface-variant text-sm font-medium">Manage your technical client database</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md active:scale-95 transition-all"
          >
            <UserPlus size={18} />
            Add New Customer
          </button>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
          <input 
            className="w-full bg-surface-container-high border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all outline-none text-on-surface font-medium" 
            placeholder="Search by name, phone, email or repair item..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="space-y-4">
          {isLoading ? (
            // Skeleton loading state
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/10 p-5 flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-container-high rounded-lg w-1/3" />
                    <div className="h-3 bg-surface-container-high rounded-lg w-1/4" />
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-5 bg-surface-container-high rounded-lg w-16" />
                    <div className="h-3 bg-surface-container-high rounded-lg w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCustomers.length > 0 ? (
            <>
              {/* In Processing Section */}
              {inProcessingCustomers.length > 0 && (
                <div className="mb-8 space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <h3 className="text-sm font-black text-on-surface uppercase tracking-widest">In Processing</h3>
                    <div className="h-px flex-1 bg-outline-variant/10" />
                    <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[10px] font-black rounded-lg uppercase">
                      {inProcessingCustomers.length} Orders
                    </span>
                  </div>
                  <div className="space-y-4">
                    {inProcessingCustomers.map(customer => renderCustomerCard(customer))}
                  </div>
                </div>
              )}

              {/* Completed Section */}
              {completedCustomers.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <h3 className="text-sm font-black text-on-surface uppercase tracking-widest opacity-60">Completed</h3>
                    <div className="h-px flex-1 bg-outline-variant/10" />
                    <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant text-[10px] font-black rounded-lg uppercase">
                      {completedCustomers.length} Done
                    </span>
                  </div>
                  <div className="space-y-4">
                    {completedCustomers.map(customer => renderCustomerCard(customer))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant">
              <p className="text-on-surface-variant font-bold">No customers found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Right Column: Detail */}
      <aside className="w-full lg:w-[450px] space-y-6">
        <AnimatePresence mode="wait">
          {isLoading || !selectedCustomer ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-surface-container-low rounded-[2rem] overflow-hidden shadow-sm border border-outline-variant/5"
            >
              <div className="h-32 bg-surface-container-high animate-pulse" />
              <div className="px-8 pb-10 -mt-12 relative">
                <div className="w-24 h-24 rounded-3xl bg-surface-container-high animate-pulse" />
                <div className="mt-6 space-y-4 animate-pulse">
                  <div className="h-6 bg-surface-container-high rounded-lg w-2/3" />
                  <div className="h-4 bg-surface-container-high rounded-lg w-1/3" />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="h-20 bg-surface-container-high rounded-2xl" />
                    <div className="h-20 bg-surface-container-high rounded-2xl" />
                  </div>
                  <div className="h-5 bg-surface-container-high rounded-lg w-1/4 mt-4" />
                  <div className="space-y-3">
                    <div className="h-16 bg-surface-container-high rounded-xl" />
                    <div className="h-16 bg-surface-container-high rounded-xl" />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
          <motion.div 
            key={selectedCustomer.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-surface-container-low rounded-[2rem] overflow-hidden shadow-sm border border-outline-variant/5"
          >
            {/* Header Gradient */}
            <div className="h-32 signature-gradient relative p-6 flex items-end">
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={openEditModal}
                  className="bg-white/10 backdrop-blur-md text-white p-2 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <Edit3 size={16} />
                </button>
                <button className="bg-white/10 backdrop-blur-md text-white p-2 rounded-xl hover:bg-white/20 transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            <div className="px-8 pb-10 -mt-12 relative">
              <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-xl flex items-center justify-center font-black text-3xl text-primary">
                {selectedCustomer.initials}
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-on-surface tracking-tight">{selectedCustomer.name}</h2>
                  <Star size={16} className="text-tertiary fill-tertiary" />
                </div>
                <p className="text-on-surface-variant font-bold text-sm">Customer ID: {selectedCustomer.id}</p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5">Email</p>
                  <p className="text-xs font-bold truncate text-on-surface">{selectedCustomer.email}</p>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5">Total Price</p>
                  <p className="text-sm font-black text-primary">${selectedCustomer.totalSpent.toFixed(2)}</p>
                </div>
              </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setShowPhonePopup(true)}
                    className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors group flex-1"
                  >
                    <Phone size={16} className="text-primary" />
                    <span className="text-sm font-bold group-hover:underline">{selectedCustomer.phone}</span>
                  </button>
                  <div className="flex flex-col items-end gap-1">
                    <button
                      onClick={() => handleSendReview()}
                      className={cn(
                        "px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all border shadow-sm",
                        sendingReviewId === selectedCustomer.id 
                          ? "bg-green-100 text-green-800 border-green-200" 
                          : "bg-amber-50 text-amber-800 border-amber-100 hover:bg-amber-100"
                      )}
                    >
                      {sendingReviewId === selectedCustomer.id ? (
                        <><Check size={14} /> SMS Sent</>
                      ) : (
                        <><Star size={14} className="fill-amber-500 text-amber-500" /> Send Review</>
                      )}
                    </button>
                    {selectedCustomer.lastReviewSent && (
                      <p className="text-[10px] font-black text-amber-600 mt-1 pr-1 whitespace-nowrap">
                        Last Sent: {new Date(selectedCustomer.lastReviewSent).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '')}
                      </p>
                    )}
                  </div>
                </div>

              <div className="mt-10">
                <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-5">Repair History</h3>
                <div className="space-y-3">
                  {selectedCustomer.repairs.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedRepair(item)}
                      className="bg-surface-container-lowest p-4 rounded-2xl flex gap-4 items-start border border-outline-variant/5 hover:border-primary/20 transition-colors cursor-pointer group"
                    >
                      <div className="bg-secondary-container/30 p-2.5 rounded-xl text-secondary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <Smartphone size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-on-surface leading-tight">{item.repairItem}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-on-surface-variant">
                              {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}
                            </span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRepair(item);
                                setIsConfirmingDeleteRepair(true);
                              }}
                              className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Delete Repair Record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-1.5">
                          <p className="text-[11px] font-bold text-on-surface-variant">Model: {item.modelNumber}</p>
                          <div className="text-right">
                            <p className="text-[11px] font-black text-primary">${item.price.toFixed(2)}</p>
                            {(item.deposit || 0) > 0 && (
                              <p className="text-[9px] font-black text-green-600">💰 ${item.deposit.toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex gap-3">
                <button 
                  onClick={() => setIsViewingAllOrders(true)}
                  className="flex-1 bg-secondary-container text-on-secondary-container py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
                >
                  View All Orders
                </button>
                <button className="bg-primary text-on-primary px-5 py-3.5 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                  <MessageSquare size={20} />
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPhonePopup(false)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/10"
            >
              {/* Header */}
              <div className="signature-gradient p-6 text-white">
                <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">Contact</p>
                <p className="text-2xl font-black">{selectedCustomer.name}</p>
                <p className="text-sm font-bold opacity-80 mt-0.5">{selectedCustomer.phone}</p>
              </div>

              <div className="p-4 space-y-3">
                {/* Call */}
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl hover:bg-primary hover:text-on-primary transition-all group"
                >
                  <div className="w-10 h-10 bg-primary/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                    <Phone size={20} className="text-primary group-hover:text-white" />
                  </div>
                  <div>
                    <p className="font-black text-sm">Call Customer</p>
                    <p className="text-xs text-on-surface-variant group-hover:text-white/70">Open dialler</p>
                  </div>
                </a>

                {/* Copy */}
                <button
                  onClick={handleCopyPhone}
                  className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl hover:bg-surface-container-high transition-all w-full text-left"
                >
                  <div className="w-10 h-10 bg-secondary-container/40 rounded-xl flex items-center justify-center">
                    {phoneCopied ? <Check size={20} className="text-green-600" /> : <Copy size={20} className="text-secondary" />}
                  </div>
                  <div>
                    <p className="font-black text-sm">{phoneCopied ? 'Copied!' : 'Copy Number'}</p>
                    <p className="text-xs text-on-surface-variant">Copy to clipboard</p>
                  </div>
                </button>

                {/* Send Review SMS */}
                <button
                  onClick={handleSendReview}
                  className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl hover:bg-amber-100 transition-all w-full text-left border border-amber-200/50"
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    {reviewSent ? <Check size={20} className="text-green-600" /> : <Star size={20} className="text-amber-500" />}
                  </div>
                  <div>
                    <p className="font-black text-sm text-amber-800">{reviewSent ? 'Review Link Sent! ⭐' : 'Request Google Review'}</p>
                    <p className="text-xs text-amber-600">Send a review link via SMS</p>
                    {selectedCustomer.lastReviewSent && (
                      <p className="text-[10px] font-bold text-amber-700/50 mt-1">
                        Last Sent: {new Date(selectedCustomer.lastReviewSent).toLocaleDateString('en-GB')}
                      </p>
                    )}
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowPhonePopup(false)}
                className="w-full p-4 text-center text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors border-t border-outline-variant/10"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Customer Modal */}
      <AnimatePresence>
        {(isAdding || isEditing) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAdding(false); setIsEditing(false); resetForm(); }}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container-low rounded-[2.5rem] shadow-2xl overflow-hidden border border-outline-variant/10"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-primary tracking-tight">
                      {isEditing ? 'Edit Customer' : 'Add New Customer'}
                    </h3>
                    <p className="text-on-surface-variant text-sm font-bold">
                      {isEditing ? 'Update client information' : 'Register a new repair ticket'}
                    </p>
                  </div>
                  <button 
                    onClick={() => { setIsAdding(false); setIsEditing(false); resetForm(); }}
                    className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={isEditing ? handleEditCustomer : handleAddCustomer} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
                  <div className="grid grid-cols-1 gap-6">
                    {!isEditing && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Repair Time</label>
                        <div className="bg-surface-container-high p-4 rounded-2xl flex items-center gap-3 text-on-surface-variant border border-outline-variant/5">
                          <Clock size={18} />
                          <span className="text-sm font-bold">{new Date().toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Customer Name</label>
                      <input 
                        type="text"
                        placeholder="Full Name"
                        className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface font-bold"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Phone</label>
                        <input 
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface font-bold"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Email</label>
                        <input 
                          type="email"
                          placeholder="email@example.com"
                          className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface font-bold"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>

                    {!isEditing && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Repair Item</label>
                            <input 
                              type="text"
                              placeholder="e.g. Screen"
                              className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface font-bold"
                              value={formData.repairItem}
                              onChange={(e) => setFormData({...formData, repairItem: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Model Number</label>
                            <input 
                              type="text"
                              placeholder="e.g. iPhone 14"
                              className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface font-bold"
                              value={formData.modelNumber}
                              onChange={(e) => setFormData({...formData, modelNumber: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Price ($)</label>
                            <input 
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface font-bold"
                              value={formData.price}
                              onChange={(e) => setFormData({...formData, price: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Password</label>
                            <input 
                              type="text"
                              placeholder="Device Passcode"
                              className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface font-bold"
                              value={formData.password}
                              onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">IMEI / Serial Number</label>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="IMEI Number"
                              className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface font-bold"
                              value={formData.imei}
                              onChange={(e) => setFormData({...formData, imei: e.target.value})}
                            />
                            <button
                              type="button"
                              onClick={() => setScannerTarget('add')}
                              className="bg-primary/10 text-primary p-4 rounded-2xl hover:bg-primary/20 transition-colors flex items-center justify-center shrink-0"
                              title="Scan IMEI using Camera"
                            >
                              <Scan size={20} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1 flex items-center gap-1.5">
                            <DollarSign size={12} className="text-green-600" />
                            Deposit / 订金 (Optional)
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 font-black text-sm">$</span>
                            <input 
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="w-full bg-green-50 border border-green-200 rounded-2xl p-4 pl-8 focus:ring-2 focus:ring-green-300/40 transition-all outline-none text-on-surface font-bold"
                              value={formData.deposit}
                              onChange={(e) => setFormData({...formData, deposit: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Remark</label>
                          <textarea 
                            placeholder="Special notes or instructions..."
                            className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface font-bold min-h-[100px] resize-none"
                            value={formData.remark}
                            onChange={(e) => setFormData({...formData, remark: e.target.value})}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-xl transition-colors",
                              formData.liquidDamage ? "bg-error/10 text-error" : "bg-surface-container-high text-on-surface-variant"
                            )}>
                              <Droplets size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-on-surface">Liquid Damage</p>
                              <p className="text-[10px] font-bold text-on-surface-variant">Has the device been in water?</p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, liquidDamage: !formData.liquidDamage})}
                            className={cn(
                              "w-12 h-6 rounded-full relative transition-colors duration-300",
                              formData.liquidDamage ? "bg-error" : "bg-surface-container-highest"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                              formData.liquidDamage ? "left-7" : "left-1"
                            )} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => { setIsAdding(false); setIsEditing(false); resetForm(); }}
                        className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-on-primary bg-primary shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                      >
                        {isEditing ? 'Update Info' : 'Save Customer'}
                      </button>
                    </div>
                    {isEditing && (
                      <button 
                        type="button"
                        onClick={() => setIsConfirmingDelete(true)}
                        className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-error bg-error/10 hover:bg-error/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
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

      {/* Repair Detail Modal */}
      <AnimatePresence>
        {selectedRepair && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedRepair(null); setIsEditingRepair(false); }}
              className="absolute inset-0 bg-on-surface/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-surface-container-low rounded-[2.5rem] shadow-2xl overflow-hidden border border-outline-variant/10 flex flex-col max-h-[90vh]"
            >
              <div className="p-8 pb-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-primary">
                    {isEditingRepair ? 'Edit Repair Record' : 'Repair Details'}
                  </h3>
                  <button onClick={() => { setSelectedRepair(null); setIsEditingRepair(false); }} className="p-2 hover:bg-surface-container-high rounded-full">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">

                {isEditingRepair ? (
                  <form onSubmit={handleUpdateRepair} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Repair Item</label>
                      <input 
                        type="text"
                        className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface font-bold"
                        value={repairFormData.repairItem}
                        onChange={(e) => setRepairFormData({...repairFormData, repairItem: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Model Number</label>
                      <input 
                        type="text"
                        className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface font-bold"
                        value={repairFormData.modelNumber}
                        onChange={(e) => setRepairFormData({...repairFormData, modelNumber: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Price ($)</label>
                        <input 
                          type="number"
                          step="0.01"
                          className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface font-bold"
                          value={repairFormData.price}
                          onChange={(e) => setRepairFormData({...repairFormData, price: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Status</label>
                        <select 
                          className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface font-bold appearance-none"
                          value={repairFormData.status}
                          onChange={(e) => setRepairFormData({...repairFormData, status: e.target.value})}
                        >
                          <option value="In Processing">In Processing</option>
                          <option value="Urgent">Urgent</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Password</label>
                        <input 
                          type="text"
                          className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface font-bold"
                          value={repairFormData.password}
                          onChange={(e) => setRepairFormData({...repairFormData, password: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">IMEI / Serial Number</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface font-bold"
                            value={repairFormData.imei}
                            onChange={(e) => setRepairFormData({...repairFormData, imei: e.target.value})}
                          />
                          <button
                            type="button"
                            onClick={() => setScannerTarget('repair')}
                            className="bg-primary/10 text-primary p-4 rounded-2xl hover:bg-primary/20 transition-colors flex items-center justify-center shrink-0"
                            title="Scan IMEI using Camera"
                          >
                            <Scan size={20} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1 flex items-center gap-1.5">
                        <DollarSign size={12} className="text-green-600" />
                        Deposit / 订金
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 font-black text-sm">$</span>
                        <input 
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full bg-green-50 border border-green-200 rounded-2xl p-4 pl-8 focus:ring-2 focus:ring-green-300/40 transition-all outline-none text-on-surface font-bold"
                          value={repairFormData.deposit}
                          onChange={(e) => setRepairFormData({...repairFormData, deposit: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Remark</label>
                      <textarea 
                        placeholder="Special notes or instructions..."
                        className="w-full bg-surface-container-lowest border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface font-bold min-h-[100px] resize-none"
                        value={repairFormData.remark}
                        onChange={(e) => setRepairFormData({...repairFormData, remark: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                      <div className="flex items-center gap-3">
                        <Droplets size={18} className={repairFormData.liquidDamage ? "text-error" : "text-on-surface-variant"} />
                        <span className="text-xs font-bold text-on-surface">Liquid Damage</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setRepairFormData({...repairFormData, liquidDamage: !repairFormData.liquidDamage})}
                        className={cn(
                          "w-10 h-5 rounded-full relative transition-colors",
                          repairFormData.liquidDamage ? "bg-error" : "bg-surface-container-highest"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                          repairFormData.liquidDamage ? "left-5.5" : "left-0.5"
                        )} />
                      </button>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                      <div className="flex gap-3">
                        <button 
                          type="button"
                          onClick={() => setIsEditingRepair(false)}
                          className="flex-1 py-3.5 bg-surface-container-high text-on-surface-variant rounded-2xl font-black text-xs uppercase tracking-widest"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 py-3.5 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                          Save Changes
                        </button>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIsConfirmingDeleteRepair(true)}
                        className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-error bg-error/10 hover:bg-error/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
                        Delete Repair Record
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/10">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                          <Smartphone size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-on-surface">{selectedRepair.repairItem}</h4>
                          <p className="text-xs font-bold text-on-surface-variant">{selectedRepair.modelNumber}</p>
                        </div>
                        <button 
                          onClick={() => setIsTicketModalOpen(true)}
                          className="ml-auto p-3 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-on-primary transition-all flex items-center gap-2"
                          title="Print Repair Ticket"
                        >
                          <Printer size={18} />
                          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Ticket</span>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10">
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Status</p>
                        <span 
                          onClick={(e) => { e.stopPropagation(); toggleRepairStatus(selectedCustomer.id, selectedRepair.id, selectedRepair.status); }}
                          className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest transition-all",
                            selectedRepair.status === 'In Processing' && "cursor-pointer hover:opacity-70 active:scale-95",
                            selectedRepair.status === 'Urgent' ? "bg-error-container text-on-error-container" :
                            selectedRepair.status === 'In Processing' ? "bg-tertiary-container text-on-tertiary-container" :
                            "bg-surface-container-highest text-on-surface-variant"
                          )}
                        >
                          {selectedRepair.status}
                        </span>
                      </div>
                      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10">
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Price</p>
                        <p className="text-sm font-black text-primary">${selectedRepair.price.toFixed(2)}</p>
                      </div>
                      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10">
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Date</p>
                        <p className="text-sm font-bold text-on-surface">{new Date(selectedRepair.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                    {(selectedRepair.deposit || 0) > 0 && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border-2 border-green-300 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-green-200">
                            <DollarSign size={22} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Deposit Paid / 订金</p>
                            <p className="text-lg font-black text-green-700">${selectedRepair.deposit.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Remaining</p>
                          <p className="text-lg font-black text-green-700">${(selectedRepair.price - selectedRepair.deposit).toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10">
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Password</p>
                        <p className="text-sm font-bold text-on-surface">{selectedRepair.password || 'None'}</p>
                      </div>
                      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10">
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">IMEI</p>
                        <p className="text-sm font-bold text-on-surface truncate">{selectedRepair.imei || 'N/A'}</p>
                      </div>
                    </div>

                    <div className={cn(
                      "p-4 rounded-2xl flex items-center gap-3",
                      selectedRepair.liquidDamage ? "bg-error/10 text-error" : "bg-success/10 text-success"
                    )}>
                      <Droplets size={18} />
                      <span className="text-xs font-black uppercase tracking-widest">
                        {selectedRepair.liquidDamage ? 'Liquid Damage Detected' : 'No Liquid Damage'}
                      </span>
                    </div>

                    {selectedRepair.remark && (
                      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10">
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Remark</p>
                        <p className="text-sm font-bold text-on-surface whitespace-pre-wrap">{selectedRepair.remark}</p>
                      </div>
                    )}

                    <div className="pt-4 flex flex-col gap-3">
                      <div className="flex gap-3">
                        <button 
                          onClick={() => openEditRepairModal(selectedRepair)}
                          className="flex-1 py-4 bg-secondary-container text-on-secondary-container rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <Edit3 size={16} />
                          Edit Record
                        </button>
                        <button 
                          onClick={() => setSelectedRepair(null)}
                          className="flex-1 py-4 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                          Close Details
                        </button>
                      </div>
                      
                      {/* Notify Part Arrival Button */}
                      <button 
                        onClick={() => handleNotifyPart(selectedRepair, selectedCustomer)}
                        disabled={partNotifiedId === selectedRepair.id}
                        className={cn(
                          "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                          partNotifiedId === selectedRepair.id 
                            ? "bg-green-500 text-white" 
                            : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        )}
                      >
                        {partNotifiedId === selectedRepair.id ? (
                          <>
                            <Check size={16} />
                            Notification Sent
                          </>
                        ) : (
                          <>
                            <Package size={16} />
                            Notify Part Arrival
                          </>
                        )}
                      </button>

                      <button 
                        onClick={() => setIsConfirmingDeleteRepair(true)}
                        className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-error bg-error/10 hover:bg-error/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
                        Delete Repair Record
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View All Orders Modal */}
      <AnimatePresence>
        {isViewingAllOrders && (
          <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViewingAllOrders(false)}
              className="absolute inset-0 bg-on-surface/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-surface-container-low rounded-[2.5rem] shadow-2xl overflow-hidden border border-outline-variant/10"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-primary tracking-tight">Order History</h3>
                    <p className="text-on-surface-variant text-sm font-bold">All repairs for {selectedCustomer.name}</p>
                  </div>
                  <button 
                    onClick={() => setIsViewingAllOrders(false)}
                    className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {selectedCustomer.repairs.map((repair) => (
                    <div 
                      key={repair.id}
                      onClick={() => {
                        setSelectedRepair(repair);
                        setIsViewingAllOrders(false);
                      }}
                      className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between border border-outline-variant/5 hover:border-primary/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-xl text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-on-surface">{repair.repairItem}</h4>
                          <p className="text-xs font-bold text-on-surface-variant">{repair.modelNumber}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRepair(repair);
                              setIsConfirmingDeleteRepair(true);
                            }}
                            className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            title="Delete Repair Record"
                          >
                            <Trash2 size={16} />
                          </button>
                          <p className="font-black text-primary text-lg">${repair.price.toFixed(2)}</p>
                        </div>
                        {(repair.deposit || 0) > 0 && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-green-100 text-green-700 border border-green-200">
                            💰 Deposit: ${repair.deposit.toFixed(2)}
                          </span>
                        )}
                        <div className="flex flex-col items-end gap-1 mt-1">
                           <span 
                            onClick={(e) => { e.stopPropagation(); toggleRepairStatus(selectedCustomer.id, repair.id, repair.status); }}
                            className={cn(
                              "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter transition-all",
                              (repair.status === 'In Processing' || repair.status === 'waiting for pay') && "cursor-pointer hover:opacity-70 active:scale-95",
                              repair.status === 'Urgent' ? "bg-error-container text-on-error-container" :
                              (repair.status === 'In Processing' || repair.status === 'waiting for pay') ? "bg-tertiary-container text-on-tertiary-container" :
                              repair.status === 'Ready for Pickup' ? "bg-success-container text-on-success-container" :
                              "bg-surface-container-highest text-on-surface-variant"
                            )}
                          >
                            {repair.status === 'waiting for pay' ? 'Waiting Part/Pay' : repair.status}
                          </span>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                            {new Date(repair.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Total Price</p>
                    <p className="text-2xl font-black text-primary">${selectedCustomer.totalSpent.toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => setIsViewingAllOrders(false)}
                    className="px-8 py-3.5 bg-surface-container-highest text-on-surface font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-outline-variant/20 transition-all"
                  >
                    Close History
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isConfirmingDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmingDelete(false)}
              className="absolute inset-0 bg-on-surface/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-surface-container-low rounded-[2.5rem] shadow-2xl overflow-hidden border border-outline-variant/10 p-8 text-center"
            >
              <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-on-surface mb-2">Delete Profile?</h3>
              <p className="text-on-surface-variant font-medium mb-8">
                This action is permanent and will delete all repair history for <strong>{selectedCustomer.name}</strong>.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsConfirmingDelete(false)}
                  className="flex-1 py-4 bg-surface-container-high text-on-surface-variant rounded-2xl font-black text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteCustomer}
                  className="flex-1 py-4 bg-error text-on-error rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-error/20"
                >
                  Delete Now
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
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmingDeleteRepair(false)}
              className="absolute inset-0 bg-on-surface/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-surface-container-low rounded-[2.5rem] shadow-2xl overflow-hidden border border-outline-variant/10 p-8 text-center"
            >
              <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-on-surface mb-2">Delete Record?</h3>
              <p className="text-on-surface-variant font-medium mb-8">
                Are you sure you want to delete this specific repair record? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsConfirmingDeleteRepair(false)}
                  className="flex-1 py-4 bg-surface-container-high text-on-surface-variant rounded-2xl font-black text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteRepair}
                  className="flex-1 py-4 bg-error text-on-error rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-error/20"
                >
                  Delete Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowQR(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-sm bg-surface-container-lowest rounded-[2rem] shadow-2xl p-8 flex flex-col items-center"
            >
               <h3 className="text-xl font-black text-on-surface mb-2 tracking-tight">Client Portal QR</h3>
               <p className="text-center text-sm font-medium text-on-surface-variant mb-8 leading-relaxed">Customers can scan this code to drop-off a new repair or track their live ticket status.</p>
               
               <div className="p-4 bg-white rounded-3xl shadow-lg border border-outline-variant/10 mb-8 transform hover:scale-105 transition-transform">
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(getPortalUrl())}`} alt="Portal QR" className="w-48 h-48 rounded-2xl" />
               </div>

               <p className="text-[10px] font-black text-primary uppercase tracking-widest text-center bg-primary/10 px-4 py-2 rounded-full">Point phone camera here</p>

               <button 
                  onClick={() => setShowQR(false)}
                  className="absolute top-4 right-4 p-2 bg-surface-container-high rounded-full hover:bg-surface-container-highest transition-colors text-on-surface-variant"
               >
                 <X size={20} />
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <button 
        onClick={() => setShowQR(true)}
        className="fixed right-6 bottom-24 md:bottom-8 bg-primary text-on-primary w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-[90] ring-4 ring-primary/20 hover:ring-primary/40"
      >
        <QrCode size={24} />
      </button>

      <RepairTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        repair={selectedRepair}
        customer={selectedCustomer}
        t={t}
      />

      {/* IMEI Camera Scanner Overlay */}
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
