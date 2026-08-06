import { describe, expect, it } from 'vitest';
import {
  POS_REPAIR_WARRANTY_TEXT,
  STANDARD_REPAIR_WARRANTY_EXCLUSIONS,
  STANDARD_REPAIR_WARRANTY_SUMMARY,
} from './repairWarranty';

describe('POS repair warranty copy', () => {
  it('describes the six-month standard repair warranty for the replacement part and labour', () => {
    expect(STANDARD_REPAIR_WARRANTY_SUMMARY).toContain('6-month warranty');
    expect(STANDARD_REPAIR_WARRANTY_SUMMARY).toContain('replacement part and labour');
  });

  it('states the warranty exclusions', () => {
    expect(STANDARD_REPAIR_WARRANTY_EXCLUSIONS).toContain('new or repeated liquid exposure');
    expect(STANDARD_REPAIR_WARRANTY_EXCLUSIONS).toContain('third-party repair or modification');
    expect(STANDARD_REPAIR_WARRANTY_EXCLUSIONS).toContain('unrelated faults');
  });

  it('avoids legacy and unconditional warranty promises', () => {
    expect(POS_REPAIR_WARRANTY_TEXT).not.toContain('180 DAYS ON MOBILE REPAIRS ONLY');
    expect(POS_REPAIR_WARRANTY_TEXT).not.toContain('Comprehensive Warranty');
    expect(POS_REPAIR_WARRANTY_TEXT).not.toMatch(/whole device|data|all repairs/i);
  });
});
