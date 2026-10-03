import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import MotherboardRepairLandingPage from './MotherboardRepairLandingPage';

const eligibleDevices = [
  { category: 'phone', brand: 'iPhone', brandSlug: 'iphone', model: 'iPhone 15', modelSlug: 'iphone-15' },
  { category: 'phone', brand: 'Samsung', brandSlug: 'samsung', model: 'Galaxy S21', modelSlug: 'galaxy-s21' },
  { category: 'phone', brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 8 Pro', modelSlug: 'pixel-8-pro' },
  { category: 'phone', brand: 'OPPO', brandSlug: 'oppo', model: 'Find X5 Pro', modelSlug: 'find-x5-pro' },
  { category: 'phone', brand: 'Asus', brandSlug: 'asus', model: 'ROG Phone 5', modelSlug: 'rog-phone-5' },
  { category: 'tablet', brand: 'iPad', brandSlug: 'ipad', model: 'iPad Pro', modelSlug: 'ipad-pro' },
  { category: 'tablet', brand: 'Samsung', brandSlug: 'samsung', model: 'Galaxy Tab S9', modelSlug: 'galaxy-tab-s9' },
  { category: 'tablet', brand: 'Lenovo', brandSlug: 'lenovo', model: 'Tab P12', modelSlug: 'tab-p12' },
  { category: 'laptop', brand: 'MacBook', brandSlug: 'macbook', model: 'MacBook Air (M3)', modelSlug: 'macbook-air-m3' },
  { category: 'watch', brand: 'Apple Watch', brandSlug: 'apple', model: 'Series 9', modelSlug: 'series-9' },
] as const;

describe('MotherboardRepairLandingPage', () => {
  it('reuses the Shared Master hero with all ten collapsed assessment groups', () => {
    const { container } = render(<MotherboardRepairLandingPage canonicalPath="/repairs/motherboard-repair" eligibleDevices={eligibleDevices} selection={null} />);

    expect(container.querySelector('[data-camera-module-hero]')).toBeTruthy();
    expect(container.querySelector('[data-camera-module-model-selector]')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Motherboard & Logic Board Repair' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Select your device' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Book Repair Now' })).toBeNull();
    expect(screen.getAllByRole('button', { name: /^(iPhone|Samsung|Google Pixel|OPPO|Other Phone|iPad|Samsung Tab|Lenovo|MacBook|Apple Watch)/ })).toHaveLength(10);
    expect(container.textContent).toContain('1. Device received and inspected');
    expect(container.textContent).toContain('2. Initial fault assessment');
    expect(container.textContent).toContain('3. Estimated price range');
    expect(container.textContent).toContain('4. Detailed board-level diagnosis');
    expect(container.textContent).toContain('5. Exact fault and final price');
    expect(container.textContent).toContain('6. Repair after final approval');
  });

  it.each([
    [eligibleDevices[5], 'category=tablet', 'brandSlug=ipad', 'modelSlug=ipad-pro'],
    [eligibleDevices[8], 'category=laptop', 'brandSlug=macbook', 'modelSlug=macbook-air-m3'],
    [eligibleDevices[9], 'category=watch', 'brandSlug=apple', 'modelSlug=series-9'],
    [eligibleDevices[0], 'category=phone', 'brandSlug=iphone', 'modelSlug=iphone-15'],
  ] as const)('keeps %s booking identity category-aware in selected state', (selection, category, brandSlug, modelSlug) => {
    const { container } = render(<MotherboardRepairLandingPage canonicalPath="/repairs/motherboard-repair" eligibleDevices={eligibleDevices} selection={selection} />);

    const bookingHref = screen.getByRole('link', { name: 'Book Repair Now' }).getAttribute('href') ?? '';
    expect(bookingHref).toContain(category);
    expect(bookingHref).toContain(brandSlug);
    expect(bookingHref).toContain(modelSlug);
    expect(screen.getByRole('button', { name: 'Change model' })).toBeTruthy();
    expect(container.textContent).not.toMatch(/\$0|From \$|6 Months Warranty/i);
  });

  it('renders only the approved motherboard facts and no forbidden fast-turnaround copy', () => {
    const { container } = render(<MotherboardRepairLandingPage canonicalPath="/repairs/motherboard-repair" eligibleDevices={eligibleDevices} selection={null} />);

    expect(container.textContent).toContain('Quote on Request');
    expect(container.textContent).toContain('Around 2–3 Weeks');
    expect(container.textContent).toContain('Board-Level Diagnosis');
    expect(container.textContent).toContain('Ringwood Square');
    expect(container.textContent).not.toMatch(/30 minutes|same day repair|same day service|while you wait|30–60 minutes/i);
    const schema = Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map((element) => element.textContent).join('\n');
    expect(schema).toContain('BreadcrumbList');
    expect(schema).toContain('Service');
    expect(schema).not.toMatch(/Offer|Product|30 minutes|same day repair|same day service|while you wait|30–60 minutes/i);
  });
});
