/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} {...props}>{children}</a>,
}));

import RepairTypeHubSelectedDevice from './RepairTypeHubSelectedDevice';

describe('RepairTypeHubSelectedDevice', () => {
  it('shows the selected service, trusted price, explicit booking, call, and clean-Hub model change', () => {
    render(<RepairTypeHubSelectedDevice
      selected={{
        brand: 'Huawei',
        model: 'P30 Pro',
        repairName: 'Screen Replacement',
        priceLabel: 'From $119',
        bookingHref: '/book-repair?category=phone&brandSlug=huawei&modelSlug=p30-pro&serviceSlug=screen-replacement',
      }}
      changeModelHref="/repairs/screen-replacement#repair-type-model-finder"
    />);

    expect(screen.getByText('Huawei P30 Pro')).toBeInTheDocument();
    expect(screen.getByText('Screen Replacement')).toBeInTheDocument();
    expect(screen.getByText('From $119')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Book Repair Now/i })).toHaveAttribute('href', expect.stringContaining('serviceSlug=screen-replacement'));
    expect(screen.getByRole('link', { name: /Call 0481 058 514/i })).toHaveAttribute('href', 'tel:0481058514');
    expect(screen.getByRole('link', { name: /Change model/i })).toHaveAttribute('href', '/repairs/screen-replacement#repair-type-model-finder');
  });
});
