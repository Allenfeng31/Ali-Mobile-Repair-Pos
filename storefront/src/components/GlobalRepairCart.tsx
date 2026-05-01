"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart, RepairService, CartDevice } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { 
  RawItem, ParsedItem, parseItem, displayBrand, TABS, MANUAL_MODELS, detectDeviceType, formatDeviceTitle,
  groupServicesByBaseName, GroupedService
} from '@/lib/inventoryUtils';
import { smartSortModels } from '@/lib/modelSortConfig';
import './RepairCart.css';

// ── Types ──────────────────────────────────────────────────────────────────
interface UpsellItem {
  id: string;
  name: string;
  description: string;
  regular_price: number;
  bundle_price: number;
}

// Dynamic tier descriptions fetched from backend
// previously TIER_DESCRIPTIONS

// ── Shared Component for the Cart ──────────────────────────────────────────

const CartContent = () => {
  const { 
    devices, addDevice, removeDevice, updateServices, updateDeviceInfo, 
    confirmDevice, editDevice, totalPrice, hasCustomQuote 
  } = useCart();
  const searchParams = useSearchParams();
  
  const [inventory, setInventory] = useState<ParsedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [upsells, setUpsells] = useState<UpsellItem[]>([]);
  const [tierDescriptions, setTierDescriptions] = useState<Record<string, string>>({});

  // Fetch inventory once - NO POLLING
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch('/api/proxy/inventory');
        if (!res.ok) throw new Error(`${res.status}`);
        const raw: RawItem[] = await res.json();
        const parsed = raw.map(parseItem).filter(Boolean) as ParsedItem[];
        setInventory(parsed);
      } catch (err) {
        console.error('Failed to load inventory', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    const fetchTierDescriptions = async () => {
      try {
        const res = await fetch('/api/proxy/quality-tiers');
        if (res.ok) {
          const tiers = await res.json();
          const map: Record<string, string> = {};
          tiers.forEach((t: any) => { map[t.name] = t.description; });
          setTierDescriptions(map);
        }
      } catch (err) {
        console.error('Failed to load quality tiers', err);
      }
    };

    fetchInventory();
    fetchTierDescriptions();
  }, []);

  // Fetch active upsells from Supabase
  useEffect(() => {
    const fetchUpsells = async () => {
      try {
        const { data, error } = await supabase
          .from('storefront_upsells')
          .select('id, name, description, regular_price, bundle_price')
          .eq('is_active', true);

        if (!error && data) {
          setUpsells(data);
        }
      } catch (err) {
        console.error('Failed to load upsells', err);
      }
    };
    fetchUpsells();
  }, []);

  // ── SEO Intent Auto-Populate (One-time Consume & Clear) ───────────────────
  useEffect(() => {
    if (loading || inventory.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const brandParam = params.get('brand');
    const modelParam = params.get('model');
    const serviceParam = params.get('service');
    const legacyModelParam = params.get('model') && !brandParam ? params.get('model') : null;
    const legacyRepairParam = params.get('repair');

    import('@/lib/cartAutoSelect').then(({ resolveInitialCartState }) => {
      if (brandParam && modelParam) {
        const { brand, model, category, serviceToSelect, shouldAutoConfirm } = resolveInitialCartState(
          brandParam,
          modelParam,
          serviceParam,
          inventory
        );

        if (brand && model && category) {
          const alreadyInCart = devices.some(d => d.brand === brand && d.model === model);
          if (!alreadyInCart) {
            addDevice(brand, model, category as ParsedItem["deviceType"], serviceToSelect || undefined, shouldAutoConfirm);
          }
        }
      } else if (legacyModelParam) {
        const decodedModel = legacyModelParam.replace(/-/g, ' ').toLowerCase();
        const matchedItem = inventory.find(i => 
          i.deviceModel.toLowerCase() === decodedModel || 
          i.deviceModel.toLowerCase().replace(/\s+/g, '-') === legacyModelParam
        );

        if (matchedItem) {
          const alreadyInCart = devices.some(d => d.brand === matchedItem.brand && d.model === matchedItem.deviceModel);
          if (!alreadyInCart) {
            let serviceToSelect: RepairService | undefined = undefined;
            if (legacyRepairParam) {
              const decodedRepair = legacyRepairParam.replace(/-/g, ' ').toLowerCase();
              const matchedService = inventory.find(i => 
                i.brand === matchedItem.brand && 
                i.deviceModel === matchedItem.deviceModel &&
                (i.service.toLowerCase() === decodedRepair || i.service.toLowerCase().replace(/\s+/g, '-') === legacyRepairParam)
              );
              if (matchedService) {
                serviceToSelect = { id: matchedService.id, name: matchedService.service, price: matchedService.price };
              }
            }
            addDevice(matchedItem.brand, matchedItem.deviceModel, matchedItem.category, serviceToSelect, true);
          }
        }
      }
      
      if (brandParam || legacyModelParam) {
        // CRITICAL: Clear URL parameters once consumed to prevent state hijacking on refresh/interaction
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    });
  }, [loading, inventory]); // Remove devices/searchParams from deps to ensure it only runs once on load

  // UI Helpers
  const brands = useMemo(() => Array.from(new Set(inventory.map(i => i.brand))).sort(), [inventory]);
  
  const getModels = (brand: string) => {
    const dbModels = inventory.filter(i => i.brand === brand).map(i => i.deviceModel);
    return Array.from(new Set(dbModels)).sort();
  };

  const getServices = (brand: string, model: string) => {
    return inventory.filter(i => i.brand === brand && i.deviceModel === model);
  };

  if (loading) return <div className="cart-container"><p style={{ textAlign: 'center' }}>Loading workshop data...</p></div>;
  if (error) return <div className="cart-container"><p style={{ textAlign: 'center', color: '#ff3b30' }}>Workshop connection failed. Please call 0481 058 514.</p></div>;

  return (
    <div className="cart-container animate-fade">
      <div className="cart-header">
        <h1>Repair Cart</h1>
        <p>Select multiple devices or repairs. Prices are live and transparent.</p>
      </div>

      {devices.map((device, idx) => (
        <DeviceSelector 
          key={device.id}
          device={device}
          inventory={inventory}
          brands={brands}
          onRemove={() => removeDevice(device.id)}
          onUpdate={(services) => updateServices(device.id, services)}
          onConfirm={() => confirmDevice(device.id)}
          onEdit={() => editDevice(device.id)}
          onUpdateInfo={(brand, model, category) => updateDeviceInfo(device.id, brand, model, category)}
          isFirst={idx === 0}
          upsells={upsells}
          tierDescriptions={tierDescriptions}
        />
      ))}

        <button className="add-device-btn" onClick={() => addDevice("", "", "phone")}>
          + Add another device
        </button>

      {devices.length > 0 && (
        <div className="cart-footer animate-fade">
          <div className="total-section">
            <h4>Estimated Cost (Pay In-Store)</h4>
            <div className="total-amount">
              {totalPrice > 0 ? (
                <>
                  ${totalPrice.toFixed(2)}
                  {hasCustomQuote && <span className="custom-quote-badge"> + Custom Quote</span>}
                </>
              ) : (
                hasCustomQuote ? "Custom Quote" : "$0.00"
              )}
            </div>
            <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem', color: 'var(--foreground)' }}>
              💡 No upfront payment required. You only pay in-store after your device is successfully repaired.
            </p>
          </div>
          
          <button 
            className="checkout-btn" 
            onClick={() => window.location.href = `/book-repair/checkout`}
            disabled={!devices.some(d => d.isConfirmed)}
            style={{ opacity: devices.some(d => d.isConfirmed) ? 1 : 0.5 }}
          >
            Book Repair
          </button>
        </div>
      )}
    </div>
  );
};

// ── Sub-component for individual device selection ───────────────────────────

interface DeviceSelectorProps {
  device: CartDevice;
  inventory: ParsedItem[];
  brands: string[];
  onRemove: () => void;
  onUpdate: (services: RepairService[]) => void;
  onConfirm: () => void;
  onEdit: () => void;
  onUpdateInfo: (brand: string, model: string, category: string) => void;
  isFirst: boolean;
  upsells: UpsellItem[];
  tierDescriptions: Record<string, string>;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({ 
  device, inventory, brands, onRemove, onUpdate, onConfirm, onEdit, onUpdateInfo, isFirst, upsells, tierDescriptions 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ParsedItem["deviceType"]>((device.category || "phone").toLowerCase() as ParsedItem["deviceType"]);
  const [selectedBrand, setSelectedBrand] = useState(device.brand || "");
  const [selectedModel, setSelectedModel] = useState(device.model || "");

  const sortedBrands = useMemo(() => {
    const PRIORITY_BRANDS = ['iPhone', 'Samsung', 'Google', 'Oppo'];
    const filtered = brands.filter(b => detectDeviceType(b) === selectedCategory);
    
    // UI Safeguard: Deduplicate by display name to prevent visually identical options
    const displayToRaw = new Map<string, string[]>();
    filtered.forEach(b => {
      const display = displayBrand(b);
      if (!displayToRaw.has(display)) displayToRaw.set(display, []);
      displayToRaw.get(display)!.push(b);
    });

    // Development-time validation: Log warning if duplicate raw brands produce the same display label
    if (process.env.NODE_ENV === 'development') {
      const duplicates = Array.from(displayToRaw.entries()).filter(([_, raws]) => raws.length > 1);
      if (duplicates.length > 0) {
        console.warn(
          `[Inventory Validation] Duplicate brands detected for category "${selectedCategory}":`,
          duplicates.map(([display, raws]) => `${display} (${raws.join(', ')})`)
        );
      }
    }

    const uniqueBrands = Array.from(displayToRaw.values()).map(raws => raws[0]);
    
    const priority = uniqueBrands
      .filter(b => PRIORITY_BRANDS.includes(displayBrand(b)))
      .sort((a, b) => PRIORITY_BRANDS.indexOf(displayBrand(a)) - PRIORITY_BRANDS.indexOf(displayBrand(b)));
      
    const others = uniqueBrands
      .filter(b => !PRIORITY_BRANDS.includes(displayBrand(b)))
      .sort((a, b) => displayBrand(a).localeCompare(displayBrand(b)));
      
    return { priority, others };
  }, [brands, selectedCategory]);

  const models = useMemo(() => {
    if (!selectedBrand) return [];
    const dbModels = inventory.filter(i => i.brand === selectedBrand).map(i => i.deviceModel);
    const uniqueModels = Array.from(new Set(dbModels));
    
    // Apply Generation-Aware Sorting
    const modelItems = uniqueModels.map(m => ({ model: m, slug: "", repairTypes: [] }));
    const sorted = smartSortModels(modelItems);
    return sorted.map(s => s.model);
  }, [inventory, selectedBrand]);

  const availableServices = useMemo(() => {
    if (!selectedBrand || !selectedModel) return [];
    const filtered = inventory.filter(i => i.brand === selectedBrand && i.deviceModel === selectedModel);
    return groupServicesByBaseName(filtered);
  }, [inventory, selectedBrand, selectedModel]);

  const isGroupSelected = (s: GroupedService) => 
    s.variants.some(v => device.services.some(ds => ds.id === v.id));

  const toggleService = (s: GroupedService) => {
    const isSelected = isGroupSelected(s);
    if (isSelected) {
      const variantIds = s.variants.map(v => v.id);
      onUpdate(device.services.filter(item => !variantIds.includes(item.id as number)));
    } else {
      const defaultVariant = s.variants.find(v => v.quality_grade === 'Standard') || s.variants[0];
      const name = s.variants.length > 1 ? `${s.service} - ${defaultVariant.quality_grade}` : s.service;
      onUpdate([...device.services, { id: defaultVariant.id, name, price: defaultVariant.price }]);
    }
  };

  const selectVariant = (s: GroupedService, variantId: number) => {
    const variant = s.variants.find(v => v.id === variantId);
    if (!variant) return;
    const name = s.variants.length > 1 ? `${s.service} - ${variant.quality_grade}` : s.service;
    const newServices = device.services.filter(item => !s.variants.some(v => v.id === item.id));
    onUpdate([...newServices, { id: variant.id, name, price: variant.price }]);
  };

  const handleConfirm = () => {
    if (!selectedBrand || !selectedModel) return alert("Please select brand and model first");
    if (device.services.length === 0) return alert("Please select at least one repair service");
    onUpdateInfo(selectedBrand, selectedModel, selectedCategory);
    onConfirm();
  };

  if (device.isConfirmed) {
    return (
      <div className="device-summary-card-wrapper animate-fade">
        <div className="device-summary-card">
          <div className="summary-main">
            <div className="summary-title">
              {formatDeviceTitle(device.brand, device.model)}
            </div>
            <div className="summary-services">
              {device.services.filter(s => !String(s.id).startsWith('upsell-')).map(s => s.name).join(", ")}
            </div>
          </div>
          <div className="summary-actions">
            <button className="edit-summary-btn" onClick={onEdit}>Edit</button>
            <button className="remove-summary-btn" onClick={onRemove}>Remove</button>
          </div>
        </div>
        
        {upsells.map(upsell => {
          const upsellServiceId = `upsell-${upsell.id}-${device.id}`;
          const isAdded = device.services.some(s => s.id === upsellServiceId);

          return (
            <div key={upsell.id} className="upsell-banner">
              <div className="upsell-text">
                <span>💡</span>
                <span>{upsell.name}</span>
                {upsell.description && (
                  <span style={{ opacity: 0.7, fontSize: '0.82rem' }}> — {upsell.description}</span>
                )}
                {Number(upsell.regular_price) > 0 && Number(upsell.regular_price) !== Number(upsell.bundle_price) && (
                  <span style={{ textDecoration: 'line-through', opacity: 0.45, marginLeft: '0.5rem', fontSize: '0.82rem' }}>
                    ${Number(upsell.regular_price).toFixed(2)}
                  </span>
                )}
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                  ${Number(upsell.bundle_price).toFixed(2)}
                </span>
              </div>
              <button 
                className={`add-upsell-btn ${isAdded ? 'added' : ''}`}
                onClick={() => {
                  if (isAdded) {
                    onUpdate(device.services.filter(s => s.id !== upsellServiceId));
                  } else {
                    onUpdate([...device.services, { 
                      id: upsellServiceId, 
                      name: upsell.name, 
                      price: Number(upsell.bundle_price) 
                    }]);
                  }
                }}
              >
                {isAdded ? 'Added ✓' : '+ Add'}
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="device-entry animate-fade">
      <div className="device-info-header">
        <div className="device-title">
          {formatDeviceTitle(selectedBrand, selectedModel)}
        </div>
        {!isFirst && <button className="remove-device-btn" onClick={onRemove}>Remove</button>}
      </div>

      <div className="category-selector-row">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`category-pill ${selectedCategory === tab.key ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory(tab.key);
              setSelectedBrand("");
              setSelectedModel("");
              onUpdate([]);
            }}
          >
            <span className="tab-emoji">{tab.emoji}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="selector-row">
        <div className="selector-group">
          <label>Brand</label>
          <select 
            className="cart-control" 
            value={selectedBrand} 
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setSelectedModel("");
              onUpdate([]);
            }}
          >
            <option value="">-- Brand --</option>
            {sortedBrands.priority.length > 0 && (
              <>
                <optgroup label="Popular Brands">
                  {sortedBrands.priority.map(b => (
                    <option key={b} value={b}>{displayBrand(b)}</option>
                  ))}
                </optgroup>
                <option disabled>──────────</option>
              </>
            )}
            {sortedBrands.others.map(b => (
              <option key={b} value={b}>{displayBrand(b)}</option>
            ))}
          </select>
        </div>
        <div className="selector-group">
          <label>Model</label>
          <select 
            className="cart-control" 
            value={selectedModel} 
            disabled={!selectedBrand}
            onChange={(e) => {
              setSelectedModel(e.target.value);
              onUpdate([]);
            }}
          >
            <option value="">-- Model --</option>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {selectedModel && (
        <>
          <div className="services-grid animate-fade">
            {availableServices.length > 0 ? (
              availableServices.map(s => {
                const isSelected = isGroupSelected(s);
                const selectedVariantId = isSelected 
                  ? device.services.find(ds => s.variants.some(v => v.id === ds.id))?.id 
                  : null;

                return (
                  <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div 
                      className={`service-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleService(s)}
                      style={isSelected && s.variants.length > 1 ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' } : {}}
                    >
                      <div className="checkbox-custom" />
                      <div className="service-name-price">
                        <span className="service-name">{s.service}</span>
                        <span className="service-price">
                          {s.price > 0 ? (s.variants.length > 1 ? `From $${s.price}` : `$${s.price.toFixed(2)}`) : "Quote on Request"}
                        </span>
                      </div>
                    </div>

                    {isSelected && s.variants.length > 1 && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1px',
                        background: 'var(--layer-border)',
                        border: '1px solid var(--layer-border)',
                        borderTop: 'none',
                        borderBottomLeftRadius: '12px',
                        borderBottomRightRadius: '12px',
                        overflow: 'hidden',
                        marginTop: '-0.5rem',
                        padding: '0.5rem'
                      }}>
                        {s.variants.map(v => (
                          <label 
                            key={v.id} 
                            style={{
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '1rem', 
                              padding: '0.8rem', 
                              background: selectedVariantId === v.id ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--layer)',
                              cursor: 'pointer',
                              borderRadius: '8px',
                              border: selectedVariantId === v.id ? '1px solid var(--primary)' : '1px solid transparent',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <input 
                              type="radio" 
                              name={`variant-${s.id}`} 
                              checked={selectedVariantId === v.id}
                              onChange={() => selectVariant(s, v.id)}
                              style={{ accentColor: 'var(--primary)', width: '1.1rem', height: '1.1rem', margin: 0 }}
                            />
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{v.quality_grade} Tier</span>
                              <span 
                                title={tierDescriptions[v.quality_grade] || 'Information about this tier'} 
                                style={{ 
                                  cursor: 'help', 
                                  opacity: 0.6, 
                                  fontSize: '0.85rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  background: 'var(--layer-border)',
                                  color: 'var(--foreground)'
                                }}
                              >
                                ?
                              </span>
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>${v.price}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p style={{ gridColumn: '1/-1', opacity: 0.5, fontSize: '0.85rem' }}>
                No standard pricing found. We can still help! Please add to cart and we will quote you.
              </p>
            )}
          </div>

          <div className="confirmation-row">
            <button 
              className="confirm-device-btn"
              onClick={handleConfirm}
              disabled={device.services.length === 0}
            >
              Confirm Selection
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ── Wrapper with Suspense for useSearchParams ──────────────────────────────

export default function GlobalRepairCart() {
  return (
    <Suspense fallback={<div>Loading Cart...</div>}>
      <CartContent />
    </Suspense>
  );
}
