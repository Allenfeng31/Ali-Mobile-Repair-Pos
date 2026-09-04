import { act, render, screen, waitFor } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./BeforeAfterSlider', () => ({
  default: ({ beforeSrc, afterSrc }: { beforeSrc: string; afterSrc: string }) => (
    <div data-testid="before-after-slider">{beforeSrc}|{afterSrc}</div>
  ),
}));

import RepairTypeRepairResultsSection from './RepairTypeRepairResultsSection';

const seed = {
  id: 'screen-result', device_category: 'phone' as const, brand: 'Samsung', brand_slug: 'samsung', model: 'Galaxy S21', model_slug: 'galaxy-s21',
  repair_type: 'Screen Repair', repair_type_slug: 'screen-repair', image_pair_alt_text: 'Approved proof',
  title: 'Galaxy S21 screen repaired', short_description: 'Approved public proof.',
  related_repair_url: '/repairs/phone/samsung/galaxy-s21/screen-replacement',
};

afterEach(() => vi.unstubAllGlobals());

describe('RepairTypeRepairResultsSection initial results contract', () => {
  it('includes the existing public proof and safe media routes in server markup', () => {
    const html = renderToStaticMarkup(
      <RepairTypeRepairResultsSection
        category="phone"
        repairType="screen-replacement"
        heading="Recent Screen Replacement Results"
        description="Approved public proof."
        initialResults={[seed]}
      />,
    );

    expect(html).toContain('Galaxy S21 screen repaired');
    expect(html).toContain('/media/repair-results/screen-result/before');
    expect(html).toContain('/media/repair-results/screen-result/after');
    expect(html).not.toContain('approved/');
  });

  it('renders a non-empty server seed immediately without observing or requesting the matching API', () => {
    const fetchMock = vi.fn();
    const observer = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('IntersectionObserver', class { observe = observer; disconnect() {} });

    render(
      <RepairTypeRepairResultsSection
        category="phone"
        repairType="screen-replacement"
        heading="Recent Screen Replacement Results"
        description="Approved public proof."
        initialResults={[seed]}
      />,
    );

    expect(screen.getByText('Galaxy S21 screen repaired')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'View matching repair page' }).getAttribute('href'))
      .toBe('/repairs/phone/samsung/galaxy-s21/screen-replacement');
    expect(screen.getByTestId('before-after-slider').textContent).toContain('/media/repair-results/screen-result/before');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(observer).not.toHaveBeenCalled();
  });

  it('keeps the existing observer and matching API fallback when no seed is supplied', async () => {
    let observe: ((entries: IntersectionObserverEntry[]) => void) | undefined;
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: (entries: IntersectionObserverEntry[]) => void) { observe = callback; }
      observe() {}
      disconnect() {}
    });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'SUCCESS', data: [seed] }) });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <RepairTypeRepairResultsSection
        category="phone"
        repairType="screen-replacement"
        heading="Recent Screen Replacement Results"
        description="Approved public proof."
      />,
    );

    await act(async () => observe?.([{ isIntersecting: true } as IntersectionObserverEntry]));
    await waitFor(() => expect(screen.getByText('Galaxy S21 screen repaired')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/public/repair-results/matching?category=phone&repair_type=screen-replacement&context=hub&limit=3',
      expect.any(Object),
    );
  });
});
