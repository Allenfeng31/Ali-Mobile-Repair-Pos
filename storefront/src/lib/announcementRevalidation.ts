import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';

import { TOP_ANNOUNCEMENT_TAG } from './topAnnouncements';

export function isAuthorizedAnnouncementRevalidation(providedSecret: string | null, expectedSecret: string | undefined) {
  if (!providedSecret || !expectedSecret) return false;

  const provided = Buffer.from(providedSecret);
  const expected = Buffer.from(expectedSecret);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export function revalidateTopAnnouncement() {
  revalidateTag(TOP_ANNOUNCEMENT_TAG, { expire: 0 });
}
