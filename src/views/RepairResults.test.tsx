/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RepairResultsView } from './RepairResults';

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'test-token' } } }) } },
}));

vi.mock('@/hooks/useAuthStore', () => ({
  useAuthStore: () => ({ permissions: { is_super_admin: true }, isLoading: false }),
}));

const taxonomy = {
  categories: [
    { value: 'phone', label: 'Phone', brands: [{ name: 'Samsung', slug: 'samsung', models: [{ name: 'Galaxy S24', slug: 'galaxy-s24', repairTypes: [{ name: 'Screen Replacement', slug: 'screen-replacement', relatedRepairUrl: '/repairs/phone/samsung/galaxy-s24/screen-replacement' }] }] }] },
    { value: 'laptop', label: 'Laptop', brands: [{ name: 'MacBook', slug: 'macbook', models: [{ name: 'MacBook Air M2 13-inch 2022', slug: 'macbook-air-m2-13-2022', repairTypes: [{ name: 'Screen Replacement', slug: 'screen-replacement', relatedRepairUrl: '/repairs/laptop/macbook/macbook-air-m2-13-2022/screen-replacement' }] }] }] },
  ],
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('RepairResultsView taxonomy workflow', () => {
  it('uses dependent canonical controls, generates preview text, and preserves feature choices across taxonomy changes', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => Promise.resolve({
      ok: true,
      json: async () => url.includes('view=taxonomy') ? { data: taxonomy } : { data: [] },
    })));
    render(<RepairResultsView onBack={vi.fn()} />);

    const category = await screen.findByLabelText('Device category');
    fireEvent.change(category, { target: { value: 'laptop' } });
    fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'macbook' } });
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'macbook-air-m2-13-2022' } });
    fireEvent.change(screen.getByLabelText('Repair type'), { target: { value: 'screen-replacement' } });

    expect(screen.getByDisplayValue('MacBook Air M2 13-inch 2022 Screen Replacement in Ringwood')).toBeTruthy();
    expect(screen.getByDisplayValue('/repairs/laptop/macbook/macbook-air-m2-13-2022/screen-replacement')).toBeTruthy();

    const homepage = screen.getByLabelText(/Featured on Homepage/i);
    fireEvent.click(homepage);
    fireEvent.change(category, { target: { value: 'phone' } });

    expect((homepage as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText('Brand') as HTMLSelectElement).value).toBe('');
    expect(screen.getByText('Feature selections will become publicly visible only after this result is published.')).toBeTruthy();
  });

  it('uses authoritative stats above the latest-results cap and refreshes them after publishing', async () => {
    const draftResult = {
      id: 'result-1',
      device_category: 'phone',
      brand: 'Samsung',
      brand_slug: 'samsung',
      model: 'Galaxy S24',
      model_slug: 'galaxy-s24',
      repair_type: 'Screen Replacement',
      repair_type_slug: 'screen-replacement',
      before_image_path: 'approved/result-1/before.webp',
      after_image_path: 'approved/result-1/after.webp',
      image_pair_alt_text: null,
      image_aspect_ratio: '4:3',
      before_image_width: 1200,
      before_image_height: 900,
      after_image_width: 1200,
      after_image_height: 900,
      title: 'Draft Galaxy S24 screen repair',
      short_description: null,
      status: 'draft',
      privacy_checked: true,
      featured_on_homepage: false,
      featured_on_repair_hub: false,
      featured_on_brand_hub: false,
      sort_order: 0,
      related_repair_url: '/repairs/phone/samsung/galaxy-s24/screen-replacement',
      created_at: '2026-09-14T00:00:00.000Z',
      updated_at: '2026-09-14T00:00:00.000Z',
      published_at: null,
    };
    const resultPayloads = [
      { data: [draftResult], stats: { total: 137, published: 126 } },
      { data: [{ ...draftResult, status: 'published', published_at: '2026-09-14T01:00:00.000Z' }], stats: { total: 137, published: 127 } },
    ];
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url.includes('view=taxonomy')) {
        return Promise.resolve({ ok: true, json: async () => ({ data: taxonomy }) });
      }
      if (init?.method === 'PATCH') {
        return Promise.resolve({ ok: true, json: async () => ({ status: 'SUCCESS' }) });
      }

      return Promise.resolve({ ok: true, json: async () => resultPayloads.shift() });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<RepairResultsView onBack={vi.fn()} />);

    expect(await screen.findByText('137')).toBeTruthy();
    expect(screen.getByText('126')).toBeTruthy();
    expect(screen.getByText('Draft Galaxy S24 screen repair')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));

    await waitFor(() => {
      expect(screen.getByText('127')).toBeTruthy();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/repair-results/result-1'),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });
});
