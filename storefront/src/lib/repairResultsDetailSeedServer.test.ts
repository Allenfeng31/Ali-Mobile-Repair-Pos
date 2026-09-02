import { describe, expect, it, vi } from 'vitest';

const createPublicRepairResultsClient = vi.hoisted(() => vi.fn());

vi.mock('./repair-results', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./repair-results')>()),
  createPublicRepairResultsClient,
}));

import { fetchRepairDetailInitialResults } from './repair-results.server';

const request = {
  category: 'phone' as const,
  brandSlug: 'future-brand',
  modelSlug: 'future-phone',
  repairTypeSlug: 'future-repair',
};

const publicResult = {
  id: 'public-result-1',
  device_category: 'phone' as const,
  brand: 'Future Brand',
  brand_slug: 'future-brand',
  model: 'Future Phone',
  model_slug: 'future-phone',
  repair_type: 'Future Repair',
  repair_type_slug: 'future-repair',
  before_image_path: 'approved/before.jpg',
  after_image_path: 'approved/after.jpg',
  image_pair_alt_text: 'Approved public repair result',
  image_aspect_ratio: '4:3',
  before_image_width: 1200,
  before_image_height: 900,
  after_image_width: 1200,
  after_image_height: 900,
  title: 'Future repair proof',
  short_description: 'A privacy-checked published repair result.',
  status: 'published' as const,
  privacy_checked: true,
  featured_on_homepage: false,
  featured_on_repair_hub: false,
  featured_on_brand_hub: false,
  sort_order: 10,
  related_repair_url: '/repairs/phone/future-brand/future-phone/future-repair',
  created_at: '2026-09-02T09:00:00.000Z',
  updated_at: '2026-09-02T09:00:00.000Z',
  published_at: '2026-09-02T09:00:00.000Z',
};

function queryFor(data: unknown[]) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    neq: vi.fn(),
    order: vi.fn(),
    or: vi.fn(),
    limit: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.neq.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.or.mockReturnValue(query);
  query.limit.mockResolvedValue({ data, error: null });
  return query;
}

describe('server Repair Detail initial result reader', () => {
  it('uses exact canonical context, matching API ordering, a limit of one, and a safe seed projection', async () => {
    const query = queryFor([publicResult]);
    createPublicRepairResultsClient.mockReturnValue({ from: vi.fn(() => query) });

    const results = await fetchRepairDetailInitialResults(request);

    expect(query.eq).toHaveBeenCalledWith('device_category', 'phone');
    expect(query.eq).toHaveBeenCalledWith('brand_slug', 'future-brand');
    expect(query.eq).toHaveBeenCalledWith('repair_type_slug', 'future-repair');
    expect(query.or).toHaveBeenCalledWith(
      'model_slug.eq.future-phone,related_repair_url.eq./repairs/phone/future-brand/future-phone/future-repair',
    );
    expect(query.order.mock.calls).toEqual([
      ['featured_on_homepage', { ascending: false }],
      ['sort_order', { ascending: true }],
      ['published_at', { ascending: false, nullsFirst: false }],
      ['updated_at', { ascending: false }],
    ]);
    expect(query.limit).toHaveBeenCalledWith(1);
    expect(results).toEqual([expect.objectContaining({
      id: 'public-result-1',
      image_pair_alt_text: 'Approved public repair result',
      title: 'Future repair proof',
    })]);
    expect(results[0]).not.toHaveProperty('before_image_path');
    expect(results[0]).not.toHaveProperty('after_image_path');
  });

  it('fails closed for results that no longer meet public eligibility', async () => {
    const query = queryFor([{ ...publicResult, privacy_checked: false }]);
    createPublicRepairResultsClient.mockReturnValue({ from: vi.fn(() => query) });

    await expect(fetchRepairDetailInitialResults(request)).resolves.toEqual([]);
  });
});
