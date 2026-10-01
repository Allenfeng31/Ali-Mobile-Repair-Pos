import { describe, expect, it } from 'vitest';
import { resolveFutureRepairResultDestination } from './futureRepairResultDestination';

describe('future shared Repair Result destination helper', () => {
  it('keeps the actual selected model in a resolved brand-shared destination', () => {
    expect(resolveFutureRepairResultDestination({
      category: 'phone', brandSlug: 'samsung', modelSlug: 'galaxy-s23', repairSlug: 'power-button-replacement',
    })).toMatchObject({ href: '/repairs/phone/samsung/power-button-replacement?model=galaxy-s23' });
  });
});
