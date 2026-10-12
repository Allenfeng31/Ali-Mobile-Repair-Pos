/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RepairPricingAndCTA from './RepairPricingAndCTA';

let routeParams: Record<string, string> = {};

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => routeParams,
}));
vi.mock('@/lib/analytics', () => ({
  analytics: { trackBookRepair: vi.fn(), trackCallNow: vi.fn() },
}));

describe('Apple Watch pricing presentation', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it.each([
    ['apple-watch-series-3-42mm'],
    ['apple-watch-series-6-44mm'],
    ['apple-watch-series-9-41mm'],
    ['apple-watch-ultra-2-49mm'],
  ])('keeps quote-only Screen pricing fallback-free for %s', (model) => {
    routeParams = {
      category: 'watch',
      brand: 'apple',
      model,
      'repair-type': 'screen-replacement',
    };

    render(
      <RepairPricingAndCTA
        brandName="Apple"
        modelName={model}
        repairName="Screen Replacement"
        variants={[]}
      />,
    );

    expect(screen.getByText('Quote on Request')).toBeInTheDocument();
    expect(screen.queryByText('Starting from')).not.toBeInTheDocument();
    expect(screen.queryByText('$150')).not.toBeInTheDocument();
  });

  it('preserves an exact Screen catalogue price', () => {
    routeParams = {
      category: 'watch',
      brand: 'apple',
      model: 'apple-watch-series-3-38mm',
      'repair-type': 'screen-replacement',
    };

    render(
      <RepairPricingAndCTA
        brandName="Apple"
        modelName="Apple Watch Series 3 (38mm)"
        repairName="Screen Replacement"
        variants={[{ quality_grade: 'Standard', price: 150 }]}
      />,
    );

    expect(screen.getByText('$150')).toBeInTheDocument();
    expect(screen.queryByText('Quote on Request')).not.toBeInTheDocument();
  });
});
