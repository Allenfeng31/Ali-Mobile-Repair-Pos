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
}

interface CartContextType {
  devices: CartDevice[];
  addDevice: (brand: string, model: string, category: string, service?: RepairService) => void;
  removeDevice: (deviceId: string) => void;
  updateServices: (deviceId: string, services: RepairService[]) => void;
  clearCart: () => void;
  totalPrice: number;
  hasCustomQuote: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<CartDevice[]>([]);

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

  const addDevice = (brand: string, model: string, category: string, service?: RepairService) => {
    const newDevice: CartDevice = {
      id: Math.random().toString(36).substring(2, 9),
      brand,
      model,
      category,
      services: service ? [service] : [],
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

  const clearCart = () => {
    setDevices([]);
  };

  const totalPrice = devices.reduce((sum, device) => 
    sum + device.services.reduce((s, service) => s + (service.price || 0), 0)
  , 0);

  const hasCustomQuote = devices.some(device => 
    device.services.some(s => s.price === 0)
  );

  return (
    <CartContext.Provider value={{ 
      devices, 
      addDevice, 
      removeDevice, 
      updateServices, 
      clearCart, 
      totalPrice, 
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
