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
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InventoryItem, Order, OrderItem } from '../types';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'eftpos'>('cash');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  const filteredItems = inventory.filter(item => {
    const itemCat = item.category || '';
    const matchesCategory = activeCategory === 'All Items' || itemCat === activeCategory;
    
    // For legacy items without brand string formats, we guess by seeing if brand substring is in their name or model
    const matchesBrand = activeBrand === 'All Brands' || 
                         item.brand === activeBrand || 
                         ((!item.brand || item.brand === 'Other') && 
                          (item.name.toLowerCase().includes(activeBrand.toLowerCase()) || 
                           item.model.toLowerCase().includes(activeBrand.toLowerCase())));
                           
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(Boolean);
    const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => 
      item.name.toLowerCase().includes(term) || 
      item.model.toLowerCase().includes(term) ||
      (item.sku && item.sku.toLowerCase().includes(term))
    );
    
    return matchesCategory && matchesBrand && matchesSearch;
  });

  const displayBrands = ['All Brands', ...brands];
  const displayCategories = ['All Items', ...categories];

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
  };

  const addToCart = (item: any) => {
    if (item.stock !== undefined && item.stock <= 0) {
      setSuccessMessage(`${t('term', 'outofstock')} ${item.name}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.name === item.name);
      if (existing) {
        if (item.stock !== undefined && existing.qty + 1 > item.stock) {
          setSuccessMessage(`${t('term', 'limit')} ${item.name}`);
          setTimeout(() => setSuccessMessage(null), 3000);
          return prev;
        }
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
        const invItem = inventory.find(i => i.name === item.name);
        const newQty = Math.max(1, item.qty + delta);
        if (delta > 0 && invItem && invItem.stock !== undefined && newQty > invItem.stock) {
          setSuccessMessage(`${t('term', 'stockLimit')} ${item.name}`);
          setTimeout(() => setSuccessMessage(null), 3000);
          return item;
        }
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
      // Calculate profit for the order
      let totalProfit = 0;
      const orderItems: OrderItem[] = cart.map(item => {
        const invItem = inventory.find(i => i.name === item.name);
        const cost = invItem ? invItem.costPrice : 0;
        totalProfit += (item.price - cost) * item.qty;
        return {
          id: item.id,
          name: item.name,
          sku: item.sku,
          price: item.price,
          qty: item.qty,
          category: invItem ? invItem.category : 'General'
        };
      });

      const newOrder: Order = {
        id: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        items: orderItems,
        subtotal: baseTotal - gst,
        tax: gst,
        total: finalTotal,
        profit: totalProfit,
        type: orderItems.some(i => i.category.toLowerCase().includes('repair') || i.category.toLowerCase().includes('service')) ? 'repair' : 'sale',
        paymentMethod: paymentMethod
      };

      await api.createOrder(newOrder);

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

      setOrders(prev => [newOrder, ...prev]);
      setLastOrder(newOrder);
      setShowInvoice(true);
      setInventory(updatedInventory);
      setCart([]);
      
      setSuccessMessage(t('term', 'success'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setSuccessMessage(t('term', 'fail'));
    } finally {
      setIsProcessing(false);
    }
  };

  const baseTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const gst = baseTotal / 11;
  const surcharge = paymentMethod === 'eftpos' ? baseTotal * 0.015 : 0;
  const finalTotal = baseTotal + surcharge;

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
                onClick={() => setActiveBrand(br)}
                className={cn(
                  "px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all",
                  activeBrand === br 
                    ? "bg-secondary-container text-on-secondary-container shadow-sm border border-secondary/20" 
                    : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/5 hover:text-on-surface"
                )}
              >
                {br === 'All Brands' ? t('term', 'brandAll') : br}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 auto-rows-fr">
          {filteredItems.map(item => (
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
                  <span className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60 bg-surface-container px-1.5 py-0.5 rounded">{item.category.split(' ')[0]}</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-on-surface text-xs leading-tight line-clamp-2 min-h-[2rem]">{item.name}</h3>
                  <p className="text-on-surface-variant text-[9px] font-medium truncate mt-0.5">{item.model}</p>
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
      </div>

      {/* Right Column: Cart */}
      <aside className="lg:col-span-4 bg-surface-container-lowest lg:border-l border-outline-variant/10 p-6 flex flex-col rounded-3xl lg:rounded-none">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-extrabold tracking-tight">{t('term', 'currentCart')}</h2>
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
                <div className="flex justify-between">
                  <h4 className="font-bold text-sm text-on-surface leading-tight">{item.name}</h4>
                  <span className="font-bold text-sm">${item.price.toFixed(2)}</span>
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

        <div className="mt-8 pt-8 border-t border-outline-variant/20">
          <div className="space-y-2 mb-8">
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-sm font-medium">{t('term', 'subtotalExclGST')}</span>
              <span className="font-bold text-sm">${(baseTotal - gst).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-sm font-medium">{t('term', 'gst')}</span>
              <span className="font-bold text-sm">${gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-4">
              <span className="text-lg font-extrabold">{t('term', 'totalAmount')}</span>
              <span className="text-2xl font-black text-primary">${baseTotal.toFixed(2)}</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">{item.name}</span>
                        <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">{t('term', 'qty')}: {item.qty} × ${item.price.toFixed(2)}</span>
                      </div>
                      <span className="font-bold text-primary">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Payment Selection */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{t('term', 'paymentMethod')}</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={cn(
                        "py-3 rounded-xl font-bold text-sm transition-all border-2",
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
                        "py-3 rounded-xl font-bold text-sm transition-all border-2",
                        paymentMethod === 'eftpos' 
                          ? "bg-primary/10 border-primary text-primary" 
                          : "bg-surface-container-low border-transparent text-on-surface-variant hover:bg-surface-container-high"
                      )}
                    >
                      {t('term', 'eftpos')} (+1.5%)
                    </button>
                  </div>
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

      <InvoiceModal 
        isOpen={showInvoice} 
        onClose={() => setShowInvoice(false)} 
        order={lastOrder} 
        t={t}
      />
    </div>
  );
}
