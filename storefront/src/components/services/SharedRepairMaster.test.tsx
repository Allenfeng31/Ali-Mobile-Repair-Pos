import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import CameraModuleRepairSelectionExperience from './CameraModuleRepairSelectionExperience';

vi.mock('./SharedRepairHierarchySections', () => ({ default: () => <div>Model navigation</div> }));

const models = [
  { brandSlug: 'lg', brandLabel: 'LG', modelSlug: 'g8s-thinq', modelLabel: 'LG G8s ThinQ', repairLabel: 'Volume Button Replacement', priceLabel: '$119', bookingHref: '/book-repair?modelSlug=g8s-thinq' },
  { brandSlug: 'lg', brandLabel: 'LG', modelSlug: 'v60', modelLabel: 'LG V60', repairLabel: 'Volume Button Replacement', priceLabel: 'From $89', bookingHref: '/book-repair?modelSlug=v60' },
];
const selectedDevice = {
  selectedDevice: { brand: 'LG', brandSlug: 'lg', model: 'G8s ThinQ', modelSlug: 'g8s-thinq' },
  selectedRepair: { name: 'Volume Button Replacement', serviceSlug: 'volume-button-replacement' },
  booking: { href: '/book-repair?modelSlug=g8s-thinq', isAvailable: true },
};

function master(priceLabel?: string) {
  return <CameraModuleRepairSelectionExperience useMasterFacts
    title="Phone Volume Button Replacement" description="Diagnosis first." eyebrow="Volume button repair" icon="volume"
    bookingService="Volume Button Replacement" canonicalPath="/repairs/phone/volume-button-replacement"
    hierarchy={{ models, selectedBrandSlug: priceLabel ? 'lg' : null, selectedModelSlug: priceLabel ? 'g8s-thinq' : null, selectedDevice: priceLabel ? { ...selectedDevice, priceLabel } : null }}
  />;
}

function expectFacts(priceLabel: string) {
  const facts = screen.getByLabelText('Repair facts');
  expect(facts.children).toHaveLength(4);
  for (const text of [priceLabel, '30 Minutes', '6 Months Warranty', 'Ringwood Square']) expect(within(facts).getByText(text)).toBeInTheDocument();
  expect(facts.compareDocumentPosition(screen.getByRole('heading', { level: 1 })) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  expect(screen.queryByText('Inspection Before Work')).toBeNull();
  expect(screen.queryByText('Clear Quote First')).toBeNull();
  expect(screen.queryByText('Repair Warranty')).toBeNull();
  expect(screen.queryByText('Repair Desk')).toBeNull();
  expect(screen.queryByLabelText('Commercial repair facts')).toBeNull();
  return facts;
}

describe('Centered generic shared-page master', () => {
  it('shows the service starting price in compact facts after the centered Hero actions, independently of model prices', () => {
    const { container } = render(master());
    expectFacts('From $50');
    expect(screen.getAllByText('From $50')).toHaveLength(1);
    expect(screen.queryByText('From $89')).toBeNull();
    expect(container.querySelector('[data-camera-module-hero-price-card]')).toBeNull();
    expect(screen.queryByText('Selected device')).toBeNull();
    expect(screen.getByRole('button', { name: 'Select your model' })).toBeInTheDocument();
    expect(container.querySelector('[data-camera-module-hero-stack]')).toHaveClass('items-center', 'text-center');
  });

  it.each(['$129', 'From $149', 'Quote on Request'])('keeps selected %s in the existing card while the bottom fact remains From $50', (priceLabel) => {
    const { container } = render(master(priceLabel));
    const facts = expectFacts('From $50');
    expect(within(facts).queryByText(priceLabel)).toBeNull();
    const card = container.querySelector('[data-camera-module-hero-price-card]') as HTMLElement;
    expect(card).toHaveClass('max-w-md', 'p-5', 'sm:p-6', 'md:p-8');
    expect(within(card).getByText(priceLabel)).toBeInTheDocument();
    expect(within(card).getByRole('heading', { name: 'LG G8s ThinQ' })).toBeInTheDocument();
    expect(screen.queryByText('From $89')).toBeNull();
    const book = screen.getByRole('link', { name: /Book Repair Now/ });
    const call = screen.getByRole('link', { name: /Call 0481/ });
    const change = screen.getByRole('button', { name: 'Change model' });
    expect(book).toHaveAttribute('href', selectedDevice.booking.href);
    expect(book.compareDocumentPosition(call) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(call.compareDocumentPosition(change) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelector('[data-camera-module-model-selector]')).toHaveAttribute('hidden');
    fireEvent.click(change);
    expectFacts('From $50');
    expect(screen.queryByText('Selected device')).toBeNull();
    expect(container.querySelector('[data-camera-module-model-selector]')).not.toHaveAttribute('hidden');
  });

  it('renders all four facts in initial HTML after the H1', () => {
    const html = renderToStaticMarkup(master());
    for (const text of ['From $50', '30 Minutes', '6 Months Warranty', 'Ringwood Square']) {
      expect(html).toContain(text);
      expect(html.indexOf(text)).toBeGreaterThan(html.indexOf('<h1'));
    }
  });
});
