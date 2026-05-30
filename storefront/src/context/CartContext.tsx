"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface RepairService {
  id: number | string;
  name: string;
  price: number;
}

export interface CartDevice {
  id: string; // Internal UUID for the cart item
  brand: string;
  model: string;
  category: string;
  services: RepairService[];
  isConfirmed: boolean;
  pendingExpandedService?: string;
}

export interface MultiDiscountConfig {
  multi_discount_tier_2: number;
  multi_discount_tier_3: number;
}

interface CartContextType {
  devices: CartDevice[];
  addDevice: (brand: string, model: string, category: string, service?: RepairService, autoConfirm?: boolean, pendingExpandedService?: string | null) => void;
  removeDevice: (deviceId: string) => void;
  updateServices: (deviceId: string, services: RepairService[]) => void;
  updateDeviceInfo: (deviceId: string, brand: string, model: string, category: string) => void;
  confirmDevice: (deviceId: string) => void;
  editDevice: (deviceId: string) => void;
  clearCart: () => void;
  totalPrice: number;
  subtotalPrice: number;
  discountRate: number;
  discountAmount: number;
  qualifyingRepairItemCount: number;
  discountConfig: MultiDiscountConfig;
  hasConfirmedDevices: boolean;
  hasCustomQuote: boolean;
}

export const DEFAULT_MULTI_DISCOUNT_CONFIG: MultiDiscountConfig = {
  multi_discount_tier_2: 0.10,
  multi_discount_tier_3: 0.15,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const parseDiscountRate = (value: unknown, fallback: number) => {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  const normalized = numeric > 1 ? numeric / 100 : numeric;
  return Math.min(Math.max(normalized, 0), 0.95);
};

const priceToCents = (value: number | undefined) => Math.round((Number(value) || 0) * 100);
const centsToPrice = (cents: number) => Number((cents / 100).toFixed(2));
const isAccessoryService = (service: RepairService) => String(service.id).startsWith('upsell-');

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<CartDevice[]>([]);
  const [discountConfig, setDiscountConfig] = useState<MultiDiscountConfig>(DEFAULT_MULTI_DISCOUNT_CONFIG);

  // Load from localStorage on init
  useEffect(() => {
    const saved = localStorage.getItem('repair_cart');
    if (saved) {
      try {
        setDevices(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('repair_cart', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    const fetchDiscountConfig = async () => {
      try {
        const res = await fetch('/api/proxy/store-configs');
        if (!res.ok) return;
        const config = await res.json();
        setDiscountConfig({
          multi_discount_tier_2: parseDiscountRate(config.multi_discount_tier_2, DEFAULT_MULTI_DISCOUNT_CONFIG.multi_discount_tier_2),
          multi_discount_tier_3: parseDiscountRate(config.multi_discount_tier_3, DEFAULT_MULTI_DISCOUNT_CONFIG.multi_discount_tier_3),
        });
      } catch (error) {
        console.warn('Using default multi-item discount config.', error);
      }
    };

    fetchDiscountConfig();
  }, []);

  const addDevice = (brand: string, model: string, category: string, service?: RepairService, autoConfirm: boolean = false, pendingExpandedService?: string | null) => {
    const newDevice: CartDevice = {
      id: Math.random().toString(36).substring(2, 9),
      brand,
      model,
      category,
      services: service ? [service] : [],
      isConfirmed: autoConfirm,
      ...(pendingExpandedService ? { pendingExpandedService } : {})
    };
    setDevices(prev => [...prev, newDevice]);
  };

  const removeDevice = (deviceId: string) => {
    setDevices(prev => prev.filter(d => d.id !== deviceId));
  };

  const updateServices = (deviceId: string, services: RepairService[]) => {
    setDevices(prev => prev.map(d => 
      d.id === deviceId ? { ...d, services } : d
    ));
  };

  const updateDeviceInfo = (deviceId: string, brand: string, model: string, category: string) => {
    setDevices(prev => prev.map(d => 
      d.id === deviceId ? { ...d, brand, model, category } : d
    ));
  };

  const confirmDevice = (deviceId: string) => {
    setDevices(prev => prev.map(d => 
      d.id === deviceId ? { ...d, isConfirmed: true } : d
    ));
  };

  const editDevice = (deviceId: string) => {
    setDevices(prev => prev.map(d => 
      d.id === deviceId ? { ...d, isConfirmed: false } : d
    ));
  };

  const clearCart = () => {
    setDevices([]);
  };

  const confirmedDevices = devices.filter(d => d.isConfirmed);

  const subtotalCents = confirmedDevices.reduce((sum, device) => 
    sum + device.services.reduce((serviceSum, service) => serviceSum + priceToCents(service.price), 0)
  , 0);

  const qualifyingRepairItemCount = confirmedDevices.reduce((sum, device) => 
    sum + device.services.filter(service => !isAccessoryService(service)).length
  , 0);

  const discountRate = qualifyingRepairItemCount >= 3
    ? discountConfig.multi_discount_tier_3
    : qualifyingRepairItemCount === 2
      ? discountConfig.multi_discount_tier_2
      : 0;

  const discountCents = Math.round(subtotalCents * discountRate);
  const subtotalPrice = centsToPrice(subtotalCents);
  const discountAmount = centsToPrice(discountCents);
  const totalPrice = centsToPrice(subtotalCents - discountCents);

  const hasConfirmedDevices = confirmedDevices.length > 0;

  const hasCustomQuote = confirmedDevices.some(device => 
    device.services.some(s => s.price === 0)
  );

  return (
    <CartContext.Provider value={{ 
      devices, 
      addDevice, 
      removeDevice, 
      updateServices, 
      updateDeviceInfo,
      confirmDevice,
      editDevice,
      clearCart, 
      totalPrice, 
      subtotalPrice,
      discountRate,
      discountAmount,
      qualifyingRepairItemCount,
      discountConfig,
      hasConfirmedDevices,
      hasCustomQuote 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
