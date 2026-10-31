import { afterEach, describe, expect, it, vi } from 'vitest';

const { createServiceRoleClient, fetchRepairCatalog, resolveRepairResultTaxonomy, revalidateRepairResultPaths } = vi.hoisted(() => ({
  createServiceRoleClient: vi.fn(),
  fetchRepairCatalog: vi.fn(),
  resolveRepairResultTaxonomy: vi.fn(),
  revalidateRepairResultPaths: vi.fn(),
}));

vi.mock('next/headers', () => ({ cookies: vi.fn(async () => new Map()) }));
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: vi.fn(() => ({ auth: { getSession: vi.fn(async () => ({ data: { session: { user: { id: 'staff' } } }, error: null })) } })),
}));
vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn() }));
vi.mock('@/utils/supabase/service-role', () => ({ createServiceRoleClient }));
vi.mock('@/lib/api', () => ({ fetchRepairCatalog }));
vi.mock('@/lib/repairResultTaxonomy', () => ({ resolveRepairResultTaxonomy }));
vi.mock('@/lib/repairResultRevalidation.server', () => ({ revalidateRepairResultPaths }));

import { PATCH } from './route';
import type { PublicRepairResult } from '@/lib/repair-results';

const existingResult: PublicRepairResult = {
  id: '00000000-0000-4000-8000-000000000003',
  device_category: 'phone',
  brand: 'iPhone',
  brand_slug: 'iphone',
  model: 'iPhone 16 Pro',
  model_slug: 'iphone-16-pro',
  repair_type: 'Screen Replacement',
  repair_type_slug: 'screen-replacement',
  before_image_path: 'approved/result/before.webp',
  after_image_path: 'approved/result/after.webp',
  image_pair_alt_text: 'Repair result',
  image_aspect_ratio: '4:3',
  before_image_width: null,
  before_image_height: null,
  after_image_width: null,
  after_image_height: null,
  title: 'Original title',
  short_description: 'Original description',
  status: 'published' as const,
  privacy_checked: true,
  featured_on_homepage: true,
  featured_on_repair_hub: true,
  featured_on_brand_hub: true,
  sort_order: 0,
  related_repair_url: '/repairs/phone/iphone/iphone-16-pro/screen-replacement',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  published_at: '2026-01-01T00:00:00.000Z',
};

function mockPatchClient(nextResult: typeof existingResult, updateError: Error | null = null) {
  const existingQuery = {
    eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: existingResult, error: null })) })),
  };
  const updateQuery = {
    eq: vi.fn(() => ({
      select: vi.fn(() => ({ single: vi.fn(async () => ({ data: updateError ? null : nextResult, error: updateError })) })),
    })),
  };

  createServiceRoleClient.mockReturnValueOnce({
    from: vi.fn(() => ({
      select: vi.fn(() => existingQuery),
      update: vi.fn(() => updateQuery),
    })),
    storage: { from: vi.fn(() => ({ copy: vi.fn(async () => ({ error: null })) })) },
  });
}

