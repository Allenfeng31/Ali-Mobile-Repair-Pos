/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import SharedRepairSelectedDevice from './SharedRepairSelectedDevice';

vi.mock('next/link', () => ({
  default: ({ children, href }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href}>{children}</a>,
}));

const selection = {
  selectedDevice: { brand: 'Huawei', brandSlug: 'huawei', model: 'Mate 20 Pro', modelSlug: 'mate-20-pro' },
  selectedRepair: { name: 'Loudspeaker Replacement', serviceSlug: 'loudspeaker-replacement' },
  booking: { href: '/book-repair?category=phone&brandSlug=huawei&modelSlug=mate-20-pro&serviceSlug=loudspeaker-replacement', isAvailable: true },
} as const;

describe('SharedRepairSelectedDevice', () => {
  it('renders the server-derived device, canonical booking link, and real change-model anchor without pricing', () => {
    render(<SharedRepairSelectedDevice selection={selection} changeModelHref="#shared-repair-model-selection" />);

    expect(screen.getByText('Huawei Mate 20 Pro')).toBeInTheDocument();
    expect(screen.getByText('Loudspeaker Replacement')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Book Repair Now/ })).toHaveAttribute('href', selection.booking.href);
    expect(screen.getByRole('link', { name: /Change model/ })).toHaveAttribute('href', '#shared-repair-model-selection');
    expect(screen.queryByText(/\$\d/)).toBeNull();
  });

  it.each([
    ['$70'],
    ['From $89'],
  ])('renders the supplied trusted display price label %s without deriving a fallback', (priceLabel) => {
    render(<SharedRepairSelectedDevice selection={{ ...selection, priceLabel }} changeModelHref="#shared-repair-model-selection" />);

    expect(screen.getByText(priceLabel)).toBeInTheDocument();
  });

  it('renders no price row when the supplied display label is null', () => {
    const { container } = render(<SharedRepairSelectedDevice selection={{ ...selection, priceLabel: null }} changeModelHref="#shared-repair-model-selection" />);

    expect(container.querySelector('[data-shared-repair-selected-price]')).toBeNull();
    expect(screen.queryByText(/Starting from|Custom Quote|Quote on Request/)).toBeNull();
  });
});
