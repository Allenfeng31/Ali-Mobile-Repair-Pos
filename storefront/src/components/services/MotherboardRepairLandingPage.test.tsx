import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import MotherboardRepairLandingPage from './MotherboardRepairLandingPage';

const eligibleDevices = [
  { category: 'phone', brand: 'Samsung', brandSlug: 'samsung', model: 'Galaxy S21', modelSlug: 'galaxy-s21' },
  { category: 'phone', brand: 'Asus', brandSlug: 'asus', model: 'ROG Phone 5', modelSlug: 'rog-phone-5' },
  { category: 'laptop', brand: 'MacBook', brandSlug: 'macbook', model: 'MacBook Air (M3)', modelSlug: 'macbook-air-m3' },
] as const;

describe('MotherboardRepairLandingPage', () => {
  it('renders the generic cross-device selector without a model-specific booking link', () => {
    render(<MotherboardRepairLandingPage canonicalPath="/repairs/motherboard-repair" eligibleDevices={eligibleDevices} selection={null} />);

    expect(screen.getByRole('heading', { name: 'Motherboard & Logic Board Repair' })).toBeTruthy();
    expect(screen.getByText('Turnaround Varies')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Select your device' }).getAttribute('href')).toBe('#motherboard-device-selector');
    expect(screen.queryByRole('link', { name: 'Book Repair Now' })).toBeNull();
  });

  it('renders the selected MacBook state as quote-only and returns Change model to the clean Master', () => {
    const { container } = render(<MotherboardRepairLandingPage canonicalPath="/repairs/motherboard-repair" eligibleDevices={eligibleDevices} selection={eligibleDevices[2]} />);

    expect(screen.getByRole('heading', { name: 'MacBook MacBook Air (M3)' })).toBeTruthy();
    expect(screen.getAllByText('Quote on Request')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Book Repair Now' }).getAttribute('href')).toContain('category=laptop');
    expect(screen.getByRole('link', { name: 'Change model' }).getAttribute('href')).toBe('/repairs/motherboard-repair#motherboard-device-selector');
    expect(container.textContent).not.toMatch(/\$0|From \$|\$499|6 Months Warranty/i);
  });

  it('renders only the motherboard-specific timing contract', () => {
    const { container } = render(<MotherboardRepairLandingPage canonicalPath="/repairs/motherboard-repair" eligibleDevices={eligibleDevices} selection={null} />);

    expect(container.textContent).toContain('Turnaround Varies');
    expect(container.textContent).not.toMatch(/30 minutes|same day repair|same day service|while you wait|30–60 minutes/i);
    const schema = Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map((element) => element.textContent).join('\n');
    expect(schema).toContain('BreadcrumbList');
    expect(schema).toContain('Service');
    expect(schema).not.toMatch(/Offer|Product|30 minutes|same day repair|same day service|while you wait|30–60 minutes/i);
  });
});
