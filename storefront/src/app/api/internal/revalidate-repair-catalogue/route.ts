import { revalidatePath, revalidateTag } from 'next/cache';

import { PUBLIC_REPAIR_CATALOGUE_SOURCE_TAG, refreshPublicRepairCatalogue, fetchRepairCatalog } from '@/lib/api';
import type { RepairCatalog } from '@/lib/api';
import {
  isAuthorizedRepairCatalogueRevalidation,
  isIgnoredCatalogueMutation,
  normalizeCatalogueMutations,
  repairCataloguePathsForMutations,
  extractCatalogueTopology,
} from '@/lib/repairCatalogueRevalidation';

const MAX_BODY_BYTES = 16_384;

function logRevalidation(event: string, details: Record<string, string | number | boolean>) {
  console.info('[repair-catalogue-revalidation]', { event, ...details });
}

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
  logRevalidation('received', {
    mutationCount: mutations.length,
    operation: [...new Set(mutations.map((mutation) => mutation.operation))].join(','),
  });
  if (isIgnoredCatalogueMutation(mutations)) {
    logRevalidation('ignored', { reason: 'stock-only', mutationCount: mutations.length, status: 200 });
    return Response.json({ ignored: true });
  }

  let beforeCatalogue: RepairCatalog | null = null;
  try {
    beforeCatalogue = await fetchRepairCatalog();
  } catch {
    beforeCatalogue = null;
  }

  // The source cache is made stale first. The refresh writes a validated durable snapshot
  // before any public route is invalidated, preserving last-known-good on failure.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  revalidateTag(PUBLIC_REPAIR_CATALOGUE_SOURCE_TAG, { expire: 0 } as any);
  let catalogue: RepairCatalog;
  try {
    catalogue = await refreshPublicRepairCatalogue();
    if (catalogue.catalogueSource !== 'live-pos') {
      logRevalidation('live-refresh-failed', { reason: 'not-live-pos', status: 503 });
      return Response.json({ error: 'Catalogue refresh failed.' }, { status: 503 });
    }
    logRevalidation('live-refresh-succeeded', { modelCount: catalogue.publicModelCount, status: 200 });
  } catch {
    logRevalidation('live-refresh-failed', { reason: 'refresh-error', status: 503 });
    return Response.json({ error: 'Catalogue refresh failed.' }, { status: 503 });
  }

  let effectiveTopologyChanged = false;
  const deletedPaths = new Set<string>();

  if (beforeCatalogue) {
    const beforeTopology = extractCatalogueTopology(beforeCatalogue);
    const afterTopology = extractCatalogueTopology(catalogue);

    const topologyIsIdentical = beforeTopology.size === afterTopology.size && [...beforeTopology].every((x) => afterTopology.has(x));

    for (const path of beforeTopology) {
      if (!afterTopology.has(path)) {
        deletedPaths.add(path);
      }
    }

    const payloadTopologyChanged = mutations.some(m => m.topologyChanged);
    effectiveTopologyChanged = payloadTopologyChanged || !topologyIsIdentical;
  } else {
    effectiveTopologyChanged = true;
  }

  const updatedMutations = mutations.map(m => ({
    ...m,
    topologyChanged: m.topologyChanged || effectiveTopologyChanged,
  }));

  const paths = new Set(repairCataloguePathsForMutations(updatedMutations));

  for (const deleted of deletedPaths) {
    paths.add(`/repairs/${deleted}`);
    const segments = deleted.split('/');
    if (segments.length > 1) {
      segments.pop();
      paths.add(`/repairs/${segments.join('/')}`);
    }
  }

  const pathsArray = [...paths];
  for (const path of pathsArray) revalidatePath(path);
  logRevalidation('paths-invalidated', { pathCount: pathsArray.length, status: 200 });
  return Response.json({ revalidated: true, invalidatedPathCount: pathsArray.length });
}
