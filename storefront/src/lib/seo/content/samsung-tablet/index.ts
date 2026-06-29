import { slugify } from '@/lib/inventoryUtils';
import { buildSamsungTabletBackCameraReplacementPocket } from './back-camera-replacement';
import { buildSamsungTabletBatteryReplacementPocket } from './battery-replacement';
import { buildSamsungTabletChargingPortReplacementPocket } from './charging-port-replacement';
import {
  getSamsungTabletModelConfig,
  getSamsungTabletModelConfigByModelName,
  SAMSUNG_TABLET_MODEL_CONFIG_LIST,
} from './config';
import { buildSamsungTabletFrontCameraReplacementPocket } from './front-camera-replacement';
import { buildSamsungTabletScreenReplacementPocket } from './screen-replacement';
import {
  ALI_MOBILE_SAMSUNG_TABLET_BUSINESS,
  buildSamsungTabletModelHubHref,
  buildSamsungTabletRepairDetailHref,
  formatSamsungTabletModelCodes,
  getSamsungTabletCategoryHubLinks,
  getSamsungTabletModelHubLinks,
  getSamsungTabletRepairLabel,
  getSamsungTabletSameModelRepairLinks,
  getSamsungTabletSameRepairLinks,
  getSamsungTabletSupportLabel,
  isSamsungTabletEnhancedBrand,
} from './shared';
import { getSamsungTabletWhyChooseConfig, SAMSUNG_TABLET_WHY_CHOOSE_SHARED_HIGHLIGHTS } from './why-choose';
import type {
  AliMobileEnhancedSamsungTabletModelSlug,
  AliMobileEnhancedSamsungTabletRepairType,
  SamsungTabletEnhancedSeoPocket,
} from './types';

export type {
  AliMobileEnhancedSamsungTabletModelSlug,
  AliMobileEnhancedSamsungTabletRepairType,
  RepairTypeSeoPocket,
  SamsungTabletDetailSection,
  SamsungTabletDiagnosticProcessSection,
  SamsungTabletEnhancedSeoPocket,
  SamsungTabletFinalCtaSection,
  SamsungTabletModelConfig,
  SamsungTabletServiceSection,
} from './types';

export {
  ALI_MOBILE_SAMSUNG_TABLET_BUSINESS,
  buildSamsungTabletModelHubHref,
  buildSamsungTabletRepairDetailHref,
  formatSamsungTabletModelCodes,
  getSamsungTabletCategoryHubLinks,
  getSamsungTabletModelConfig,
  getSamsungTabletModelConfigByModelName,
  getSamsungTabletModelHubLinks,
  getSamsungTabletRepairLabel,
  getSamsungTabletSameModelRepairLinks,
  getSamsungTabletSameRepairLinks,
  getSamsungTabletSupportLabel,
  getSamsungTabletWhyChooseConfig,
  SAMSUNG_TABLET_MODEL_CONFIG_LIST,
  SAMSUNG_TABLET_WHY_CHOOSE_SHARED_HIGHLIGHTS,
};

interface AliMobileEnhancedSamsungTabletRouteParams {
  category: string;
  brand: string;
  model: string;
  'repair-type': string;
}

interface AliMobileEnhancedSamsungTabletSeoPocketParams {
  modelSlug: string;
  repairSlug: string;
}

const APPROVED_SAMSUNG_TABLET_REPAIR_TYPES = new Set<string>([
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
  'front-camera-replacement',
  'back-camera-replacement',
]);

function getAliMobileEnhancedSamsungTabletModelSlug(
  params: AliMobileEnhancedSamsungTabletRouteParams
): AliMobileEnhancedSamsungTabletModelSlug | null {
  if (slugify(params.category) !== 'tablet' || !isSamsungTabletEnhancedBrand(params.brand)) {
    return null;
  }

  return getSamsungTabletModelConfig(params.model)?.modelSlug ?? null;
}

export function getAliMobileEnhancedSamsungTabletRepairType(
  params: AliMobileEnhancedSamsungTabletRouteParams
): AliMobileEnhancedSamsungTabletRepairType | null {
  const modelSlug = getAliMobileEnhancedSamsungTabletModelSlug(params);
  const repairType = slugify(params['repair-type']);

  if (!modelSlug) {
    return null;
  }

  return APPROVED_SAMSUNG_TABLET_REPAIR_TYPES.has(repairType)
    ? (repairType as AliMobileEnhancedSamsungTabletRepairType)
    : null;
}

export function isAliMobileEnhancedSamsungTabletRepairPage(
  params: AliMobileEnhancedSamsungTabletRouteParams
): boolean {
  return getAliMobileEnhancedSamsungTabletRepairType(params) !== null;
}

export function getAliMobileEnhancedSamsungTabletSeoPocket({
  modelSlug,
  repairSlug,
}: AliMobileEnhancedSamsungTabletSeoPocketParams): SamsungTabletEnhancedSeoPocket | null {
  const config = getSamsungTabletModelConfig(modelSlug);
  const normalizedRepairSlug = slugify(repairSlug);

  if (!config || !APPROVED_SAMSUNG_TABLET_REPAIR_TYPES.has(normalizedRepairSlug)) {
    return null;
  }

  switch (normalizedRepairSlug) {
    case 'screen-replacement':
      return buildSamsungTabletScreenReplacementPocket(config);
    case 'battery-replacement':
      return buildSamsungTabletBatteryReplacementPocket(config);
    case 'charging-port-replacement':
      return buildSamsungTabletChargingPortReplacementPocket(config);
    case 'front-camera-replacement':
      return buildSamsungTabletFrontCameraReplacementPocket(config);
    case 'back-camera-replacement':
      return buildSamsungTabletBackCameraReplacementPocket(config);
    default:
      return null;
  }
}

