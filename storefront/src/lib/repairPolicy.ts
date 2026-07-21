export const STANDARD_WARRANTY_SUMMARY =
  'Completed standard repairs include a 6-month warranty covering the replacement part and labour.';

export const PREVIOUS_LIQUID_DAMAGE_LIMITATION =
  'If a device has previous liquid damage and needs a different repair, only the part repaired or replaced in this visit is covered, not the whole device.';

export const WATER_DAMAGE_WARRANTY_SUMMARY =
  'Water Damage Repair normally involves cleaning contamination and may require component replacements. The service has no warranty. If the device later fails, neither the Water Damage Repair nor components fitted as part of that service are covered.';

export const WARRANTY_EXCLUSIONS = [
  'a new drop or impact',
  'new or repeated liquid exposure',
  'misuse or accidental damage',
  'third-party opening, repair or modification',
  'a new unrelated fault',
] as const;

export const NO_FIX_NO_CHARGE_SUMMARY =
  'If a diagnosed component is replaced and tested but does not resolve the fault, there is no charge. This also applies if added faults are found, or if the final price is higher than advised and you choose not to continue. For an unsuccessful repair, we do not charge for the repair attempt, a specially ordered part or a deposit already paid.';

export const INSPECTION_FEE_SUMMARY =
  'An inspection or disassembly fee can apply only when it is clearly disclosed and approved before work starts.';

export const REPAIR_PATH_SUMMARY =
  'Repair can mean board-level or component-level work; replacement means directly replacing a component, not the whole phone. The right path depends on inspection. We generally prefer component replacement because board-repair labour can cost more, then explain the options before work begins.';

export type RepairPolicyVariant = 'standard' | 'water-damage';

export function getRepairPolicyVariant(repairSlug: string): RepairPolicyVariant {
  return isWaterDamageRepairSlug(repairSlug) ? 'water-damage' : 'standard';
}

export function getWaterDamageServiceDescription(serviceName: string): string {
  return `${serviceName}. ${WATER_DAMAGE_WARRANTY_SUMMARY}`;
}
import { isWaterDamageRepairSlug } from '@/lib/waterDamageRouting';
