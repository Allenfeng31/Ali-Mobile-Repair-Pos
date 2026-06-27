import { slugify } from '@/lib/inventoryUtils';
import { buildSamsungBackCameraReplacementPocket } from './back-camera-replacement';
import { buildSamsungBackHousingReplacementPocket } from './back-housing-replacement';
import { buildSamsungBatteryReplacementPocket } from './battery-replacement';
import { buildSamsungChargingPortReplacementPocket } from './charging-port-replacement';
import { getSamsungHardwareConfig, SAMSUNG_HARDWARE_CONFIG } from './config';
import { buildSamsungFrontCameraReplacementPocket } from './front-camera-replacement';
import { buildSamsungLogicBoardRepairPocket } from './logic-board-repair';
import { buildSamsungScreenReplacementPocket } from './screen-replacement';
import { getSamsungEnhancedHubLinks, type SamsungHubLink } from './shared';
import type {
  AliMobileEnhancedSamsungModelSlug,
  AliMobileEnhancedSamsungRepairType,
  RepairTypeSeoPocket,
} from './types';

export type {
  AliMobileEnhancedSamsungModelSlug,
  AliMobileEnhancedSamsungRepairType,
  RepairTypeSeoPocket,
} from './types';

interface AliMobileEnhancedSamsungRouteParams {
  category: string;
  brand: string;
  model: string;
  'repair-type': string;
}

interface AliMobileEnhancedSamsungSeoPocketParams {
  category: string;
  brand: string;
  model: string;
  repairType: string;
  pocket: RepairTypeSeoPocket | null;
}

function buildEnhancedSamsungRepairTypesByModel(): Record<
  AliMobileEnhancedSamsungModelSlug,
  ReadonlySet<AliMobileEnhancedSamsungRepairType>
> {
  const repairTypesByModel = {} as Record<
    AliMobileEnhancedSamsungModelSlug,
    ReadonlySet<AliMobileEnhancedSamsungRepairType>
  >;

  for (const config of Object.values(SAMSUNG_HARDWARE_CONFIG)) {
    repairTypesByModel[config.modelSlug] = new Set<AliMobileEnhancedSamsungRepairType>(
      config.supportedRepairTypes
    );
  }

  return repairTypesByModel;
}

export const ENHANCED_SAMSUNG_REPAIR_TYPES_BY_MODEL: Record<
  AliMobileEnhancedSamsungModelSlug,
  ReadonlySet<AliMobileEnhancedSamsungRepairType>
> = buildEnhancedSamsungRepairTypesByModel();

function getAliMobileEnhancedSamsungModelSlug(
  params: AliMobileEnhancedSamsungRouteParams
): AliMobileEnhancedSamsungModelSlug | null {
  const category = slugify(params.category);
  const brand = slugify(params.brand);
  const model = slugify(params.model);

  if (category !== 'phone' || brand !== 'samsung') {
    return null;
  }

  const hardwareConfig = getSamsungHardwareConfig(model);
  return hardwareConfig?.modelSlug ?? null;
}

export function getAliMobileEnhancedSamsungRepairType(
  params: AliMobileEnhancedSamsungRouteParams
): AliMobileEnhancedSamsungRepairType | null {
  const modelSlug = getAliMobileEnhancedSamsungModelSlug(params);
  const repairType = slugify(params['repair-type']) as AliMobileEnhancedSamsungRepairType;

  if (!modelSlug) {
    return null;
  }

  return ENHANCED_SAMSUNG_REPAIR_TYPES_BY_MODEL[modelSlug].has(repairType) ? repairType : null;
}

export function isAliMobileEnhancedSamsungRepairPage(
  params: AliMobileEnhancedSamsungRouteParams
): boolean {
  return getAliMobileEnhancedSamsungRepairType(params) !== null;
}

export function getAliMobileEnhancedSamsungSeoPocket({
  category,
  brand,
  model,
  repairType,
  pocket,
}: AliMobileEnhancedSamsungSeoPocketParams): RepairTypeSeoPocket | null {
  const enhancedRepairType = getAliMobileEnhancedSamsungRepairType({
    category,
    brand,
    model,
    'repair-type': repairType,
  });

  if (!enhancedRepairType) {
    return pocket;
  }

  const hardwareConfig = getSamsungHardwareConfig(model);
  if (!hardwareConfig) {
    return pocket;
  }

  switch (enhancedRepairType) {
    case 'screen-replacement':
      return buildSamsungScreenReplacementPocket(hardwareConfig);
    case 'battery-replacement':
      return buildSamsungBatteryReplacementPocket(hardwareConfig);
    case 'charging-port-replacement':
      return buildSamsungChargingPortReplacementPocket(hardwareConfig);
    case 'back-glass-replacement':
    case 'back-housing-replacement':
      return buildSamsungBackHousingReplacementPocket(hardwareConfig);
    case 'front-camera-replacement':
      return buildSamsungFrontCameraReplacementPocket(hardwareConfig);
    case 'back-camera-replacement':
      return buildSamsungBackCameraReplacementPocket(hardwareConfig);
    case 'logic-board-repair':
      return buildSamsungLogicBoardRepairPocket(hardwareConfig);
    default:
      return pocket;
  }
}

export function getAliMobileEnhancedSamsungHubLinks(modelSlug: string): SamsungHubLink[] {
  const hardwareConfig = getSamsungHardwareConfig(modelSlug);
  return hardwareConfig ? getSamsungEnhancedHubLinks(hardwareConfig) : [];
}
