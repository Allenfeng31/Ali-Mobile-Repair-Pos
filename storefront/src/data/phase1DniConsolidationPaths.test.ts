import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  PHASE1_DNI_CONSOLIDATION_PATHS,
  PHASE1_DNI_CONSOLIDATION_SHA256,
  getPhase1DniConsolidationDestination,
} from './phase1DniConsolidationPaths';

describe('Phase 1 DNI consolidation cohort', () => {
  it('preserves the exact, sorted, checksum-locked 329-path cohort', () => {
    expect(PHASE1_DNI_CONSOLIDATION_PATHS).toHaveLength(329);
    expect(new Set(PHASE1_DNI_CONSOLIDATION_PATHS)).toHaveLength(329);
    expect([...PHASE1_DNI_CONSOLIDATION_PATHS]).toEqual([...PHASE1_DNI_CONSOLIDATION_PATHS].sort());

    const water = PHASE1_DNI_CONSOLIDATION_PATHS.filter((path) => path.endsWith('/water-damage-repair'));
    const logicBoard = PHASE1_DNI_CONSOLIDATION_PATHS.filter((path) => path.endsWith('/logic-board-repair'));
    expect(water).toHaveLength(204);
    expect(logicBoard).toHaveLength(125);
    expect(PHASE1_DNI_CONSOLIDATION_SHA256)
      .toBe('1e741364921d0f9ba410552ed6134cb3d43f20a570fbc7676e3b2431121b7173');
    expect(createHash('sha256').update(`${PHASE1_DNI_CONSOLIDATION_PATHS.join('\n')}\n`).digest('hex'))
      .toBe('1e741364921d0f9ba410552ed6134cb3d43f20a570fbc7676e3b2431121b7173');
  });

  it('redirects only approved Water Damage and Logic Board source paths', () => {
    expect(getPhase1DniConsolidationDestination('/repairs/phone/asus/rog-phone-5/water-damage-repair'))
      .toBe('/repairs/water-damage');
    expect(getPhase1DniConsolidationDestination('/repairs/phone/asus/rog-phone-5/logic-board-repair'))
      .toBe('/repairs/phone/logic-board-repair');
    expect(getPhase1DniConsolidationDestination('/repairs/water-damage')).toBeUndefined();
    expect(getPhase1DniConsolidationDestination('/repairs/phone/logic-board-repair')).toBeUndefined();
    expect(getPhase1DniConsolidationDestination('/repairs/laptop/macbook/macbook-air-11-2014-2015/water-damage-repair'))
      .toBeUndefined();
    expect(getPhase1DniConsolidationDestination('/repairs/phone/samsung/galaxy-z-flip/logic-board-repair'))
      .toBeUndefined();
  });

  it.each([
    '/repairs/phone/iphone/iphone-6/logic-board-repair',
    '/repairs/phone/iphone/iphone-se/logic-board-repair',
    '/repairs/tablet/ipad/ipad-mini-6th-generation/logic-board-repair',
    '/repairs/tablet/ipad/ipad-pro-13-inch-m4/logic-board-repair',
    '/repairs/laptop/macbook/macbook-air-m3-15-2024/logic-board-repair',
    '/repairs/laptop/macbook/macbook-pro-13-m2-2022/logic-board-repair',
  ])('keeps held path %s outside the frozen cohort', (path) => {
    expect(getPhase1DniConsolidationDestination(path)).toBeUndefined();
  });
});
