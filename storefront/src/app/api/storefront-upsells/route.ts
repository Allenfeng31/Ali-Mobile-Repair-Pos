import { NextResponse } from 'next/server';

import { isLocalRepairCatalogueOnly } from '@/lib/localRepairCatalogueFixture';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (isLocalRepairCatalogueOnly()) return NextResponse.json([]);

    const { data, error } = await supabase
      .from('storefront_upsells')
      .select('id, name, description, regular_price, bundle_price')
      .eq('is_active', true);
    if (error) return NextResponse.json({ error: 'Unable to load storefront upsells.' }, { status: 500 });

    return NextResponse.json(data ?? []);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Unable to load storefront upsells.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
