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
  Package,
  Tablet,
  Laptop,
  Watch,
  Headphones,
  Volume2,
  Mic,
  Wifi,
  Cpu,
  Layout as LayoutIcon,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InventoryItem, Order, OrderItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { InvoiceModal } from '../components/InvoiceModal';
import { api } from '../lib/api';
import { useScrollLock } from '../hooks/useScrollLock';
import { useAuthStore } from '../hooks/useAuthStore';

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

const getCategoryIcon = (name: string, category: string) => {
  if (!name) return Package;
  const n = name.toLowerCase();
  const c = (category || '').toLowerCase();

  if (n.includes('screen') || n.includes('lcd') || n.includes('display')) return Smartphone;
  if (n.includes('battery')) return Battery;
  if (n.includes('charging') || n.includes('port') || n.includes('charge')) return Zap;
  if (n.includes('camera')) return Camera;
  if (n.includes('housing') || n.includes('glass') || n.includes('back cover')) return LayoutIcon;
  if (n.includes('logic board') || n.includes('motherboard') || n.includes('ic ')) return Cpu;
  if (n.includes('speaker') || n.includes('buzzer')) return Volume2;
  if (n.includes('mic')) return Mic;
  if (n.includes('wifi') || n.includes('signal') || n.includes('antenna')) return Wifi;

  if (c.includes('phone')) return Smartphone;
  if (c.includes('tablet') || c.includes('ipad')) return Tablet;
  if (c.includes('laptop') || c.includes('macbook')) return Laptop;
  if (c.includes('watch')) return Watch;
  if (c.includes('accessory') || c.includes('accessories')) return Headphones;
  if (c.includes('service') || c.includes('repair')) return Wrench;
  if (c.includes('part')) return Zap;

  return Package;
};

const attachIcons = (items: any[]) => {
  return items.map(item => ({
    ...item,
    icon: getCategoryIcon(item.name, item.category || '')
  }));
};

