import { slugify } from '@/lib/inventoryUtils';
import { buildLenovoTabletBackCameraReplacementPocket } from './back-camera-replacement';
import { buildLenovoTabletBatteryReplacementPocket } from './battery-replacement';
import { buildLenovoTabletChargingPortReplacementPocket } from './charging-port-replacement';
import {
  getLenovoTabletModelConfig,
  getLenovoTabletModelConfigByModelName,
  LENOVO_TABLET_MODEL_CONFIG_LIST,
} from './config';
import { buildLenovoTabletFrontCameraReplacementPocket } from './front-camera-replacement';
import { buildLenovoTabletScreenReplacementPocket } from './screen-replacement';
import {
  ALI_MOBILE_LENOVO_TABLET_BUSINESS,
  buildLenovoTabletModelHubHref,
  buildLenovoTabletRepairDetailHref,
  formatLenovoTabletModelCodes,
  getLenovoTabletCategoryHubLinks,
  getLenovoTabletModelHubLinks,
  getLenovoTabletRepairLabel,
  getLenovoTabletSameModelRepairLinks,
  getLenovoTabletSameRepairLinks,
  getLenovoTabletSupportLabel,
  isLenovoTabletEnhancedBrand,
} from './shared';
import { getLenovoTabletWhyChooseConfig, LENOVO_TABLET_WHY_CHOOSE_SHARED_HIGHLIGHTS } from './why-choose';
import type {
  AliMobileEnhancedLenovoTabletModelSlug,
  AliMobileEnhancedLenovoTabletRepairType,
  LenovoTabletEnhancedSeoPocket,
} from './types';

export type {
  AliMobileEnhancedLenovoTabletModelSlug,
  AliMobileEnhancedLenovoTabletRepairType,
  RepairTypeSeoPocket,
  LenovoTabletDetailSection,
  LenovoTabletDiagnosticProcessSection,
  LenovoTabletEnhancedSeoPocket,
  LenovoTabletFinalCtaSection,
  LenovoTabletModelConfig,
  LenovoTabletServiceSection,
} from './types';

export {
  ALI_MOBILE_LENOVO_TABLET_BUSINESS,
  buildLenovoTabletModelHubHref,
  buildLenovoTabletRepairDetailHref,
  formatLenovoTabletModelCodes,
  getLenovoTabletCategoryHubLinks,
  getLenovoTabletModelConfig,
  getLenovoTabletModelConfigByModelName,
  getLenovoTabletModelHubLinks,
  getLenovoTabletRepairLabel,
  getLenovoTabletSameModelRepairLinks,
  getLenovoTabletSameRepairLinks,
  getLenovoTabletSupportLabel,
  getLenovoTabletWhyChooseConfig,
  LENOVO_TABLET_MODEL_CONFIG_LIST,
  LENOVO_TABLET_WHY_CHOOSE_SHARED_HIGHLIGHTS,
};

interface AliMobileEnhancedLenovoTabletRouteParams {
  category: string;
  brand: string;
  model: string;
  'repair-type': string;
}

interface AliMobileEnhancedLenovoTabletSeoPocketParams {
  modelSlug: string;
  repairSlug: string;
}

const APPROVED_LENOVO_TABLET_REPAIR_TYPES = new Set<string>([
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
  'front-camera-replacement',
  'back-camera-replacement',
]);

function getAliMobileEnhancedLenovoTabletModelSlug(
  params: AliMobileEnhancedLenovoTabletRouteParams
): AliMobileEnhancedLenovoTabletModelSlug | null {
  if (slugify(params.category) !== 'tablet' || !isLenovoTabletEnhancedBrand(params.brand)) {
    return null;
  }

  return getLenovoTabletModelConfig(params.model)?.modelSlug ?? null;
}

export function getAliMobileEnhancedLenovoTabletRepairType(
  params: AliMobileEnhancedLenovoTabletRouteParams
): AliMobileEnhancedLenovoTabletRepairType | null {
  const modelSlug = getAliMobileEnhancedLenovoTabletModelSlug(params);
  const repairType = slugify(params['repair-type']);

  if (!modelSlug) {
    return null;
  }

  return APPROVED_LENOVO_TABLET_REPAIR_TYPES.has(repairType)
    ? (repairType as AliMobileEnhancedLenovoTabletRepairType)
    : null;
}

export function isAliMobileEnhancedLenovoTabletRepairPage(
  params: AliMobileEnhancedLenovoTabletRouteParams
): boolean {
  return getAliMobileEnhancedLenovoTabletRepairType(params) !== null;
}

export function getAliMobileEnhancedLenovoTabletSeoPocket({
  modelSlug,
  repairSlug,
}: AliMobileEnhancedLenovoTabletSeoPocketParams): LenovoTabletEnhancedSeoPocket | null {
  const config = getLenovoTabletModelConfig(modelSlug);
  const normalizedRepairSlug = slugify(repairSlug);

  if (!config || !APPROVED_LENOVO_TABLET_REPAIR_TYPES.has(normalizedRepairSlug)) {
    return null;
  }

  switch (normalizedRepairSlug) {
    case 'screen-replacement':
      return buildLenovoTabletScreenReplacementPocket(config);
    case 'battery-replacement':
      return buildLenovoTabletBatteryReplacementPocket(config);
    case 'charging-port-replacement':
      return buildLenovoTabletChargingPortReplacementPocket(config);
    case 'front-camera-replacement':
      return buildLenovoTabletFrontCameraReplacementPocket(config);
    case 'back-camera-replacement':
      return buildLenovoTabletBackCameraReplacementPocket(config);
    default:
      return null;
  }
}

