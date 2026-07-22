/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi, afterEach } from 'vitest';

import RepairPricingAndCTA from './RepairPricingAndCTA';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

vi.mock('@/lib/analytics', () => ({
  analytics: {
    trackBookRepair: vi.fn(),
    trackCallNow: vi.fn(),
  },
}));

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

describe('RepairPricingAndCTA SEO headings', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('places a repair-options H2 before the tier H3 headings', () => {
    render(
      <RepairPricingAndCTA
        brandName="iPhone"
        modelName="iPhone 15"
        repairName="Screen Replacement"
        variants={[
          { quality_grade: 'Standard', price: 170 },
          { quality_grade: 'Premium', price: 190 },
        ]}
      />
    );

    const optionsHeading = screen.getByRole('heading', {
      level: 2,
      name: 'iPhone 15 Screen Replacement options and pricing',
    });
    const tierHeading = screen.getByRole('heading', { level: 3, name: 'Standard' });

    expect(optionsHeading.compareDocumentPosition(tierHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
