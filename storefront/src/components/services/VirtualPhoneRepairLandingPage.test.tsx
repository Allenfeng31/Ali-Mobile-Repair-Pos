import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/script', () => ({ default: (props: ComponentProps<'script'>) => <script {...props} /> }));
vi.mock('./SharedRepairBookingControls', () => ({ default: () => <div data-testid="generic-booking-cta" /> }));
vi.mock('./SharedRepairHierarchySections', () => ({
  default: ({ models, selectedBrandSlug, selectedModelSlug, ariaLabel }: { models: Array<{ modelLabel: string; bookingHref: string }>; selectedBrandSlug: string | null; selectedModelSlug: string | null; ariaLabel: string }) => (
    <div data-testid="generic-peripheral-hierarchy" data-brand={selectedBrandSlug} data-model={selectedModelSlug} aria-label={ariaLabel}>{models.map((model) => <a key={model.modelLabel} href={model.bookingHref}>{model.modelLabel}</a>)}</div>
  ),
}));

import VirtualPhoneRepairLandingPage from './VirtualPhoneRepairLandingPage';

describe('VirtualPhoneRepairLandingPage generic hierarchy integration', () => {
  it('uses the Camera master selected state without a virtual fallback price or duplicate selected-device card', () => {
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
    expect(screen.getByRole('heading', { level: 1, name: 'Phone Loudspeaker Replacement' })).toBeTruthy();
    expect(screen.queryByText('Starting from $50')).toBeNull();
    expect(screen.queryByTestId('generic-booking-cta')).toBeNull();
    expect(screen.getByTestId('generic-peripheral-hierarchy').parentElement).toHaveAttribute('hidden');
    expect(screen.getByRole('heading', { level: 2, name: 'Huawei Mate 20' })).toBeTruthy();
    expect(screen.getByText('$79')).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /Book Repair Now/ })).toHaveLength(1);
    expect(screen.getByRole('link', { name: /Book Repair Now/ })).toHaveAttribute('href', '/book-repair?category=phone&brandSlug=huawei&modelSlug=mate-20&serviceSlug=loudspeaker-replacement');
    expect(screen.getByRole('button', { name: /Change model/ })).toBeTruthy();
    expect(container.querySelector('[data-shared-repair-selected-device]')).toBeNull();
    expect(container.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
    const schemas = Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map((script) => JSON.parse(script.textContent ?? '{}'));
    expect(schemas.map((schema) => schema['@type'])).toEqual(['Service', 'BreadcrumbList']);
    expect(schemas.find((schema) => schema['@type'] === 'Service')).toMatchObject({
      name: 'Phone Loudspeaker Replacement',
      url: 'https://www.alimobile.com.au/repairs/phone/loudspeaker-replacement',
      provider: { '@id': 'https://www.alimobile.com.au/#localbusiness' },
    });
    expect(JSON.stringify(schemas)).not.toMatch(/FAQPage|Offer|Product|AggregateOffer|price|availability|\?/);
    expect(container.textContent).toContain('Frequently Asked Questions');
    expect(container.textContent).not.toContain('Repair Results');

    fireEvent.click(screen.getByRole('button', { name: /Change model/ }));
    expect(screen.getByRole('button', { name: 'Select your model' })).toBeTruthy();
    expect(screen.getByTestId('generic-peripheral-hierarchy').getAttribute('data-brand')).toBe('huawei');
    expect(screen.getByRole('link', { name: 'Huawei Mate 20' })).toHaveAttribute('href', '/repairs/phone/loudspeaker-replacement?brand=huawei&model=mate-20');
  });

  it.each([
    ['earpiece-speaker-replacement', 'Earpiece Speaker Replacement'],
    ['power-button-replacement', 'Power Button Replacement'],
  ] as const)('derives hierarchy accessibility semantics for %s without Loudspeaker leakage', (repairSlug, repairName) => {
    render(<VirtualPhoneRepairLandingPage
      repairSlug={repairSlug}
      canonicalPath={`/repairs/phone/${repairSlug}`}
      models={[]}
      isGeneric
      hierarchy={{ models: [{ brandSlug: 'huawei', brandLabel: 'Huawei', modelSlug: 'p30', modelLabel: 'Huawei P30', repairLabel: repairName, priceLabel: null, bookingHref: '/book-repair' }], selectedBrandSlug: null, selectedModelSlug: null }}
    />);
    const hierarchy = screen.getByTestId('generic-peripheral-hierarchy');
    expect(hierarchy.getAttribute('aria-label')).toBe(`Supported ${repairName} models`);
    expect(hierarchy.getAttribute('aria-label')).not.toContain('Loudspeaker');
    const selectModel = screen.getByRole('button', { name: 'Select your model' });
    expect(selectModel).toHaveAttribute('aria-controls', 'camera-module-model-selector-region');
    expect(selectModel).toHaveClass('min-h-14', 'w-full', 'text-lg');
    expect(screen.queryByTestId('generic-booking-cta')).toBeNull();
  });

  it.each([
    ['loudspeaker-replacement', 'Phone Loudspeaker Replacement', 'Loudspeaker, earpiece or microphone?', 'Why does sound work through headphones or Bluetooth but not the phone speaker?', 'Dust, moisture, an audio-routing setting'],
    ['earpiece-speaker-replacement', 'Phone Earpiece Speaker Replacement', 'Earpiece speaker or loudspeaker?', 'Why can I hear callers on speakerphone but not through the earpiece?', 'After a drop or impact, low, muffled or distorted earpiece audio can come from damage to the earpiece, flex, connector or other internal components'],
    ['volume-button-replacement', 'Phone Volume Button Replacement', 'When it may not be a button fault', 'What can I do while my volume button is not working?', 'Liquid or moisture exposure can affect the physical button, button flex, connector or other internal components'],
    ['power-button-replacement', 'Phone Power Button Replacement', 'No power is not proof of a bad button', 'Why does my power button open an assistant instead of the power menu?', 'A phone that will not start can have a depleted battery'],
  ] as const)('answers the main pre-booking intent for %s without a location-stuffed H1', (repairSlug, heading, distinction, faq, evidence) => {
    const { container } = render(<VirtualPhoneRepairLandingPage
      repairSlug={repairSlug}
      canonicalPath={`/repairs/phone/${repairSlug}`}
      models={[]}
      isGeneric
      hierarchy={{ models: [], selectedBrandSlug: null, selectedModelSlug: null }}
    />);

    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeTruthy();
    expect(screen.getByText(distinction)).toBeTruthy();
    expect(screen.getByText(faq)).toBeTruthy();
    expect(container.textContent).toContain(evidence);
    expect(screen.getByRole('heading', { level: 1 }).textContent).not.toContain('Ringwood');
  });

  it('adds only diagnosis-relevant reciprocal internal links', () => {
    const { rerender } = render(<VirtualPhoneRepairLandingPage
      repairSlug="loudspeaker-replacement"
      canonicalPath="/repairs/phone/loudspeaker-replacement"
      models={[]}
      isGeneric
      hierarchy={{ models: [], selectedBrandSlug: null, selectedModelSlug: null }}
    />);
    expect(screen.getByRole('link', { name: 'Compare earpiece speaker symptoms' })).toHaveAttribute('href', '/repairs/phone/earpiece-speaker-replacement');

    rerender(<VirtualPhoneRepairLandingPage
      repairSlug="power-button-replacement"
      canonicalPath="/repairs/phone/power-button-replacement"
      models={[]}
      isGeneric
      hierarchy={{ models: [], selectedBrandSlug: null, selectedModelSlug: null }}
    />);
    expect(screen.getByRole('link', { name: 'Learn when a logic board assessment may be relevant' })).toHaveAttribute('href', '/repairs/phone/logic-board-repair');
  });

  it('does not alter legacy Virtual Phone pages when no hierarchy is supplied', () => {
    render(<VirtualPhoneRepairLandingPage repairSlug="earpiece-speaker-replacement" canonicalPath="/repairs/phone/earpiece-speaker-replacement" models={[]} isGeneric />);
    expect(screen.queryByTestId('generic-peripheral-hierarchy')).toBeNull();
    expect(screen.getByTestId('generic-booking-cta')).toBeTruthy();
  });
});
