import { describe, expect, it } from 'vitest';
import { formatScopedRepairPriceLabel } from './scopedRepairPriceLabel';

describe('formatScopedRepairPriceLabel', () => {
  const quote = 'Quote on Request';

  it.each([
    ['camera-lens-replacement', 50, 'Starting from $50'],
    ['loudspeaker-replacement', 50, 'Starting from $50'],
    ['earpiece-speaker-replacement', 0, 'Starting from'],
    ['power-button-replacement', undefined, 'Starting from'],
    ['volume-button-replacement', 50, 'Starting from $50'],
  ])('formats %s at %s as %s', (slug, price, expected) => {
    expect(formatScopedRepairPriceLabel(slug, price, quote)).toBe(expected);
  });

  it.each([
    ['logic-board-repair', 0, quote],
    ['water-damage-repair', 0, quote],
    ['screen-replacement', 170, 'From $170'],
  ])('preserves the unscoped %s label', (slug, price, expected) => {
    expect(formatScopedRepairPriceLabel(slug, price, expected)).toBe(expected);
  });

  it.each([
    ['camera-lens-replacement', 50, quote, 'real'], // Real POS product (iPhone camera lens) should preserve the quote label
    ['camera-lens-replacement', 0, quote, 'real'],
    ['camera-lens-replacement', 50, 'Starting from $50', 'virtual'], // Virtual Android should return starting from
    ['camera-lens-replacement', 0, 'Starting from', 'virtual'],
  ])('handles sourceType for %s with price %s appropriately', (slug, price, expected, sourceType) => {
    expect(formatScopedRepairPriceLabel(slug, price, quote, sourceType as 'real' | 'virtual')).toBe(expected);
  });
});
