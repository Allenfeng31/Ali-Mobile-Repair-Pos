/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./RepairTypeModelGrid', () => ({ default: () => <section data-repair-type-finder>Finder</section> }));
vi.mock('./RepairTypeHubCrawlerLinkIndex', () => ({ default: () => <section data-repair-type-crawler-index>Browse</section> }));
vi.mock('./RepairTypeHubSelectedDevice', () => ({ default: ({ selected }: { selected: { model: string } }) => <section data-repair-type-selected>{selected.model}</section> }));
vi.mock('next/link', () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock('lucide-react', () => ({ ArrowLeft: () => null }));

import RepairTypeHubPage from './RepairTypeHubPage';

const data = { hub: { label: 'Screen Replacement' }, categories: [] } as never;

describe('RepairTypeHubPage hybrid selected state', () => {
  it('keeps the original three-card Hero rail beside the H1', () => {
    const { container } = render(<RepairTypeHubPage
      data={data}
      title="Phone Screen & Display Replacement"
      heroHighlights={[
        { title: 'Price', description: 'From $60' },
        { title: 'Repair Time', description: '30 Minutes' },
        { title: 'Ringwood Square', description: 'Walk-ins welcome at Kiosk C1 inside Ringwood Square.' },
      ]}
    />);

    const hero = container.querySelector('section');
    const cards = hero?.querySelectorAll('[class*="heroHighlightCard"]');
    expect(cards).toHaveLength(3);
    expect(cards?.[0]).toHaveTextContent('Price');
    expect(cards?.[0]).toHaveTextContent('From $60');
    expect(cards?.[1]).toHaveTextContent('Repair Time');
    expect(cards?.[1]).toHaveTextContent('30 Minutes');
    expect(cards?.[2]).toHaveTextContent('Ringwood Square');
    expect(cards?.[2]).toHaveTextContent('Walk-ins welcome at Kiosk C1 inside Ringwood Square.');
    expect(hero?.querySelector('[aria-label="Commercial repair facts"]')).toBeNull();
  });

  it('keeps the established finder for generic state', () => {
    const { container } = render(<RepairTypeHubPage data={data} />);
    expect(container.querySelector('[data-repair-type-finder]')).toBeInTheDocument();
    expect(container.querySelector('[data-repair-type-crawler-index]')).toBeInTheDocument();
    expect(container.querySelector('[data-repair-type-selected]')).toBeNull();
  });

  it('replaces only the finder area with the selected-device module', () => {
    const { container } = render(<RepairTypeHubPage
      data={data}
      selectedDevice={{ brand: 'Huawei', model: 'P30', repairName: 'Screen Replacement', priceLabel: 'Quote on Request', bookingHref: '/book-repair' }}
      changeModelHref="/repairs/screen-replacement#repair-type-model-finder"
    />);
    expect(container.querySelector('[data-repair-type-finder]')).toBeNull();
    expect(container.querySelector('[data-repair-type-crawler-index]')).toBeNull();
    expect(container.querySelector('[data-repair-type-selected]')).toHaveTextContent('P30');
  });
});
