import { slugify } from '@/lib/inventoryUtils';
import { applyIphoneBackGlassReplacementSeoPocket } from './back-glass-replacement';
import { applyIphoneBackCameraReplacementSeoPocket } from './back-camera-replacement';
import { applyIphoneBatteryReplacementSeoPocket } from './battery-replacement';
import { applyIphoneChargingPortReplacementSeoPocket } from './charging-port-replacement';
import {
  getIphoneHardwareConfig,
  IPHONE_HARDWARE_CONFIG,
} from './config';
import { applyIphoneFrontCameraReplacementSeoPocket } from './front-camera-replacement';
import { applyIphoneScreenReplacementSeoPocket } from './screen-replacement';
import type {
  AliMobileEnhancedIphoneModelSlug,
  AliMobileEnhancedIphoneRepairType,
  Iphone14ProMaxPilotRepairType,
  RepairTypeSeoPocket,
} from './types';

export type {
  AliMobileEnhancedIphoneModelSlug,
  AliMobileEnhancedIphoneRepairType,
  Iphone14ProMaxPilotRepairType,
  RepairTypeSeoPocket,
} from './types';

interface AliMobileEnhancedIphoneRouteParams {
  category: string;
  brand: string;
  model: string;
  'repair-type': string;
}

interface AliMobileEnhancedIphoneSeoPocketParams {
  category: string;
  brand: string;
  model: string;
  repairType: string;
  pocket: RepairTypeSeoPocket | null;
}

export const ENHANCED_REPAIR_TYPES_BY_MODEL: Record<
  AliMobileEnhancedIphoneModelSlug,
  ReadonlySet<AliMobileEnhancedIphoneRepairType>
> = Object.fromEntries(
  Object.values(IPHONE_HARDWARE_CONFIG).map((config) => [
    config.modelSlug,
    new Set(config.supportedRepairTypes),
  ])
) as Record<AliMobileEnhancedIphoneModelSlug, ReadonlySet<AliMobileEnhancedIphoneRepairType>>;

function getAliMobileEnhancedIphoneModelSlug(
  params: AliMobileEnhancedIphoneRouteParams
): AliMobileEnhancedIphoneModelSlug | null {
  const category = slugify(params.category);
  const brand = slugify(params.brand);
  const model = slugify(params.model);

  if (category !== "phone" || brand !== "iphone") {
    return null;
  }

  const hardwareConfig = getIphoneHardwareConfig(model);
  if (hardwareConfig) {
    return hardwareConfig.modelSlug;
  }

  return null;
}

export function getAliMobileEnhancedIphoneRepairType(
  params: AliMobileEnhancedIphoneRouteParams
): AliMobileEnhancedIphoneRepairType | null {
  const modelSlug = getAliMobileEnhancedIphoneModelSlug(params);
  const repairType = slugify(params['repair-type']) as AliMobileEnhancedIphoneRepairType;

  if (!modelSlug) {
    return null;
  }

  return ENHANCED_REPAIR_TYPES_BY_MODEL[modelSlug].has(repairType) ? repairType : null;
}

export function isAliMobileEnhancedIphoneRepairPage(params: AliMobileEnhancedIphoneRouteParams): boolean {
  return getAliMobileEnhancedIphoneRepairType(params) !== null;
}

export function getAliMobileEnhancedIphoneModelName(modelSlug: string): string | null {
  return getIphoneHardwareConfig(modelSlug)?.modelName ?? null;
}

export function getAliMobileEnhancedIphoneSeoPocket({
  category,
  brand,
  model,
  repairType,
  pocket,
}: AliMobileEnhancedIphoneSeoPocketParams): RepairTypeSeoPocket | null {
  if (!pocket) {
    return pocket;
  }

  const enhancedRepairType = getAliMobileEnhancedIphoneRepairType({
    category,
    brand,
    model,
    'repair-type': repairType,
  });

  if (!enhancedRepairType) {
    return pocket;
  }

  const hardwareConfig = getIphoneHardwareConfig(model);
  if (!hardwareConfig) {
    return pocket;
  }

  switch (enhancedRepairType) {
    case "screen-replacement":
      return applyIphoneScreenReplacementSeoPocket(pocket, hardwareConfig);
    case "battery-replacement":
      return applyIphoneBatteryReplacementSeoPocket(pocket, hardwareConfig);
    case "charging-port-replacement":
      return applyIphoneChargingPortReplacementSeoPocket(pocket, hardwareConfig);
    case "back-glass-replacement":
      return applyIphoneBackGlassReplacementSeoPocket(pocket, hardwareConfig);
    case "front-camera-replacement":
      return applyIphoneFrontCameraReplacementSeoPocket(pocket, hardwareConfig);
    case "back-camera-replacement":
      return applyIphoneBackCameraReplacementSeoPocket(pocket, hardwareConfig);
    default:
      return pocket;
  }
}
