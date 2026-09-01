import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import LogicBoardRepairLandingPage from './LogicBoardRepairLandingPage';

const candidates = [
  { canonicalBrandSlug: 'google-pixel', modelSlug: 'pixel-8-pro', displayBrand: 'Google Pixel', displayModel: 'Pixel 8 Pro' },
  { canonicalBrandSlug: 'samsung', modelSlug: 'galaxy-s25', displayBrand: 'Samsung', displayModel: 'Galaxy S25' },
];

describe('LogicBoardRepairLandingPage', () => {
  it('renders assessment-first content without guarantees or fixed prices', () => {
    render(<LogicBoardRepairLandingPage canonicalPath="/repairs/phone/logic-board-repair" candidates={candidates} />);
    const pageText = document.body.textContent ?? '';
    expect(pageText).toMatch(/Logic Board Repair/i);
    expect(pageText).toMatch(/assessment/i);
    expect(pageText).toMatch(/no power|boot loop|intermittent faults/i);
    expect(pageText).toMatch(/guarantee data recovery/i);
    expect(pageText).not.toMatch(/\$[0-9]+/);
    expect(pageText).not.toMatch(/From \$/i);
    expect(pageText).not.toMatch(/guaranteed repair/i);
  });

  it('outputs query-free BreadcrumbList without Offer, Product, or FAQPage schema', () => {
    render(<LogicBoardRepairLandingPage canonicalPath="/repairs/phone/logic-board-repair" candidates={candidates} />);
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const schema = script?.textContent ?? '';
    expect(schema).toContain('BreadcrumbList');
    expect(schema).toContain('https://www.alimobile.com.au/repairs/phone/logic-board-repair');
    expect(schema).not.toMatch(/Offer|Product|AggregateOffer|priceCurrency|availability|\?|FAQPage/);
  });
});
