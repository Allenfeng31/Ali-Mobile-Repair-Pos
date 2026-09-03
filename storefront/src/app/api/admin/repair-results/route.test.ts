import { afterEach, describe, expect, it, vi } from 'vitest';

const { createServiceRoleClient, fetchRepairCatalog, revalidateRepairResultPaths } = vi.hoisted(() => ({
  createServiceRoleClient: vi.fn(),
  fetchRepairCatalog: vi.fn(),
  revalidateRepairResultPaths: vi.fn(),
}));

vi.mock('next/headers', () => ({ cookies: vi.fn(async () => new Map()) }));
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: vi.fn(() => ({ auth: { getSession: vi.fn(async () => ({ data: { session: { user: { id: 'staff' } } }, error: null })) } })),
}));
vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn() }));
vi.mock('@/utils/supabase/service-role', () => ({ createServiceRoleClient }));
vi.mock('@/lib/api', () => ({ fetchRepairCatalog }));
vi.mock('@/lib/repairResultRevalidation.server', () => ({ revalidateRepairResultPaths }));

import { GET, POST } from './route';

const catalog = {
  brands: [{
    category: 'laptop', brand: 'MacBook', slug: 'macbook', icon: 'laptop', models: [{
      model: 'MacBook Air M2 13-inch 2022', slug: 'macbook-air-m2-13-2022',
      repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 0 }],
    }],
  }],
};

function createValidPhoneFormData(id: string) {
  const formData = new FormData();
  formData.set('id', id);
  formData.set('device_category', 'phone');
  formData.set('brand', 'iPhone');
  formData.set('brand_slug', 'iphone');
  formData.set('model', 'iPhone 16 Pro');
  formData.set('model_slug', 'iphone-16-pro');
  formData.set('repair_type', 'Screen Replacement');
  formData.set('repair_type_slug', 'screen-replacement');
  formData.set('title', 'Screen repair result');
  formData.append('before_image', new Blob(['before'], { type: 'image/webp' }), 'before.webp');
  formData.append('after_image', new Blob(['after'], { type: 'image/webp' }), 'after.webp');
  return formData;
}

const phoneCatalog = {
  brands: [{
    category: 'phone', brand: 'iPhone', slug: 'iphone', icon: 'phone', models: [{
      model: 'iPhone 16 Pro', slug: 'iphone-16-pro',
      repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 0 }],
    }],
  }],
};

const replayResult = {
  id: '00000000-0000-4000-8000-000000000005',
  device_category: 'phone',
  brand_slug: 'iphone',
  model_slug: 'iphone-16-pro',
  repair_type_slug: 'screen-replacement',
  featured_on_homepage: true,
  featured_on_repair_hub: true,
  featured_on_brand_hub: true,
};

