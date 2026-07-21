/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import RepairPolicySection from './RepairPolicySection';
import {
  INSPECTION_FEE_SUMMARY,
  NO_FIX_NO_CHARGE_SUMMARY,
  PREVIOUS_LIQUID_DAMAGE_LIMITATION,
  REPAIR_PATH_SUMMARY,
  STANDARD_WARRANTY_SUMMARY,
  WARRANTY_EXCLUSIONS,
  WATER_DAMAGE_WARRANTY_SUMMARY,
  getRepairPolicyVariant,
  getWaterDamageServiceDescription,
} from '@/lib/repairPolicy';

describe('RepairPolicySection', () => {
  it('shows the standard policy for iPhone screen, battery and MacBook repair routes', () => {
    expect(getRepairPolicyVariant('screen-replacement')).toBe('standard');
    expect(getRepairPolicyVariant('battery-replacement')).toBe('standard');
    expect(getRepairPolicyVariant('logic-board-repair')).toBe('standard');

    render(<RepairPolicySection variant="standard" />);

    expect(screen.getByRole('heading', { level: 2, name: 'Warranty and repair policy' })).toBeInTheDocument();
    expect(screen.getByText(STANDARD_WARRANTY_SUMMARY)).toBeInTheDocument();
    expect(screen.getByText(PREVIOUS_LIQUID_DAMAGE_LIMITATION)).toBeInTheDocument();
    expect(screen.getByText(NO_FIX_NO_CHARGE_SUMMARY)).toBeInTheDocument();
    expect(screen.getByText(INSPECTION_FEE_SUMMARY)).toBeInTheDocument();
    expect(screen.getByText(REPAIR_PATH_SUMMARY)).toBeInTheDocument();
    WARRANTY_EXCLUSIONS.forEach((exclusion) => expect(screen.getByText(exclusion)).toBeInTheDocument());
  });

  it.each(['water-damage-repair', 'water-damage'])('shows no-warranty policy for the accepted %s alias', (repairSlug) => {
    expect(getRepairPolicyVariant(repairSlug)).toBe('water-damage');
    expect(getWaterDamageServiceDescription('iPhone 15 Water Damage Repair in Ringwood')).toBe(
      `iPhone 15 Water Damage Repair in Ringwood. ${WATER_DAMAGE_WARRANTY_SUMMARY}`
    );

    render(<RepairPolicySection variant={getRepairPolicyVariant(repairSlug)} />);

    expect(screen.getByText(WATER_DAMAGE_WARRANTY_SUMMARY)).toBeInTheDocument();
    expect(screen.queryByText(STANDARD_WARRANTY_SUMMARY)).not.toBeInTheDocument();
  });
});
