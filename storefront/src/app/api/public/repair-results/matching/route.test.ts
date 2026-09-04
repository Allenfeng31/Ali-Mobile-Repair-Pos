import { describe, expect, it, vi } from 'vitest';

const createPublicRepairResultsClient = vi.hoisted(() => vi.fn());

vi.mock('@/lib/repair-results', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/repair-results')>()),
  createPublicRepairResultsClient,
}));

import { GET } from './route';

type RepairResult = {
  id: string;
  device_category: 'phone' | 'tablet' | 'laptop' | 'watch';
  brand: string;
  brand_slug: string;
  model: string;
  model_slug: string;
  repair_type: string;
  repair_type_slug: string;
  before_image_path: string;
  after_image_path: string;
  image_pair_alt_text: string | null;
  image_aspect_ratio: string | null;
  before_image_width: number | null;
  before_image_height: number | null;
  after_image_width: number | null;
  after_image_height: number | null;
  title: string;
  short_description: string | null;
  status: 'published' | 'draft';
  privacy_checked: boolean;
  featured_on_homepage: boolean;
  featured_on_repair_hub: boolean;
  featured_on_brand_hub: boolean;
  sort_order: number;
  related_repair_url: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

function result(overrides: Partial<RepairResult> = {}): RepairResult {
  return {
    id: 'exact-screen',
    device_category: 'phone',
    brand: 'Apple',
    brand_slug: 'apple',
    model: 'iPhone 16 Pro',
    model_slug: 'iphone-16-pro',
    repair_type: 'Screen Replacement',
    repair_type_slug: 'screen-replacement',
    before_image_path: 'before.jpg',
    after_image_path: 'after.jpg',
    image_pair_alt_text: null,
    image_aspect_ratio: '4:3',
    before_image_width: 1200,
    before_image_height: 900,
    after_image_width: 1200,
    after_image_height: 900,
    title: 'Exact model screen repair',
    short_description: null,
    status: 'published',
    privacy_checked: true,
    featured_on_homepage: false,
    featured_on_repair_hub: false,
    featured_on_brand_hub: false,
    sort_order: 10,
    related_repair_url: '/repairs/phone/iphone/iphone-16-pro/screen-replacement',
    created_at: '2026-09-03T08:00:00.000Z',
    updated_at: '2026-09-03T08:00:00.000Z',
    published_at: '2026-09-03T08:00:00.000Z',
    ...overrides,
  };
}

function createQuery(rows: RepairResult[]) {
  const conditions: Array<(row: RepairResult) => boolean> = [];
  const orderBy: Array<[keyof RepairResult, { ascending?: boolean } | undefined]> = [];
  const query = {
    select: vi.fn(),
    eq: vi.fn((field: keyof RepairResult, value: unknown) => {
      conditions.push((row) => row[field] === value);
      return query;
    }),
    neq: vi.fn((field: keyof RepairResult, value: unknown) => {
      conditions.push((row) => row[field] !== value);
      return query;
    }),
    in: vi.fn((field: keyof RepairResult, values: unknown[]) => {
      conditions.push((row) => values.includes(row[field]));
      return query;
    }),
    order: vi.fn((field: keyof RepairResult, options?: { ascending?: boolean }) => {
      orderBy.push([field, options]);
      return query;
    }),
    or: vi.fn((expression: string) => {
      const model = expression.match(/^model_slug\.eq\.([^,]+)/)?.[1];
      const relatedMatch = expression.match(/related_repair_url\.(like|eq)\.(.+)$/);
      const relatedOperator = relatedMatch?.[1];
      const relatedUrl = relatedMatch?.[2];
      conditions.push((row) => row.model_slug === model || (
        relatedOperator === 'like'
          ? (row.related_repair_url?.startsWith(relatedUrl?.replace(/%$/, '') || '') ?? false)
          : row.related_repair_url === relatedUrl
      ));
      return query;
    }),
    limit: vi.fn((limit: number) => {
      const data = rows
        .filter((row) => conditions.every((condition) => condition(row)))
        .slice()
        .sort((left, right) => {
          for (const [field, options] of orderBy) {
            if (left[field] === right[field]) continue;
            const direction = options?.ascending === false ? -1 : 1;
            return (String(left[field]) > String(right[field]) ? 1 : -1) * direction;
          }
          return 0;
        })
        .slice(0, limit);
      return Promise.resolve({ data, error: null });
    }),
  };
  query.select.mockReturnValue(query);
  return query;
}

function createSupabase(rows: RepairResult[]) {
  const queries: ReturnType<typeof createQuery>[] = [];
  return {
    client: {
      from: vi.fn(() => {
        const query = createQuery(rows);
        queries.push(query);
        return query;
      }),
    },
    queries,
  };
}

async function getModelResults(rows: RepairResult[], options: {
  brand?: string;
  model?: string;
  category?: string;
} = {}) {
  const supabase = createSupabase(rows);
  createPublicRepairResultsClient.mockReturnValue(supabase.client);
  const response = await GET(new Request(
    `http://localhost/api/public/repair-results/matching?context=model&category=${options.category || 'phone'}&brand=${options.brand || 'apple'}&model=${options.model || 'future-phone'}`,
  ));
  return { body: await response.json(), queries: supabase.queries };
}

describe('public Repair Results matching route', () => {
  it('rejects a different model even when its related URL begins with the requested Model Hub prefix', async () => {
    const wrongModelWithRequestedPrefix = result({
      id: 'wrong-model-prefix',
      model: 'iPhone 16 Pro Max',
      model_slug: 'iphone-16-pro-max',
      related_repair_url: '/repairs/phone/iphone/iphone-16-pro/screen-replacement',
    });
    const { body, queries } = await getModelResults([wrongModelWithRequestedPrefix], {
      brand: 'iphone',
      model: 'iphone-16-pro',
    });

    expect(body).toEqual({ status: 'SUCCESS', data: [] });
    expect(queries.every((query) => query.or.mock.calls.length === 0)).toBe(true);
  });

  it('keeps exact-model repair diversity, ordering, and the maximum of three results', async () => {
    const { body } = await getModelResults([
      result({ id: 'screen-first', model_slug: 'future-phone', repair_type_slug: 'screen-replacement', sort_order: 20 }),
      result({ id: 'screen-duplicate', model_slug: 'future-phone', repair_type_slug: 'screen-replacement', sort_order: 30 }),
      result({ id: 'battery', model_slug: 'future-phone', repair_type_slug: 'battery-replacement', sort_order: 10 }),
      result({ id: 'camera', model_slug: 'future-phone', repair_type_slug: 'back-camera-replacement', sort_order: 15 }),
      result({ id: 'overflow', model_slug: 'future-phone', repair_type_slug: 'charging-port-replacement', sort_order: 40 }),
    ]);

    expect(body.data.map((item: { id: string }) => item.id)).toEqual([
      'battery',
      'camera',
      'screen-first',
    ]);
  });

  it('requires exact model identity and existing public eligibility', async () => {
    const { body } = await getModelResults([
      result({ id: 'exact', model_slug: 'future-phone' }),
      result({ id: 'sibling', model_slug: 'future-phone-pro' }),
      result({ id: 'prefix-sibling', model_slug: 'future-phone-99' }),
      result({ id: 'wrong-brand', brand_slug: 'other-brand', model_slug: 'future-phone' }),
      result({ id: 'wrong-category', device_category: 'tablet', model_slug: 'future-phone' }),
      result({ id: 'draft', model_slug: 'future-phone', status: 'draft' }),
      result({ id: 'privacy-missing', model_slug: 'future-phone', privacy_checked: false }),
      result({ id: 'before-missing', model_slug: 'future-phone', before_image_path: '' }),
      result({ id: 'after-missing', model_slug: 'future-phone', after_image_path: '' }),
    ]);

    expect(body.data.map((item: { id: string }) => item.id)).toEqual(['exact']);
  });

  it('supports arbitrary future exact models while rejecting their sibling models', async () => {
    const { body } = await getModelResults([
      result({ id: 'future-exact', brand_slug: 'future-brand', model_slug: 'future-phone-99' }),
      result({ id: 'future-sibling', brand_slug: 'future-brand', model_slug: 'future-phone-98' }),
    ], { brand: 'future-brand', model: 'future-phone-99' });

    expect(body.data.map((item: { id: string }) => item.id)).toEqual(['future-exact']);
  });

  it('keeps approved brand aliases but never lets an alias bypass exact model equality', async () => {
    const { body } = await getModelResults([
      result({ id: 'apple-exact', brand_slug: 'apple', model_slug: 'iphone-16-pro' }),
      result({
        id: 'apple-sibling-prefix',
        brand_slug: 'apple',
        model_slug: 'iphone-16-pro-max',
        related_repair_url: '/repairs/phone/iphone/iphone-16-pro/screen-replacement',
      }),
    ], { brand: 'iphone', model: 'iphone-16-pro' });

    expect(body.data.map((item: { id: string }) => item.id)).toEqual(['apple-exact']);
  });

  it('leaves exact Detail URL fallback and repair-type hub matching unchanged', async () => {
    const detailFallback = result({
      id: 'detail-url-fallback',
      brand_slug: 'future-brand',
      model_slug: 'different-model',
      repair_type_slug: 'screen-replacement',
      related_repair_url: '/repairs/phone/future-brand/future-phone/screen-replacement',
    });
    const supabase = createSupabase([detailFallback]);
    createPublicRepairResultsClient.mockReturnValue(supabase.client);

    const detailResponse = await GET(new Request(
      'http://localhost/api/public/repair-results/matching?context=detail&category=phone&brand=future-brand&model=future-phone&repair_type=screen-replacement',
    ));
    const hubResponse = await GET(new Request(
      'http://localhost/api/public/repair-results/matching?context=hub&category=phone&repair_type=screen-replacement',
    ));

    expect((await detailResponse.json()).data.map((item: { id: string }) => item.id)).toEqual(['detail-url-fallback']);
    expect((await hubResponse.json()).data.map((item: { id: string }) => item.id)).toEqual(['detail-url-fallback']);
  });

  it('keeps generic hub aliases, source ordering, and the maximum of three through the shared selector', async () => {
    const supabase = createSupabase([
      result({ id: 'screen-alias', repair_type_slug: 'screen-repair', published_at: '2026-09-04T00:00:00.000Z' }),
      result({ id: 'screen-current', published_at: '2026-09-03T00:00:00.000Z' }),
      result({ id: 'screen-third', published_at: '2026-09-02T00:00:00.000Z' }),
      result({ id: 'screen-fourth', published_at: '2026-09-01T00:00:00.000Z' }),
      result({ id: 'unsupported', repair_type_slug: 'housing-replacement' }),
    ]);
    createPublicRepairResultsClient.mockReturnValue(supabase.client);

    const response = await GET(new Request(
      'http://localhost/api/public/repair-results/matching?context=hub&category=phone&repair_type=screen-replacement',
    ));

    expect((await response.json()).data.map((item: { id: string }) => item.id))
      .toEqual(['screen-alias', 'screen-current', 'screen-third']);
    expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=300, stale-while-revalidate=86400');
  });
});
