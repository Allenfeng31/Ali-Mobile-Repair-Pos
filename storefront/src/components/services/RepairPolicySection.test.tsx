/**
 * @vitest-environment jsdom
 */
import { render, screen, within } from '@testing-library/react';
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
  it('keeps the authoritative standard repair summary exact', () => {
    expect(STANDARD_WARRANTY_SUMMARY).toBe(
      'Completed standard repairs include a 6-month warranty covering the replacement part and labour.'
    );
  });

  it('shows compact standard summaries with full policy content in closed disclosures', () => {
    expect(getRepairPolicyVariant('screen-replacement')).toBe('standard');
    expect(getRepairPolicyVariant('battery-replacement')).toBe('standard');
    expect(getRepairPolicyVariant('logic-board-repair')).toBe('standard');

    render(<RepairPolicySection variant="standard" />);

    expect(screen.getByRole('heading', { level: 2, name: 'Warranty and repair policy' })).toBeInTheDocument();
    expect(screen.getByText('6-month warranty')).toBeInTheDocument();
    expect(screen.getByText('Parts and labour included.')).toBeInTheDocument();
    expect(screen.getByText('No Fix, No Charge')).toBeInTheDocument();
    expect(screen.getByText('Clear approval')).toBeInTheDocument();

    const disclosures = screen.getAllByRole('group');
    expect(disclosures).toHaveLength(3);
    disclosures.forEach((disclosure) => expect(disclosure).not.toHaveAttribute('open'));
    expect(within(disclosures[0]).getByText('Warranty coverage and exclusions')).toBeInTheDocument();
    expect(within(disclosures[1]).getByText('No Fix, No Charge details')).toBeInTheDocument();
    expect(within(disclosures[2]).getByText('Inspection, repair or replacement')).toBeInTheDocument();
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

    expect(screen.getByText('No warranty for water damage service')).toBeInTheDocument();
    expect(screen.getByText(WATER_DAMAGE_WARRANTY_SUMMARY)).toBeInTheDocument();
    expect(screen.queryByText(STANDARD_WARRANTY_SUMMARY)).not.toBeInTheDocument();
    expect(screen.queryByText('6-month warranty')).not.toBeInTheDocument();
    const disclosures = screen.getAllByRole('group');
    expect(disclosures).toHaveLength(3);
    disclosures.forEach((disclosure) => expect(disclosure).not.toHaveAttribute('open'));
  });
});
