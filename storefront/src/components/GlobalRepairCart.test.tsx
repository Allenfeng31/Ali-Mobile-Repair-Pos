/**
 * @vitest-environment jsdom
 */
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import GlobalRepairCart from './GlobalRepairCart';
import { CartProvider } from '@/context/CartContext';
import React from 'react';

// Mock Next.js navigation
const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

// Mock inventory data
let mockInventory: any[] = [];

describe('GlobalRepairCart Hydration Logic', () => {
  beforeEach(() => {
    localStorage.clear();
    mockInventory = [
      {
        id: 1,
        name: 'iPhone 14 Plus Screen Replacement',
        model: 'P iPhone||iPhone 14 Plus',
        price: 199,
        category: 'phone',
        quality_grade: 'Premium'
      }
    ];

    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url.includes('/api/proxy/inventory')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockInventory),
        });
      }
      if (url.includes('/api/proxy/quality-tiers')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes('/api/proxy/store-configs')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            multi_discount_tier_2: 0.10,
            multi_discount_tier_3: 0.15,
          }),
        });
      }
      return Promise.reject(new Error('Unknown API'));
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    // Clear search params manually for each test
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
  });

  it('hydrates cart when brand, model, and service are in URL', async () => {
    mockSearchParams.set('brand', 'iPhone');
    mockSearchParams.set('model', 'iPhone 14 Plus');
    mockSearchParams.set('service', 'Screen Replacement');
    mockSearchParams.set('tier', 'Premium');

    render(
      <CartProvider>
        <GlobalRepairCart />
      </CartProvider>
    );

    // Wait for hydration to happen
    try {
      const deviceTitle = await screen.findByText(/iPhone 14 Plus/, {}, { timeout: 4000 });
      expect(deviceTitle).toBeTruthy();
      
      const serviceText = await screen.findByText('Screen Replacement');
      expect(serviceText).toBeTruthy();
      
      const priceText = await screen.findByText(/\$199/);
      expect(priceText).toBeTruthy();
    } catch (e) {
      console.log('Test failed. Current HTML:');
      screen.debug();
      throw e;
    }
  });

  it('hydrates cart with tier name when multiple variants exist', async () => {
    // Add a second variant to mock inventory
    mockInventory.push({
      id: 2,
      name: 'iPhone 14 Plus Screen Replacement',
      model: 'P iPhone||iPhone 14 Plus',
      price: 150,
      category: 'phone',
      quality_grade: 'Standard'
    });

    mockSearchParams.set('brand', 'iPhone');
    mockSearchParams.set('model', 'iPhone 14 Plus');
    mockSearchParams.set('service', 'Screen Replacement');
    mockSearchParams.set('tier', 'Premium');

    render(
      <CartProvider>
        <GlobalRepairCart />
      </CartProvider>
    );

    // Wait for hydration to happen
    const serviceText = await screen.findByText('Screen Replacement - Premium');
    expect(serviceText).toBeTruthy();
    
    const priceText = await screen.findByText(/\$199/);
    expect(priceText).toBeTruthy();
  });
});
