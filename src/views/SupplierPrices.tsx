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
  Inbox
} from 'lucide-react';

interface SupplierPricesProps {
  onBack: () => void;
}
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
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
              name: rawItem.suppliers.name,
              price: Number(rawItem.current_price),
              stock: stockLevel,
              stockText: rawItem.stock_status || 'Unknown'
            });
          }
        });
      });

      // Convert maps back to arrays
      const finalTaxonomy = Object.values(taxonomyMap).map((b: any) => ({
        brand: b.brand,
        categories: Object.values(b.categories).map((c: any) => ({
          name: c.name,
          icon: c.name.includes('iPad') ? Tablet : (c.name.includes('MacBook') ? Laptop : Smartphone),
          models: Object.values(c.models).map((m: any) => ({
            name: m.name,
            partTypes: Object.values(m.partTypes).map((p: any) => ({
              name: p.name,
              qualityTiers: Object.values(p.qualityTiers)
            }))
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
                    <button className="text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-1.5 rounded-lg transition-colors">
                      Map Item
                    </button>
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
                                {/* Quality Tier Header */}
                                <div className="px-5 py-3 bg-surface-container-low border-b border-outline-variant/20 flex items-center gap-2">
                                  <Package size={16} className="text-primary" />
                                  <h4 className="text-sm font-black tracking-widest uppercase text-on-surface-variant">{tier.name}</h4>
                                </div>
                                
                                {/* Supplier Pricing Grid (Side by side comparison) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-outline-variant/10">
                                  {tier.suppliers.map((supplier: any, index: number) => (
                                    <div key={index} className="p-5 flex flex-col relative group hover:bg-surface-container-lowest transition-colors">
                                      {/* Highlight lowest price visually if needed */}
                                      <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center">
                                            <Building2 size={14} className="text-on-surface-variant" />
                                          </div>
                                          <span className="font-bold text-on-surface">{supplier.name}</span>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${getStockColor(supplier.stock)}`}>
                                          {supplier.stockText}
                                        </span>
                                      </div>
                                      
                                      <div className="mt-auto">
                                        <span className="text-3xl font-black text-on-surface tracking-tighter">
                                          <span className="text-xl text-on-surface-variant/50 mr-1">$</span>
                                          {(supplier.price * 1.1).toFixed(2)}
                                        </span>
                                        <div className="text-xs text-on-surface-variant/70 mt-1 font-medium">(GST included)</div>
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
    </div>
  );
}
