import { NextResponse } from 'next/server';
import {
  createPublicRepairResultsClient,
  PUBLIC_REPAIR_RESULT_SELECT,
  MAX_HUB_REPAIR_RESULT_QUERY_ROWS,
  selectHubRepairResults,
  type PublicRepairResult,
} from '@/lib/repair-results';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');

    if (!category || !['phone', 'tablet', 'laptop', 'watch'].includes(category)) {
      return NextResponse.json({ error: 'Invalid or missing category.' }, { status: 400 });
    }

    const supabase = createPublicRepairResultsClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database client initialization failed.' }, { status: 500 });
    }

    let query = supabase
      .from('repair_results')
      .select(PUBLIC_REPAIR_RESULT_SELECT)
      .eq('status', 'published')
      .eq('privacy_checked', true)
      .neq('before_image_path', '')
      .neq('after_image_path', '')
      .eq('device_category', category);

    if (brand) {
      const aliases = brand === 'iphone' || brand === 'ipad' ? [brand, 'apple'] : [brand];
      query = query.in('brand_slug', aliases).eq('featured_on_brand_hub', true);
    } else {
      query = query.eq('featured_on_repair_hub', true);
    }

    query = query
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(MAX_HUB_REPAIR_RESULT_QUERY_ROWS);

    const { data, error } = await query;

    if (error) {
      console.error('[repair-results-hub] Failed to fetch repair results:', error);
      return NextResponse.json({ error: 'Database query failed.' }, { status: 500 });
    }

    const finalData = selectHubRepairResults((data || []) as unknown as PublicRepairResult[]);

    return NextResponse.json(
      { status: 'SUCCESS', data: finalData },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('[repair-results-hub] Internal error:', error);
    return NextResponse.json(
      { status: 'SUCCESS', data: [] },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  }
}
