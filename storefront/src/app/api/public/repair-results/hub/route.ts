import { NextResponse } from 'next/server';
import {
  createPublicRepairResultsClient,
  PUBLIC_REPAIR_RESULT_SELECT,
  type PublicRepairResult,
} from '@/lib/repair-results';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function normalizeRepairGroup(slug: string): 'screen' | 'battery' | 'charging-port' | 'back-glass-or-housing' | null {
  if (slug === 'screen-replacement' || slug === 'screen-repair' || slug === 'screen') {
    return 'screen';
  }
  if (slug === 'battery-replacement' || slug === 'battery-service' || slug === 'battery-repair' || slug === 'battery') {
    return 'battery';
  }
  if (slug === 'charging-port-replacement' || slug === 'charging-port-repair' || slug === 'charging-port') {
    return 'charging-port';
  }
  if (slug === 'back-glass-replacement' || slug === 'back-housing-replacement' || slug === 'back-glass' || slug === 'back-housing') {
    return 'back-glass-or-housing';
  }
  return null;
}

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
      query = query.eq('brand_slug', brand).eq('featured_on_brand_hub', true);
    } else {
      query = query.eq('featured_on_repair_hub', true);
    }

    query = query
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(50); // Fetch enough to cover duplicates across groups

    const { data, error } = await query;

    if (error) {
      console.error('[repair-results-hub] Failed to fetch repair results:', error);
      return NextResponse.json({ error: 'Database query failed.' }, { status: 500 });
    }

    const groups: Partial<Record<'screen' | 'battery' | 'charging-port' | 'back-glass-or-housing', PublicRepairResult>> = {};

    for (const result of (data || []) as unknown as PublicRepairResult[]) {
      const group = normalizeRepairGroup(result.repair_type_slug);
      if (group && !groups[group]) {
        groups[group] = result;
        if (Object.keys(groups).length === 4) {
          break; // Optimization: stop processing once all groups are found
        }
      }
    }

    const groupOrder = ['screen', 'battery', 'charging-port', 'back-glass-or-housing'] as const;
    const finalData = groupOrder.map(group => groups[group]).filter(Boolean);

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
