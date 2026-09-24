import { afterEach, describe, expect, it, vi } from 'vitest';

const isLocalRepairCatalogueOnly = vi.hoisted(() => vi.fn());
const from = vi.hoisted(() => vi.fn());

vi.mock('@/lib/localRepairCatalogueFixture', () => ({ isLocalRepairCatalogueOnly }));
vi.mock('@/lib/supabase', () => ({ supabase: { from } }));

import { GET } from './route';

afterEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/storefront-upsells', () => {
  it('returns no upsells without querying Supabase in local-only mode', async () => {
    isLocalRepairCatalogueOnly.mockReturnValue(true);

    const response = await GET();

    expect(await response.json()).toEqual([]);
    expect(from).not.toHaveBeenCalled();
  });

  it('keeps the active-upsell query in normal mode', async () => {
    isLocalRepairCatalogueOnly.mockReturnValue(false);
    const eq = vi.fn().mockResolvedValue({ data: [{ id: 'upsell-1', name: 'Case' }], error: null });
    const select = vi.fn().mockReturnValue({ eq });
    from.mockReturnValue({ select });

    const response = await GET();

    expect(from).toHaveBeenCalledWith('storefront_upsells');
    expect(select).toHaveBeenCalledWith('id, name, description, regular_price, bundle_price');
    expect(eq).toHaveBeenCalledWith('is_active', true);
    expect(await response.json()).toEqual([{ id: 'upsell-1', name: 'Case' }]);
  });
});
