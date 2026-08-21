import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import BrandHubPage, { generateMetadata } from './page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  notFound: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: class IntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  },
});

vi.mock('@/lib/api', () => ({
  fetchBrandModels: vi.fn().mockResolvedValue({ brand: { brand: 'MacBook' } }),
  fetchRepairCatalog: vi.fn().mockResolvedValue({
    brands: [{
      category: 'laptop',
      slug: 'macbook',
      models: [{ slug: 'macbook-pro-14-m3', model: 'MacBook Pro 14 M3', repairTypes: [] }],
    }],
  }),
}));

describe('MacBook Brand Hub Service Areas', () => {
  it('renders eight canonical location cards in the required nearby-area order', async () => {
    const pageElement = await BrandHubPage({ params: Promise.resolve({ category: 'laptop', brand: 'macbook' }) });
    const { container } = render(pageElement);
    const text = container.textContent || '';
    const cards = [...container.querySelectorAll<HTMLAnchorElement>('.iphone-service-area-link')];
    const expectedSlugs = [
      'ringwood-east',
      'ringwood-north',
      'heathmont',
      'mitcham',
      'croydon',
      'nunawading',
      'wantirna',
      'glenwaverley',
    ];

    expect(cards).toHaveLength(8);
    expect(cards.map((card) => card.getAttribute('href'))).toEqual(
      expectedSlugs.map((slug) => `/locations/${slug}`)
    );
    expect(new Set(cards.map((card) => card.getAttribute('href'))).size).toBe(8);
    expect(text).toContain('MacBook repair near Mitcham is supported from our Ringwood Square repair desk, with the exact model, fault, parts availability and quote confirmed before work begins.');
    expect(text).toContain('MacBook repair near Croydon starts with model and fault confirmation. Customers can contact our Ringwood Square team before travelling to check parts availability and likely timing.');
    expect(text).toContain('Customers also visit Ali Mobile & Repair at Ringwood Square from Ringwood East, Ringwood North, Heathmont, Mitcham, Croydon, Nunawading, Wantirna and Glen Waverley for MacBook repair assessment and quote support.');
    expect(text).toContain('MacBook Repair in Ringwood');
    expect(text).toContain('Ringwood Square Shopping Centre Kiosk C1');
  });

  it('keeps the MacBook metadata and canonical ownership unchanged', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ category: 'laptop', brand: 'macbook' }) });

    expect(metadata.title).toBe('MacBook Repair in Ringwood | Ali Mobile & Repair');
    expect(metadata.alternates?.canonical).toBe('/repairs/laptop/macbook');
  });
});
