import { NextResponse } from 'next/server';

import { fetchRepairCatalog } from '@/lib/api';
import { resolvePublicBookingSelection } from '@/lib/publicBookingSelection';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const selection = resolvePublicBookingSelection(await fetchRepairCatalog(), {
    category: params.get('category'),
    brandSlug: params.get('brandSlug'),
    modelSlug: params.get('modelSlug'),
    serviceSlug: params.get('serviceSlug'),
    brand: params.get('brand'),
    model: params.get('model'),
    service: params.get('service'),
  });

  if (!selection) return NextResponse.json({ error: 'Invalid booking selection.' }, { status: 400 });
  return NextResponse.json({ selection });
}
