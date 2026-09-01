import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { replace, searchParams } = vi.hoisted(() => ({ replace: vi.fn(), searchParams: new URLSearchParams() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }), useSearchParams: () => searchParams }));

import LogicBoardRepairBookingControls from './LogicBoardRepairBookingControls';

const candidates = [
  { canonicalBrandSlug: 'google-pixel', modelSlug: 'pixel-8-pro', displayBrand: 'Google Pixel', displayModel: 'Pixel 8 Pro' },
  { canonicalBrandSlug: 'samsung', modelSlug: 'galaxy-s25', displayBrand: 'Samsung', displayModel: 'Galaxy S25' },
];

function renderControls() {
  return render(<LogicBoardRepairBookingControls basePath="/repairs/phone/logic-board-repair" candidates={candidates} />);
}

describe('LogicBoardRepairBookingControls', () => {
  beforeEach(() => { searchParams.forEach((_, key) => searchParams.delete(key)); replace.mockReset(); });

  it('uses trusted display values and the fixed booking service for a valid Google Pixel context', () => {
    searchParams.set('brand', 'google-pixel'); searchParams.set('model', 'pixel-8-pro');
    renderControls();
    const href = screen.getByRole('link', { name: /request an assessment/i }).getAttribute('href') ?? '';
    expect(href).toContain('brand=Google+Pixel');
    expect(href).toContain('model=Pixel+8+Pro');
    expect(href).toContain('service=Logic+Board+Repair');
  });

  it.each([
    'brand=google&model=pixel-8-pro', // invalid brand mapping
    'model=pixel-8-pro', // model-only rejected
    'brand=google-pixel&model=galaxy-s25', // cross-brand model rejected
    'brand=google-pixel&brand=samsung&model=pixel-8-pro', // repeated brand rejected
    'brand=google-pixel&model=pixel-8-pro&model=galaxy-s25', // repeated model rejected
    'brand=google-pixel&model=pixel-8-pro&service=Screen%20Replacement', // service injection rejected
  ])('fails closed for invalid context %s', (query) => {
    new URLSearchParams(query).forEach((value, key) => searchParams.append(key, value));
    renderControls();
    const href = screen.getByRole('link', { name: /request an assessment/i }).getAttribute('href') ?? '';
    expect(href).toContain('service=Logic+Board+Repair');
    expect(href).not.toContain('brand=');
    expect(href).not.toContain('model=');
    expect(href).not.toContain('Screen');
  });

  it('updates only canonical brand/model route context from the trusted selector', async () => {
    const user = userEvent.setup(); renderControls();
    await user.selectOptions(screen.getByLabelText(/choose your phone model/i), 'samsung/galaxy-s25');
    expect(replace).toHaveBeenCalledWith('/repairs/phone/logic-board-repair?brand=samsung&model=galaxy-s25', { scroll: false });
  });
});
