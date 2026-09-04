import { afterEach, describe, expect, it, vi } from 'vitest';

const createPublicRepairResultsClient = vi.hoisted(() => vi.fn());
const selectHubRepairResults = vi.hoisted(() => vi.fn());

vi.mock('@/lib/repair-results', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/repair-results')>();

  return {
    ...actual,
    createPublicRepairResultsClient,
    selectHubRepairResults,
    MAX_HUB_REPAIR_RESULT_QUERY_ROWS: 50,
    PUBLIC_REPAIR_RESULT_SELECT: 'public-fields',
  };
});

import { GET } from './route';

function queryFor(data: unknown[], error: unknown = null) {
  const query = { select: vi.fn(), eq: vi.fn(), neq: vi.fn(), in: vi.fn(), order: vi.fn(), limit: vi.fn() };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.neq.mockReturnValue(query);
  query.in.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.limit.mockResolvedValue({ data, error });
  return query;
}

describe('public Category Hub Repair Results route', () => {
  afterEach(() => {
    createPublicRepairResultsClient.mockReset();
    selectHubRepairResults.mockReset();
  });

  it('keeps the existing no-store response and delegates ordered candidates to the shared Hub selector', async () => {
    const sourceRows = [{ id: 'screen-first' }];
    const selectedRows = [{
      id: 'screen-first',
      device_category: 'phone',
      brand: 'Example',
      brand_slug: 'example',
      model: 'Example Phone',
      model_slug: 'example-phone',
      repair_type: 'Screen Replacement',
      repair_type_slug: 'screen-replacement',
      image_pair_alt_text: 'Approved result',
      title: 'Example screen result',
      short_description: 'Approved repair result',
      related_repair_url: '/repairs/phone/example/example-phone/screen-replacement',
      before_image_path: 'approved/internal-before.jpg',
      after_image_path: 'approved/internal-after.jpg',
    }];
    const query = queryFor(sourceRows);
    createPublicRepairResultsClient.mockReturnValue({ from: vi.fn(() => query) });
    selectHubRepairResults.mockReturnValue(selectedRows);

    const response = await GET(new Request('https://example.test/api/public/repair-results/hub?category=phone'));

    expect(query.eq).toHaveBeenCalledWith('device_category', 'phone');
    expect(query.eq).toHaveBeenCalledWith('featured_on_repair_hub', true);
    expect(query.order.mock.calls).toEqual([
      ['published_at', { ascending: false, nullsFirst: false }],
      ['created_at', { ascending: false }],
      ['id', { ascending: false }],
    ]);
    expect(query.limit).toHaveBeenCalledWith(50);
    expect(selectHubRepairResults).toHaveBeenCalledWith(sourceRows);
    expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0, must-revalidate');
    await expect(response.json()).resolves.toEqual({
      status: 'SUCCESS',
      data: [{
        id: 'screen-first',
        device_category: 'phone',
        brand: 'Example',
        brand_slug: 'example',
        model: 'Example Phone',
        model_slug: 'example-phone',
        repair_type: 'Screen Replacement',
        repair_type_slug: 'screen-replacement',
        image_pair_alt_text: 'Approved result',
        title: 'Example screen result',
        short_description: 'Approved repair result',
        related_repair_url: '/repairs/phone/example/example-phone/screen-replacement',
      }],
    });
  });
});