describe('PATCH /api/admin/repair-results/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('uses persisted old and new states so unpublish, privacy, content, and removed placements clear affected SSR paths', async () => {
    const nextResult = {
      ...existingResult,
      status: 'draft' as const,
      privacy_checked: false,
      featured_on_homepage: false,
      featured_on_repair_hub: false,
      featured_on_brand_hub: false,
      title: 'Updated title',
    };
    mockPatchClient(nextResult);

    const response = await PATCH(new Request('http://localhost/api/admin/repair-results/result', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        status: 'draft',
        privacy_checked: false,
        featured_on_homepage: false,
        featured_on_repair_hub: false,
        featured_on_brand_hub: false,
        title: 'Updated title',
      }),
    }), { params: Promise.resolve({ id: existingResult.id }) });

    expect(response.status).toBe(200);
    expect(revalidateRepairResultPaths).toHaveBeenCalledWith([
      '/repairs/phone/iphone/iphone-16-pro/screen-replacement',
      '/repairs/phone/iphone/iphone-16-pro',
      '/repairs/phone/iphone',
      '/repairs/phone',
      '/',
      '/repairs/screen-replacement',
    ]);
  });

  it('adds new placement destinations after a successful PATCH', async () => {
    const oldResult = {
      ...existingResult,
      status: 'draft' as const,
      privacy_checked: false,
      featured_on_homepage: false,
      featured_on_repair_hub: false,
      featured_on_brand_hub: false,
    };
    const nextResult = {
      ...oldResult,
      featured_on_homepage: true,
      featured_on_repair_hub: true,
      featured_on_brand_hub: true,
    };
    const existingQuery = {
      eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: oldResult, error: null })) })),
    };
    const updateQuery = {
      eq: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(async () => ({ data: nextResult, error: null })) })) })),
    };
    createServiceRoleClient.mockReturnValueOnce({
      from: vi.fn(() => ({ select: vi.fn(() => existingQuery), update: vi.fn(() => updateQuery) })),
      storage: { from: vi.fn(() => ({ copy: vi.fn(async () => ({ error: null })) })) },
    });

    const response = await PATCH(new Request('http://localhost/api/admin/repair-results/result', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        featured_on_homepage: true,
        featured_on_repair_hub: true,
        featured_on_brand_hub: true,
      }),
    }), { params: Promise.resolve({ id: existingResult.id }) });

    expect(response.status).toBe(200);
    expect(revalidateRepairResultPaths).toHaveBeenLastCalledWith([
      '/repairs/phone/iphone/iphone-16-pro/screen-replacement',
      '/repairs/phone/iphone/iphone-16-pro',
      '/repairs/screen-replacement',
      '/repairs/phone/iphone',
      '/repairs/phone',
      '/',
    ]);
  });

  it('does not invalidate when persistence fails', async () => {
    mockPatchClient(existingResult, new Error('write failed'));

    const response = await PATCH(new Request('http://localhost/api/admin/repair-results/result', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Updated title' }),
    }), { params: Promise.resolve({ id: existingResult.id }) });

    expect(response.status).toBe(500);
    expect(revalidateRepairResultPaths).not.toHaveBeenCalled();
  });

  it('persists canonical identity and editable metadata while preserving media and the original publication date', async () => {
    const update = vi.fn((updates: Record<string, unknown>) => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({ single: vi.fn(async () => ({
          data: { ...existingResult, ...updates },
          error: null,
        })) })),
      })),
    }));
    createServiceRoleClient.mockReturnValueOnce({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: existingResult, error: null })) })),
        })),
        update,
      })),
      storage: { from: vi.fn(() => ({ copy: vi.fn(async () => ({ error: null })) })) },
    });
    fetchRepairCatalog.mockResolvedValue({ brands: [] });
    resolveRepairResultTaxonomy.mockReturnValue({
      deviceCategory: 'phone',
      brand: 'Google Pixel',
      brandSlug: 'google-pixel',
      model: 'Pixel 9 Pro',
      modelSlug: 'pixel-9-pro',
      repairType: 'Battery Replacement',
      repairTypeSlug: 'battery-replacement',
      relatedRepairUrl: '/repairs/phone/google-pixel/pixel-9-pro/battery-replacement',
    });

    const body = new FormData();
    body.set('device_category', 'phone');
    body.set('brand_slug', 'google-pixel');
    body.set('model_slug', 'pixel-9-pro');
    body.set('repair_type_slug', 'battery-replacement');
    body.set('title', 'Pixel 9 Pro battery result');
    body.set('short_description', 'Saved preset description.');
    body.set('image_pair_alt_text', 'Pixel 9 Pro battery before and after');
    body.set('image_aspect_ratio', '3:4');
    body.set('sort_order', '7');
    body.set('status', 'published');
    body.set('privacy_checked', 'true');
    body.set('featured_on_homepage', 'true');
    body.set('featured_on_repair_hub', 'true');
    body.set('featured_on_brand_hub', 'true');

    const response = await PATCH(new Request('http://localhost/api/admin/repair-results/result', {
      method: 'PATCH',
      body,
    }), { params: Promise.resolve({ id: existingResult.id }) });

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      device_category: 'phone',
      brand: 'Google Pixel',
      brand_slug: 'google-pixel',
      model: 'Pixel 9 Pro',
      model_slug: 'pixel-9-pro',
      repair_type: 'Battery Replacement',
      repair_type_slug: 'battery-replacement',
      related_repair_url: '/repairs/phone/google-pixel/pixel-9-pro/battery-replacement',
      short_description: 'Saved preset description.',
      image_aspect_ratio: '3:4',
      sort_order: 7,
      published_at: existingResult.published_at,
    }));
    expect(update.mock.calls[0][0]).toMatchObject({
      before_image_path: existingResult.before_image_path,
      after_image_path: existingResult.after_image_path,
    });
  });
});
