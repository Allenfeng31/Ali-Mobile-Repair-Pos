import { slugify } from '@/lib/inventoryUtils';
import { buildIpadBackCameraReplacementPocket } from './back-camera-replacement';
import { buildIpadBatteryReplacementPocket } from './battery-replacement';
import { buildIpadChargingPortReplacementPocket } from './charging-port-replacement';
import {
  getIpadHardwareConfig,
  getIpadHardwareConfigByModelName,
  IPAD_HARDWARE_CONFIG,
} from './config';
import { buildIpadFrontCameraReplacementPocket } from './front-camera-replacement';
import { buildIpadScreenReplacementPocket } from './screen-replacement';
import {
  getIpadModelHubLinks,
  getIpadSameModelRepairLinks,
  getIpadSameRepairLinks,
  isIpadEnhancedBrand,
} from './shared';
import { getIpadWhyChooseConfig, IPAD_WHY_CHOOSE_SHARED_HIGHLIGHTS } from './why-choose';
import type {
  AliMobileEnhancedIpadModelSlug,
  AliMobileEnhancedIpadRepairType,
  IpadEnhancedSeoPocket,
} from './types';

export type {
  AliMobileEnhancedIpadModelSlug,
  AliMobileEnhancedIpadRepairType,
  IpadDetailSection,
  IpadEnhancedSeoPocket,
  IpadFinalCtaSection,
  IpadHardwareConfig,
  RepairTypeSeoPocket,
} from './types';

export { getIpadHardwareConfig, getIpadHardwareConfigByModelName } from './config';
export {
  ALI_MOBILE_IPAD_BUSINESS,
  buildIpadModelHubHref,
  buildIpadRepairDetailHref,
  getIpadModelHubLinks,
  getIpadRepairLabel,
  getIpadSameModelRepairLinks,
  getIpadSameRepairLinks,
} from './shared';
export { getIpadWhyChooseConfig, IPAD_WHY_CHOOSE_SHARED_HIGHLIGHTS } from './why-choose';

interface AliMobileEnhancedIpadRouteParams {
  category: string;
  brand: string;
  model: string;
  'repair-type': string;
}

interface AliMobileEnhancedIpadSeoPocketParams {
  modelSlug: string;
  repairSlug: string;
}

export const ENHANCED_IPAD_REPAIR_TYPES_BY_MODEL: Record<
  AliMobileEnhancedIpadModelSlug,
  ReadonlySet<AliMobileEnhancedIpadRepairType>
> = Object.fromEntries(
  Object.values(IPAD_HARDWARE_CONFIG).map((config) => [
    config.modelSlug,
    new Set<AliMobileEnhancedIpadRepairType>(config.supportedRepairTypes),
  ])
) as unknown as Record<AliMobileEnhancedIpadModelSlug, ReadonlySet<AliMobileEnhancedIpadRepairType>>;

function getAliMobileEnhancedIpadModelSlug(
  params: AliMobileEnhancedIpadRouteParams
): AliMobileEnhancedIpadModelSlug | null {
  if (slugify(params.category) !== 'tablet' || !isIpadEnhancedBrand(params.brand)) {
    return null;
  }

  return getIpadHardwareConfig(params.model)?.modelSlug ?? null;
}

export function getAliMobileEnhancedIpadRepairType(
  params: AliMobileEnhancedIpadRouteParams
): AliMobileEnhancedIpadRepairType | null {
  const modelSlug = getAliMobileEnhancedIpadModelSlug(params);
  const repairType = slugify(params['repair-type']) as AliMobileEnhancedIpadRepairType;

  if (!modelSlug) {
    return null;
  }

  return ENHANCED_IPAD_REPAIR_TYPES_BY_MODEL[modelSlug].has(repairType) ? repairType : null;
}

export function isAliMobileEnhancedIpadRepairPage(params: AliMobileEnhancedIpadRouteParams): boolean {
  return getAliMobileEnhancedIpadRepairType(params) !== null;
}

export function getAliMobileEnhancedIpadModelName(modelSlug: string): string | null {
  return getIpadHardwareConfig(modelSlug)?.modelName ?? null;
}

export function getAliMobileEnhancedIpadSeoPocket({
  modelSlug,
  repairSlug,
}: AliMobileEnhancedIpadSeoPocketParams): IpadEnhancedSeoPocket | null {
  const config = getIpadHardwareConfig(modelSlug);
  const normalizedRepairSlug = slugify(repairSlug) as AliMobileEnhancedIpadRepairType;

  if (!config || !config.supportedRepairTypes.includes(normalizedRepairSlug)) {
    return null;
  }

  switch (normalizedRepairSlug) {
    case 'screen-replacement':
      return buildIpadScreenReplacementPocket(config);
    case 'battery-replacement':
      return buildIpadBatteryReplacementPocket(config);
    case 'charging-port-replacement':
      return buildIpadChargingPortReplacementPocket(config);
    case 'front-camera-replacement':
      return buildIpadFrontCameraReplacementPocket(config);
    case 'back-camera-replacement':
      return buildIpadBackCameraReplacementPocket(config);
    default:
      return null;
  }
}
