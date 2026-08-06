import { describe, expect, it } from 'vitest';
import { ROOT_SOCIAL_DESCRIPTION } from './siteMetadata';

describe('root social metadata', () => {
  it('describes eligible standard repair warranty support without legacy claims', () => {
    expect(ROOT_SOCIAL_DESCRIPTION).toContain('eligible standard repairs');
    expect(ROOT_SOCIAL_DESCRIPTION).not.toContain('with a 6-month warranty');
    expect(ROOT_SOCIAL_DESCRIPTION).not.toContain('180-Day');
    expect(ROOT_SOCIAL_DESCRIPTION).not.toContain('Comprehensive Warranty');
  });

  it('keeps Ringwood Square and the repair business identity', () => {
    expect(ROOT_SOCIAL_DESCRIPTION).toContain('Ringwood Square');
    expect(ROOT_SOCIAL_DESCRIPTION).toMatch(/mobile phone and electronics repair/i);
  });
});
