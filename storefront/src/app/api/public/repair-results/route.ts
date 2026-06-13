import { NextResponse } from 'next/server';
import {
  REPAIR_RESULT_CATEGORIES,
  fetchFeaturedRepairResultsByCategory,
  type RepairResultDeviceCategory,
  type RepairResultHomepageItem,
} from '@/lib/repair-results';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type RepairResultsApiResponse = {
  status: 'SUCCESS';
  data: Partial<Record<RepairResultDeviceCategory, RepairResultHomepageItem>>;
  latestPublishedAt?: string | null;
};

function pickHomepageFields(result: NonNullable<Awaited<ReturnType<typeof fetchFeaturedRepairResultsByCategory>>[RepairResultDeviceCategory]>) {
  return {
    id: result.id,
    device_category: result.device_category,
    model: result.model,
    repair_type: result.repair_type,
    image_pair_alt_text: result.image_pair_alt_text,
    title: result.title,
    short_description: result.short_description,
    related_repair_url: result.related_repair_url,
  } satisfies RepairResultHomepageItem;
}

export async function GET() {
  try {
    const resultsByCategory = await fetchFeaturedRepairResultsByCategory();
    const data: Partial<Record<RepairResultDeviceCategory, RepairResultHomepageItem>> = {};
    let latestPublishedAt: string | null = null;

    for (const category of REPAIR_RESULT_CATEGORIES) {
      const result = resultsByCategory[category.value];
      if (result) {
        data[category.value] = pickHomepageFields(result);
        
        const timestamp = result.published_at || result.created_at;
        if (timestamp) {
          if (!latestPublishedAt || new Date(timestamp) > new Date(latestPublishedAt)) {
            latestPublishedAt = timestamp;
          }
        }
      }
    }

    const payload: RepairResultsApiResponse = {
      status: 'SUCCESS',
      data,
      latestPublishedAt,
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[repair-results-public] Failed to load homepage data:', error);
    return NextResponse.json(
      { status: 'SUCCESS', data: {}, latestPublishedAt: null },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  }
}
