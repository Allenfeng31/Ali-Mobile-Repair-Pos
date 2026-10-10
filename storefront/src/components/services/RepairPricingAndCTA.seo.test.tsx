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

  it('keeps an exact price primary while showing a typical range as secondary context', () => {
    render(
      <RepairPricingAndCTA
        brandName="Lenovo"
        modelName="Lenovo Tab P12"
        repairName="Screen Replacement"
        variants={[{ quality_grade: 'Standard', price: 170 }]}
        typicalPriceRange={{
          label: 'Typical Repair Range',
          amountLabel: 'AUD $100–$250',
          explanation: 'Exact pricing depends on the exact model, required part, part availability, device condition, and repair requirements.',
        }}
      />,
    );

    expect(screen.getByText('$170')).toBeInTheDocument();
    expect(screen.getByText('Typical Repair Range')).toBeInTheDocument();
    expect(screen.getByText('AUD $100–$250')).toBeInTheDocument();
  });

  it('shows a typical range and an exact-quote CTA when no catalogue price exists', () => {
    render(
      <RepairPricingAndCTA
        brandName="Lenovo"
        modelName="Lenovo Tab M11"
        repairName="Battery Replacement"
        variants={[]}
        pricing={{
          resolvedPrice: null,
          validVariants: [],
          source: 'none',
          isQuoteOnly: true,
          canEmitOffer: false,
        }}
        showStartingPriceFallback={false}
        useNeutralQuoteWording
        quoteCtaLabel="Get Exact Quote"
        typicalPriceRange={{
          label: 'Typical Repair Range',
          amountLabel: 'AUD $80–$150',
          explanation: 'Exact pricing depends on the exact model, required part, part availability, device condition, and repair requirements.',
        }}
      />,
    );

    expect(screen.getByText('AUD $80–$150')).toBeInTheDocument();
    expect(screen.getByText('Quote on Request')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Get Exact Quote' })).toBeInTheDocument();
  });
});
