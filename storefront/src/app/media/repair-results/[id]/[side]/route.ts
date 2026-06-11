import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/utils/supabase/service-role';
import { REPAIR_RESULT_BUCKET, isPublicRepairResult } from '@/lib/repair-results';

export const dynamic = 'force-dynamic';

interface MediaRouteContext {
  params: Promise<{
    id: string;
    side: string;
  }>;
}

export async function GET(_request: Request, context: MediaRouteContext) {
  const { id, side } = await context.params;

  if (side !== 'before' && side !== 'after') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('repair_results')
      .select('id,status,privacy_checked,before_image_path,after_image_path')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!data || !isPublicRepairResult(data)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const path = side === 'before' ? data.before_image_path : data.after_image_path;
    if (!path.startsWith('approved/')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { data: file, error: downloadError } = await supabase.storage
      .from(REPAIR_RESULT_BUCKET)
      .download(path);

    if (downloadError || !file) {
      throw downloadError || new Error('Unable to read repair result image.');
    }

    return new NextResponse(file, {
      headers: {
        'Content-Type': file.type || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Robots-Tag': 'index, follow',
      },
    });
  } catch (error) {
    console.error('[repair-results-media] Failed to serve image:', error);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
