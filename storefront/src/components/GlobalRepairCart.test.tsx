/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import GlobalRepairCart from './GlobalRepairCart';
import { CartProvider } from '@/context/CartContext';
import { buildBookingPayload } from '@/lib/bookingPayload';
import { resolvePublicBookingSelection } from '@/lib/publicBookingSelection';
import type { RepairCatalog } from '@/lib/publicRepairCataloguePolicy';
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

// Mock inventory data
let mockInventory: Array<Record<string, unknown>> = [];

const bookingCatalog = {
  brands: [
    {
      category: 'phone', brand: 'iPhone', slug: 'iphone', icon: '', models: [{
        model: 'iPhone 14 Plus', slug: 'iphone-14-plus', repairTypes: [{
          slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'pos',
        }],
      }],
    },
    {
      category: 'phone', brand: 'Google Pixel', slug: 'google-pixel', icon: '', models: [{
        model: 'Pixel 10a', slug: 'pixel-10a', repairTypes: [{
          slug: 'screen-replacement', name: 'Screen Replacement', price: 120, repairOrigin: 'pos',
        }],
      }],
    },
  ],
} as Pick<RepairCatalog, 'brands'>;

describe('GlobalRepairCart Hydration Logic', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
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
      if (url.includes('/api/booking-selection')) {
        const params = new URL(url, 'https://example.test').searchParams;
        const selection = resolvePublicBookingSelection(bookingCatalog, Object.fromEntries(params.entries()));
        if (!selection) {
          return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'Invalid booking selection.' }) });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ selection }),
        });
      }
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
      if (url.includes('/api/storefront-upsells')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
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
      expect(global.fetch).toHaveBeenCalledWith('/api/storefront-upsells');
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

  it('renders the fixed $50 Camera Lens service for a Google booking without an exact POS product', async () => {
    mockInventory = [{
      id: 3,
      name: 'Google Pixel Pixel 10a Screen Replacement',
      model: 'P Google Pixel||Pixel 10a',
      price: 120,
      category: 'phone',
      quality_grade: 'Standard',
    }];
    mockSearchParams.set('brand', 'Google Pixel');
    mockSearchParams.set('model', 'Pixel 10a');
    mockSearchParams.set('service', 'Camera Lens Replacement');

    render(
      <CartProvider>
        <GlobalRepairCart />
      </CartProvider>
    );

    await screen.findByText('Google Pixel Pixel 10a');
    expect(screen.getByText('Camera Lens Replacement')).toBeTruthy();
    expect(screen.getByText('$50.00')).toBeTruthy();
  });

  it('confirms a validated quote-only Loudspeaker repair without using its virtual $50 fallback', async () => {
    mockSearchParams.set('category', 'phone');
    mockSearchParams.set('brandSlug', 'google-pixel');
    mockSearchParams.set('modelSlug', 'pixel-10a');
    mockSearchParams.set('serviceSlug', 'loudspeaker-replacement');
    mockSearchParams.set('brand', 'Google Pixel');
    mockSearchParams.set('model', 'Pixel 10a');
    mockSearchParams.set('service', 'Loudspeaker Replacement');

    render(<CartProvider><GlobalRepairCart /></CartProvider>);

    await screen.findByText('Google Pixel Pixel 10a');
    expect(screen.getByText('Loudspeaker Replacement')).toBeTruthy();
    expect(screen.getByText('Custom Quote')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Confirm Selection' })).toBeNull();
    expect(screen.queryByText('Starting from $50')).toBeNull();
    expect(screen.queryByText('$50.00')).toBeNull();
  });

  it('displays the discount on known repairs alongside a pending Custom Quote', async () => {
    localStorage.setItem('repair_cart', JSON.stringify([
      {
        id: 'paid-device', brand: 'P iPhone', model: 'iPhone 14 Plus', category: 'phone', isConfirmed: true,
        services: [{ id: 1, name: 'Screen Replacement', price: 100 }],
      },
      {
        id: 'quote-device', brand: 'P Google Pixel', model: 'Pixel 10a', category: 'phone', isConfirmed: true,
        services: [{
          id: 'public-booking:phone:google-pixel:pixel-10a:loudspeaker-replacement',
          name: 'Loudspeaker Replacement', price: 0,
        }],
      },
    ]));

    render(<CartProvider><GlobalRepairCart /></CartProvider>);

    await screen.findByText('$90.00');
    expect(document.querySelector('.custom-quote-badge')?.textContent).toContain('Custom Quote');
    expect(screen.queryByText('$50.00')).toBeNull();
  });

  it('preserves a canonical Custom Quote through same-repair reselect, reload, and payload construction', async () => {
    mockInventory = [{
      id: 7,
      name: 'Google Pixel Pixel 10a Screen Replacement',
      model: 'P Google Pixel||Pixel 10a',
      price: 120,
      category: 'phone',
      quality_grade: 'Standard',
    }];
    localStorage.setItem('repair_cart', JSON.stringify([{
      id: 'quote-device', brand: 'P Google Pixel', model: 'Pixel 10a', category: 'phone', isConfirmed: true,
      services: [{
        id: 'public-booking:phone:google-pixel:pixel-10a:loudspeaker-replacement',
        name: 'Loudspeaker Replacement', price: 0,
      }],
    }]));

    render(<CartProvider><GlobalRepairCart /></CartProvider>);

    await screen.findByRole('button', { name: 'Edit' });
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const serviceCard = (await screen.findByText('Loudspeaker Replacement')).closest('.service-card');
    expect(serviceCard?.className).toContain('selected');
    expect(serviceCard?.querySelector('.service-price')?.textContent).toBe('Custom Quote');

    fireEvent.click(screen.getByRole('button', { name: 'Confirm Selection' }));
    await screen.findByRole('button', { name: 'Edit' });
    await waitFor(() => expect(JSON.parse(localStorage.getItem('repair_cart') ?? '[]')[0].services).toEqual([{
      id: 'public-booking:phone:google-pixel:pixel-10a:loudspeaker-replacement',
      name: 'Loudspeaker Replacement', price: 0,
    }]));

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const selectedServiceCard = (await screen.findByText('Loudspeaker Replacement')).closest('.service-card');
    fireEvent.click(selectedServiceCard!);
    await waitFor(() => expect((screen.getByRole('button', { name: 'Confirm Selection' }) as HTMLButtonElement).disabled).toBe(true));

    fireEvent.click(selectedServiceCard!);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Selection' }));
    await screen.findByRole('button', { name: 'Edit' });

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const reselectedServiceCard = (await screen.findByText('Loudspeaker Replacement')).closest('.service-card');
    fireEvent.click(reselectedServiceCard!);
    fireEvent.click(reselectedServiceCard!);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Selection' }));
    await screen.findByRole('button', { name: 'Edit' });

    const storedAfterReselect = JSON.parse(localStorage.getItem('repair_cart') ?? '[]');
    expect(storedAfterReselect[0].services).toEqual([{
      id: 'public-booking:phone:google-pixel:pixel-10a:loudspeaker-replacement',
      name: 'Loudspeaker Replacement', price: 0,
    }]);

    cleanup();
    render(<CartProvider><GlobalRepairCart /></CartProvider>);
    await screen.findByRole('button', { name: 'Edit' });
    const payload = buildBookingPayload({
      customerName: 'Test Customer', phone: '0400000000', devices: JSON.parse(localStorage.getItem('repair_cart') ?? '[]'),
      total: 0, hasCustomQuote: true,
      pricing: { subtotal: 0, discountRate: 0, discountAmount: 0, qualifyingRepairItemCount: 1, total: 0 },
      datetime: '2026-07-15T10:00:00.000Z', displayDate: '15/07/2026 10:00', notes: '', sessionToken: null,
    });
    expect(payload.devices[0].services[0]).toMatchObject({
      id: 'public-booking:phone:google-pixel:pixel-10a:loudspeaker-replacement', price: 0,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const canonicalServiceCard = (await screen.findByText('Loudspeaker Replacement')).closest('.service-card');
    fireEvent.click(canonicalServiceCard!);
    const replacementServiceCard = (await screen.findByText('Volume Button Replacement')).closest('.service-card');
    fireEvent.click(replacementServiceCard!);
    expect(replacementServiceCard?.querySelector('.service-price')?.textContent).toBe('Custom Quote');
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Selection' }));
    await screen.findByRole('button', { name: 'Edit' });
    await waitFor(() => expect(JSON.parse(localStorage.getItem('repair_cart') ?? '[]')[0].services).toHaveLength(1));
    expect(JSON.parse(localStorage.getItem('repair_cart') ?? '[]')[0].services[0]).toMatchObject({
      id: 'virtual-volume-button-google-pixel-10a', name: 'Volume Button Replacement', price: 0,
    });
    expect(JSON.parse(localStorage.getItem('repair_cart') ?? '[]')[0].validatedPublicBookingService).toBeUndefined();
  });

  it('does not insert a device when canonical booking validation fails closed', async () => {
    mockSearchParams.set('category', 'phone');
    mockSearchParams.set('brandSlug', 'google-pixel');
    mockSearchParams.set('modelSlug', 'pixel-8');
    mockSearchParams.set('serviceSlug', 'invalid-repair');

    render(<CartProvider><GlobalRepairCart /></CartProvider>);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/booking-selection?')));
    expect(screen.queryByText(/Google Pixel Pixel 8/)).toBeNull();
  });

  it('does not duplicate a real resolved booking after cart reinitialisation', async () => {
    mockSearchParams.set('category', 'phone');
    mockSearchParams.set('brandSlug', 'iphone');
    mockSearchParams.set('modelSlug', 'iphone-14-plus');
    mockSearchParams.set('serviceSlug', 'screen-replacement');
    mockSearchParams.set('brand', 'iPhone');
    mockSearchParams.set('model', 'iPhone 14 Plus');
    mockSearchParams.set('service', 'Screen Replacement');

    const firstRender = render(<CartProvider><GlobalRepairCart /></CartProvider>);
    await screen.findByText('Screen Replacement');
    expect(screen.queryByRole('button', { name: 'Confirm Selection' })).toBeNull();
    await waitFor(() => expect(JSON.parse(localStorage.getItem('repair_cart') ?? '[]')).toHaveLength(1));
    firstRender.unmount();

    render(<CartProvider><GlobalRepairCart /></CartProvider>);
    await screen.findByText('Screen Replacement');
    await waitFor(() => expect(JSON.parse(localStorage.getItem('repair_cart') ?? '[]')).toHaveLength(1));
  });

  it('keeps manual edit and add-device flows available after a confirmed repair', async () => {
    localStorage.setItem('repair_cart', JSON.stringify([{
      id: 'manual-device', brand: 'P iPhone', model: 'iPhone 14 Plus', category: 'phone', isConfirmed: true,
      services: [{ id: 1, name: 'Screen Replacement', price: 199 }],
    }]));

    render(<CartProvider><GlobalRepairCart /></CartProvider>);

    await screen.findByRole('button', { name: 'Edit' });
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await screen.findByRole('button', { name: 'Confirm Selection' });

    fireEvent.click(screen.getByRole('button', { name: 'Confirm Selection' }));
    await screen.findByRole('button', { name: 'Edit' });

    fireEvent.click(screen.getByRole('button', { name: '+ Add another device' }));
    await waitFor(() => expect(screen.getAllByText('Brand')).toHaveLength(1));
  });
});