export function TerminalView({ inventory, setInventory, orders, setOrders, cart, setCart, categories, brands, t }: TerminalViewProps) {
  const { permissions } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState('⭐ Quick Access');
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
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numpadItem, setNumpadItem] = useState<any | null>(null);
  const [numpadValue, setNumpadValue] = useState('');
  const [isFirstStroke, setIsFirstStroke] = useState(true);

  // Lock body scroll when any modal is open
  useScrollLock(isConfirming || showInvoice || !!numpadItem);


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
      (item.device_model || '').toLowerCase().includes(term) ||
      (item.brand || '').toLowerCase().includes(term) ||
      (item.sku || '').toLowerCase().includes(term) ||
      (item.category || '').toLowerCase().includes(term)
    );

    // If there's a search query, prioritize it and ignore category/brand filters (Global Search)
    if (searchQuery.trim() !== '') {
      return matchesSearch;
    }

    const itemCat = item.category || '';
    let matchesCategory = activeCategory === 'All Items' || itemCat === activeCategory;

    // Handle Quick Access specially
    if (activeCategory === '⭐ Quick Access') {
      return item.is_pinned === true;
    }

    if (!matchesCategory) {
      const migratedNameMap: Record<string, string> = {
        'Screen Repair': 'Screen Replacement',
        'Battery Service': 'Battery Replacement',
        'Charging Port': 'Charging Port Replacement',
        'Front Camera': 'Front Camera Replacement',
        'Back Camera': 'Back Camera Replacement',
        'Back Glass': 'Back Housing Replacement',
        'Back Housing': 'Back Housing Replacement'
      };
      if (migratedNameMap[activeCategory] && itemCat === migratedNameMap[activeCategory]) {
        matchesCategory = true;
      }
    }
    
    const cleanItemBrand = getDisplayBrand(item.brand || '');
    const cleanActiveBrand = getDisplayBrand(activeBrand);
    
    // Check direct equality, or prefix matching (P Apple === Apple), or fuzzy name match
    const matchesBrand = activeBrand === 'All Brands' || 
                         item.brand === activeBrand || 
                         cleanItemBrand === cleanActiveBrand ||
                         ((!item.brand || item.brand === 'Other') && 
                          ((item.name || '').toLowerCase().includes(cleanActiveBrand.toLowerCase()) || 
                           (item.model || '').toLowerCase().includes(cleanActiveBrand.toLowerCase())));
                           
    return matchesCategory && matchesBrand;
  }).sort((a, b) => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const terms = q.split(' ').filter(t => t.length > 0);
      
      const calculateScore = (item: InventoryItem) => {
        let score = 0;
        const name = (item.name || '').toLowerCase();
        const model = (item.model || '').toLowerCase();
        const device_model = (item.device_model || '').toLowerCase();
        const brand = (item.brand || '').toLowerCase();
        const fullName = `${brand} ${model} ${device_model} ${name}`.toLowerCase();
        const fullWords = fullName.split(/[\\s-]+/).filter(Boolean);

        // 1. Exact or Prefix Matches (High Priority)
        if (device_model === q || model === q || name === q) score += 500;
        if (device_model.startsWith(q) || model.startsWith(q) || name.startsWith(q)) score += 200;

        // 2. Term Matches
        terms.forEach(t => {
          if (device_model.includes(t)) score += 80;
          if (model.includes(t)) score += 50;
          if (name.includes(t)) score += 30;
          
          // Number matching (e.g. "7" matches "7th")
          if (/^\\d+$/.test(t)) {
            if (model.includes(`${t}th`) || name.includes(`${t}th`)) score += 40;
          }
        });

        // 3. Penalty for "Distractors" (Crucial for iPad vs iPad mini)
        // If user didn't type "mini", but item contains "mini", subtract points
        const modifiers = ['mini', 'air', 'pro', 'max', 'plus', 'ultra'];
        modifiers.forEach(m => {
          if (!q.includes(m) && fullName.includes(m)) {
            score -= 100; // Heavy penalty to push secondary models down
          }
        });

        // 4. Exact word count match (Reward shorter/more precise names)
        if (fullWords.length <= terms.length + 1) score += 20;

        return score;
      };

      const scoreA = calculateScore(a);
      const scoreB = calculateScore(b);

      if (scoreA !== scoreB) return scoreB - scoreA;
    }

    // Special sorting for Quick Access: strictly by pin_order (ascending: 0, 1, 2...)
    if (activeCategory === '⭐ Quick Access') {
      const orderA = a.pin_order || 0;
      const orderB = b.pin_order || 0;
      if (orderA !== orderB) return orderA - orderB;
    }

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
  const displayCategories = ['⭐ Quick Access', 'All Items', ...categories];


  const addToCart = (item: any) => {
    if (searchQuery) setSearchQuery('');
    setCart(prev => [...prev, { 
      id: Math.random().toString(36).substr(2, 9), 
      name: item.name, 
      sku: `SKU-${item.name.substring(0, 3).toUpperCase()}`, 
      price: item.price, 
      qty: 1, 
      icon: item.icon 
    }]);
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
    setError(null);
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

      let baseTotal = rawTotal - percentDiscountAmount;

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

      const newOrder: Order = {
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

      await api.createOrder(newOrder);

      setOrders(prev => [newOrder, ...prev]);
      setLastOrder(newOrder);
      setInventory(updatedInventory);
      setCart([]);
      setDiscountPercent(0);
      setIsConfirming(false); // Only close on success
      setShowInvoice(true);
      
      setSuccessMessage(t('term', 'success'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || t('term', 'fail'));
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
  let percentDiscountAmount = percentDiscountableTotal * (discountPercent / 100);
  
  // Cap the discount if a limit is set and user is not super admin
  const discountExceeded = permissions?.is_super_admin === false && 
                           permissions?.max_discount_limit !== undefined && 
                           permissions.max_discount_limit > 0 &&
                           percentDiscountAmount > permissions.max_discount_limit;

  if (discountExceeded) {
    percentDiscountAmount = permissions.max_discount_limit;
  }

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
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">{t('term', 'title')}</h2>
          <p className="text-on-surface-variant text-sm font-medium">{t('term', 'sub')}</p>
        </div>

        {/* Search and Categories */}
        <div className="space-y-4">
          <div className="relative">
            <input 
              type="text"
              placeholder={t('term', 'search')}
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
              {(() => {
                const SearchIcon = (typeof Search !== 'undefined') ? Search : Package;
                return <SearchIcon size={18} />;
              })()}
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
                {cat === 'All Items' ? t('term', 'catAll') : cat}
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
              className="bg-surface-container-lowest p-3 rounded-xl transition-all hover:ring-2 hover:ring-primary/20 group cursor-pointer relative overflow-hidden border border-outline-variant/5 flex flex-col justify-between h-full min-h-[140px] active:scale-[0.93] active:ring-2 active:ring-primary/40 active:shadow-inner duration-150"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="p-1.5 rounded-lg bg-primary-container/10 text-primary">
                    {(() => {
                      const Icon = item.icon || Package;
                      return <Icon size={18} />;
                    })()}
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
              <p className="text-on-surface-variant text-sm italic">{t('term', 'empty')}</p>
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
        


        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-extrabold tracking-tight">
            {t('term', 'cart')}
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
                {(() => {
                  const Icon = item.icon || Package;
                  return <Icon className="text-primary" size={20} />;
                })()}
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
              <p className="text-on-surface-variant text-sm">{t('term', 'empty')}</p>
            </div>
          )}
        </div>

        {cart.length > 0 && permissions?.can_give_discount !== false && (
          <div className="space-y-2">
            <div className={cn(
              "flex items-center justify-between p-3 rounded-xl border transition-all",
              discountExceeded ? "bg-error/5 border-error/20 shadow-[inset_0_1px_4px_rgba(255,0,0,0.05)]" : "bg-surface-container-high border-outline-variant/10"
            )}>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Apply Discount (%)</span>
                {discountExceeded && (
                  <span className="text-[10px] font-black text-error uppercase tracking-tighter mt-0.5 animate-pulse">
                    Limit Capped: ${permissions.max_discount_limit} Max
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={discountPercent === 0 ? '' : discountPercent}
                  onChange={(e) => {
                    const val = Math.min(100, Math.max(0, Number(e.target.value)));
                    setDiscountPercent(val);
                  }}
                  placeholder="0"
                  className={cn(
                    "w-16 border rounded-lg py-1.5 px-2 text-center text-sm font-bold focus:outline-none focus:ring-2 transition-all",
                    discountExceeded 
                      ? "bg-error-container text-on-error-container border-error/30 focus:ring-error/20" 
                      : "bg-surface-container-lowest border-outline-variant/20 text-on-surface focus:ring-primary/20"
                  )}
                />
                <span className={cn("text-sm font-bold", discountExceeded ? "text-error" : "text-on-surface")}>%</span>
              </div>
            </div>
          </div>
        )}

        {cart.length > 0 && !permissions?.can_give_discount && (
          <div className="mt-4 flex items-center justify-center p-3 opacity-50 bg-surface-container rounded-xl border border-dashed border-outline-variant/20">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
              <Lock size={12} />
              Discounting Restricted
            </span>
          </div>
        )}

        <div className="mt-4 pt-6 border-t border-outline-variant/20">
          <div className="space-y-2 mb-8">
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-sm font-medium">{t('term', 'subtotal')}</span>
              <span className="font-bold text-sm">${(baseTotal - gst).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-sm font-medium">{t('term', 'tax')}</span>
              <span className="font-bold text-sm">${gst.toFixed(2)}</span>
            </div>
            {paymentMethod === 'eftpos' && (
              <div className="flex justify-between animate-in fade-in slide-in-from-right-2">
                <span className="text-primary text-sm font-bold">EFTPOS Surcharge (1.5%)</span>
                <span className="text-primary font-bold text-sm">+${surcharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-4 border-t border-outline-variant/10 mt-2">
              <span className="text-lg font-extrabold">{t('term', 'total')}</span>
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
              className="relative w-full max-w-lg bg-surface-container-lowest rounded-[2rem] shadow-2xl overflow-hidden border border-outline-variant/10 flex flex-col max-h-[90vh]"
            >
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center text-primary">
                    <ShoppingCart size={24} />
                  </div>
                  <button 
                    onClick={() => {
                      if (!isProcessing) {
                        setIsConfirming(false);
                        setError(null);
                      }
                    }}
                    disabled={isProcessing}
                    className="p-2 hover:bg-surface-container-high rounded-full transition-colors disabled:opacity-30"
                  >
                    <X size={20} />
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-error-container/20 text-error text-xs font-bold rounded-xl border border-error/10 flex items-center gap-2 animate-in shake-1">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

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
                    onClick={() => {
                      setIsConfirming(false);
                      setError(null);
                    }}
                    disabled={isProcessing}
                    className="flex-1 py-4 bg-surface-container-high text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAction}
                    disabled={isProcessing}
                    className="flex-1 py-4 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : 'Complete Order'}
                  </button>
                </div>
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
