import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { getRepairTierDescription } from './repairTierDescriptions';

const pricingCardSource = fs.readFileSync(
  path.resolve(__dirname, '../components/services/RepairPricingAndCTA.tsx'),
  'utf8',
);
const repairFaqSource = fs.readFileSync(
  path.resolve(__dirname, '../app/(public)/repairs/[category]/[brand]/[model]/[repair-type]/repairFaqs.ts'),
  'utf8',
);
const repairDetailPageSource = fs.readFileSync(
  path.resolve(__dirname, '../app/(public)/repairs/[category]/[brand]/[model]/[repair-type]/page.tsx'),
  'utf8',
);

describe('repair tier description authority', () => {
  it('provides the existing screen description through the shared authority', () => {
    expect(getRepairTierDescription('Screen Replacement', 'Standard')).toBe(
      'Industry-standard replacement part with reliable performance.',
    );
  });

  it('keeps the pricing card on the shared description authority without a duplicate override table', () => {
    expect(pricingCardSource).toContain("import { getRepairTierDescription } from '@/lib/repairTierDescriptions';");
    expect(pricingCardSource).not.toContain('const TIER_DESCRIPTION_OVERRIDES');
  });

  it('keeps the resolved-tier FAQ formatter free of fixed current dollar amounts', () => {
    const formatterSource = repairFaqSource.slice(
      repairFaqSource.indexOf('export function withResolvedTierPriceFaq'),
      repairFaqSource.indexOf('export function getLSIForRepair'),
    );

    expect(formatterSource).not.toMatch(/\$\d+/);
  });

  it('keeps the resolved-tier FAQ opt-in limited to the iPhone 16 Pro screen pilot', () => {
    expect(repairDetailPageSource.match(/useResolvedTierPriceFaq:\s*true/g)).toHaveLength(1);
    expect(repairDetailPageSource).toContain('"phone/iphone/iphone-16-pro/screen-replacement": {\n    useResolvedTierPriceFaq: true');
  });
});
