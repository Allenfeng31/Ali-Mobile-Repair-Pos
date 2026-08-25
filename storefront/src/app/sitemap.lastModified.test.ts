import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { fetchRepairCatalogMock, getSortedPostsDataMock } = vi.hoisted(() => ({
  fetchRepairCatalogMock: vi.fn(),
  getSortedPostsDataMock: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ fetchRepairCatalog: fetchRepairCatalogMock }));
vi.mock('@/lib/blog', () => ({ getSortedPostsData: getSortedPostsDataMock }));

import sitemap from './sitemap';

const catalogue = {
  brands: [{
    category: 'phone',
    slug: 'iphone',
    models: [{
      slug: 'iphone-13',
      repairTypes: [{ slug: 'screen-replacement' }],
    }],
  }],
};

const pathname = (entry: { url: string }) => new URL(entry.url).pathname;

describe('sitemap lastModified policy', () => {
  beforeEach(() => {
    fetchRepairCatalogMock.mockResolvedValue(catalogue);
    getSortedPostsDataMock.mockResolvedValue([
      { slug: 'edited-post', date: '2026-01-01T00:00:00.000Z', updated_at: '2026-02-03T04:05:06.000Z' },
      { slug: 'published-only-post', date: '2026-01-02T00:00:00.000Z' },
      { slug: 'missing-date-post', date: '' },
    ]);
  });

  it('omits invented dates while preserving URLs across system times', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
      const first = await sitemap();
      vi.setSystemTime(new Date('2030-12-31T23:59:59.000Z'));
      const second = await sitemap();

      expect(first.map((entry) => entry.url)).toEqual(second.map((entry) => entry.url));
      expect(first).toHaveLength(second.length);

      for (const path of [
        '/',
        '/repairs',
        '/repairs/screen-replacement',
        '/repairs/phone',
        '/repairs/phone/iphone',
        '/repairs/phone/iphone/iphone-13',
        '/repairs/phone/iphone/iphone-13/screen-replacement',
        '/locations/ringwood',
        '/book-repair',
      ]) {
        expect(first.find((entry) => pathname(entry) === path)).not.toHaveProperty('lastModified');
      }

      const waterDamageEntry = first.find((entry) => pathname(entry).includes('water-damage'));
      expect(waterDamageEntry).toBeDefined();
      expect(waterDamageEntry).not.toHaveProperty('lastModified');
    } finally {
      vi.useRealTimers();
    }
  });

  it('uses only a valid blog updated_at timestamp and never falls back to the current time', async () => {
    const urls = await sitemap();

    expect(urls.find((entry) => pathname(entry) === '/blog/edited-post')).toMatchObject({
      lastModified: new Date('2026-02-03T04:05:06.000Z'),
    });
    expect(urls.find((entry) => pathname(entry) === '/blog/published-only-post')).not.toHaveProperty('lastModified');
    expect(urls.find((entry) => pathname(entry) === '/blog/missing-date-post')).not.toHaveProperty('lastModified');
  });

  it('does not use a current-time lastModified fallback in the production implementation', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/app/sitemap.ts'), 'utf8');

    expect(source).not.toMatch(/new Date\(\s*\)/);
    expect(source).not.toContain('Date.now');
  });
});
