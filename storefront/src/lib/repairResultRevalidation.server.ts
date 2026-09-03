import 'server-only';

import { revalidatePath } from 'next/cache';

/**
 * Revalidation is intentionally best-effort: the successful database mutation
 * remains authoritative and the route ISR interval remains the fallback.
 */
export function revalidateRepairResultPaths(paths: readonly string[]): void {
  let failedPathCount = 0;

  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch {
      failedPathCount += 1;
    }
  }

  if (failedPathCount > 0) {
    console.error('[repair-results] Page revalidation failed after successful mutation.', {
      affectedPathCount: paths.length,
      failedPathCount,
    });
  }
}
