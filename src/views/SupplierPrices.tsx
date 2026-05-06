import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  ChevronDown,
  ChevronRight,
  Smartphone,
  Tablet,
  Laptop,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Package,
  Layers,
  Wrench,
  Loader2,
  Inbox,
  Trash2,
  Undo2,
  ChevronLeft,
  Check
} from 'lucide-react';

interface SupplierPricesProps {
  onBack: () => void;
}

const PART_TYPE_PRIORITY = [
  "Screen Replacement",
  "Tempered Glass",
  "Battery",
  "Back Glass",
  "Charging Port",
  "Front Camera",
  "Back Camera",
  "Earpiece Speaker",
  "Loudspeaker",
  "Taptic Engine",
  "Power/Volume Flex"
];
export function SupplierPrices({ onBack }: SupplierPricesProps) {
  // Data State
  const [taxonomy, setTaxonomy] = useState<any[]>([]);
  const [unmappedItems, setUnmappedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation State
  const [expandedBrands, setExpandedBrands] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  
  // Accordion State for Part Types
  const [expandedPartTypes, setExpandedPartTypes] = useState<string[]>([]);

  // Toggle for Uncategorized Review
  const [showUncategorized, setShowUncategorized] = useState(false);
  
  // Mapping Wizard State
  const [wizardItem, setWizardItem] = useState<any>(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    brand: '',
    model: '',
    partType: '',
    grade: '',
    isNewModel: false,
    isNewPartType: false,
    isNewGrade: false
  });
  const [persistentGrades, setPersistentGrades] = useState<string[]>([]);
  const [partTypeSuggestions, setPartTypeSuggestions] = useState<string[]>([]);
  const [customGradeInput, setCustomGradeInput] = useState('');
  const [customPartTypeInput, setCustomPartTypeInput] = useState('');

  // Confirm Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchData();
    fetchPersistentGrades();
    fetchPartTypeSuggestions();
  }, []);

  const fetchPartTypeSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('part_type_suggestions')
        .select('name');
      
      if (error) {
        console.error('Supabase Part Type Fetch Error:', error);
      }

      if (data) {
        const types = data.map(p => p.name);
        // Apply Priority Sorting
        const sortedTypes = [...types].sort((a, b) => {
          const indexA = PART_TYPE_PRIORITY.indexOf(a);
          const indexB = PART_TYPE_PRIORITY.indexOf(b);
          
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.localeCompare(b);
        });
        setPartTypeSuggestions(sortedTypes);
      } else {
        setPartTypeSuggestions([]);
      }
    } catch (err) {
      console.error('Failed to fetch part type suggestions:', err);
    }
  };

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // 1. Fetch mapped items
      const { data: mappedData, error: mappedError } = await supabase
        .from('master_catalog')
        .select(`
          brand,
          device_model,
          part_type,
          quality_tier,
          item_mapping (
            raw_supplier_items (
              id,
              raw_title,
              current_price,
              stock_status,
              suppliers (
                name
              )
            )
          )
        `);
      
      console.log('mappedData:', mappedData, 'mappedError:', mappedError);
      if (mappedError) throw mappedError;

      // 2. Fetch unmapped items (raw items without mapping)
      const { data: rawData, error: rawError } = await supabase
        .from('raw_supplier_items')
        .select(`
          id,
          raw_title,
          current_price,
          stock_status,
          suppliers ( name ),
          item_mapping ( master_catalog_id )
        `);
        
      console.log('rawData:', rawData, 'rawError:', rawError);
      if (rawError) throw rawError;

      const unmapped = (rawData || []).filter(item => !item.item_mapping || item.item_mapping.length === 0);
      setUnmappedItems(unmapped);

      // 3. Transform mapped data into the nested taxonomy structure
      const taxonomyMap: any = {};

      (mappedData || []).forEach(row => {
        // Skip if no suppliers are mapped to this catalog item
        if (!row.item_mapping || row.item_mapping.length === 0) return;

        const brandName = row.brand;
        const deviceModel = row.device_model;
        const partType = row.part_type;
        const qualityTier = row.quality_tier;
        
        // Derive category roughly (e.g. iPhone from iPhone 13 Pro Max)
        let categoryName = 'Other';
        if (deviceModel.toLowerCase().includes('iphone')) categoryName = 'iPhone';
        else if (deviceModel.toLowerCase().includes('ipad')) categoryName = 'iPad';
        else if (deviceModel.toLowerCase().includes('macbook')) categoryName = 'MacBook';
        else if (deviceModel.toLowerCase().includes('galaxy')) categoryName = 'Galaxy';

        // Build Nested Structure
        if (!taxonomyMap[brandName]) taxonomyMap[brandName] = { brand: brandName, categories: {} };
        if (!taxonomyMap[brandName].categories[categoryName]) {
          taxonomyMap[brandName].categories[categoryName] = { 
            name: categoryName, 
            icon: Smartphone, // fallback 
            models: {} 
          };
        }
        if (!taxonomyMap[brandName].categories[categoryName].models[deviceModel]) {
          taxonomyMap[brandName].categories[categoryName].models[deviceModel] = {
            name: deviceModel,
            partTypes: {}
          };
        }
        if (!taxonomyMap[brandName].categories[categoryName].models[deviceModel].partTypes[partType]) {
          taxonomyMap[brandName].categories[categoryName].models[deviceModel].partTypes[partType] = {
            name: partType,
            qualityTiers: {}
          };
        }
        if (!taxonomyMap[brandName].categories[categoryName].models[deviceModel].partTypes[partType].qualityTiers[qualityTier]) {
          taxonomyMap[brandName].categories[categoryName].models[deviceModel].partTypes[partType].qualityTiers[qualityTier] = {
            name: qualityTier,
            suppliers: []
          };
        }

        // Add suppliers
        row.item_mapping.forEach((mapping: any) => {
          const rawItem = mapping.raw_supplier_items;
          if (rawItem && rawItem.suppliers) {
            const stockLevel = rawItem.stock_status?.toLowerCase().includes('out') ? 'out' : 
                               rawItem.stock_status?.toLowerCase().includes('low') ? 'low' : 'high';
            
            taxonomyMap[brandName].categories[categoryName].models[deviceModel].partTypes[partType].qualityTiers[qualityTier].suppliers.push({
              id: rawItem.id,
              name: rawItem.suppliers.name,
              raw_title: rawItem.raw_title,
              price: Number(rawItem.current_price),
              stock: stockLevel,
              stockText: rawItem.stock_status || 'Unknown'
            });
          }
        });
      });

      // Convert maps back to arrays with sorting
      const finalTaxonomy = Object.values(taxonomyMap).map((b: any) => ({
        brand: b.brand,
        categories: Object.values(b.categories).map((c: any) => ({
          name: c.name,
          icon: c.name.includes('iPad') ? Tablet : (c.name.includes('MacBook') ? Laptop : Smartphone),
          models: Object.values(c.models).map((m: any) => ({
            name: m.name,
            partTypes: Object.values(m.partTypes)
              .map((p: any) => ({
                name: p.name,
                qualityTiers: Object.values(p.qualityTiers)
              }))
              .sort((a, b) => {
                const indexA = PART_TYPE_PRIORITY.indexOf(a.name);
                const indexB = PART_TYPE_PRIORITY.indexOf(b.name);
                
                // If both in priority list, sort by priority
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                // If only A in priority list, A comes first
                if (indexA !== -1) return -1;
                // If only B in priority list, B comes first
                if (indexB !== -1) return 1;
                // Otherwise alphabetical
                return a.name.localeCompare(b.name);
              })
          }))
        }))
      }));

      setTaxonomy(finalTaxonomy);
      
      // Auto-expand first brand/category
      if (finalTaxonomy.length > 0) {
        const firstBrand = finalTaxonomy[0];
        setExpandedBrands([firstBrand.brand]);
        if (firstBrand.categories.length > 0) {
          const firstCat = firstBrand.categories[0];
          setExpandedCategories([`${firstBrand.brand}-${firstCat.name}`]);
          if (firstCat.models.length > 0) {
            setSelectedModel(firstCat.models[0]);
            if (firstCat.models[0].partTypes.length > 0) {
              setExpandedPartTypes([firstCat.models[0].partTypes[0].name]);
            }
          }
        }
      }

    } catch (err) {
      console.error('Failed to fetch supplier data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUnmapItem = async (rawItemId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Unmap Item?',
      message: 'This item will be moved to the Uncategorized section. Its price history will be preserved.',
      confirmText: 'Unmap Item',
      onConfirm: async () => {
        // Optimistic Update
        const previousTaxonomy = [...taxonomy];

        setTaxonomy(prev => prev.map(brand => ({
          ...brand,
          categories: brand.categories.map((cat: any) => ({
            ...cat,
            models: cat.models.map((model: any) => ({
              ...model,
              partTypes: model.partTypes.map((pt: any) => ({
                ...pt,
                qualityTiers: pt.qualityTiers.map((tier: any) => ({
                  ...tier,
                  suppliers: tier.suppliers.filter((s: any) => s.id !== rawItemId)
                })).filter((tier: any) => tier.suppliers.length > 0)
              })).filter((pt: any) => pt.qualityTiers.length > 0)
            })).filter((model: any) => model.partTypes.length > 0)
          })).filter((cat: any) => cat.models.length > 0)
        })).filter(brand => brand.categories.length > 0));

        try {
          const { error } = await supabase
            .from('item_mapping')
            .delete()
            .eq('raw_item_id', rawItemId);

          if (error) throw error;
          fetchData(false); // background sync
        } catch (err) {
          console.error('Failed to unmap item:', err);
          setTaxonomy(previousTaxonomy);
        }
      }
    });
  };

  const handleDeleteItem = async (rawItemId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Item?',
      message: 'PERMANENTLY delete this item and its price history? This action cannot be undone.',
      confirmText: 'Delete Permanently',
      isDestructive: true,
      onConfirm: async () => {
        // Optimistic Update
        const previousTaxonomy = [...taxonomy];
        const previousUnmapped = [...unmappedItems];

        setTaxonomy(prev => prev.map(brand => ({
          ...brand,
          categories: brand.categories.map((cat: any) => ({
            ...cat,
            models: cat.models.map((model: any) => ({
              ...model,
              partTypes: model.partTypes.map((pt: any) => ({
                ...pt,
                qualityTiers: pt.qualityTiers.map((tier: any) => ({
                  ...tier,
                  suppliers: tier.suppliers.filter((s: any) => s.id !== rawItemId)
                })).filter((tier: any) => tier.suppliers.length > 0)
              })).filter((pt: any) => pt.qualityTiers.length > 0)
            })).filter((model: any) => model.partTypes.length > 0)
          })).filter((cat: any) => cat.models.length > 0)
        })).filter(brand => brand.categories.length > 0));

        setUnmappedItems(prev => prev.filter(item => item.id !== rawItemId));

        try {
          const { error } = await supabase
            .from('raw_supplier_items')
            .delete()
            .eq('id', rawItemId);

          if (error) throw error;
          fetchData(false); // background sync
        } catch (err) {
          console.error('Failed to delete item:', err);
          setTaxonomy(previousTaxonomy);
          setUnmappedItems(previousUnmapped);
        }
      }
    });
  };

  const fetchPersistentGrades = async (specificPartType?: string) => {
    const pt = specificPartType || wizardData.partType;
    if (!pt) {
      setPersistentGrades([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('quality_tiers_suggestions')
        .select('name')
        .eq('part_type', pt)
        .order('name');
      
      if (error) {
        console.error('Supabase Grade Fetch Error:', error);
      }

      if (data) {
        // Use a Set to ensure absolute deduplication in the UI
        const uniqueNames = Array.from(new Set(data.map(g => g.name)));
        setPersistentGrades(uniqueNames);
      }
    } catch (err) {
      console.error('Failed to fetch persistent grades:', err);
    }
  };

  const handleSavePartType = async () => {
    if (!customPartTypeInput.trim()) return;
    
    setLoading(true);
    try {
      const trimmedName = customPartTypeInput.trim();
      const { error } = await supabase
        .from('part_type_suggestions')
        .insert({ name: trimmedName });

      if (error) {
        if (error.code === '23505') {
          alert(`The part type "${trimmedName}" already exists.`);
        } else {
          alert(`Database Error: ${error.message}`);
        }
      } else {
        await fetchPartTypeSuggestions();
        setCustomPartTypeInput('');
        // Auto-select the newly created part type
        setWizardData(prev => ({ ...prev, partType: trimmedName, isNewPartType: false }));
      }
    } catch (err: any) {
      console.error('Failed to save part type:', err);
      alert(`System Error: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrade = async () => {
    if (!customGradeInput.trim() || !wizardData.partType) return;
    
    setLoading(true);
    try {
      const trimmedGrade = customGradeInput.trim();
      const { error } = await supabase
        .from('quality_tiers_suggestions')
        .insert({ 
          name: trimmedGrade,
          part_type: wizardData.partType 
        });

      if (error) {
        console.error('Supabase Save Error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        if (error.code === '23505') { // Unique constraint
          alert(`Duplicate Error: The grade "${trimmedGrade}" already exists for "${wizardData.partType}".`);
        } else {
          alert(`Database Error: ${error.message}\n\nDetails: ${error.details || 'None'}`);
        }
      } else {
        await fetchPersistentGrades();
        setCustomGradeInput('');
        // Auto-select the newly created grade
        setWizardData(prev => ({ ...prev, grade: trimmedGrade, isNewGrade: false }));
      }
    } catch (err: any) {
      console.error('Failed to save grade:', err);
      alert(`System Error: ${err.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteGradeSuggestion = async (grade: string) => {
    try {
      await supabase
        .from('quality_tiers_suggestions')
        .delete()
        .eq('name', grade);
      setPersistentGrades(prev => prev.filter(g => g !== grade));
    } catch (err) {
      console.error('Failed to delete grade suggestion:', err);
    }
  };

  const toggleBrand = (brand: string) => {
    setExpandedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryKey) ? prev.filter(c => c !== categoryKey) : [...prev, categoryKey]
    );
  };

  const togglePartType = (partTypeName: string) => {
    setExpandedPartTypes(prev => 
      prev.includes(partTypeName) ? prev.filter(p => p !== partTypeName) : [...prev, partTypeName]
    );
  };

  const getStockColor = (level: string) => {
    switch(level) {
      case 'high': return 'text-emerald-600 bg-emerald-500/10';
      case 'low': return 'text-orange-600 bg-orange-500/10';
      case 'out': return 'text-red-600 bg-red-500/10';
      default: return 'text-slate-600 bg-slate-500/10';
    }
  };

  return (
    <div className="flex h-full bg-surface">
      {/* Left Sidebar - Deep Taxonomy Tree */}
      <div className="w-72 border-r border-outline-variant/20 bg-surface-container-lowest flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors mb-6 group"
          >
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            Back to Dashboard
          </button>
          
          <h2 className="text-xl font-black text-on-surface flex items-center gap-2">
            <Layers size={20} className="text-primary" />
            Device Catalog
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : (
            <>
              {taxonomy.map((brandObj) => (
            <div key={brandObj.brand} className="mb-2">
              {/* Brand Header */}
              <button 
                onClick={() => toggleBrand(brandObj.brand)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-container transition-colors text-left font-bold text-on-surface"
              >
                <div className={`transition-transform duration-200 ${expandedBrands.includes(brandObj.brand) ? 'rotate-90' : ''}`}>
                  <ChevronRight size={16} className="text-on-surface-variant" />
                </div>
                {brandObj.brand}
              </button>

              {/* Categories */}
              <AnimatePresence>
                {expandedBrands.includes(brandObj.brand) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-6 pr-2 mt-1 space-y-1 border-l-2 border-outline-variant/20 ml-[21px]"
                  >
                    {brandObj.categories.map((category) => {
                      const categoryKey = `${brandObj.brand}-${category.name}`;
                      const Icon = category.icon || Smartphone;
                      
                      return (
                        <div key={category.name} className="mb-1">
                          <button 
                            onClick={() => toggleCategory(categoryKey)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-container text-left text-sm font-bold text-on-surface-variant transition-colors"
                          >
                            <div className={`transition-transform duration-200 ${expandedCategories.includes(categoryKey) ? 'rotate-90' : ''}`}>
                              <ChevronRight size={14} />
                            </div>
                            <Icon size={16} className="opacity-70" />
                            {category.name}
                          </button>

                          {/* Models */}
                          <AnimatePresence>
                            {expandedCategories.includes(categoryKey) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden pl-7 mt-1 space-y-1"
                              >
                                {category.models.map((model) => {
                                  const isSelected = selectedModel?.name === model.name;
                                  return (
                                    <button
                                      key={model.name}
                                      onClick={() => {
                                        setSelectedModel(model);
                                        setShowUncategorized(false);
                                      }}
                                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                                        isSelected 
                                          ? 'bg-primary text-on-primary font-bold shadow-md shadow-primary/20 scale-[1.02]' 
                                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-medium'
                                      }`}
                                    >
                                      {model.name}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          
          {/* Uncategorized Section Link */}
          {unmappedItems.length > 0 && (
            <div className="mt-6 pt-6 border-t border-outline-variant/20">
              <button
                onClick={() => {
                  setShowUncategorized(true);
                  setSelectedModel(null);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  showUncategorized 
                    ? 'bg-orange-500/10 text-orange-600 font-bold' 
                    : 'bg-surface hover:bg-surface-container text-on-surface-variant font-bold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Inbox size={18} />
                  <span>Uncategorized</span>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs">
                  {unmappedItems.length}
                </div>
              </button>
            </div>
          )}
          
          </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-container-lowest">
        {/* Header */}
        <div className="px-8 py-6 border-b border-outline-variant/20 bg-surface/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight flex items-center gap-3">
              {showUncategorized ? 'Uncategorized Items' : (selectedModel?.name || 'Select a Model')}
            </h1>
            <p className="text-sm text-on-surface-variant font-medium mt-1">
              {showUncategorized ? 'Raw supplier items that need manual mapping.' : 'Compare pricing across quality tiers and vendors'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-on-surface text-surface rounded-2xl text-sm font-bold hover:scale-105 transition-transform active:scale-95 shadow-md">
              <Plus size={18} />
              Add Vendor
            </button>
          </div>
        </div>

        {/* Dynamic Accordion Area */}
        <div className="flex-1 overflow-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : showUncategorized ? (
            <div className="max-w-5xl mx-auto space-y-4">
              {unmappedItems.map(item => (
                <div key={item.id} className="bg-surface rounded-2xl border border-outline-variant/20 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="font-bold text-on-surface text-lg">{item.raw_title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-sm font-medium text-on-surface-variant">
                        <Building2 size={14} />
                        {item.suppliers?.name || 'Unknown Supplier'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${getStockColor(item.stock_status?.toLowerCase().includes('out') ? 'out' : 'high')}`}>
                        {item.stock_status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-3">
                    <span className="text-2xl font-black text-on-surface tracking-tighter">
                      <span className="text-lg text-on-surface-variant/50 mr-1">$</span>
                      {(Number(item.current_price) * 1.1).toFixed(2)}
                      <span className="text-sm text-on-surface-variant/70 font-normal ml-2 tracking-normal">(GST included)</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          // RESET WIZARD DATA COMPLETELY
                          setWizardData({
                            brand: '',
                            model: '',
                            partType: '',
                            grade: '',
                            isNewModel: false,
                            isNewPartType: false,
                            isNewGrade: false
                          });
                          setCustomGradeInput('');
                          setCustomPartTypeInput('');
                          setWizardItem(item);
                          setWizardStep(1);
                        }}
                        className="text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-1.5 rounded-lg transition-colors"
                      >
                        Map Item
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedModel ? (
            <div className="max-w-5xl mx-auto space-y-6">
              {selectedModel.partTypes.map((part: any) => {
                const isExpanded = expandedPartTypes.includes(part.name);
                
                return (
                  <div key={part.name} className="bg-surface rounded-3xl border border-outline-variant/20 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                    {/* Part Header (Click to expand) */}
                    <button 
                      onClick={() => togglePartType(part.name)}
                      className="w-full flex items-center justify-between px-6 py-5 bg-surface hover:bg-surface-container-lowest transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isExpanded ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                          <Wrench size={24} />
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-black text-on-surface">{part.name}</h3>
                          <p className="text-sm text-on-surface-variant font-medium">{part.qualityTiers.length} Quality Tier(s) available</p>
                        </div>
                      </div>
                      <div className={`w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center border border-outline-variant/20 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={20} className="text-on-surface-variant" />
                      </div>
                    </button>

                    {/* Expandable Content (Quality Tiers & Suppliers) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-surface-container-lowest/50"
                        >
                          <div className="p-6 border-t border-outline-variant/10 space-y-6">
                            {part.qualityTiers.map((tier: any) => (
                              <div key={tier.name} className="bg-surface border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm">
                                {/* Quality Tier Header - Hidden if generic "Standard" and only one tier */}
                                {(tier.name !== 'Standard' || part.qualityTiers.length > 1) && (
                                  <div className="px-5 py-3 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Package size={16} className="text-primary" />
                                      <h4 className="text-sm font-black tracking-widest uppercase text-on-surface-variant">{tier.name}</h4>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Supplier Pricing Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-outline-variant/10">
                                  {tier.suppliers.map((supplier: any, index: number) => (
                                    <div key={index} className="p-5 flex flex-col relative group hover:bg-surface-container-lowest transition-colors">
                                      <div className="flex justify-between items-start mb-3">
                                        <div className="flex flex-col flex-1">
                                          {/* Full Raw Title with wrapping */}
                                          <span className="font-bold text-on-surface text-sm leading-snug whitespace-normal break-words">
                                            {supplier.raw_title}
                                          </span>
                                        </div>
                                        
                                        {/* Item Actions */}
                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                          <button 
                                            onClick={() => handleUnmapItem(supplier.id)}
                                            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                            title="Unmap / Move to Uncategorized"
                                          >
                                            <Undo2 size={16} />
                                          </button>
                                          <button 
                                            onClick={() => handleDeleteItem(supplier.id)}
                                            className="p-1.5 text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                            title="Delete Permanently"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                      </div>
                                      
                                      <div className="mt-auto pt-4 flex items-end justify-between">
                                        <div className="flex flex-col">
                                          <span className="text-xl font-black text-on-surface tracking-tight">
                                            <span className="text-sm text-on-surface-variant/50 mr-1">$</span>
                                            {(supplier.price * 1.1).toFixed(2)}
                                          </span>
                                          <div className="text-[9px] text-on-surface-variant/70 font-bold uppercase tracking-wider">Incl. GST</div>
                                        </div>
                                        <div className="text-[10px] text-on-surface-variant/40 font-mono">
                                          Excl. ${supplier.price.toFixed(2)}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full opacity-50">
              <div className="text-center">
                <Smartphone size={48} className="mx-auto mb-4 text-on-surface-variant" />
                <h3 className="text-xl font-black text-on-surface">No Model Selected</h3>
                <p className="text-on-surface-variant mt-2 max-w-md mx-auto">Choose a model from the left sidebar to view pricing, or check the Uncategorized section for new items.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mapping Wizard Modal */}
      <AnimatePresence>
        {wizardItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-on-surface/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface rounded-[32px] w-full max-w-xl overflow-hidden shadow-2xl border border-outline-variant/20"
            >
              {/* Wizard Header */}
              <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low">
                <div>
                  <h3 className="text-xl font-black text-on-surface">Map Supplier Item</h3>
                  <p className="text-sm text-on-surface-variant font-medium truncate max-w-xs">{wizardItem.raw_title}</p>
                </div>
                <button 
                  onClick={() => setWizardItem(null)}
                  className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-surface-container flex">
                {[1, 2, 3, 4].map(step => (
                  <div 
                    key={step} 
                    className={`h-full flex-1 transition-all duration-500 ${step <= wizardStep ? 'bg-primary' : 'bg-transparent'}`}
                  />
                ))}
              </div>

              {/* Step Content */}
              <div className="p-8 min-h-[340px]">
                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-on-surface mb-2">Step 1: Select Brand</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {['Apple', 'Samsung', 'Google', 'Oppo', 'Huawei'].map(b => (
                        <button
                          key={b}
                          onClick={() => {
                            setWizardData(prev => ({ ...prev, brand: b }));
                            setWizardStep(2);
                          }}
                          className={`px-4 py-3 rounded-2xl border-2 transition-all text-left font-bold ${
                            wizardData.brand === b 
                              ? 'border-primary bg-primary/5 text-primary' 
                              : 'border-outline-variant/20 hover:border-primary/50 text-on-surface-variant'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <button onClick={() => setWizardStep(1)} className="p-2 -ml-2 text-primary hover:bg-primary/10 rounded-full">
                        <ChevronLeft size={20} />
                      </button>
                      <h4 className="text-lg font-bold text-on-surface">Step 2: Select Model</h4>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                      {/* Filter models by brand */}
                      {taxonomy.find(b => b.brand === wizardData.brand)?.categories.flatMap((c: any) => c.models).map((m: any) => (
                        <button
                          key={m.name}
                          onClick={() => {
                            setWizardData(prev => ({ ...prev, model: m.name, isNewModel: false }));
                            setWizardStep(3);
                          }}
                          className={`w-full px-4 py-3 rounded-xl border transition-all text-left font-medium ${
                            wizardData.model === m.name 
                              ? 'border-primary bg-primary/5 text-primary' 
                              : 'border-outline-variant/20 hover:bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t border-outline-variant/10">
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Or Add New Model</p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Enter model name (e.g. iPhone 17)"
                          className="flex-1 px-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 focus:outline-none focus:border-primary"
                          value={wizardData.isNewModel ? wizardData.model : ''}
                          onChange={(e) => setWizardData(prev => ({ ...prev, model: e.target.value, isNewModel: true }))}
                        />
                        <button 
                          disabled={!wizardData.model}
                          onClick={() => setWizardStep(3)}
                          className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-4" onMouseEnter={() => fetchPartTypeSuggestions()}>
                    <div className="flex items-center gap-2 mb-4">
                      <button onClick={() => setWizardStep(2)} className="p-2 -ml-2 text-primary hover:bg-primary/10 rounded-full">
                        <ChevronLeft size={20} />
                      </button>
                      <h4 className="text-lg font-bold text-on-surface">Step 3: Select Part Type</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                      {partTypeSuggestions.length > 0 ? (
                        partTypeSuggestions.map(pt => (
                          <button
                            key={pt}
                            onClick={() => {
                              setWizardData(prev => ({ ...prev, partType: pt, isNewPartType: false }));
                            }}
                            className={`px-4 py-3 rounded-xl border transition-all text-left text-sm font-bold ${
                              wizardData.partType === pt 
                                ? 'border-primary bg-primary/5 text-primary' 
                                : 'border-outline-variant/20 hover:bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            {pt}
                          </button>
                        ))
                      ) : (
                        <div className="col-span-2 py-8 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
                          <p className="text-sm text-on-surface-variant font-medium">No part types found in database.</p>
                          <button 
                            onClick={() => fetchPartTypeSuggestions()}
                            className="mt-2 text-xs font-bold text-primary hover:underline"
                          >
                            Click to Retry Fetch
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-outline-variant/10">
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Or Add New Type</p>
                      <div className="flex gap-2 mb-6">
                        <input 
                          type="text" 
                          placeholder="e.g. Back Housing, Full Screw Set..."
                          className="flex-1 px-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 focus:outline-none focus:border-primary"
                          value={customPartTypeInput}
                          onChange={(e) => setCustomPartTypeInput(e.target.value)}
                        />
                        <button 
                          onClick={handleSavePartType}
                          disabled={!customPartTypeInput.trim()}
                          className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <Plus size={20} />
                        </button>
                      </div>

                      <button 
                        onClick={() => {
                          fetchPersistentGrades(wizardData.partType);
                          setWizardStep(4);
                        }}
                        disabled={!wizardData.partType}
                        className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      >
                        Next Step
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {wizardStep === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <button onClick={() => setWizardStep(3)} className="p-2 -ml-2 text-primary hover:bg-primary/10 rounded-full">
                        <ChevronLeft size={20} />
                      </button>
                      <h4 className="text-lg font-bold text-on-surface">Step 4: Quality / Grade</h4>
                    </div>
                    
                    <div className="space-y-4" onMouseEnter={() => fetchPersistentGrades()}>
                      <p className="text-sm text-on-surface-variant">Selected Mapping: <span className="font-bold text-on-surface">{wizardData.brand} {wizardData.model} &gt; {wizardData.partType}</span></p>
                      
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Select Existing Grade</p>
                        <div className="flex flex-wrap gap-2">
                          {persistentGrades.map(g => (
                            <div key={g} className="relative group">
                              <button
                                onClick={() => setWizardData(prev => ({ ...prev, grade: g, isNewGrade: false }))}
                                className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition-all pr-8 ${
                                  wizardData.grade === g 
                                    ? 'border-primary bg-primary text-on-primary' 
                                    : 'border-outline-variant/20 hover:bg-surface-container text-on-surface-variant'
                                }`}
                              >
                                {g}
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteGradeSuggestion(g);
                                }}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Plus className="w-3 h-3 rotate-45" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-outline-variant/10">
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Or Add New Grade</p>
                        <div className="flex gap-2 mb-6">
                          <input 
                            type="text" 
                            placeholder="e.g. Service Pack, Refurbished..."
                            className="flex-1 px-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 focus:outline-none focus:border-primary"
                            value={customGradeInput}
                            onChange={(e) => setCustomGradeInput(e.target.value)}
                          />
                          <button 
                            onClick={handleSaveGrade}
                            disabled={!customGradeInput.trim()}
                            className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors disabled:opacity-50"
                          >
                            <Plus size={20} />
                          </button>
                        </div>

                        <button 
                          onClick={async () => {
                            setLoading(true);
                            try {
                              // 1. Find or Create Master Catalog Item
                              const { data: existing, error: findError } = await supabase
                                .from('master_catalog')
                                .select('id')
                                .eq('brand', wizardData.brand)
                                .eq('device_model', wizardData.model)
                                .eq('part_type', wizardData.partType)
                                .eq('quality_tier', wizardData.grade)
                                .maybeSingle();
                              
                              let masterId = existing?.id;
                              
                              if (!masterId) {
                                const { data: created, error: createError } = await supabase
                                  .from('master_catalog')
                                  .insert({
                                    brand: wizardData.brand,
                                    device_model: wizardData.model,
                                    part_type: wizardData.partType,
                                    quality_tier: wizardData.grade
                                  })
                                  .select('id')
                                  .single();
                                
                                if (createError) throw createError;
                                masterId = created.id;
                              }
                              
                              // 2. Create Mapping
                              const { error: mapError } = await supabase
                                .from('item_mapping')
                                .insert({
                                  raw_item_id: wizardItem.id,
                                  master_catalog_id: masterId
                                });
                                
                              if (mapError) throw mapError;
                              
                              setWizardItem(null);
                              await fetchData();
                            } catch (err) {
                              console.error('Mapping failed:', err);
                              alert('Mapping failed');
                            } finally {
                              setLoading(false);
                            }
                          }}
                          disabled={!wizardData.grade}
                          className="w-full py-4 bg-primary text-on-primary rounded-2xl font-black text-lg shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <Check size={20} />
                          Finalize Mapping
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {confirmConfig.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${confirmConfig.isDestructive ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{confirmConfig.title}</h3>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  {confirmConfig.message}
                </p>
              </div>
              <div className="p-4 bg-slate-800/50 flex gap-3">
                <button
                  onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmConfig.onConfirm();
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                  }}
                  className={`flex-1 py-3 px-4 ${
                    confirmConfig.isDestructive 
                      ? 'bg-red-600 hover:bg-red-500' 
                      : 'bg-blue-600 hover:bg-blue-500'
                  } text-white font-semibold rounded-xl shadow-lg transition-colors`}
                >
                  {confirmConfig.confirmText || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
