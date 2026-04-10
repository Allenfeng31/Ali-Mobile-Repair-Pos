import React, { useState } from 'react';
import { 
  Smartphone, 
  Battery, 
  Wrench, 
  Camera, 
  Plus, 
  Trash2, 
  Printer, 
  ShoppingCart,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  UserPlus,
  UserCircle,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomerReservation, Customer, InventoryItem, Order, OrderItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { InvoiceModal } from '../components/InvoiceModal';
import { api } from '../lib/api';

interface TerminalViewProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  cart: any[];
  setCart: React.Dispatch<React.SetStateAction<any[]>>;
  categories: string[];
  brands: string[];
  t: (section: string, key: string) => string;
}

export function TerminalView({ inventory, setInventory, orders, setOrders, cart, setCart, categories, brands, t }: TerminalViewProps) {
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [activeBrand, setActiveBrand] = useState('All Brands');

  // Strip P/T/C/W prefix for display ("C MacBook" → "MacBook", "P iPhone" → "iPhone")
  const getDisplayBrand = (br: string) => {
    if (br === 'All Brands') return t('term', 'brandAll');
    if (/^[PTCWptcw] .+/.test(br)) return br.slice(2).trim();
    return br;
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'eftpos' | 'mixed'>('cash');
  const [mixedCash, setMixedCash] = useState<number>(0);
  const [mixedEftpos, setMixedEftpos] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [numpadItem, setNumpadItem] = useState<any | null>(null);
  const [numpadValue, setNumpadValue] = useState('');
  const [isFirstStroke, setIsFirstStroke] = useState(true);

  // RESERVATIONS STATE
  const [reservations, setReservations] = useState<CustomerReservation[]>([]);
  const [activeReservationId, setActiveReservationId] = useState<string | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDepositPayment, setIsDepositPayment] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [generalCart, setGeneralCart] = useState<any[]>(cart);
  const [reservationSearch, setReservationSearch] = useState('');
  const [selectedCusts, setSelectedCusts] = useState<{id:string, name:string, phone:string}[]>([]);

  // Load settings on mount
  React.useEffect(() => {
    api.getSettings().then(settings => {
      if (settings.ali_pos_reservations) {
        try {
          setReservations(JSON.parse(settings.ali_pos_reservations));
        } catch(e) {}
      }
    });
    api.getCustomers().then(custs => {
      setCustomers(custs);
    });
  }, []);

  const prevReservationIdRef = React.useRef(activeReservationId);
  React.useEffect(() => {
    if (prevReservationIdRef.current === activeReservationId) {
      if (activeReservationId) {
         const updated = reservations.map(r => r.id === activeReservationId ? { ...r, items: cart } : r);
         setReservations(updated);
         api.updateSetting('ali_pos_reservations', JSON.stringify(updated)).catch(console.error);
      } else {
         setGeneralCart(cart);
      }
    }
    prevReservationIdRef.current = activeReservationId;
  }, [cart, activeReservationId]);

  const switchContext = (resId: string | null) => {
    if (resId === activeReservationId) {
      setActiveReservationId(null);
      setCart(generalCart);
      return;
    }
    if (resId === null) {
      setActiveReservationId(null);
      setCart(generalCart);
    } else {
      setActiveReservationId(resId);
      const res = reservations.find(r => r.id === resId);
      if (res) setCart(res.items);
    }
  };

  const createReservation = async () => {
    if (selectedCusts.length === 0) return;
    
    let existingRes = reservations.find(r => 
      r.status !== 'completed' && 
      r.customers.some(rc => selectedCusts.some(sc => sc.id === rc.id))
    );

    let updated = [...reservations];
    
    if (existingRes) {
       if (existingRes.status === 'hidden') {
         const resurrected = { ...existingRes, status: 'active' as const };
         updated = updated.map(r => r.id === resurrected.id ? resurrected : r);
         setReservations(updated);
         await api.updateSetting('ali_pos_reservations', JSON.stringify(updated));
       }
       setShowReservationModal(false);
       setSelectedCusts([]);
       switchContext(existingRes.id);
       return;
    }

    const newRes: CustomerReservation = {
      id: `RES-${Math.random().toString(36).substring(2,9).toUpperCase()}`,
      customers: selectedCusts,
      items: [],
      depositPaid: 0,
      totalAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };
    updated = [newRes, ...reservations];
    setReservations(updated);
    await api.updateSetting('ali_pos_reservations', JSON.stringify(updated));
    setShowReservationModal(false);
    setSelectedCusts([]);
    switchContext(newRes.id);
  };

  const removeReservation = async (e: React.MouseEvent, resId: string) => {
    e.stopPropagation();
    const updatedRes = reservations.map(r => r.id === resId ? { ...r, status: 'hidden' as const } : r);
    setReservations(updatedRes);
    await api.updateSetting('ali_pos_reservations', JSON.stringify(updatedRes));
    if (activeReservationId === resId) {
      switchContext(null);
    }
  };


  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeBrand, searchQuery]);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat === 'All Items' || activeCategory === cat ? 'All Items' : cat);
    setCurrentPage(1);
  };

  const handleBrandClick = (br: string) => {
    setActiveBrand(br === 'All Brands' || activeBrand === br ? 'All Brands' : br);
    setCurrentPage(1);
  };

  const filteredItems = inventory.filter(item => {
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(Boolean);
    const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => 
      (item.name || '').toLowerCase().includes(term) || 
      (item.model || '').toLowerCase().includes(term) ||
      (item.sku && item.sku.toLowerCase().includes(term))
    );

    // If there's a search query, prioritize it and ignore category/brand filters (Global Search)
    if (searchQuery.trim() !== '') {
      return matchesSearch;
    }

    const itemCat = item.category || '';
    const matchesCategory = activeCategory === 'All Items' || itemCat === activeCategory;
    
    // For legacy items without brand string formats, we guess by seeing if brand substring is in their name or model
    const matchesBrand = activeBrand === 'All Brands' || 
                         item.brand === activeBrand || 
                         ((!item.brand || item.brand === 'Other') && 
                          ((item.name || '').toLowerCase().includes(activeBrand.toLowerCase()) || 
                           (item.model || '').toLowerCase().includes(activeBrand.toLowerCase())));
                           
    return matchesCategory && matchesBrand;
  }).sort((a, b) => {
    // When showing all items, Accessories always floats to top
    if (activeCategory === 'All Items') {
      const aIsAcc = (a.category || '') === 'Accessories';
      const bIsAcc = (b.category || '') === 'Accessories';
      if (aIsAcc && !bIsAcc) return -1;
      if (!aIsAcc && bIsAcc) return 1;
    }
    // Treat string/number IDs implicitly casting correctly natively
    const idA = typeof a.id === 'string' ? parseInt(a.id, 10) || 0 : a.id;
    const idB = typeof b.id === 'string' ? parseInt(b.id, 10) || 0 : b.id;
    return idB - idA;
  });

  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const displayBrands = ['All Brands', ...brands];
  const displayCategories = ['All Items', ...categories];


  const addToCart = (item: any) => {
    if (searchQuery) setSearchQuery('');
    setCart(prev => {
      const existing = prev.find(i => i.name === item.name);
      if (existing) {
        return prev.map(i => i.name === item.name ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { 
        id: Math.random().toString(36).substr(2, 9), 
        name: item.name, 
        sku: `SKU-${item.name.substring(0, 3).toUpperCase()}`, 
        price: item.price, 
        qty: 1, 
        icon: item.icon 
      }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const handleAction = async () => {
    setIsConfirming(false);
    setIsProcessing(true);
    setSuccessMessage(null);
    
    try {
      // Calculate totals
      let grossMSRP = 0;
      let rawTotal = 0;
      let percentDiscountableTotal = 0;
      
      cart.forEach(item => {
        let currentPrice = item.price;
        let isMarkupOrZero = false;

        if (item.overridePrice !== undefined) {
          if (item.overridePrice < item.price) {
            grossMSRP += item.price * item.qty;
            rawTotal += item.overridePrice * item.qty;
            currentPrice = item.overridePrice;
          } else {
            grossMSRP += item.overridePrice * item.qty;
            rawTotal += item.overridePrice * item.qty;
            currentPrice = item.overridePrice;
            if (item.overridePrice > item.price) isMarkupOrZero = true;
          }
        } else {
          grossMSRP += item.price * item.qty;
          rawTotal += item.price * item.qty;
        }

        if (item.price === 0 || isMarkupOrZero) {
          // Exempt from global % discount
        } else {
          percentDiscountableTotal += currentPrice * item.qty;
        }
      });

      const lineDiscountAmount = grossMSRP - rawTotal;
      const percentDiscountAmount = percentDiscountableTotal * (discountPercent / 100);
      const totalDiscountAmount = lineDiscountAmount + percentDiscountAmount;

      const activeRes = reservations.find(r => r.id === activeReservationId);
      const isFinalCheckoutForRes = (!isDepositPayment && activeRes && activeRes.depositPaid > 0);
      const depositDiscount = isFinalCheckoutForRes ? activeRes!.depositPaid : 0;

      let baseTotal = rawTotal - percentDiscountAmount;
      const originalBaseTotal = baseTotal;
      baseTotal = Math.max(0, baseTotal - depositDiscount);

      const gst = baseTotal / 11;
      
      let surcharge = 0;
      if (paymentMethod === 'eftpos') {
        surcharge = baseTotal * 0.015;
      } else if (paymentMethod === 'mixed') {
        surcharge = mixedEftpos * 0.015;
      }
      
      const finalTotal = baseTotal + surcharge;

      // Calculate profit for the order
      let totalProfit = -totalDiscountAmount;
      const orderItems: OrderItem[] = cart.map(item => {
        const invItem = inventory.find(i => i.name === item.name);
        const cost = invItem ? invItem.costPrice : 0;
        
        let loggedPrice = item.price;
        if (item.overridePrice !== undefined && item.overridePrice > item.price) {
          loggedPrice = item.overridePrice; // Log at bumped price
        }

        totalProfit += (loggedPrice - cost) * item.qty;
        return {
          id: item.id,
          name: item.name,
          sku: item.sku,
          price: loggedPrice,
          qty: item.qty,
          category: invItem ? invItem.category : 'General'
        };
      });

      if (totalDiscountAmount > 0) {
        let discountName = `Discount`;
        if (percentDiscountAmount > 0 && lineDiscountAmount > 0) discountName = `Combined Discounts & Savings`;
        else if (lineDiscountAmount > 0) discountName = `Line Item Savings`;
        else discountName = `Discount (${discountPercent}%)`;

        orderItems.push({
          id: `DISC-${Math.random().toString(36).substr(2, 9)}`,
          name: discountName,
          sku: 'DISCOUNT',
          price: -totalDiscountAmount,
          qty: 1,
          category: 'Adjustment'
        });
      }

      if (isFinalCheckoutForRes && depositDiscount > 0) {
        orderItems.push({
          id: `DEP-APPLY-${Math.random().toString(36).substring(2, 6)}`,
          name: `Previous Deposit Applied`,
          sku: `DEP-APPLIED`,
          price: -depositDiscount,
          qty: 1,
          category: 'Adjustment'
        });
      }

      let newOrder: Order;

      if (isDepositPayment) {
        newOrder = {
          id: `DEP-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toISOString(),
          items: [{
            id: `DEP-ITEM`,
            name: `Deposit Payment${activeRes ? ` - ${activeRes.customers.map(c => c.name).join(', ')}` : ''}`,
            sku: 'DEPOSIT',
            price: depositAmount,
            qty: 1,
            category: 'Adjustment'
          }],
          subtotal: depositAmount,
          tax: 0,
          surcharge: surcharge,
          total: depositAmount + surcharge,
          profit: depositAmount,
          type: 'deposit',
          paymentMethod: paymentMethod,
          mixedCash: paymentMethod === 'mixed' ? mixedCash : undefined,
          mixedEftpos: paymentMethod === 'mixed' ? mixedEftpos : undefined,
          depositAmount: depositAmount,
          outstandingAmount: activeRes ? (finalTotal - (activeRes.depositPaid + depositAmount)) : 0,
          reservationCustomers: activeRes ? activeRes.customers : []
        };

        if (activeRes) {
           const newPaid = activeRes.depositPaid + depositAmount;
           const updatedRes = reservations.map(r => r.id === activeRes.id ? { ...r, depositPaid: newPaid, totalAmount: finalTotal } : r);
           setReservations(updatedRes);
           await api.updateSetting('ali_pos_reservations', JSON.stringify(updatedRes));
           
           for (const cust of activeRes.customers) {
              const fullCustomer = customers.find(c => c.id === cust.id);
              if (fullCustomer) {
                  const cartItemNames = cart.map(i => i.name).join(', ');
                  
                  const inProcRepair = fullCustomer.repairs?.find(r => r.status === 'In Processing');
                  if (inProcRepair) {
                     const updatedRepairItem = inProcRepair.repairItem + (cartItemNames ? ` + Part Booking: ${cartItemNames}` : '');
                     const existingRemark = inProcRepair.remark ? inProcRepair.remark + '\n' : '';
                     const newRemark = existingRemark + `Layaway booked. Added parts: ${cartItemNames}. Deposit Paid: $${depositAmount.toFixed(2)}, Outstanding: $${(finalTotal - newPaid).toFixed(2)}`;
                     
                     await api.updateRepair(inProcRepair.id, {
                        repairItem: updatedRepairItem,
                        remark: newRemark
                     });
                  }
                  
                  await api.updateCustomer(cust.id, {
                     totalSpent: fullCustomer.totalSpent + depositAmount
                  });
              }
           }
        }
      } else {
        newOrder = {
          id: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toISOString(),
          items: orderItems,
          subtotal: baseTotal - gst,
          tax: gst,
          surcharge: surcharge,
          total: finalTotal,
          profit: totalProfit,
          type: orderItems.some(i => (i.category || '').toLowerCase().includes('repair') || (i.category || '').toLowerCase().includes('service')) ? 'repair' : 'sale',
          paymentMethod: paymentMethod,
          mixedCash: paymentMethod === 'mixed' ? mixedCash : undefined,
          mixedEftpos: paymentMethod === 'mixed' ? mixedEftpos : undefined
        };

        // Deduct stock from inventory
        const updatedInventory = [...inventory];
        for (const cartItem of cart) {
          const invItemIndex = updatedInventory.findIndex(i => i.name === cartItem.name);
          if (invItemIndex !== -1) {
            const invItem = updatedInventory[invItemIndex];
            const newStock = Math.max(0, invItem.stock - cartItem.qty);
            const updateData = { 
              stock: newStock, 
              status: newStock <= invItem.minStock ? 'low-stock' : invItem.status 
            };
            await api.updateInventoryItem(invItem.id, updateData);
            updatedInventory[invItemIndex] = { ...invItem, ...updateData };
          }
        }
        setInventory(updatedInventory);
        
        // If it was a layaway payout, mark it completed or remove it
        if (activeRes) {
          const updatedRes = reservations.filter(r => r.id !== activeRes.id);
          setReservations(updatedRes);
          await api.updateSetting('ali_pos_reservations', JSON.stringify(updatedRes));
          setActiveReservationId(null);
        }
      }

      await api.createOrder(newOrder);

      setOrders(prev => [newOrder, ...prev]);
      setLastOrder(newOrder);

      setOrders(prev => [newOrder, ...prev]);
      setLastOrder(newOrder);
      setShowInvoice(true);
      setInventory(updatedInventory);
      setCart([]);
      setDiscountPercent(0);
      
      setSuccessMessage(t('term', 'success'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setSuccessMessage(t('term', 'fail'));
    } finally {
      setIsProcessing(false);
    }
  };

  let grossMSRP = 0;
  let rawTotal = 0;
  let percentDiscountableTotal = 0;

  cart.forEach(item => {
    let currentPrice = item.price;
    let isMarkupOrZero = false;

    if (item.overridePrice !== undefined) {
      if (item.overridePrice < item.price) {
        grossMSRP += item.price * item.qty;
        rawTotal += item.overridePrice * item.qty;
        currentPrice = item.overridePrice;
      } else {
        grossMSRP += item.overridePrice * item.qty;
        rawTotal += item.overridePrice * item.qty;
        currentPrice = item.overridePrice;
        if (item.overridePrice > item.price) isMarkupOrZero = true;
      }
    } else {
      grossMSRP += item.price * item.qty;
      rawTotal += item.price * item.qty;
    }

    if (item.price === 0 || isMarkupOrZero) {
      // Exempt from global % discount
    } else {
      percentDiscountableTotal += currentPrice * item.qty;
    }
  });

  const lineDiscountAmount = grossMSRP - rawTotal;
  const percentDiscountAmount = percentDiscountableTotal * (discountPercent / 100);
  const totalDiscountAmount = lineDiscountAmount + percentDiscountAmount;

  const baseTotal = rawTotal - percentDiscountAmount;
  const gst = baseTotal / 11;
  
  let surcharge = 0;
  if (paymentMethod === 'eftpos') {
    surcharge = baseTotal * 0.015;
  } else if (paymentMethod === 'mixed') {
    surcharge = mixedEftpos * 0.015;
  }
  
  const finalTotal = baseTotal + surcharge;

  // Sync mixed values when total changes or mode changes to mixed
  React.useEffect(() => {
    if (paymentMethod === 'mixed' && mixedCash === 0 && mixedEftpos === 0) {
      setMixedCash(baseTotal);
      setMixedEftpos(0);
    }
  }, [paymentMethod, baseTotal]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Selection */}
      <div className="lg:col-span-8 space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">{t('term', 'terminalConsole')}</h2>
          <p className="text-on-surface-variant text-sm font-medium">{t('term', 'selectComponents')}</p>
        </div>

        {/* Search and Categories */}
        <div className="space-y-4">
          <div className="relative">
            <input 
              type="text"
              placeholder={t('term', 'searchProducts')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                  setSearchQuery('');
                }
              }}
              className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl py-3 px-11 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50">
              <Search size={18} />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-outline-variant/10">
            {displayCategories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={cn(
                  "px-4 py-3 rounded-t-xl font-bold text-xs whitespace-nowrap transition-all border-b-2",
                  activeCategory === cat 
                    ? "border-primary text-primary bg-primary/5" 
                    : "border-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                )}
              >
                {cat === 'All Items' ? t('term', 'categoryAll') : cat}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 pt-2 no-scrollbar animate-in fade-in slide-in-from-top-1">
            {displayBrands.map(br => (
              <button
                key={br}
                onClick={() => handleBrandClick(br)}
                className={cn(
                  "px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all",
                  activeBrand === br 
                    ? "bg-secondary-container text-on-secondary-container shadow-sm border border-secondary/20" 
                    : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/5 hover:text-on-surface"
                )}
              >
                {br === 'All Brands' ? t('term', 'brandAll') : getDisplayBrand(br)}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 auto-rows-fr">
          {currentItems.map(item => (
            <div 
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-surface-container-lowest p-3 rounded-xl transition-all hover:ring-2 hover:ring-primary/20 group cursor-pointer relative overflow-hidden border border-outline-variant/5 flex flex-col justify-between h-full min-h-[140px]"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="p-1.5 rounded-lg bg-primary-container/10 text-primary">
                    <item.icon size={18} />
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60 bg-surface-container px-1.5 py-0.5 rounded">{(item.category || '').split(' ')[0]}</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-on-surface text-base leading-tight line-clamp-2">{item.name}</h3>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-outline-variant/5">
                <span className="text-primary font-black text-sm">${item.price.toFixed(2)}</span>
                <div className="w-6 h-6 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 group-hover:scale-110">
                  <Plus size={14} />
                </div>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full py-10 text-center">
              <p className="text-on-surface-variant text-sm italic">{t('term', 'noItemsFound')}</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-surface-container text-on-surface rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-surface-container-high transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-bold text-on-surface-variant">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-sm disabled:opacity-50 hover:opacity-90 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Cart */}
      <aside className="lg:col-span-4 bg-surface-container-lowest lg:border-l border-outline-variant/10 p-6 flex flex-col rounded-3xl lg:rounded-none">
        
        {/* Reservations Box */}
        <div className="mb-6 bg-secondary-container/20 rounded-2xl p-4 border border-secondary/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-on-surface flex items-center gap-2">
              <UserCircle size={16} className="text-primary" />
              Customer Reservations
            </h3>
            <button 
              onClick={() => setShowReservationModal(true)}
              className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto no-scrollbar">
            {reservations.filter(r => r.status !== 'hidden').length === 0 ? (
              <p className="text-[10px] text-on-surface-variant italic text-center py-2">No active reservations.</p>
            ) : (
              reservations.filter(r => r.status !== 'hidden').map(res => (
                <div 
                  key={res.id} 
                  onClick={() => switchContext(res.id)}
                  className={cn(
                    "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                    activeReservationId === res.id 
                      ? "bg-primary text-on-primary border-primary shadow-sm"
                      : "bg-surface-container hover:bg-surface-container-high border-outline-variant/10"
                  )}
                >
                  <div className="flex flex-col gap-0.5 max-w-[65%]">
                    <span className="font-bold text-xs truncate">
                      {res.customers.length > 0 ? res.customers.map(c => c.name).join(', ') : 'Unnamed'}
                    </span>
                    <span className="text-[9px] opacity-80">{res.items.length} items</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xs">${res.depositPaid.toFixed(2)} paid</span>
                    <button 
                      onClick={(e) => removeReservation(e, res.id)}
                      className={cn("p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity", 
                        activeReservationId === res.id ? "hover:bg-primary-container text-on-primary" : "hover:bg-error/10 text-error"
                      )}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-extrabold tracking-tight">
            {activeReservationId ? 'Reservation Cart' : t('term', 'currentCart')}
          </h2>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <ShoppingCart size={16} />
            <span className="text-xs font-bold">{cart.length} {t('term', 'items')}</span>
          </div>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-teal-50 text-teal-700 text-xs font-bold rounded-xl border border-teal-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={16} />
            {successMessage}
          </div>
        )}

        <div className="flex-grow space-y-6 overflow-y-auto max-h-[500px] pr-2 no-scrollbar">
          {cart.map(item => (
            <div key={item.id} className="flex items-start gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
                <item.icon className="text-primary" size={20} />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-base text-on-surface leading-tight">{item.name}</h4>
                  <div className="flex flex-col items-end">
                    {item.overridePrice !== undefined && item.overridePrice < item.price && (
                      <span className="text-[10px] text-on-surface-variant line-through mb-0.5">${item.price.toFixed(2)}</span>
                    )}
                    <span 
                      className="font-bold text-sm cursor-pointer hover:text-primary hover:underline transition-colors px-1 -mr-1 rounded bg-primary/5 border border-primary/10"
                      title="Click to override price"
                      onClick={() => {
                        const currentVal = item.overridePrice !== undefined ? item.overridePrice : item.price;
                        setNumpadValue(currentVal.toString());
                        setNumpadItem(item);
                        setIsFirstStroke(true);
                      }}
                    >
                      ${(item.overridePrice !== undefined ? item.overridePrice : item.price).toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-wider font-semibold">SKU: {item.sku}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Trash2 
                    size={14} 
                    className="text-error cursor-pointer hover:scale-110 transition-transform" 
                    onClick={() => removeFromCart(item.id)}
                  />
                  <div className="flex items-center gap-2 ml-auto">
                    <button 
                      className="w-6 h-6 rounded bg-surface-container flex items-center justify-center text-xs font-bold hover:bg-surface-container-high"
                      onClick={() => updateQty(item.id, -1)}
                    >
                      -
                    </button>
                    <span className="text-xs font-bold">{item.qty}</span>
                    <button 
                      className="w-6 h-6 rounded bg-surface-container flex items-center justify-center text-xs font-bold hover:bg-surface-container-high"
                      onClick={() => updateQty(item.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="text-center py-10">
              <p className="text-on-surface-variant text-sm">{t('term', 'cartEmpty')}</p>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="mt-4 flex items-center justify-between bg-surface-container-high p-3 rounded-xl border border-outline-variant/10">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Apply Discount (%)</span>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                min="0"
                max="100"
                value={discountPercent === 0 ? '' : discountPercent}
                onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                placeholder="0"
                className="w-16 bg-surface-container-lowest border border-outline-variant/20 rounded-lg py-1.5 px-2 text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-sm font-bold text-on-surface">%</span>
            </div>
          </div>
        )}

        <div className="mt-4 pt-6 border-t border-outline-variant/20">
          <div className="space-y-2 mb-8">
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-sm font-medium">{t('term', 'subtotalExclGST')}</span>
              <span className="font-bold text-sm">${(baseTotal - gst).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-sm font-medium">{t('term', 'gst')}</span>
              <span className="font-bold text-sm">${gst.toFixed(2)}</span>
            </div>
            {paymentMethod === 'eftpos' && (
              <div className="flex justify-between animate-in fade-in slide-in-from-right-2">
                <span className="text-primary text-sm font-bold">EFTPOS Surcharge (1.5%)</span>
                <span className="text-primary font-bold text-sm">+${surcharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-4 border-t border-outline-variant/10 mt-2">
              <span className="text-lg font-extrabold">{t('term', 'totalAmount')}</span>
              <span className="text-2xl font-black text-primary">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              disabled={cart.length === 0 || isProcessing}
              onClick={() => setIsConfirming(true)}
              className="w-full py-4 rounded-xl signature-gradient text-on-primary font-bold text-base flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 size={20} />
              {isProcessing ? t('term', 'processing') : t('term', 'confirm')}
            </button>
          </div>
        </div>
      </aside>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirming && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-28 md:pb-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirming(false)}
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
                  <div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center text-primary">
                    <ShoppingCart size={24} />
                  </div>
                  <button 
                    onClick={() => setIsConfirming(false)}
                    className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-on-surface">{t('term', 'orderSummary')}</h3>
                  <p className="text-on-surface-variant font-medium">
                    {t('term', 'reviewItems')}
                  </p>
                </div>

                {/* Item List */}
                <div className="max-h-48 overflow-y-auto space-y-3 pr-2 no-scrollbar border-y border-outline-variant/10 py-4">
                  {cart.map(item => {
                    const loggedPrice = (item.overridePrice !== undefined && item.overridePrice > item.price) ? item.overridePrice : item.price;
                    return (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                          <span className="font-bold text-on-surface">{item.name}</span>
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">{t('term', 'qty')}: {item.qty} × ${loggedPrice.toFixed(2)}</span>
                        </div>
                        <span className="font-bold text-primary">${(loggedPrice * item.qty).toFixed(2)}</span>
                      </div>
                    );
                  })}
                  {totalDiscountAmount > 0 && (
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-outline-variant/5">
                      <span className="font-bold text-on-surface italic">
                        {percentDiscountAmount > 0 && lineDiscountAmount > 0 ? `Combined Discounts & Savings` : lineDiscountAmount > 0 ? `Line Item Savings` : `Discount (${discountPercent}%)`}
                      </span>
                      <span className="font-bold text-error">-${totalDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Payment Selection */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{t('term', 'paymentMethod')}</span>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={cn(
                        "py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border-2",
                        paymentMethod === 'cash' 
                          ? "bg-primary/10 border-primary text-primary" 
                          : "bg-surface-container-low border-transparent text-on-surface-variant hover:bg-surface-container-high"
                      )}
                    >
                      {t('term', 'cash')}
                    </button>
                    <button
                      onClick={() => setPaymentMethod('eftpos')}
                      className={cn(
                        "py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border-2",
                        paymentMethod === 'eftpos' 
                          ? "bg-primary/10 border-primary text-primary" 
                          : "bg-surface-container-low border-transparent text-on-surface-variant hover:bg-surface-container-high"
                      )}
                    >
                      {t('term', 'eftpos')}
                    </button>
                    <button
                      onClick={() => {
                        setPaymentMethod('mixed');
                        if (mixedCash === 0 && mixedEftpos === 0) {
                          setMixedCash(baseTotal);
                          setMixedEftpos(0);
                        }
                      }}
                      className={cn(
                        "py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border-2",
                        paymentMethod === 'mixed' 
                          ? "bg-primary/10 border-primary text-primary" 
                          : "bg-surface-container-low border-transparent text-on-surface-variant hover:bg-surface-container-high"
                      )}
                    >
                      {t('term', 'mixed')}
                    </button>
                  </div>

                  {paymentMethod === 'mixed' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="grid grid-cols-2 gap-4 pt-2"
                    >
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Cash Amount</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                          <input 
                            type="number"
                            value={mixedCash || ''}
                            onChange={(e) => {
                              const val = Math.min(baseTotal, Math.max(0, Number(e.target.value)));
                              setMixedCash(val);
                              setMixedEftpos(Number((baseTotal - val).toFixed(2)));
                            }}
                            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3 pl-7 pr-3 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Card Amount</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                          <input 
                            type="number"
                            value={mixedEftpos || ''}
                            onChange={(e) => {
                              const val = Math.min(baseTotal, Math.max(0, Number(e.target.value)));
                              setMixedEftpos(val);
                              setMixedCash(Number((baseTotal - val).toFixed(2)));
                            }}
                            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3 pl-7 pr-3 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Deposit Payment Toggle (only if active reservation) */}
                  {activeReservationId && (
                    <div className="pt-3 border-t border-outline-variant/10">
                      <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-surface-container transition-colors">
                        <input 
                          type="checkbox" 
                          checked={isDepositPayment} 
                          onChange={(e) => setIsDepositPayment(e.target.checked)}
                          className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-bold text-on-surface">Process as Deposit Payment</span>
                      </label>
                      
                      <AnimatePresence>
                        {isDepositPayment && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 space-y-1.5 overflow-hidden"
                          >
                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Deposit Amount to Pay</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-black">$</span>
                              <input 
                                type="number"
                                value={depositAmount || ''}
                                onChange={(e) => setDepositAmount(Math.max(0, Number(e.target.value)))}
                                className="w-full bg-primary/5 border border-primary/20 rounded-xl py-3 pl-7 pr-3 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/40 text-primary"
                                placeholder="0.00"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <div className="bg-surface-container-low rounded-2xl p-5 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant">
                    <span>{t('term', 'subtotalInclGST')}</span>
                    <span>${baseTotal.toFixed(2)}</span>
                  </div>
                  {paymentMethod === 'eftpos' && (
                    <div className="flex justify-between items-center text-xs font-bold text-primary">
                      <span>EFTPOS Surcharge (1.5%)</span>
                      <span>${surcharge.toFixed(2)}</span>
                    </div>
                  )}
                  {paymentMethod === 'mixed' && (
                    <>
                      <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant opacity-70">
                        <span>Cash Portion</span>
                        <span>${mixedCash.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant opacity-70">
                        <span>Card Portion (Subtotal)</span>
                        <span>${mixedEftpos.toFixed(2)}</span>
                      </div>
                      {surcharge > 0 && (
                        <div className="flex justify-between items-center text-[10px] font-bold text-primary">
                          <span>Card Surcharge (1.5%)</span>
                           <span>${surcharge.toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-outline-variant/10">
                    <span className="text-sm font-bold text-on-surface uppercase tracking-widest">Total Amount</span>
                    <span className="text-2xl font-black text-primary">${finalTotal.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-on-surface-variant text-right italic">
                    Includes GST of ${gst.toFixed(2)}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsConfirming(false)}
                    className="flex-1 py-4 bg-surface-container-high text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAction}
                    className="flex-1 py-4 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
                  >
                    Complete Order
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reservation Creation Modal */}
      <AnimatePresence>
        {showReservationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowReservationModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container-lowest rounded-[2rem] shadow-2xl overflow-hidden border border-outline-variant/10 p-6 flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4 mb-4">
                <h3 className="font-black text-xl text-on-surface flex items-center gap-2">
                  <UserPlus className="text-primary" size={20} />
                  New Customer Reservation
                </h3>
                <button onClick={() => setShowReservationModal(false)} className="w-8 h-8 bg-surface-container-high rounded-full flex items-center justify-center hover:bg-surface-container-highest transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto pr-2 no-scrollbar">
                {/* Search */}
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Search existing customers..."
                    value={reservationSearch}
                    onChange={(e) => setReservationSearch(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3 px-11 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50">
                    <Search size={16} />
                  </div>
                </div>

                {/* Selected */}
                {selectedCusts.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedCusts.map(sc => (
                      <div key={sc.id} className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 border border-primary/20">
                        {sc.name}
                        <X size={12} className="cursor-pointer hover:scale-125 transition-transform" onClick={() => setSelectedCusts(p => p.filter(c => c.id !== sc.id))} />
                      </div>
                    ))}
                  </div>
                )}

                {/* List */}
                <div className="space-y-2 mt-4">
                  <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest pl-1">In-Processing Customers</p>
                  {customers
                    .filter(c => c.repairs?.some(r => r.status === 'In Processing'))
                    .filter(c => c.name.toLowerCase().includes(reservationSearch.toLowerCase()) || c.phone.includes(reservationSearch))
                    .slice(0, 15).map(c => {
                      const isSel = selectedCusts.some(sc => sc.id === c.id);
                      const inProcRepairs = c.repairs?.filter(r => r.status === 'In Processing') || [];
                      return (
                        <div 
                          key={c.id} 
                          onClick={() => {
                            if (isSel) setSelectedCusts(p => p.filter(sc => sc.id !== c.id));
                            else setSelectedCusts(p => [...p, { id: c.id, name: c.name, phone: c.phone }]);
                          }}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                            isSel ? "border-primary bg-primary/5" : "border-outline-variant/10 bg-surface-container hover:border-primary/30"
                          )}
                        >
                          <div>
                            <p className="font-bold text-sm text-on-surface">{c.name}</p>
                            <p className="text-xs text-on-surface-variant">{c.phone}</p>
                            {inProcRepairs.length > 0 && (
                              <p className="text-[10px] text-primary/80 mt-1 font-semibold flex items-center gap-1">
                                <Wrench size={10} />
                                {inProcRepairs.map(r => r.modelNumber && r.modelNumber !== 'N/A' && r.modelNumber !== 'Layaway' ? r.modelNumber : r.repairItem).join(', ')}
                              </p>
                            )}
                          </div>
                          {isSel && <CheckCircle2 size={18} className="text-primary" />}
                        </div>
                      )
                  })}
                  {customers.filter(c => c.repairs?.some(r => r.status === 'In Processing')).length === 0 && (
                    <p className="text-xs text-on-surface-variant italic p-2">No customers are currently in processing.</p>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-auto border-t border-outline-variant/10">
                <button 
                  onClick={createReservation}
                  disabled={selectedCusts.length === 0}
                  className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold shadow-lg disabled:opacity-50 transition-all hover:opacity-90"
                >
                  Create Reservation Setup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <InvoiceModal 
        isOpen={showInvoice} 
        onClose={() => setShowInvoice(false)} 
        order={lastOrder} 
        t={t}
      />

      {/* Numeric Keypad Price Override Modal */}
      <AnimatePresence>
        {numpadItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pb-20 sm:pb-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => { setNumpadItem(null); setNumpadValue(''); }}
            />

            <motion.div
              className="relative w-full max-w-sm bg-surface-container rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 z-10 select-none"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest">Override Price</p>
                  <p className="font-bold text-on-surface text-sm truncate max-w-[220px]">{numpadItem.name}</p>
                </div>
                <button
                  onPointerDown={() => { setNumpadItem(null); setNumpadValue(''); }}
                  className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors active:scale-90"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Display */}
              <div className="bg-surface-container-high rounded-2xl px-5 py-4 mb-5 text-right border border-outline-variant/10">
                <p className="text-3xl font-black tracking-tight text-on-surface">
                  ${numpadValue || '0'}
                </p>
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3 touch-action-manipulation">
                {['7','8','9','4','5','6','1','2','3'].map(k => (
                  <button
                    key={k}
                  onPointerDown={() => {
                    setNumpadValue(prev => (isFirstStroke ? k : (prev === '0' ? k : prev + k)));
                    setIsFirstStroke(false);
                  }}
                    className="py-4 rounded-2xl bg-surface-container-high text-on-surface text-xl font-bold hover:bg-primary sm:hover:text-on-primary active:scale-95 active:bg-primary active:text-on-primary transition-all duration-75"
                  >
                    {k}
                  </button>
                ))}
                <button
                  onPointerDown={() => {
                    if (isFirstStroke) {
                      setNumpadValue('0.');
                    } else {
                      setNumpadValue(prev => prev.includes('.') ? prev : prev + '.');
                    }
                    setIsFirstStroke(false);
                  }}
                  className="py-4 rounded-2xl bg-surface-container-high text-on-surface text-xl font-bold hover:bg-surface-container-highest active:scale-95 active:bg-surface-container-highest transition-all duration-75"
                >
                  .
                </button>
                <button
                  onPointerDown={() => {
                    setNumpadValue(prev => (isFirstStroke ? '0' : (prev === '0' ? '0' : prev + '0')));
                    setIsFirstStroke(false);
                  }}
                  className="py-4 rounded-2xl bg-surface-container-high text-on-surface text-xl font-bold hover:bg-primary sm:hover:text-on-primary active:scale-95 active:bg-primary active:text-on-primary transition-all duration-75"
                >
                  0
                </button>
                <button
                  onPointerDown={() => {
                    setNumpadValue(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
                    setIsFirstStroke(false);
                  }}
                  className="py-4 rounded-2xl bg-surface-container-high text-error text-xl font-bold hover:bg-error-container active:scale-95 active:bg-error-container transition-all duration-75"
                >
                  ⌫
                </button>

                {/* Clear + Confirm spanning full row */}
                <button
                  onPointerDown={() => { setNumpadValue('0'); setIsFirstStroke(true); }}
                  className="col-span-1 py-4 rounded-2xl bg-surface-container-highest text-on-surface-variant text-base font-bold hover:bg-error-container hover:text-on-error-container active:scale-95 active:bg-error-container active:text-on-error-container transition-all duration-75"
                >
                  Clear
                </button>
                <button
                  onPointerDown={() => {
                    const val = parseFloat(numpadValue);
                    if (!isNaN(val) && val >= 0) {
                      setCart(prev => prev.map(i => i.id === numpadItem.id ? { ...i, overridePrice: val } : i));
                    }
                    setNumpadItem(null);
                    setNumpadValue('');
                  }}
                  className="col-span-2 py-4 rounded-2xl bg-primary text-on-primary text-base font-black shadow-lg shadow-primary/30 hover:opacity-90 active:scale-[0.98] transition-all duration-75"
                >
                  ✓ Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
