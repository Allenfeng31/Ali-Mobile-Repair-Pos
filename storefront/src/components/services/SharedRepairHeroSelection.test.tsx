import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SharedRepairHeroSelection from './SharedRepairHeroSelection';

vi.mock('next/link', () => ({
  default: ({ children, href }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href}>{children}</a>,
}));

const selection = {
  selectedDevice: { brand: 'Huawei', brandSlug: 'huawei', model: 'P30', modelSlug: 'p30' },
  selectedRepair: { name: 'Loudspeaker Replacement', serviceSlug: 'loudspeaker-replacement' },
  booking: { href: '/book-repair?category=phone&service=Loudspeaker+Replacement&brand=Huawei&model=P30&brandSlug=huawei&modelSlug=p30&serviceSlug=loudspeaker-replacement', isAvailable: true },
} as const;

describe('SharedRepairHeroSelection', () => {
  it('renders only the server-authoritative selected-device controls for a valid selection', () => {
    render(<SharedRepairHeroSelection selectedDevice={selection} priceLabel="$70" changeModelHref="#shared-repair-model-selection" />);

    expect(screen.getByText('Selected device')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Book Repair Now/ })).toHaveAttribute('href', selection.booking.href);
    expect(screen.getByRole('link', { name: /Change model/ })).toHaveAttribute('href', '#shared-repair-model-selection');
    expect(screen.getByText('$70')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Select your model' })).toBeNull();
  });

  it('renders a real model-selection anchor without any booking or price UI when no device is selected', () => {
    render(<SharedRepairHeroSelection selectedDevice={null} changeModelHref="#shared-repair-model-selection" />);

    const selectModel = screen.getByRole('link', { name: 'Select your model' });
    expect(selectModel).toHaveAttribute('href', '#shared-repair-model-selection');
    expect(selectModel).toHaveClass('repair-primary-action');
    expect(screen.queryByRole('link', { name: /Book Repair Now/ })).toBeNull();
    expect(screen.queryByText(/\$\d/)).toBeNull();
  });
});
