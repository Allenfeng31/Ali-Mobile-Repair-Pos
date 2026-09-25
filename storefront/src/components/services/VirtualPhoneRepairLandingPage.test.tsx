import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./SharedRepairBookingControls', () => ({ default: () => <div data-testid="generic-booking-cta" /> }));
vi.mock('./SharedRepairHierarchySections', () => ({
  default: ({ models, selectedBrandSlug, selectedModelSlug, ariaLabel, genericSelectionPath }: { models: Array<{ modelLabel: string }>; selectedBrandSlug: string | null; selectedModelSlug: string | null; ariaLabel: string; genericSelectionPath?: string }) => (
    <div data-testid="generic-peripheral-hierarchy" data-brand={selectedBrandSlug} data-model={selectedModelSlug} data-selection-path={genericSelectionPath} aria-label={ariaLabel}>{models.map((model) => model.modelLabel).join(', ')}</div>
  ),
}));

import VirtualPhoneRepairLandingPage from './VirtualPhoneRepairLandingPage';

describe('VirtualPhoneRepairLandingPage generic hierarchy integration', () => {
  it('promotes the server-selected device as the sole top-of-page booking authority', () => {
    const { container } = render(<VirtualPhoneRepairLandingPage
      repairSlug="loudspeaker-replacement"
      canonicalPath="/repairs/phone/loudspeaker-replacement"
      models={[{ brand: 'Huawei', brandSlug: 'huawei', model: 'Mate 20', modelSlug: 'mate-20' }]}
      isGeneric
      hierarchy={{
        models: [{ brandSlug: 'huawei', brandLabel: 'Huawei', modelSlug: 'mate-20', modelLabel: 'Huawei Mate 20', repairLabel: 'Loudspeaker Replacement', priceLabel: '$79', bookingHref: '/book-repair?category=phone' }],
        selectedBrandSlug: 'huawei', selectedModelSlug: 'mate-20',
        selectedDevice: {
          selectedDevice: { brand: 'Huawei', brandSlug: 'huawei', model: 'Mate 20', modelSlug: 'mate-20' },
          selectedRepair: { name: 'Loudspeaker Replacement', serviceSlug: 'loudspeaker-replacement' },
          booking: { href: '/book-repair?category=phone&brandSlug=huawei&modelSlug=mate-20&serviceSlug=loudspeaker-replacement', isAvailable: true },
        },
      }}
    />);
    expect(screen.getByRole('heading', { level: 1, name: 'Phone Loudspeaker Replacement in Ringwood' })).toBeTruthy();
    expect(screen.getByText('Starting from $50')).toBeTruthy();
    expect(screen.queryByTestId('generic-booking-cta')).toBeNull();
    expect(screen.getByTestId('generic-peripheral-hierarchy').getAttribute('data-brand')).toBe('huawei');
    expect(screen.getByTestId('generic-peripheral-hierarchy').getAttribute('aria-label')).toBe('Supported Loudspeaker Replacement models');
    expect(screen.getByTestId('generic-peripheral-hierarchy')).not.toHaveAttribute('data-selection-path', '/repairs/phone/loudspeaker-replacement');
    expect(screen.getByTestId('generic-peripheral-hierarchy').textContent).toContain('Huawei Mate 20');
    expect(screen.getByRole('heading', { level: 2, name: 'Huawei Mate 20' })).toBeTruthy();
    expect(screen.getByText('$79')).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /Book Repair Now/ })).toHaveLength(1);
    expect(screen.getByRole('link', { name: /Book Repair Now/ })).toHaveAttribute('href', '/book-repair?category=phone&brandSlug=huawei&modelSlug=mate-20&serviceSlug=loudspeaker-replacement');
    expect(screen.getByRole('link', { name: /Change model/ })).toHaveAttribute('href', '#shared-repair-model-selection');
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
    const selectModel = screen.getByRole('link', { name: 'Select your model' });
    expect(selectModel).toHaveAttribute('href', '#shared-repair-model-selection');
    expect(selectModel).toHaveClass('repair-primary-action');
    expect(screen.queryByTestId('generic-booking-cta')).toBeNull();
  });

  it('does not alter legacy Virtual Phone pages when no hierarchy is supplied', () => {
    render(<VirtualPhoneRepairLandingPage repairSlug="earpiece-speaker-replacement" canonicalPath="/repairs/phone/earpiece-speaker-replacement" models={[]} isGeneric />);
    expect(screen.queryByTestId('generic-peripheral-hierarchy')).toBeNull();
    expect(screen.getByTestId('generic-booking-cta')).toBeTruthy();
  });
});
