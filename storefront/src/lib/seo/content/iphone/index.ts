import { slugify } from '@/lib/inventoryUtils';
import { applyIphoneBackGlassReplacementSeoPocket } from './back-glass-replacement';
import { applyIphoneBackCameraReplacementSeoPocket } from './back-camera-replacement';
import { applyIphoneBatteryReplacementSeoPocket } from './battery-replacement';
import { applyIphoneChargingPortReplacementSeoPocket } from './charging-port-replacement';
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
> = {
  'iphone-14-pro-max': new Set([
    'screen-replacement',
    'battery-replacement',
    'charging-port-replacement',
    'back-glass-replacement',
  ]),
  'iphone-14-pro': new Set([
    'screen-replacement',
    'battery-replacement',
    'charging-port-replacement',
    'back-glass-replacement',
    'front-camera-replacement',
    'back-camera-replacement',
  ]),
};

function getAliMobileEnhancedIphoneModelSlug(
  params: AliMobileEnhancedIphoneRouteParams
): AliMobileEnhancedIphoneModelSlug | null {
  const category = slugify(params.category);
  const brand = slugify(params.brand);
  const model = slugify(params.model);

  if (category !== "phone" || brand !== "iphone") {
    return null;
  }

  if (model === 'iphone-14-pro-max' || model === 'iphone-14-pro') {
    return model;
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
  switch (slugify(modelSlug)) {
    case 'iphone-14-pro-max':
      return 'iPhone 14 Pro Max';
    case 'iphone-14-pro':
      return 'iPhone 14 Pro';
    default:
      return null;
  }
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

  const modelName = getAliMobileEnhancedIphoneModelName(model);
  if (!modelName) {
    return pocket;
  }

  switch (enhancedRepairType) {
    case "screen-replacement":
      return applyIphoneScreenReplacementSeoPocket(pocket, modelName);
    case "battery-replacement":
      return applyIphoneBatteryReplacementSeoPocket(pocket, modelName);
    case "charging-port-replacement":
      return applyIphoneChargingPortReplacementSeoPocket(pocket, modelName);
    case "back-glass-replacement":
      return applyIphoneBackGlassReplacementSeoPocket(pocket, modelName);
    case "front-camera-replacement":
      return applyIphoneFrontCameraReplacementSeoPocket(pocket, modelName);
    case "back-camera-replacement":
      return applyIphoneBackCameraReplacementSeoPocket(pocket, modelName);
    default:
      return pocket;
  }
}
