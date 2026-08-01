import { describe, it, expect } from 'vitest';
import { items } from '../../../server/seed_moto_g24.js';
import { formatScopedRepairPriceLabel } from '../lib/scopedRepairPriceLabel';
import { getOtherRepairPriceLabel } from '../lib/otherRepairBooking';

interface SeedItem {
  name: string;
  category: string;
  model: string;
  device_model: string;
  price: number;
}

describe('Motorola Moto G24 POS Seed Validation', () => {
  it('validates Moto G24 targeted seed script and price formatting', () => {
    const seedItems = items as SeedItem[];
    // Model should generate exactly 7 categories
    expect(seedItems).toHaveLength(7);

    // Verify all items share the exact same model and code
    for (const item of seedItems) {
      expect(item.model).toBe('P Motorola||Moto G24');
      expect(item.device_model).toBe('XT2423-2');
      expect(item.name).toContain('Moto G24');
      expect(item.name).not.toContain('Motorola Motorola Moto G24');
    }

    const screenItem = seedItems.find(i => i.category === 'Screen Replacement')!;
    const batteryItem = seedItems.find(i => i.category === 'Battery Replacement')!;
    const boardItem = seedItems.find(i => i.category === 'Logic Board Repair')!;

    expect(screenItem.price).toBe(139);
    expect(batteryItem.price).toBe(75);
    expect(boardItem.price).toBe(0);

    // Test real transform/label helper
    const quoteLabel = getOtherRepairPriceLabel();

    const screenUnscoped = screenItem.price === 0 ? quoteLabel : `$${screenItem.price}`;
    const batteryUnscoped = batteryItem.price === 0 ? quoteLabel : `$${batteryItem.price}`;
    const boardUnscoped = boardItem.price === 0 ? quoteLabel : `$${boardItem.price}`;

    const screenLabel = formatScopedRepairPriceLabel('screen-replacement', screenItem.price, screenUnscoped, 'real');
    const batteryLabel = formatScopedRepairPriceLabel('battery-replacement', batteryItem.price, batteryUnscoped, 'real');
    const boardLabel = formatScopedRepairPriceLabel('logic-board-repair', boardItem.price, boardUnscoped, 'real');

    expect(screenLabel).toBe('$139');
    expect(batteryLabel).toBe('$75');

    // Ensure Quote for Price is returned for price === 0
    expect(boardLabel).toBe(quoteLabel);
    expect(boardLabel).not.toBe('$0');
    expect(boardLabel).not.toBe('Free');
    expect(boardLabel).toContain('Quote');
  });
});
