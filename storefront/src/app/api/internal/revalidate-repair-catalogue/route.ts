import { revalidatePath, revalidateTag } from 'next/cache';

import { PUBLIC_REPAIR_CATALOGUE_SOURCE_TAG, refreshPublicRepairCatalogue } from '@/lib/api';
import {
  isAuthorizedRepairCatalogueRevalidation,
  isIgnoredCatalogueMutation,
  normalizeCatalogueMutations,
  repairCataloguePathsForMutations,
} from '@/lib/repairCatalogueRevalidation';

const MAX_BODY_BYTES = 16_384;

export async function POST(request: Request) {
  if (!isAuthorizedRepairCatalogueRevalidation(
    request.headers.get('x-catalogue-revalidation-secret'),
    process.env.CATALOGUE_REVALIDATION_SECRET,
  )) {
    return new Response(null, { status: 401 });
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) return Response.json({ error: 'Invalid mutation payload.' }, { status: 413 });

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return Response.json({ error: 'Invalid mutation payload.' }, { status: 400 });
  }
  if (rawBody.length > MAX_BODY_BYTES) return Response.json({ error: 'Invalid mutation payload.' }, { status: 413 });

  let mutations;
  try {
    mutations = normalizeCatalogueMutations(JSON.parse(rawBody));
  } catch {
    mutations = null;
  }
  if (!mutations) return Response.json({ error: 'Invalid mutation payload.' }, { status: 400 });
  if (isIgnoredCatalogueMutation(mutations)) return Response.json({ ignored: true });

  // The source cache is made stale first. The refresh writes a validated durable snapshot
  // before any public route is invalidated, preserving last-known-good on failure.
  revalidateTag(PUBLIC_REPAIR_CATALOGUE_SOURCE_TAG, { expire: 0 });
  try {
    const catalogue = await refreshPublicRepairCatalogue();
    if (catalogue.catalogueSource !== 'live-pos') {
      return Response.json({ error: 'Catalogue refresh failed.' }, { status: 503 });
    }
  } catch {
    return Response.json({ error: 'Catalogue refresh failed.' }, { status: 503 });
  }

  const paths = repairCataloguePathsForMutations(mutations);
  for (const path of paths) revalidatePath(path);
  return Response.json({ revalidated: true, invalidatedPathCount: paths.length });
}
