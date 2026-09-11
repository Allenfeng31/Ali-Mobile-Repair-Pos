import { describe, expect, it } from 'vitest';
import { getMacBookCategoryHubLinks } from './index';

describe('getMacBookCategoryHubLinks', () => {
  it('uses the canonical Apple Watch hub while preserving the other category destinations', () => {
    const hrefs = getMacBookCategoryHubLinks().map((link) => link.href);

    expect(hrefs).toContain('/repairs/watch/apple');
    expect(hrefs).not.toContain('/repairs/watch/apple-watch');
    expect(hrefs.filter((href) => href !== '/repairs/watch/apple')).toEqual([
      '/repairs/laptop/macbook',
      '/repairs/laptop',
      '/repairs/phone/iphone',
      '/repairs/tablet/ipad',
      '/repairs/phone/samsung',
    ]);
  });
});
