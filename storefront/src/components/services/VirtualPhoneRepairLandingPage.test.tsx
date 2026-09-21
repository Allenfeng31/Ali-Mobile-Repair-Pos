import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./SharedRepairBookingControls', () => ({ default: () => <div data-testid="generic-booking-cta" /> }));
vi.mock('./SharedRepairHierarchySections', () => ({
  default: ({ models, selectedBrandSlug, selectedModelSlug, ariaLabel }: { models: Array<{ modelLabel: string }>; selectedBrandSlug: string | null; selectedModelSlug: string | null; ariaLabel: string }) => (
    <div data-testid="generic-peripheral-hierarchy" data-brand={selectedBrandSlug} data-model={selectedModelSlug} aria-label={ariaLabel}>{models.map((model) => model.modelLabel).join(', ')}</div>
  ),
}));

import VirtualPhoneRepairLandingPage from './VirtualPhoneRepairLandingPage';

describe('VirtualPhoneRepairLandingPage generic hierarchy integration', () => {
  it('adds exactly the supplied generic hierarchy after the service-level hero while preserving its generic booking CTA', () => {
    const { container } = render(<VirtualPhoneRepairLandingPage
      repairSlug="loudspeaker-replacement"
      canonicalPath="/repairs/phone/loudspeaker-replacement"
      models={[{ brand: 'Huawei', brandSlug: 'huawei', model: 'Mate 20', modelSlug: 'mate-20' }]}
      isGeneric
      hierarchy={{
        models: [{ brandSlug: 'huawei', brandLabel: 'Huawei', modelSlug: 'mate-20', modelLabel: 'Huawei Mate 20', repairLabel: 'Loudspeaker Replacement', priceLabel: '$79', bookingHref: '/book-repair?category=phone' }],
        selectedBrandSlug: 'huawei', selectedModelSlug: 'mate-20',
      }}
    />);
    expect(screen.getByRole('heading', { level: 1, name: 'Phone Loudspeaker Replacement in Ringwood' })).toBeTruthy();
    expect(screen.getByText('Starting from $50')).toBeTruthy();
    expect(screen.getByTestId('generic-booking-cta')).toBeTruthy();
    expect(screen.getByTestId('generic-peripheral-hierarchy').getAttribute('data-brand')).toBe('huawei');
    expect(screen.getByTestId('generic-peripheral-hierarchy').getAttribute('aria-label')).toBe('Supported Loudspeaker Replacement models');
    expect(screen.getByTestId('generic-peripheral-hierarchy').textContent).toContain('Huawei Mate 20');
    expect(container.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(1);
    expect(container.textContent).not.toContain('Repair Results');
  });

  it.each([
    ['earpiece-speaker-replacement', 'Earpiece Speaker Replacement'],
    ['power-button-replacement', 'Power Button Replacement'],
  ] as const)('derives hierarchy accessibility semantics for %s without Loudspeaker leakage', (repairSlug, repairName) => {
    render(<VirtualPhoneRepairLandingPage
      repairSlug={repairSlug}
      canonicalPath={`/repairs/phone/${repairSlug}`}
      models={[]}
      hierarchy={{ models: [{ brandSlug: 'huawei', brandLabel: 'Huawei', modelSlug: 'p30', modelLabel: 'Huawei P30', repairLabel: repairName, priceLabel: null, bookingHref: '/book-repair' }], selectedBrandSlug: null, selectedModelSlug: null }}
    />);
    const hierarchy = screen.getByTestId('generic-peripheral-hierarchy');
    expect(hierarchy.getAttribute('aria-label')).toBe(`Supported ${repairName} models`);
    expect(hierarchy.getAttribute('aria-label')).not.toContain('Loudspeaker');
  });

  it('does not alter legacy Virtual Phone pages when no hierarchy is supplied', () => {
    render(<VirtualPhoneRepairLandingPage repairSlug="earpiece-speaker-replacement" canonicalPath="/repairs/phone/earpiece-speaker-replacement" models={[]} isGeneric />);
    expect(screen.queryByTestId('generic-peripheral-hierarchy')).toBeNull();
    expect(screen.getByTestId('generic-booking-cta')).toBeTruthy();
  });
});
