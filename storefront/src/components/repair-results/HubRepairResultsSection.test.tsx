import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./BeforeAfterSlider', () => ({
  default: ({ beforeSrc, afterSrc }: { beforeSrc: string; afterSrc: string }) => <div data-testid="before-after-slider">{beforeSrc}|{afterSrc}</div>,
}));

import HubRepairResultsSection from './HubRepairResultsSection';

const seed = {
  id: 'screen-result', device_category: 'phone' as const, brand: 'Future Brand', model: 'Future Phone',
  repair_type: 'Screen Replacement', repair_type_slug: 'screen-replacement', image_pair_alt_text: 'Approved proof',
  title: 'Future Phone screen repaired', short_description: 'Approved public proof.',
  related_repair_url: '/repairs/phone/future-brand/future-phone/screen-replacement',
};

afterEach(() => vi.unstubAllGlobals());

describe('HubRepairResultsSection initial results contract', () => {
  it('renders a non-empty server seed immediately without observing or requesting the Hub API', () => {
    const fetchMock = vi.fn();
    const observer = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('IntersectionObserver', class { observe = observer; disconnect() {} });

    render(<HubRepairResultsSection category="phone" scope="repair-hub" initialResults={[seed]} />);

    expect(screen.getByText('Future Phone screen repaired')).toBeTruthy();
    expect(screen.getByTestId('before-after-slider').textContent).toContain('/media/repair-results/screen-result/before');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(observer).not.toHaveBeenCalled();
  });

  it('keeps the existing observer and Hub API fallback when initialResults is undefined', async () => {
    let observe: ((entries: IntersectionObserverEntry[]) => void) | undefined;
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: (entries: IntersectionObserverEntry[]) => void) { observe = callback; }
      observe() {}
      disconnect() {}
    });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'SUCCESS', data: [seed] }) });
    vi.stubGlobal('fetch', fetchMock);

    render(<HubRepairResultsSection category="phone" scope="repair-hub" />);

    await act(async () => observe?.([{ isIntersecting: true } as IntersectionObserverEntry]));
    await waitFor(() => expect(screen.getByText('Future Phone screen repaired')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledWith('/api/public/repair-results/hub?category=phone', expect.any(Object));
  });
});
