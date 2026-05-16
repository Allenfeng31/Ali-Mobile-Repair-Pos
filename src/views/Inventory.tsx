// src/views/Inventory.tsx

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Smartphone,
  Battery,
  Zap,
  Trash2,
  Edit3,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  QrCode,
  RefreshCw,
  Wrench,
  Tablet,
  Laptop,
  Watch,
  Headphones,
  Package,
  Camera,
  Cpu,
  Layout as LayoutIcon,
  Volume2,
  Mic,
  Wifi,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { InventoryItem } from '../types';
import { api } from '../lib/api';
import { useAuthStore } from '../hooks/useAuthStore';
import { Lock } from 'lucide-react';

interface InventoryViewProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  brands: string[];
  setBrands: React.Dispatch<React.SetStateAction<string[]>>;
  t: (section: string, key: string) => string;
}

export function InventoryView({ inventory, setInventory, categories, setCategories, brands, setBrands, t }: InventoryViewProps) {
  const { permissions } = useAuthStore();
  const [filter, setFilter] = useState('All Parts');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeBrandFilter, setActiveBrandFilter] = useState('All Brands');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All Categories');

  // Strip P/T/C/W prefix for display: "C MacBook" → "MacBook"
  const getDisplayBrand = (br: string) => {
    if (/^[PTCWptcw] .+/.test(br)) return br.slice(2).trim();
    return br;
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter, activeBrandFilter, activeCategoryFilter]);

  const [qualityTiers, setQualityTiers] = useState<any[]>([]);
  React.useEffect(() => {
    api.getQualityTiers().then(tiers => {
      setQualityTiers(tiers || []);
    }).catch(console.error);
  }, []);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Phone Repair',
    brand: 'iPhone',
    model: '',
    device_model: '',
    is_pinned: false,
    pin_order: 0,
    variants: [
      { id: Date.now(), quality_grade: 'Standard', stock: '', minStock: '5', costPrice: '', sellingPrice: '', is_recommended: false }
    ]
  });

  // ── Bulk Generate Repair Suite ──────────────────────────────────────
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkBrand, setBulkBrand] = useState('Samsung');
  const [bulkModel, setBulkModel] = useState('');
  const [bulkDeviceModel, setBulkDeviceModel] = useState('');

  const REPAIR_TEMPLATES = [
    { label: 'Screen Replacement', iconName: 'Smartphone' },
    { label: 'Battery Replacement', iconName: 'Battery' },
    { label: 'Charging Port Replacement', iconName: 'Zap' },
    { label: 'Back Camera Replacement', iconName: 'Camera' },
    { label: 'Front Camera Replacement', iconName: 'Camera' },
    { label: 'Back Housing Replacement', iconName: 'Layout' },
    { label: 'Logic Board Repair', iconName: 'Cpu' },
  ] as const;

  const getIconComponent = (name: string) => {
    const icons: Record<string, any> = {
      Battery, Tablet, Laptop, Watch, Headphones, Smartphone, Wrench, Zap, Package, Camera, Cpu, LayoutIcon, Volume2, Mic, Wifi
    };
    return icons[name] || Package;
  };

  const handleBulkGenerate = async () => {
    if (!bulkModel.trim()) return;

    setBulkGenerating(true);
    try {
      const items = REPAIR_TEMPLATES.map(tmpl => ({
        name: `${bulkModel.trim()} ${tmpl.label}`,
        model: `${bulkBrand}||${bulkModel.trim()}`,
        device_model: bulkDeviceModel.trim() || null,
        stock: 0,
        minStock: 0,
        costPrice: 0,
        price: 0,
        margin: 0,
        iconName: tmpl.iconName,
        status: 'in-stock',
        category: 'Phone Repair',
        is_pinned: false,
        pin_order: 0,
      }));

      const created: any[] = await api.bulkCreateInventoryItems(items);

      const normalizedItems = created.map((raw: any) => {
        let b = 'Other', m = raw.model;
        if (typeof m === 'string' && m.includes('||')) {
          const parts = m.split('||');
          b = parts[0];
          m = parts[1];
        }
        return { ...raw, brand: b, model: m, icon: getIconComponent(raw.iconName) };
      });

      setInventory(prev => [...prev, ...normalizedItems]);
      setSuccessMessage(`⚡️ Bulk generated ${created.length} repair items for ${bulkModel.trim()}!`);
      setTimeout(() => setSuccessMessage(null), 4000);

      setBulkModel('');
      setBulkDeviceModel('');
    } catch (err: any) {
      console.error('Bulk generate failed:', err);
      setSuccessMessage(`Error: ${err?.message || 'Bulk generate failed'}`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } finally {
      setBulkGenerating(false);
    }
  };

  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [newBrand, setNewBrand] = useState('');
  const [isAddingBrand, setIsAddingBrand] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const catName = newCategory.trim();
    if (!categories.includes(catName)) {
      const updated = [...categories, catName];
      setCategories(updated);
      await api.updateSetting('ali_pos_categories', JSON.stringify(updated));
    }
    setFormData({ ...formData, category: catName });
    setIsAddingCategory(false);
    setNewCategory('');
  };

  const handleAddBrand = async () => {
    if (!newBrand.trim()) return;
    const brName = newBrand.trim();
    if (!brands.includes(brName)) {
      const updated = [...brands, brName];
      setBrands(updated);
      await api.updateSetting('ali_pos_brands', JSON.stringify(updated));
    }
    setFormData({ ...formData, brand: brName });
    setIsAddingBrand(false);
    setNewBrand('');
  };

  const handleDeleteCategory = async (catToDelete: string) => {
    if (categories.length <= 1) return;
    if (window.confirm(`Delete category "${catToDelete}"?`)) {
      const updated = categories.filter(c => c !== catToDelete);
      setCategories(updated);
      await api.updateSetting('ali_pos_categories', JSON.stringify(updated));
      if (formData.category === catToDelete) {
        setFormData({ ...formData, category: updated[0] });
      }
    }
  };

  const handleDeleteBrand = async (brandToDelete: string) => {
    if (brands.length <= 1) return;
    if (window.confirm(`Delete brand "${brandToDelete}"?`)) {
      const updated = brands.filter(b => b !== brandToDelete);
      setBrands(updated);
      await api.updateSetting('ali_pos_brands', JSON.stringify(updated));
      if (formData.brand === brandToDelete) {
        setFormData({ ...formData, brand: updated[0] });
      }
    }
  };

  const clearForm = () => {
    setFormData({
      name: '',
      category: 'Phone Repair',
      brand: 'iPhone',
      model: '',
      device_model: '',
      is_pinned: false,
      pin_order: 0,
      variants: [
        { id: Date.now(), quality_grade: 'Standard', stock: '', minStock: '5', costPrice: '', sellingPrice: '', is_recommended: false }
      ]
    });
    setEditingId(null);
  };

  const handleEdit = (item: InventoryItem) => {
    const variants = inventory.filter(i =>
      i.name === item.name &&
      i.model === item.model &&
      (i.device_model || '') === (item.device_model || '')
    ).map(v => ({
      id: v.id,
      quality_grade: v.quality_grade || 'Standard',
      stock: v.stock.toString(),
      minStock: v.minStock.toString(),
      costPrice: v.costPrice.toString(),
      sellingPrice: v.price.toString(),
      is_recommended: v.is_recommended || false,
    }));

    setEditingId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      brand: item.brand || 'iPhone',
      model: item.model,
      device_model: item.device_model || '',
      is_pinned: item.is_pinned || false,
      pin_order: item.pin_order || 0,
      variants: variants.length > 0 ? variants : [{ id: Date.now(), quality_grade: 'Standard', stock: '0', minStock: '5', costPrice: '', sellingPrice: '', is_recommended: false }]
    });
  };

  const handleSave = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!formData.name) return;

    const baseIconName = formData.name.toLowerCase().includes('screen') || formData.name.toLowerCase().includes('lcd') || formData.name.toLowerCase().includes('display') ? 'Smartphone' :
      formData.name.toLowerCase().includes('battery') ? 'Battery' :
        formData.name.toLowerCase().includes('charging') || formData.name.toLowerCase().includes('port') || formData.name.toLowerCase().includes('charge') ? 'Zap' :
          formData.name.toLowerCase().includes('camera') ? 'Camera' :
            formData.name.toLowerCase().includes('housing') || formData.name.toLowerCase().includes('glass') || formData.name.toLowerCase().includes('back cover') ? 'Layout' :
              formData.name.toLowerCase().includes('logic board') || formData.name.toLowerCase().includes('motherboard') || formData.name.toLowerCase().includes('ic ') ? 'Cpu' :
                formData.name.toLowerCase().includes('speaker') || formData.name.toLowerCase().includes('buzzer') ? 'Volume2' :
                  formData.category.toLowerCase().includes('tablet') ? 'Tablet' :
                    formData.category.toLowerCase().includes('laptop') ? 'Laptop' :
                      formData.category.toLowerCase().includes('watch') ? 'Watch' :
                        formData.category.toLowerCase().includes('accessory') ? 'Headphones' :
                          formData.category.toLowerCase().includes('phone') ? 'Smartphone' :
                            formData.category.toLowerCase().includes('service') ? 'Wrench' : 'Package';

    const itemsToSave = formData.variants.map(variant => {
      const cost = parseFloat(variant.costPrice) || 0;
      const selling = parseFloat(variant.sellingPrice) || 0;
      const margin = cost > 0 ? Math.round(((selling - cost) / selling) * 100) : 0;
      const stock = parseInt(variant.stock) || 0;
      const minStock = parseInt(variant.minStock) || 0;

      return {
        ...(variant.id > 1000000000000 ? {} : { id: variant.id }),
        name: formData.name,
        model: `${formData.brand}||${formData.model}`,
        device_model: formData.device_model,
        category: formData.category,
        is_pinned: formData.is_pinned,
        pin_order: formData.pin_order,
        iconName: baseIconName,
        quality_grade: variant.quality_grade,
        is_recommended: variant.is_recommended,
        price: selling,
        costPrice: cost,
        stock: stock,
        minStock: minStock,
        margin: margin,
        status: stock <= minStock ? 'low-stock' : 'in-stock'
      };
    });

    const normalizeItem = (raw: any) => {
      let b = 'Other', m = raw.model;
      if (typeof m === 'string' && m.includes('||')) {
        const parts = m.split('||');
        b = parts[0];
        m = parts[1];
      }
      return { ...raw, brand: b, model: m, icon: getIconComponent(raw.iconName) };
    };

    setSaving(true);
    try {
      const newItems = itemsToSave.filter(i => !i.id);
      const existingItems = itemsToSave.filter(i => i.id);

      let savedItems: any[] = [];

      if (newItems.length > 0) {
        const created = await api.bulkCreateInventoryItems(newItems);
        savedItems = [...savedItems, ...created];
      }

      for (const item of existingItems) {
        const { id, ...updateData } = item;
        const updated = await api.updateInventoryItem(id, updateData);
        savedItems.push(updated);
      }

      setInventory(prev => {
        const next = [...prev];
        savedItems.forEach(saved => {
          const idx = next.findIndex(i => i.id === saved.id);
          if (idx >= 0) {
            next[idx] = { ...next[idx], ...normalizeItem(saved) };
          } else {
            next.push(normalizeItem(saved));
          }
        });
        return next;
      });

      setSuccessMessage(`Saved ${formData.name} variants successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      clearForm();
    } catch (err: any) {
      console.error('Failed to save inventory items:', err);
      const errorMsg = err?.message || 'Failed to save items.';
      setSuccessMessage(`Error: ${errorMsg}`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    let match = true;
    if (filter === 'Low Stock') match = item.status === 'low-stock';
    if (filter === 'Devices') match = item.status === 'device';
    if (match && activeBrandFilter !== 'All Brands') match = item.brand === activeBrandFilter;
    if (match && activeCategoryFilter !== 'All Categories') match = item.category === activeCategoryFilter;

    if (match && searchQuery.trim() !== '') {
      const terms = searchQuery.toLowerCase().split(' ').filter(Boolean);
      match = terms.every(t =>
        (item.name || '').toLowerCase().includes(t) ||
        (item.model || '').toLowerCase().includes(t) ||
        (item.device_model || '').toLowerCase().includes(t) ||
        (item.brand || '').toLowerCase().includes(t) ||
        (item.sku || '').toLowerCase().includes(t) ||
        (item.category || '').toLowerCase().includes(t)
      );
    }
    return match;
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

        if (device_model === q || model === q || name === q) score += 500;
        if (device_model.startsWith(q) || model.startsWith(q) || name.startsWith(q)) score += 200;

        terms.forEach(t => {
          if (device_model.includes(t)) score += 80;
          if (model.includes(t)) score += 50;
          if (name.includes(t)) score += 30;
          if (/^\d+$/.test(t)) {
            if (model.includes(`${t}th`) || name.includes(`${t}th`)) score += 40;
          }
        });

        const modifiers = ['mini', 'air', 'pro', 'max', 'plus', 'ultra'];
        modifiers.forEach(m => {
          if (!q.includes(m) && fullName.includes(m)) score -= 100;
        });

        return score;
      };

      const scoreA = calculateScore(a);
      const scoreB = calculateScore(b);
      if (scoreA !== scoreB) return scoreB - scoreA;
    }

    const idA = typeof a.id === 'string' ? parseInt(a.id, 10) || 0 : a.id;
    const idB = typeof b.id === 'string' ? parseInt(b.id, 10) || 0 : b.id;
    return idB - idA;
  });

  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(filteredInventory.length / itemsPerPage));
  const currentItems = filteredInventory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[var(--color-neu-bg)] text-[var(--color-neu-text-primary)] font-body py-8 px-6 lg:px-12">
      {/* Toast Notification */}
      {successMessage && (
        <div className={cn(
          "fixed top-6 right-6 md:right-12 z-[100] px-6 py-4 rounded-2xl shadow-[var(--shadow-neu-floating)] font-bold animate-in fade-in slide-in-from-top-6 flex items-center gap-3",
          successMessage.startsWith('Error')
            ? "bg-red-100 text-red-600"
            : "bg-[var(--color-neu-bg)] text-blue-600"
        )}>
          {successMessage.startsWith('Error') ? <AlertTriangle size={20} /> : <Zap size={20} />}
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2 [text-shadow:-4px_4px_6px_var(--color-neu-shadow-dark)]">
              {t('inv', 'title')}
            </h1>
            <p className="text-[var(--color-neu-text-secondary)] font-medium text-lg">
              {t('inv', 'sub')}
            </p>
          </div>
          <button
            onClick={clearForm}
            className="bg-[var(--color-neu-bg)] text-blue-600 px-8 py-4 rounded-2xl font-bold shadow-[var(--shadow-neu-flat)] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Plus size={20} strokeWidth={3} />
            {t('inv', 'addUrl')}
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-3xl p-2 mb-8">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-neu-text-secondary)] w-6 h-6 opacity-60" />
            <input
              type="text"
              placeholder={t('inv', 'search')}
              className="w-full pl-14 pr-6 py-4 bg-transparent border-none rounded-2xl focus:ring-0 outline-none text-black font-semibold text-lg placeholder:text-[var(--color-neu-text-secondary)]/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 items-start">
          {/* Inventory List */}
          <div className="lg:col-span-8 space-y-6 order-first lg:order-last w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex gap-3 p-2 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl overflow-x-auto no-scrollbar w-full sm:w-auto">
                {['All Parts', 'Low Stock', 'Devices'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex-1 sm:flex-none",
                      filter === f
                        ? "bg-[var(--color-neu-bg)] text-blue-600 shadow-[var(--shadow-neu-sm)]"
                        : "text-[var(--color-neu-text-secondary)] hover:text-blue-500"
                    )}
                  >
                    {f === 'All Parts' ? t('inv', 'filterAll') : f === 'Low Stock' ? t('inv', 'filterLow') : t('inv', 'filterDev')}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl px-4 py-2.5 flex-1 sm:flex-none">
                  <Filter size={16} className="text-blue-500" />
                  <select
                    className="bg-transparent border-none text-sm font-bold text-black focus:outline-none w-full sm:w-28 cursor-pointer"
                    value={activeBrandFilter}
                    onChange={e => setActiveBrandFilter(e.target.value)}
                  >
                    <option value="All Brands">{t('term', 'brandAll') || 'All Brands'}</option>
                    {brands.map(b => <option key={b} value={b}>{getDisplayBrand(b)}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl px-4 py-2.5 flex-1 sm:flex-none">
                  <Filter size={16} className="text-blue-500" />
                  <select
                    className="bg-transparent border-none text-sm font-bold text-black focus:outline-none w-full sm:w-32 cursor-pointer"
                    value={activeCategoryFilter}
                    onChange={e => setActiveCategoryFilter(e.target.value)}
                  >
                    <option value="All Categories">{t('term', 'categoryAll') || 'All Categories'}</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {currentItems.map(item => {
                const isEditingThis = editingId === item.id;
                return (
                  <div key={item.id} className="group">
                    <div
                      onClick={() => editingId === item.id ? setEditingId(null) : handleEdit(item)}
                      className={cn(
                        "bg-[var(--color-neu-bg)] rounded-[2rem] p-5 sm:p-6 shadow-[var(--shadow-neu-flat)] active:scale-[0.98] transition-all cursor-pointer flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-4 border border-white/20",
                        isEditingThis && "shadow-[var(--shadow-neu-pressed)] scale-[0.99]"
                      )}
                    >
                      <div className="w-full sm:col-span-6 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--color-neu-bg)] shadow(--shadow-neu-sm)] flex items-center justify-center text-blue-600 shrink-0">
                          <item.icon size={28} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-black leading-tight text-lg truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-[var(--color-neu-text-secondary)] font-bold">
                              {item.brand ? `${getDisplayBrand(item.brand)} • ` : ''}{item.model}
                            </span>
                            {item.device_model && (
                              <span className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-sm)] text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest uppercase">
                                {item.device_model}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-full sm:col-span-2 flex items-center justify-between sm:justify-center mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-black/5">
                        <span className="sm:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Stock</span>
                        <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] px-4 py-1.5 rounded-xl">
                          <span className={cn(
                            "text-xs font-black uppercase tracking-wider",
                            item.status === 'low-stock' ? "text-red-600" : "text-green-600"
                          )}>
                            {item.stock} {item.stock === 1 ? 'Unit' : 'Units'}
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:block col-span-2 text-right">
                        <p className="font-black text-black text-xl">${item.price.toFixed(2)}</p>
                        <p className="text-[10px] text-gray-600 font-black tracking-tighter uppercase">
                          {item.margin}% Margin
                        </p>
                      </div>

                      <div className="hidden sm:flex col-span-2 justify-end gap-2">
                        <div className="p-3 text-blue-500 rounded-2xl shadow-[var(--shadow-neu-sm)] bg-[var(--color-neu-bg)]">
                          <Edit3 size={20} className={cn(isEditingThis && "scale-110")} />
                        </div>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!window.confirm(`Delete ${item.name}?`)) return;
                            try {
                              await api.deleteInventoryItem(item.id);
                              setInventory(prev => prev.filter(i => i.id !== item.id));
                            } catch (err: any) {
                              console.error(err);
                              setSuccessMessage(`Error: ${err?.message || 'Delete failed'}`);
                              setTimeout(() => setSuccessMessage(null), 5000);
                            }
                          }}
                          className="p-3 text-red-500 rounded-2xl shadow-[var(--shadow-neu-sm)] bg-[var(--color-neu-bg)] active:shadow-[var(--shadow-neu-pressed)]"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Quick Edit Panel */}
                    <motion.div
                      initial={false}
                      animate={{ height: isEditingThis ? 'auto' : 0, opacity: isEditingThis ? 1 : 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-6 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-[2.5rem] space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-gray-600 uppercase tracking-widest">Variants & Pricing</h4>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData({
                                ...formData,
                                variants: [...formData.variants, { id: Date.now(), quality_grade: 'Premium', stock: '0', minStock: '5', costPrice: '', sellingPrice: '', is_recommended: false }]
                              });
                            }}
                            className="text-xs font-black text-blue-600 flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-[var(--shadow-neu-sm)] bg-[var(--color-neu-bg)] active:shadow-[var(--shadow-neu-pressed)] transition-all"
                          >
                            <Plus size={14} strokeWidth={3} /> Add Tier
                          </button>
                        </div>

                        <div className="grid gap-4">
                          {formData.variants.map((variant, index) => (
                            <div key={variant.id} className="p-5 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-3xl relative">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Grade</label>
                                  <select
                                    className="w-full px-4 py-3 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] border-none rounded-xl text-sm text-black font-bold focus:ring-0 outline-none appearance-none"
                                    value={variant.quality_grade}
                                    onChange={e => {
                                      const newVariants = [...formData.variants];
                                      newVariants[index].quality_grade = e.target.value;
                                      setFormData({ ...formData, variants: newVariants });
                                    }}
                                  >
                                    {qualityTiers.map(tier => <option key={tier.id} value={tier.name}>{tier.name}</option>)}
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Stock</label>
                                  <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] border-none rounded-xl text-sm text-black font-bold focus:ring-0 outline-none"
                                    value={variant.stock}
                                    onChange={e => {
                                      const newVariants = [...formData.variants];
                                      newVariants[index].stock = e.target.value;
                                      setFormData({ ...formData, variants: newVariants });
                                    }}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Cost</label>
                                  <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] border-none rounded-xl text-sm text-black font-bold focus:ring-0 outline-none"
                                    value={variant.costPrice}
                                    onChange={e => {
                                      const newVariants = [...formData.variants];
                                      newVariants[index].costPrice = e.target.value;
                                      setFormData({ ...formData, variants: newVariants });
                                    }}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Selling</label>
                                  <input
                                    type="number"
                                    disabled={!permissions?.can_change_inventory_price}
                                    className="w-full px-4 py-3 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] border-none rounded-xl text-sm text-blue-600 font-black focus:ring-0 outline-none disabled:opacity-50"
                                    value={variant.sellingPrice}
                                    onChange={e => {
                                      const newVariants = [...formData.variants];
                                      newVariants[index].sellingPrice = e.target.value;
                                      setFormData({ ...formData, variants: newVariants });
                                    }}
                                  />
                                </div>
                              </div>
                              {formData.variants.length > 1 && (
                                <button
                                  onClick={() => {
                                    const v = [...formData.variants];
                                    v.splice(index, 1);
                                    setFormData({ ...formData, variants: v });
                                  }}
                                  className="absolute -top-3 -right-3 w-8 h-8 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-sm)] text-red-500 rounded-full flex items-center justify-center font-black active:shadow-[var(--shadow-neu-pressed)]"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-6 py-3 bg-[var(--color-neu-bg)] text-black font-bold rounded-2xl shadow-[var(--shadow-neu-flat)] active:shadow-[var(--shadow-neu-pressed)] transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSave()}
                            disabled={saving}
                            className="px-10 py-3 bg-[var(--color-neu-bg)] text-blue-600 font-black rounded-2xl shadow-[var(--shadow-neu-flat)] active:shadow-[var(--shadow-neu-pressed)] transition-all disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Quick Save'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-6">
              <span className="text-sm font-bold text-[var(--color-neu-text-secondary)]">
                Showing {filteredInventory.length === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + 1, filteredInventory.length)} - {Math.min(currentPage * itemsPerPage, filteredInventory.length)} of {filteredInventory.length}
              </span>
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] active:shadow-[var(--shadow-neu-pressed)] disabled:opacity-30 transition-all text-blue-600"
                >
                  <ChevronLeft size={20} strokeWidth={3} />
                </button>
                <div className="px-6 h-12 rounded-2xl flex items-center justify-center bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] text-black text-sm font-black">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] active:shadow-[var(--shadow-neu-pressed)] disabled:opacity-30 transition-all text-blue-600"
                >
                  <ChevronRight size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Forms */}
          <aside className="lg:col-span-4 flex flex-col gap-10 order-last lg:order-first w-full sticky top-6 h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar">
            {/* Bulk Mode Toggle */}
            <button
              onClick={() => { setBulkMode(!bulkMode); setEditingId(null); }}
              className={cn(
                "w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black text-base transition-all active:scale-[0.98]",
                bulkMode
                  ? "bg-[var(--color-neu-bg)] text-orange-600 shadow-[var(--shadow-neu-pressed)]"
                  : "bg-[var(--color-neu-bg)] text-blue-600 shadow-[var(--shadow-neu-flat)]"
              )}
            >
              <Layers size={22} className={bulkMode ? "animate-pulse" : ""} strokeWidth={3} />
              {bulkMode ? 'BULK MODE ON' : 'BULK GENERATE REPAIRS'}
            </button>

            {/* Bulk Panel */}
            <motion.div
              initial={false}
              animate={{ height: bulkMode ? 'auto' : 0, opacity: bulkMode ? 1 : 0 }}
              className="overflow-hidden"
            >
              <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[2.5rem] p-8 space-y-8">
                <h2 className="text-2xl font-black text-black flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl shadow-[var(--shadow-neu-sm)] flex items-center justify-center text-orange-500">
                    <Zap size={24} strokeWidth={3} />
                  </div>
                  Bulk Generate
                </h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Brand</label>
                    <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl p-1">
                      <select
                        className="w-full px-5 py-4 bg-transparent border-none text-black font-bold focus:ring-0 outline-none appearance-none cursor-pointer"
                        value={bulkBrand}
                        onChange={e => setBulkBrand(e.target.value)}
                      >
                        {brands.map(b => <option key={b} value={b}>{getDisplayBrand(b)}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Model Name</label>
                    <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl p-1">
                      <input
                        className="w-full px-5 py-4 bg-transparent border-none text-black font-bold focus:ring-0 outline-none placeholder:text-black/20"
                        placeholder="e.g. Galaxy S24 Ultra"
                        value={bulkModel}
                        onChange={e => setBulkModel(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleBulkGenerate}
                    disabled={bulkGenerating || !bulkModel.trim()}
                    className="w-full py-5 bg-[var(--color-neu-bg)] text-orange-600 rounded-3xl font-black text-lg shadow-[var(--shadow-neu-flat)] active:shadow-[var(--shadow-neu-pressed)] transition-all disabled:opacity-40"
                  >
                    {bulkGenerating ? 'Generating...' : 'CREATE 7 ITEMS'}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Manual Form */}
            <div className={cn(
              "bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-[2.5rem] p-8 space-y-8 transition-opacity",
              bulkMode && "opacity-30 pointer-events-none"
            )}>
              <h2 className="text-2xl font-black text-black flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl shadow-[var(--shadow-neu-sm)] flex items-center justify-center text-blue-500">
                  <Wrench size={24} strokeWidth={3} />
                </div>
                {t('inv', 'itemDet')}
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-600 uppercase tracking-widest">{t('inv', 'name')}</label>
                  <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl p-1">
                    <input
                      className="w-full px-5 py-4 bg-transparent border-none text-black font-bold focus:ring-0 outline-none"
                      placeholder="e.g. iPhone 13 Screen"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Model</label>
                    <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl p-1">
                      <input
                        className="w-full px-4 py-3 bg-transparent border-none text-black font-bold focus:ring-0 outline-none"
                        placeholder="iPhone 13"
                        value={formData.model}
                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Code</label>
                    <div className="bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] rounded-2xl p-1">
                      <input
                        className="w-full px-4 py-3 bg-transparent border-none text-black font-bold focus:ring-0 outline-none"
                        placeholder="A2633"
                        value={formData.device_model}
                        onChange={e => setFormData({ ...formData, device_model: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Variants</label>
                  {formData.variants.map((variant, idx) => (
                    <div key={idx} className="p-4 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-flat)] rounded-2xl flex flex-col gap-3 relative">
                      {formData.variants.length > 1 && (
                        <button
                          onClick={() => {
                            const v = [...formData.variants];
                            v.splice(idx, 1);
                            setFormData({ ...formData, variants: v });
                          }}
                          className="absolute -top-3 -right-3 w-8 h-8 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-sm)] text-red-500 rounded-full flex items-center justify-center font-black active:shadow-[var(--shadow-neu-pressed)]"
                        >
                          ×
                        </button>
                      )}
                      <div className="flex justify-between items-center">
                        <select
                          className="bg-transparent border-none text-sm font-black text-blue-600 focus:ring-0 outline-none cursor-pointer"
                          value={variant.quality_grade}
                          onChange={e => {
                            const v = [...formData.variants];
                            v[idx].quality_grade = e.target.value;
                            setFormData({ ...formData, variants: v });
                          }}
                        >
                          {qualityTiers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                        </select>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-black text-gray-600 uppercase">Stock</label>
                          <input
                            type="number"
                            className="w-16 px-2 py-1 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] border-none rounded-lg text-xs font-bold"
                            value={variant.stock}
                            onChange={e => {
                              const v = [...formData.variants];
                              v[idx].stock = e.target.value;
                              setFormData({ ...formData, variants: v });
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Cost</label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] border-none rounded-xl text-xs font-bold"
                            value={variant.costPrice}
                            onChange={e => {
                              const v = [...formData.variants];
                              v[idx].costPrice = e.target.value;
                              setFormData({ ...formData, variants: v });
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-black text-gray-600 uppercase ml-1">Sell</label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 bg-[var(--color-neu-bg)] shadow-[var(--shadow-neu-pressed)] border-none rounded-xl text-xs font-black text-blue-600"
                            value={variant.sellingPrice}
                            onChange={e => {
                              const v = [...formData.variants];
                              v[idx].sellingPrice = e.target.value;
                              setFormData({ ...formData, variants: v });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setFormData({ ...formData, variants: [...formData.variants, { id: Date.now(), quality_grade: 'Premium', stock: '', minStock: '5', costPrice: '', sellingPrice: '', is_recommended: false }] })}
                    className="w-full py-3 text-xs font-black text-blue-600 rounded-2xl shadow-[var(--shadow-neu-sm)] active:shadow-[var(--shadow-neu-pressed)]"
                  >
                    + ADD VARIANT
                  </button>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    onClick={() => handleSave()}
                    disabled={saving || !formData.name}
                    className="flex-1 py-5 bg-[var(--color-neu-bg)] text-blue-600 font-black text-xl rounded-3xl shadow-[var(--shadow-neu-flat)] active:shadow-[var(--shadow-neu-pressed)] transition-all disabled:opacity-40"
                  >
                    {saving ? '...' : editingId ? 'UPDATE' : 'SAVE'}
                  </button>
                  {editingId && (
                    <button
                      onClick={clearForm}
                      className="px-6 py-5 bg-[var(--color-neu-bg)] text-red-500 font-black rounded-3xl shadow-[var(--shadow-neu-flat)] active:shadow-[var(--shadow-neu-pressed)]"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Floating Scanner */}
        <button className="fixed right-10 bottom-10 bg-[var(--color-neu-bg)] text-blue-600 w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-[var(--shadow-neu-floating)] hover:scale-110 active:shadow-[var(--shadow-neu-pressed)] transition-all z-40 border-4 border-white/40">
          <QrCode size={32} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
