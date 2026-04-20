"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart, RepairService, CartDevice } from '@/context/CartContext';
import { 
  RawItem, ParsedItem, parseItem, displayBrand, TABS, MANUAL_MODELS 
} from '@/lib/inventoryUtils';
import './RepairCart.css';

// ── Shared Component for the Cart ──────────────────────────────────────────

const CartContent = () => {
  const { devices, addDevice, removeDevice, updateServices, totalPrice, hasCustomQuote } = useCart();
  const searchParams = useSearchParams();
  
  const [inventory, setInventory] = useState<ParsedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
    fetchInventory();
  }, []);

  // ── SEO Intent Auto-Populate ──────────────────────────────────────────────
  useEffect(() => {
    if (loading || inventory.length === 0) return;

    const modelParam = searchParams.get('model');
    const repairParam = searchParams.get('repair');

    if (modelParam) {
      const decodedModel = modelParam.replace(/-/g, ' ').toLowerCase();
      // Find the best match in inventory
      const matchedItem = inventory.find(i => 
        i.deviceModel.toLowerCase() === decodedModel || 
        i.deviceModel.toLowerCase().replace(/\s+/g, '-') === modelParam
      );

      if (matchedItem) {
        // If this exact model is not already in the cart, add it
        const alreadyInCart = devices.some(d => d.brand === matchedItem.brand && d.model === matchedItem.deviceModel);
        
        if (!alreadyInCart) {
          let serviceToSelect: RepairService | undefined = undefined;
          if (repairParam) {
            const decodedRepair = repairParam.replace(/-/g, ' ').toLowerCase();
            const matchedService = inventory.find(i => 
              i.brand === matchedItem.brand && 
              i.deviceModel === matchedItem.deviceModel &&
              (i.service.toLowerCase() === decodedRepair || i.service.toLowerCase().replace(/\s+/g, '-') === repairParam)
            );
            if (matchedService) {
              serviceToSelect = { id: matchedService.id, name: matchedService.service, price: matchedService.price };
            }
          }
          addDevice(matchedItem.brand, matchedItem.deviceModel, matchedItem.category, serviceToSelect);
        }
      }
    }
  }, [loading, inventory, searchParams, addDevice, devices]);

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
          isFirst={idx === 0}
        />
      ))}

      <div className="add-device-section">
        <button className="add-device-btn" onClick={() => addDevice("", "", "PHONE")}>
          + Add another device
        </button>
      </div>

      {devices.length > 0 && (
        <div className="cart-footer animate-fade">
          <div className="total-section">
            <h4>Estimated Cost (Pay In-Store)</h4>
            <div className="total-amount">
              ${totalPrice.toFixed(2)}
              {hasCustomQuote && <span className="custom-quote-badge"> + Custom Quote</span>}
            </div>
            <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem', color: 'var(--foreground)' }}>
              💡 No upfront payment required. You only pay in-store after your device is successfully repaired.
            </p>
          </div>
          
          <button className="checkout-btn" onClick={() => window.location.href = `/book-repair/checkout`}>
            Book Visit
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
  isFirst: boolean;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({ device, inventory, brands, onRemove, onUpdate, isFirst }) => {
  const [selectedBrand, setSelectedBrand] = useState(device.brand || "");
  const [selectedModel, setSelectedModel] = useState(device.model || "");

  const models = useMemo(() => {
    if (!selectedBrand) return [];
    const dbModels = inventory.filter(i => i.brand === selectedBrand).map(i => i.deviceModel);
    return Array.from(new Set(dbModels)).sort();
  }, [inventory, selectedBrand]);

  const availableServices = useMemo(() => {
    if (!selectedBrand || !selectedModel) return [];
    return inventory.filter(i => i.brand === selectedBrand && i.deviceModel === selectedModel);
  }, [inventory, selectedBrand, selectedModel]);

  const toggleService = (s: ParsedItem) => {
    const isSelected = device.services.some(item => item.id === s.id);
    if (isSelected) {
      onUpdate(device.services.filter(item => item.id !== s.id));
    } else {
      onUpdate([...device.services, { id: s.id, name: s.service, price: s.price }]);
    }
  };

  return (
    <div className="device-entry animate-fade">
      <div className="device-info-header">
        <div className="device-title">
          {selectedModel ? `${displayBrand(selectedBrand)} ${selectedModel}` : "New Device"}
        </div>
        {!isFirst && <button className="remove-device-btn" onClick={onRemove}>Remove</button>}
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
            {brands.map(b => <option key={b} value={b}>{displayBrand(b)}</option>)}
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
        <div className="services-grid">
          {availableServices.length > 0 ? (
            availableServices.map(s => (
              <div 
                key={s.id} 
                className={`service-card ${device.services.some(item => item.id === s.id) ? 'selected' : ''}`}
                onClick={() => toggleService(s)}
              >
                <div className="checkbox-custom" />
                <div className="service-name-price">
                  <span className="service-name">{s.service}</span>
                  <span className="service-price">
                    {s.price > 0 ? `$${s.price.toFixed(2)}` : "Quote on Request"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ gridColumn: '1/-1', opacity: 0.5, fontSize: '0.85rem' }}>
              No standard pricing found. We can still help! Please add to cart and we will quote you.
            </p>
          )}
        </div>
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
