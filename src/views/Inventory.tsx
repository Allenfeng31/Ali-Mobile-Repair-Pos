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
  Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { InventoryItem } from '../types';
import { api } from '../lib/api';

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
  const [filter, setFilter] = useState('All Parts');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Phone Repair',
    brand: 'iPhone',
    model: '',
    stock: '',
    minStock: '5',
    costPrice: '',
    sellingPrice: ''
  });

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
    setFormData({...formData, category: catName});
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
    setFormData({...formData, brand: brName});
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
        setFormData({...formData, category: updated[0]});
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
        setFormData({...formData, brand: updated[0]});
      }
    }
  };

  const clearForm = () => {
    setFormData({
      name: '',
      category: 'Phone Repair',
      brand: 'iPhone',
      model: '',
      stock: '',
      minStock: '5',
      costPrice: '',
      sellingPrice: ''
    });
    setEditingId(null);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      brand: item.brand || 'iPhone',
      model: item.model,
      stock: item.stock.toString(),
      minStock: item.minStock.toString(),
      costPrice: item.costPrice.toString(),
      sellingPrice: item.price.toString()
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sellingPrice) return;

    const cost = parseFloat(formData.costPrice) || 0;
    const selling = parseFloat(formData.sellingPrice) || 0;
    const margin = cost > 0 ? Math.round(((selling - cost) / selling) * 100) : 0;
    const stock = parseInt(formData.stock) || 0;
    const minStock = parseInt(formData.minStock) || 0;

    const itemData = {
      name: formData.name,
      model: `${formData.brand}||${formData.model}`,
      stock: stock,
      minStock: minStock,
      costPrice: cost,
      price: selling,
      margin: margin,
      iconName: formData.category.includes('Battery') ? 'Battery' : 
                formData.name.includes('Screen') ? 'Smartphone' : 'Zap',
      status: stock <= minStock ? 'low-stock' : 'in-stock',
      category: formData.category
    };

    const getIconComponent = (name: string) => {
      return name === 'Battery' ? Battery : name === 'Smartphone' ? Smartphone : Zap;
    };

    const normalizeItem = (raw: any) => {
      let b = 'Other', m = raw.model;
      if (typeof m === 'string' && m.includes('||')) {
        const parts = m.split('||');
        b = parts[0];
        m = parts[1];
      }
      return { ...raw, brand: b, model: m, icon: getIconComponent(raw.iconName) };
    };

    try {
      if (editingId) {
        const updatedItem = await api.updateInventoryItem(editingId, itemData);
        setInventory(prev => prev.map(item => 
          item.id === editingId ? { ...item, ...normalizeItem(updatedItem) } : item
        ));
        setSuccessMessage(`Updated ${formData.name} successfully!`);
      } else {
        const newItem = await api.createInventoryItem(itemData);
        setInventory(prev => [...prev, normalizeItem(newItem)]);
        setSuccessMessage(`Added ${formData.name} to inventory!`);
      }

      setTimeout(() => setSuccessMessage(null), 3000);
      clearForm();
    } catch (err: any) {
      console.error('Failed to save inventory item:', err);
      const errorMsg = err?.message || 'Failed to save item. Check your database settings.';
      setSuccessMessage(`Error: ${errorMsg}`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const filteredInventory = inventory.filter(item => {
    if (filter === 'Low Stock') return item.status === 'low-stock';
    if (filter === 'Devices') return item.status === 'device';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header & Search */}    <div className="h-full flex flex-col pt-6 pb-2 px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight mb-2">{t('inv', 'title')}</h1>
          <p className="text-on-surface-variant font-medium">{t('inv', 'sub')}</p>
        </div>
        <button 
          onClick={clearForm}
          className="bg-primary text-on-primary px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <Plus size={20} strokeWidth={3} />
          {t('inv', 'addUrl')}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input 
            type="text" 
            placeholder={t('inv', 'search')}
            className="w-full pl-12 pr-4 py-3.5 bg-surface-container border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-on-surface font-medium placeholder:text-on-surface-variant/50 transition-shadow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Add/Edit Form */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-[2rem] p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] pointer-events-none"></div>
            
            <h2 className="text-xl font-black text-on-surface mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Wrench size={18} />
              </div>
              {t('inv', 'itemDet')}
            </h2>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('inv', 'name')}</label>
                <input 
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 outline-none" 
                  placeholder="e.g. iPhone 13 Screen"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1.5 flex flex-col">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('inv', 'cat')}</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-surface-container-lowest border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleDeleteCategory(formData.category)}
                    className="h-[44px] px-3 bg-error/10 text-error rounded-xl font-bold hover:bg-error/20 transition-colors"
                    title="Delete selected category"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingCategory(!isAddingCategory)}
                    className="h-[44px] px-3 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary/20 transition-colors"
                    title="Add new category"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {isAddingCategory && (
                  <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-1">
                    <input 
                      className="flex-1 px-4 py-2 bg-surface-container-lowest border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 outline-none text-sm" 
                      placeholder={t('inv', 'addCat')}
                      value={newCategory} 
                      onChange={e => setNewCategory(e.target.value)} 
                    />
                    <button 
                      type="button" 
                      onClick={handleAddCategory} 
                      className="px-4 bg-primary text-on-primary rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
                        <div className="space-y-1.5 flex flex-col">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('inv', 'brand')}</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-surface-container-lowest border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                      value={formData.brand}
                      onChange={e => setFormData({...formData, brand: e.target.value})}
                    >
                      {brands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleDeleteBrand(formData.brand)}
                    className="h-[44px] px-3 bg-error/10 text-error rounded-xl font-bold hover:bg-error/20 transition-colors"
                    title="Delete selected brand"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingBrand(!isAddingBrand)}
                    className="h-[44px] px-3 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary/20 transition-colors"
                    title="Add new brand"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {isAddingBrand && (
                  <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-1">
                    <input 
                      className="flex-1 px-4 py-2 bg-surface-container-lowest border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 outline-none text-sm" 
                      placeholder={t('inv', 'addBrand')} 
                      value={newBrand} 
                      onChange={e => setNewBrand(e.target.value)} 
                    />
                    <button 
                      type="button" 
                      onClick={handleAddBrand} 
                      className="px-4 bg-primary text-on-primary rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('inv', 'model')}</label>
                <input 
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 outline-none" 
                  placeholder="iPhone 13 Pro"
                  value={formData.model}
                  onChange={e => setFormData({...formData, model: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('inv', 'qty')}</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-2.5 bg-surface-container-lowest border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 outline-none font-medium" 
                    placeholder="0"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('inv', 'minStock')}</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-2.5 bg-surface-container-lowest border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 outline-none font-medium" 
                    placeholder="5"
                    value={formData.minStock}
                    onChange={e => setFormData({...formData, minStock: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('inv', 'cost')}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                    <input 
                      type="number"
                      className="w-full pl-8 pr-4 py-2.5 bg-surface-container-lowest border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 outline-none font-medium" 
                      placeholder="0.00"
                      value={formData.costPrice}
                      onChange={e => setFormData({...formData, costPrice: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('inv', 'sell')}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                    <input 
                      type="number"
                      className="w-full pl-8 pr-4 py-2.5 bg-surface-container-lowest border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 outline-none font-medium text-primary" 
                      placeholder="0.00"
                      value={formData.sellingPrice}
                      onChange={e => setFormData({...formData, sellingPrice: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={handleSave}
                  className="flex-1 bg-primary text-on-primary py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.98]"
                >
                  {editingId ? t('inv', 'update') : t('inv', 'save')}
                </button>
                {editingId && (
                  <button 
                    onClick={clearForm}
                    className="px-6 bg-surface-container-high text-on-surface font-bold py-3.5 rounded-xl hover:bg-surface-container-highest transition-colors"
                  >
                    {t('inv', 'discard')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Inventory List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-2 p-1.5 bg-surface-container rounded-2xl overflow-x-auto no-scrollbar">
          {['All Parts', 'Low Stock', 'Devices'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all",
                filter === f 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-on-surface-variant hover:text-on-surface hover:bg-white/50"
              )}
            >
              {f === 'All Parts' ? t('inv', 'filterAll') : f === 'Low Stock' ? t('inv', 'filterLow') : t('inv', 'filterDev')}
            </button>
          ))}
        </div>
            <div className="flex items-center gap-2 text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
              <Filter size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Filter By Model</span>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/10">
            <div className="grid grid-cols-12 px-6 py-4 bg-surface-container text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <div className="col-span-5">Item & Model</div>
              <div className="col-span-2 text-center">Stock</div>
              <div className="col-span-2 text-right">Selling</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
            <div className="divide-y divide-outline-variant/10">
              {filteredInventory.map(item => (
                <div key={item.id} className="grid grid-cols-12 px-6 py-5 items-center bg-surface-container-lowest hover:bg-surface-container/30 transition-colors group">
                  <div className="col-span-5 flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      item.status === 'device' ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-high text-primary"
                    )}>
                      <item.icon size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface leading-tight">{item.name}</p>
                      <p className="text-xs text-on-surface-variant font-medium">{item.brand ? `${item.brand} • ` : ''}{item.model}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      item.status === 'low-stock' ? "bg-error-container text-on-error-container" : "bg-primary-fixed-dim text-primary"
                    )}>
                      {item.stock} {item.stock === 1 ? 'Unit' : 'Units'}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="font-bold text-on-surface">${item.price.toFixed(2)}</p>
                    <p className="text-[10px] text-tertiary-container font-bold">{item.margin}% Margin</p>
                  </div>
                  <div className="col-span-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="p-2 text-secondary hover:bg-secondary-container rounded-lg transition-colors"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          await api.deleteInventoryItem(item.id);
                          setInventory(prev => prev.filter(i => i.id !== item.id));
                        } catch (err: any) {
                          console.error(err);
                          const errorMsg = err?.message || 'Failed to delete item.';
                          setSuccessMessage(`Error: ${errorMsg}`);
                          setTimeout(() => setSuccessMessage(null), 5000);
                        }
                      }}
                      className="p-2 text-error hover:bg-error-container rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 flex items-center justify-between bg-surface-container/50">
              <span className="text-xs font-medium text-on-surface-variant">Showing {filteredInventory.length} of {inventory.length} items</span>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-container-lowest text-on-surface hover:bg-white transition-all border border-outline-variant/10"><ChevronLeft size={14} /></button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-on-primary text-xs font-bold">1</button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-container-lowest text-on-surface hover:bg-white transition-all border border-outline-variant/10"><ChevronRight size={14} /></button>
              </div>
            </div>
          </div>

          {/* Recently Used */}
          <div className="space-y-3 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-2">Recently Used Parts</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {inventory.slice(0, 4).map((part, i) => (
                <div key={i} className="flex-none w-48 bg-surface-container-low p-4 rounded-2xl space-y-3 border border-outline-variant/5">
                  <div className="flex justify-between items-start">
                    {part.status === 'low-stock' ? <AlertTriangle size={18} className="text-error" /> : <Zap size={18} className="text-primary" />}
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      part.status === 'low-stock' ? "bg-error-container text-on-error-container" : "bg-teal-100 text-teal-700"
                    )}>
                      {part.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-bold truncate text-on-surface">{part.name}</p>
                  <button 
                    onClick={() => handleEdit(part)}
                    className="w-full py-2 bg-surface-container-lowest text-primary text-xs font-bold rounded-lg border border-primary/10 hover:bg-primary/5 transition-colors"
                  >
                    Quick Edit
                  </button>
                </div>
              ))}
              {inventory.length === 0 && (
                <p className="text-xs text-on-surface-variant px-2 italic">No parts in inventory yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fixed right-6 bottom-24 md:bottom-8 bg-primary text-on-primary w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-40">
        <QrCode size={28} />
      </button>
    </div>
  );
}