describe('admin repair result taxonomy route', () => {
  afterEach(() => {
    createServiceRoleClient.mockReset();
    fetchRepairCatalog.mockReset();
    revalidateRepairResultPaths.mockReset();
  });

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

    const response = await POST({
      headers: new Headers(),
      formData: async () => formData,
    } as unknown as Request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'Selected repair taxonomy does not have a valid Storefront destination.' });
  });

  it('invalidates the persisted result destinations only after a successful POST insert', async () => {
    const persistedResult = {
      id: '00000000-0000-4000-8000-000000000002',
      device_category: 'phone',
      brand_slug: 'iphone',
      model_slug: 'iphone-16-pro',
      repair_type_slug: 'screen-replacement',
      featured_on_homepage: true,
      featured_on_repair_hub: true,
      featured_on_brand_hub: true,
    };
    const events: string[] = [];
    const selectExisting = {
      eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: null, error: null })) })),
    };
    const insert = {
      select: vi.fn(() => ({ single: vi.fn(async () => {
        events.push('insert');
        return { data: persistedResult, error: null };
      }) })),
    };

    createServiceRoleClient.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => selectExisting),
        insert: vi.fn(() => insert),
      })),
      storage: { from: vi.fn(() => ({ upload: vi.fn(async () => ({ error: null })) })) },
    });
    fetchRepairCatalog.mockResolvedValueOnce({
      brands: [{
        category: 'phone', brand: 'iPhone', slug: 'iphone', icon: 'phone', models: [{
          model: 'iPhone 16 Pro', slug: 'iphone-16-pro',
          repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 0 }],
        }],
      }],
    });
    revalidateRepairResultPaths.mockImplementation(() => events.push('revalidate'));

    const formData = new FormData();
    formData.set('id', persistedResult.id);
    formData.set('device_category', 'phone');
    formData.set('brand', 'iPhone');
    formData.set('brand_slug', 'iphone');
    formData.set('model', 'iPhone 16 Pro');
    formData.set('model_slug', 'iphone-16-pro');
    formData.set('repair_type', 'Screen Replacement');
    formData.set('repair_type_slug', 'screen-replacement');
    formData.set('title', 'Screen repair result');
    formData.append('before_image', new Blob(['before'], { type: 'image/webp' }), 'before.webp');
    formData.append('after_image', new Blob(['after'], { type: 'image/webp' }), 'after.webp');

    const response = await POST({
      headers: new Headers(),
      formData: async () => formData,
    } as unknown as Request);

    expect(response.status).toBe(201);
    expect(events).toEqual(['insert', 'revalidate']);
    expect(revalidateRepairResultPaths).toHaveBeenCalledWith([
      '/repairs/phone/iphone/iphone-16-pro/screen-replacement',
      '/repairs/phone/iphone/iphone-16-pro',
      '/repairs/phone/iphone',
      '/repairs/phone',
      '/',
    ]);
  });

  it('does not invalidate when POST persistence fails', async () => {
    const selectExisting = {
      eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: null, error: null })) })),
    };
    createServiceRoleClient.mockReturnValueOnce({
      from: vi.fn(() => ({
        select: vi.fn(() => selectExisting),
        insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(async () => ({ data: null, error: new Error('write failed') })) })) })),
      })),
      storage: { from: vi.fn(() => ({
        upload: vi.fn(async () => ({ error: null })),
        remove: vi.fn(async () => ({ error: null })),
      })) },
    });
    fetchRepairCatalog.mockResolvedValueOnce({
      brands: [{
        category: 'phone', brand: 'iPhone', slug: 'iphone', icon: 'phone', models: [{
          model: 'iPhone 16 Pro', slug: 'iphone-16-pro',
          repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 0 }],
        }],
      }],
    });
    const formData = new FormData();
    formData.set('id', '00000000-0000-4000-8000-000000000004');
    formData.set('device_category', 'phone');
    formData.set('brand', 'iPhone');
    formData.set('brand_slug', 'iphone');
    formData.set('model', 'iPhone 16 Pro');
    formData.set('model_slug', 'iphone-16-pro');
    formData.set('repair_type', 'Screen Replacement');
    formData.set('repair_type_slug', 'screen-replacement');
    formData.set('title', 'Screen repair result');
    formData.append('before_image', new Blob(['before'], { type: 'image/webp' }), 'before.webp');
    formData.append('after_image', new Blob(['after'], { type: 'image/webp' }), 'after.webp');

    const response = await POST({ headers: new Headers(), formData: async () => formData } as unknown as Request);

    expect(response.status).toBe(500);
    expect(revalidateRepairResultPaths).not.toHaveBeenCalled();
  });

  it('revalidates the existing persisted record without inserting on a pre-existing UUID replay', async () => {
    const insert = vi.fn();
    createServiceRoleClient.mockReturnValueOnce({
      from: vi.fn(() => ({
        select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: replayResult, error: null })) })) })),
        insert,
      })),
    });
    fetchRepairCatalog.mockResolvedValueOnce(phoneCatalog);

    const response = await POST({
      headers: new Headers(),
      formData: async () => createValidPhoneFormData(replayResult.id),
    } as unknown as Request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ data: replayResult, idempotentReplay: true });
    expect(insert).not.toHaveBeenCalled();
    expect(revalidateRepairResultPaths).toHaveBeenCalledWith([
      '/repairs/phone/iphone/iphone-16-pro/screen-replacement',
      '/repairs/phone/iphone/iphone-16-pro',
      '/repairs/phone/iphone',
      '/repairs/phone',
      '/',
    ]);
  });

  it('revalidates the resolved record after a 23505 concurrent replay without a second insert', async () => {
    const duplicateError = Object.assign(new Error('duplicate'), { code: '23505' });
    const insert = vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(async () => ({ data: null, error: duplicateError })) })) }));
    const from = vi.fn();
    from
      .mockReturnValueOnce({ select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: null, error: null })) })) })) })
      .mockReturnValueOnce({ insert })
      .mockReturnValueOnce({ select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: replayResult, error: null })) })) })) });
    createServiceRoleClient.mockReturnValue({
      from,
      storage: { from: vi.fn(() => ({ upload: vi.fn(async () => ({ error: null })), remove: vi.fn(async () => ({ error: null })) })) },
    });
    fetchRepairCatalog.mockResolvedValueOnce(phoneCatalog);

    const response = await POST({
      headers: new Headers(),
      formData: async () => createValidPhoneFormData(replayResult.id),
    } as unknown as Request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ data: replayResult, idempotentReplay: true });
    expect(insert).toHaveBeenCalledTimes(1);
    expect(revalidateRepairResultPaths).toHaveBeenCalledWith([
      '/repairs/phone/iphone/iphone-16-pro/screen-replacement',
      '/repairs/phone/iphone/iphone-16-pro',
      '/repairs/phone/iphone',
      '/repairs/phone',
      '/',
    ]);
  });

  it('keeps a pre-existing UUID replay successful if best-effort revalidation unexpectedly throws', async () => {
    createServiceRoleClient.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: replayResult, error: null })) })) })),
      })),
    });
    fetchRepairCatalog.mockResolvedValueOnce(phoneCatalog);
    revalidateRepairResultPaths.mockImplementationOnce(() => { throw new Error('cache unavailable'); });

    const response = await POST({
      headers: new Headers(),
      formData: async () => createValidPhoneFormData(replayResult.id),
    } as unknown as Request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ data: replayResult, idempotentReplay: true });
  });
});
