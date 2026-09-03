import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./BeforeAfterSlider', () => ({
  default: ({ beforeSrc, afterSrc }: { beforeSrc: string; afterSrc: string }) => <div data-testid="before-after-slider">{beforeSrc}|{afterSrc}</div>,
}));

import RealRepairResultsSection from './RealRepairResultsSection';

const seed = {
  phone: {
    id: 'phone-result', device_category: 'phone' as const, model: 'Future Phone', repair_type: 'Screen Replacement',
    image_pair_alt_text: 'Approved proof', title: 'Future Phone screen repaired', short_description: 'Approved public proof.',
    related_repair_url: '/repairs/phone/future-brand/future-phone/screen-replacement',
  },
  tablet: {
    id: 'tablet-result', device_category: 'tablet' as const, model: 'Future Tablet', repair_type: 'Battery Replacement',
    image_pair_alt_text: 'Approved tablet proof', title: 'Future Tablet battery repaired', short_description: null,
    related_repair_url: null,
  },
};

afterEach(() => vi.unstubAllGlobals());

describe('RealRepairResultsSection server seed', () => {
  it('renders the existing Homepage UI immediately from a non-empty seed and skips the no-store API request', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<RealRepairResultsSection initialResults={seed} initialLatestPublishedAt="2026-09-03T09:00:00.000Z" />);

    expect(screen.getByRole('heading', { name: 'Real Repair Results' })).toBeTruthy();
    expect(screen.getByText('Future Phone screen repaired')).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Phone' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByTestId('before-after-slider').textContent).toContain('/media/repair-results/phone-result/before');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps the existing no-store client fallback when no seed is supplied', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'SUCCESS', data: { phone: seed.phone }, latestPublishedAt: null }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<RealRepairResultsSection />);

    await waitFor(() => expect(screen.getByText('Future Phone screen repaired')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledWith('/api/public/repair-results', expect.objectContaining({ cache: 'no-store' }));
  });
});
