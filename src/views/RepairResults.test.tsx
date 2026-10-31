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
    { value: 'phone', label: 'Phone', brands: [{ name: 'Samsung', slug: 'samsung', models: [{ name: 'Galaxy S24', slug: 'galaxy-s24', repairTypes: [
      { name: 'Screen Replacement', slug: 'screen-replacement', relatedRepairUrl: '/repairs/phone/samsung/galaxy-s24/screen-replacement' },
      { name: 'Battery Replacement', slug: 'battery-replacement', relatedRepairUrl: '/repairs/phone/samsung/galaxy-s24/battery-replacement' },
      { name: 'Charging Port Replacement', slug: 'charging-port-replacement', relatedRepairUrl: '/repairs/phone/samsung/galaxy-s24/charging-port-replacement' },
      { name: 'Back Housing Replacement', slug: 'back-housing-replacement', relatedRepairUrl: '/repairs/phone/samsung/galaxy-s24/back-glass-replacement' },
    ] }] }] },
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
      json: async () => url.includes('view=taxonomy') ? { data: taxonomy } : { data: [], stats: { total: 0, published: 0 } },
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

  it('shows the shared symptom presets under the description and keeps advanced details open', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => Promise.resolve({
      ok: true,
      json: async () => url.includes('view=taxonomy') ? { data: taxonomy } : { data: [], stats: { total: 0, published: 0 } },
    })));
    const { container } = render(<RepairResultsView onBack={vi.fn()} />);

    await screen.findByLabelText('Device category');
    fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'samsung' } });
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'galaxy-s24' } });
    fireEvent.change(screen.getByLabelText('Repair type'), { target: { value: 'screen-replacement' } });

    expect(container.querySelector('details')?.open).toBe(true);
    expect(screen.getAllByRole('button', { name: /Use .* preset/ })).toHaveLength(10);
    expect(screen.getByRole('button', { name: 'Use No Display preset' })).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Repair type'), { target: { value: 'battery-replacement' } });
    expect(screen.getAllByRole('button', { name: /Use .* preset/ })).toHaveLength(10);
    expect(screen.getByRole('button', { name: 'Use Rapid Drain preset' })).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Repair type'), { target: { value: 'charging-port-replacement' } });
    expect(screen.getAllByRole('button', { name: /Use .* preset/ })).toHaveLength(10);
    expect(screen.getByRole('button', { name: 'Use Cable Angle preset' })).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Repair type'), { target: { value: 'back-housing-replacement' } });
    expect(screen.getAllByRole('button', { name: /Use .* preset/ })).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Use Cracked Back preset' })).toBeTruthy();
  });

  it('replaces the description with a preset and leaves it manually editable', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => Promise.resolve({
      ok: true,
      json: async () => url.includes('view=taxonomy') ? { data: taxonomy } : { data: [], stats: { total: 0, published: 0 } },
    })));
    render(<RepairResultsView onBack={vi.fn()} />);
    await screen.findByLabelText('Device category');
    fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'samsung' } });
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'galaxy-s24' } });
    fireEvent.change(screen.getByLabelText('Repair type'), { target: { value: 'screen-replacement' } });
    const description = screen.getByLabelText('Short description') as HTMLTextAreaElement;

    fireEvent.click(screen.getByRole('button', { name: 'Use No Display preset' }));
    expect(description.value).toContain('Galaxy S24');
    expect(screen.getAllByText('Preset selected').length).toBeGreaterThan(0);
    fireEvent.change(description, { target: { value: 'Technician verified custom wording.' } });
    expect(description.value).toBe('Technician verified custom wording.');
    expect(screen.getAllByText('Custom edited').length).toBeGreaterThan(0);
  });

  it('edits the same historical record without re-uploading images and preserves publication settings', async () => {
    const publishedResult = {
      id: 'result-1', device_category: 'phone', brand: 'Samsung', brand_slug: 'samsung',
      model: 'Galaxy S24', model_slug: 'galaxy-s24', repair_type: 'Screen Replacement', repair_type_slug: 'screen-replacement',
      before_image_path: 'approved/result-1/before.webp', after_image_path: 'approved/result-1/after.webp',
      image_pair_alt_text: 'Existing image description', image_aspect_ratio: '4:3',
      before_image_width: 1200, before_image_height: 900, after_image_width: 1200, after_image_height: 900,
      title: 'Published Galaxy S24 screen repair', short_description: 'Existing staff description.',
      status: 'published', privacy_checked: true, featured_on_homepage: true, featured_on_repair_hub: true,
      featured_on_brand_hub: false, sort_order: 7,
      related_repair_url: '/repairs/phone/samsung/galaxy-s24/screen-replacement',
      created_at: '2026-09-14T00:00:00.000Z', updated_at: '2026-09-14T00:00:00.000Z', published_at: '2026-09-14T01:00:00.000Z',
    };
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url.includes('view=taxonomy')) return Promise.resolve({ ok: true, json: async () => ({ data: taxonomy }) });
      if (init?.method === 'PATCH') return Promise.resolve({ ok: true, json: async () => ({ data: publishedResult }) });
      return Promise.resolve({ ok: true, json: async () => ({ data: [publishedResult], stats: { total: 1, published: 1 } }) });
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('scrollTo', vi.fn());
    render(<RepairResultsView onBack={vi.fn()} />);

    await screen.findByText('Published Galaxy S24 screen repair');
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByRole('heading', { name: 'Edit result' })).toBeTruthy();
    expect(screen.getByText('approved/result-1/before.webp')).toBeTruthy();
    expect(screen.getByText('approved/result-1/after.webp')).toBeTruthy();
    expect(screen.queryByLabelText('Before image')).toBeNull();
    expect((screen.getByLabelText(/Featured on Homepage/i) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText(/Feature on Repair Hub/i) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText(/Save as/i) as HTMLSelectElement).value).toBe('published');

    fireEvent.change(screen.getByLabelText('Short description'), { target: { value: 'Updated historical description.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update repair result' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/repair-results/result-1'),
        expect.objectContaining({ method: 'PATCH', body: expect.any(FormData) }),
      );
    });
    const patchCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH');
    const patchHeaders = patchCall?.[1]?.headers as Record<string, string>;
    const patchBody = patchCall?.[1]?.body as FormData;
    expect(patchHeaders.Authorization).toBe('Bearer test-token');
    expect(patchHeaders['Content-Type']).toBeUndefined();
    expect(patchBody.get('short_description')).toBe('Updated historical description.');
    expect(patchBody.get('featured_on_homepage')).toBe('true');
    expect(patchBody.get('status')).toBe('published');
    expect(patchBody.get('before_image')).toBeNull();
    expect(patchBody.get('after_image')).toBeNull();
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
