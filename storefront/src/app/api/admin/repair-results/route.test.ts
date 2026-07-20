import { describe, expect, it, vi } from 'vitest';

const { fetchRepairCatalog } = vi.hoisted(() => ({ fetchRepairCatalog: vi.fn() }));

vi.mock('next/headers', () => ({ cookies: vi.fn(async () => new Map()) }));
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: vi.fn(() => ({ auth: { getSession: vi.fn(async () => ({ data: { session: { user: { id: 'staff' } } }, error: null })) } })),
}));
vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn() }));
vi.mock('@/utils/supabase/service-role', () => ({ createServiceRoleClient: vi.fn() }));
vi.mock('@/lib/api', () => ({ fetchRepairCatalog }));

import { GET, POST } from './route';

const catalog = {
  brands: [{
    category: 'laptop', brand: 'MacBook', slug: 'macbook', icon: 'laptop', models: [{
      model: 'MacBook Air M2 13-inch 2022', slug: 'macbook-air-m2-13-2022',
      repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 0 }],
    }],
  }],
};

describe('admin repair result taxonomy route', () => {
  it('returns the authenticated serialized canonical taxonomy', async () => {
    fetchRepairCatalog.mockResolvedValueOnce(catalog);

    const response = await GET(new Request('http://localhost/api/admin/repair-results?view=taxonomy'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.categories[0].brands[0].models[0]).toMatchObject({
      name: 'MacBook Air M2 13-inch 2022',
      slug: 'macbook-air-m2-13-2022',
    });
  });

  it('rejects an invalid taxonomy selection before uploads or database writes', async () => {
    fetchRepairCatalog.mockResolvedValueOnce(catalog);
    const formData = new FormData();
    formData.set('id', '00000000-0000-4000-8000-000000000001');
    formData.set('device_category', 'laptop');
    formData.set('status', 'draft');
    formData.set('brand', 'Apple');
    formData.set('brand_slug', 'apple');
    formData.set('model', 'MacBook Air M2 13-inch');
    formData.set('model_slug', 'macbook-air-m2-13-inch');
    formData.set('repair_type', 'Screen Replacement');
    formData.set('repair_type_slug', 'screen-replacement');
    formData.set('title', 'Manual title');

    const response = await POST(new Request('http://localhost/api/admin/repair-results', { method: 'POST', body: formData }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'Selected repair taxonomy does not have a valid Storefront destination.' });
  });
});
