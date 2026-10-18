import { act, render, screen, waitFor } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./BeforeAfterSlider', () => ({
  default: ({ beforeSrc, afterSrc }: { beforeSrc: string; afterSrc: string }) => (
    <div data-testid="before-after-slider">{beforeSrc}|{afterSrc}</div>
  ),
}));

import RepairResultsMatchingSection from './RepairResultsMatchingSection';

const seed = {
  id: 'public-result-1',
  device_category: 'phone' as const,
  brand: 'Future Brand',
  brand_slug: 'future-brand',
  model: 'Future Phone',
  model_slug: 'future-phone',
  repair_type: 'Future Repair',
  repair_type_slug: 'future-repair',
  title: 'Future repair proof',
  short_description: 'A privacy-checked published repair result.',
  image_pair_alt_text: 'Approved public repair result',
  related_repair_url: '/repairs/phone/future-brand/future-phone/future-repair',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('RepairResultsMatchingSection initial results', () => {
  it('includes the existing proof text and public media URLs in server markup without storage paths', () => {
    const html = renderToStaticMarkup(
      <RepairResultsMatchingSection
        category="phone"
        brand="future-brand"
        model="future-phone"
        repairType="future-repair"
        context="detail"
        initialResults={[seed]}
      />,
    );

    expect(html).toContain('Real Repair Results');
    expect(html).toContain('Future repair proof');
    expect(html).toContain('A privacy-checked published repair result.');
    expect(html).toContain('/media/repair-results/public-result-1/before');
    expect(html).toContain('/media/repair-results/public-result-1/after');
    expect(html).not.toContain('approved/');
  });

  it('renders the existing proof module immediately from one server seed without a matching API fetch', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(
      <RepairResultsMatchingSection
        category="phone"
        brand="future-brand"
        model="future-phone"
        repairType="future-repair"
        context="detail"
        initialResults={[seed]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Real Repair Results' })).toBeTruthy();
    expect(screen.getByText('Future repair proof')).toBeTruthy();
    expect(screen.getByText('A privacy-checked published repair result.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'View matching repair page' }).getAttribute('href'))
      .toBe('/repairs/phone/future-brand/future-phone/future-repair');
    expect(screen.getByTestId('before-after-slider').textContent)
      .toContain('/media/repair-results/public-result-1/before');
    expect(screen.getByTestId('before-after-slider').textContent)
      .toContain('/media/repair-results/public-result-1/after');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(document.querySelectorAll('[aria-labelledby="matching-repair-results-heading"]')).toHaveLength(1);
    expect(screen.queryByRole('tablist', { name: 'Matching repair results' })).toBeNull();
  });

  it('keeps an Apple Watch Repair Result visible without a self-referential matching-page CTA', () => {
    render(
      <RepairResultsMatchingSection
        category="watch"
        brand="apple"
        model="apple-watch-series-7-45mm"
        context="model"
        suppressSelfLinkedCta
        initialResults={[{
          ...seed,
          device_category: 'watch',
          model: 'Apple Watch Series 7 45mm',
          model_slug: 'apple-watch-series-7-45mm',
          related_repair_url: '/repairs/watch/apple/apple-watch-series-7-45mm',
        }]}
      />,
    );

    expect(screen.getByText('Future repair proof')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'View matching repair page' })).toBeNull();
  });

  it('keeps a valid Apple Watch Repair Result Detail CTA when the self-link guard is enabled', () => {
    render(
      <RepairResultsMatchingSection
        category="watch"
        brand="apple"
        model="apple-watch-series-7-45mm"
        context="model"
        suppressSelfLinkedCta
        initialResults={[{
          ...seed,
          device_category: 'watch',
          model: 'Apple Watch Series 7 45mm',
          model_slug: 'apple-watch-series-7-45mm',
          related_repair_url: '/repairs/watch/apple/apple-watch-series-7-45mm/battery-replacement',
        }]}
      />,
    );

    expect(screen.getByRole('link', { name: 'View matching repair page' }).getAttribute('href'))
      .toBe('/repairs/watch/apple/apple-watch-series-7-45mm/battery-replacement');
  });

  it('keeps an iPad Repair Result visible while suppressing only a Model Hub self-link CTA', () => {
    render(
      <RepairResultsMatchingSection
        category="tablet"
        brand="ipad"
        model="ipad-7th-generation"
        context="model"
        suppressSelfLinkedCta
        initialResults={[{
          ...seed,
          device_category: 'tablet',
          model: 'iPad 7th Generation',
          model_slug: 'ipad-7th-generation',
          related_repair_url: '/repairs/tablet/ipad/ipad-7th-generation',
        }]}
      />,
    );

    expect(screen.getByText('Future repair proof')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'View matching repair page' })).toBeNull();
  });

  it('keeps a legacy iPad Repair Result CTA when it is not a Model Hub self-link', () => {
    render(
      <RepairResultsMatchingSection
        category="tablet"
        brand="ipad"
        model="ipad-pro-11-inch-4th-generation"
        context="model"
        suppressSelfLinkedCta
        initialResults={[{
          ...seed,
          device_category: 'tablet',
          model: 'iPad Pro 11-inch 4th Generation',
          model_slug: 'ipad-pro-11-inch-4th-generation',
          related_repair_url: '/repairs/tablet/apple/ipad-pro-11-inch-4th-generation/screen-replacement',
        }]}
      />,
    );

    expect(screen.getByRole('link', { name: 'View matching repair page' }).getAttribute('href'))
      .toBe('/repairs/tablet/apple/ipad-pro-11-inch-4th-generation/screen-replacement');
  });

  it('keeps a valid MacBook Repair Result Detail CTA when the self-link guard is enabled', () => {
    render(
      <RepairResultsMatchingSection
        category="laptop"
        brand="macbook"
        model="macbook-air-m3-13-inch-2024"
        context="model"
        suppressSelfLinkedCta
        initialResults={[{
          ...seed,
          device_category: 'laptop',
          model: 'MacBook Air M3 13-inch (2024)',
          model_slug: 'macbook-air-m3-13-inch-2024',
          related_repair_url: '/repairs/laptop/macbook/macbook-air-m3-13-inch-2024/battery-replacement',
        }]}
      />,
    );

    expect(screen.getByRole('link', { name: 'View matching repair page' }).getAttribute('href'))
      .toBe('/repairs/laptop/macbook/macbook-air-m3-13-inch-2024/battery-replacement');
  });

  it('keeps the existing lazy matching API fallback when no seed is supplied', async () => {
    let observe: ((entries: IntersectionObserverEntry[]) => void) | undefined;
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
        observe = callback;
      }
      observe() {}
      disconnect() {}
    });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'SUCCESS', data: [seed] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { container } = render(
      <RepairResultsMatchingSection
        category="phone"
        brand="future-brand"
        model="future-phone"
        repairType="future-repair"
        context="detail"
      />,
    );

    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    await act(async () => {
      observe?.([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    await waitFor(() => expect(screen.getByText('Future repair proof')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
