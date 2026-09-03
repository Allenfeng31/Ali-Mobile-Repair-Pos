import { afterEach, describe, expect, it, vi } from 'vitest';

const { createServiceRoleClient, revalidateRepairResultPaths } = vi.hoisted(() => ({
  createServiceRoleClient: vi.fn(),
  revalidateRepairResultPaths: vi.fn(),
}));

vi.mock('next/headers', () => ({ cookies: vi.fn(async () => new Map()) }));
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: vi.fn(() => ({ auth: { getSession: vi.fn(async () => ({ data: { session: { user: { id: 'staff' } } }, error: null })) } })),
}));
vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn() }));
vi.mock('@/utils/supabase/service-role', () => ({ createServiceRoleClient }));
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
});
