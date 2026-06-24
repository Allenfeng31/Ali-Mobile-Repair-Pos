import { slugify } from '@/lib/inventoryUtils';
import { applyIphone14ProMaxBackGlassReplacementSeoPocket } from './back-glass-replacement';
import { applyIphone14ProMaxBatteryReplacementSeoPocket } from './battery-replacement';
import { applyIphone14ProMaxChargingPortReplacementSeoPocket } from './charging-port-replacement';
import { applyIphone14ProMaxScreenReplacementSeoPocket } from './screen-replacement';
import type { Iphone14ProMaxPilotRepairType, RepairTypeSeoPocket } from './types';

export type { Iphone14ProMaxPilotRepairType, RepairTypeSeoPocket } from './types';

interface AliMobilePilotRouteParams {
  category: string;
  brand: string;
  model: string;
  'repair-type': string;
}

interface AliMobilePilotSeoPocketParams {
  category: string;
  brand: string;
  model: string;
  repairType: string;
  pocket: RepairTypeSeoPocket | null;
}

export function getAliMobileIphone14ProMaxPilotRepairType(
  params: AliMobilePilotRouteParams
): Iphone14ProMaxPilotRepairType | null {
  const category = slugify(params.category);
  const brand = slugify(params.brand);
  const model = slugify(params.model);
  const repairType = slugify(params['repair-type']);

  if (category !== "phone" || brand !== "iphone" || model !== "iphone-14-pro-max") {
    return null;
  }

  switch (repairType) {
    case "screen-replacement":
    case "battery-replacement":
    case "charging-port-replacement":
    case "back-glass-replacement":
      return repairType;
    default:
      return null;
  }
}

export function getAliMobileIphone14ProMaxPilotSeoPocket({
  category,
  brand,
  model,
  repairType,
  pocket,
}: AliMobilePilotSeoPocketParams): RepairTypeSeoPocket | null {
  if (!pocket) {
    return pocket;
  }

  const pilotRepairType = getAliMobileIphone14ProMaxPilotRepairType({
    category,
    brand,
    model,
    'repair-type': repairType,
  });

  if (!pilotRepairType) {
    return pocket;
  }

  switch (pilotRepairType) {
    case "screen-replacement":
      return applyIphone14ProMaxScreenReplacementSeoPocket(pocket);
    case "battery-replacement":
      return applyIphone14ProMaxBatteryReplacementSeoPocket(pocket);
    case "charging-port-replacement":
      return applyIphone14ProMaxChargingPortReplacementSeoPocket(pocket);
    case "back-glass-replacement":
      return applyIphone14ProMaxBackGlassReplacementSeoPocket(pocket);
    default:
      return pocket;
  }
}
