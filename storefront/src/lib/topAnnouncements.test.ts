import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getTopAnnouncements,
  TOP_ANNOUNCEMENT_REVALIDATE_SECONDS,
  TOP_ANNOUNCEMENT_TAG,
} from './topAnnouncements';

afterEach(() => vi.unstubAllEnvs());

describe('top announcement cache boundary', () => {
  it('uses a long-lived independent tagged data cache instead of a five-minute layout fetch', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify([{ id: 'a1', message: 'Saved' }])));

    await expect(getTopAnnouncements(fetchImpl)).resolves.toEqual([{ id: 'a1', message: 'Saved' }]);
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(fetchImpl.mock.calls[0][1]).toMatchObject({
      next: { revalidate: TOP_ANNOUNCEMENT_REVALIDATE_SECONDS, tags: [TOP_ANNOUNCEMENT_TAG] },
    });
    expect(TOP_ANNOUNCEMENT_REVALIDATE_SECONDS).toBe(60 * 60 * 24 * 30);
  });

  it('keeps the root layout server-rendered and limits polling-free fetching to the announcement island', () => {
    const rootLayout = readFileSync(resolve(process.cwd(), 'src/app/layout.tsx'), 'utf8');
    const announcementShell = readFileSync(resolve(process.cwd(), 'src/components/TopAnnouncementBar.tsx'), 'utf8');
    const announcementClient = readFileSync(resolve(process.cwd(), 'src/components/TopAnnouncementBarClient.tsx'), 'utf8');
    const readRoute = readFileSync(resolve(process.cwd(), 'src/app/api/announcements/route.ts'), 'utf8');

    expect(rootLayout).not.toContain("'use client'");
    expect(rootLayout).toContain('<TopAnnouncementBar />');
    expect(announcementShell).not.toContain('revalidate: 300');
    expect(announcementShell).not.toContain('fetch(');
    expect(announcementClient).toContain("fetch('/api/announcements'");
    expect(announcementClient).not.toContain('setInterval');
    expect(announcementClient).not.toContain('ANNOUNCEMENT_REVALIDATION_SECRET');
    expect(readRoute).toContain("'Cache-Control': 'no-store, max-age=0'");
  });
});
