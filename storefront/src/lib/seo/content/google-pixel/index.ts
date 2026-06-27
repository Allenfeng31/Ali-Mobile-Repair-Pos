import { slugify } from '@/lib/inventoryUtils';
import { buildGooglePixelBackCameraReplacementPocket } from './back-camera-replacement';
import { buildGooglePixelBackGlassReplacementPocket } from './back-glass-replacement';
import { buildGooglePixelBatteryReplacementPocket } from './battery-replacement';
import { buildGooglePixelChargingPortReplacementPocket } from './charging-port-replacement';
import { getGooglePixelHardwareConfig, GOOGLE_PIXEL_HARDWARE_CONFIG } from './config';
import { buildGooglePixelFrontCameraReplacementPocket } from './front-camera-replacement';
import { buildGooglePixelLogicBoardRepairPocket } from './logic-board-repair';
import { buildGooglePixelScreenReplacementPocket } from './screen-replacement';
import { getGooglePixelEnhancedHubLinks, type GooglePixelHubLink } from './shared';
import type {
  AliMobileEnhancedGooglePixelModelSlug,
  AliMobileEnhancedGooglePixelRepairType,
  RepairTypeSeoPocket,
} from './types';

export type {
  AliMobileEnhancedGooglePixelModelSlug,
  AliMobileEnhancedGooglePixelRepairType,
  RepairTypeSeoPocket,
} from './types';

interface AliMobileEnhancedGooglePixelRouteParams {
  category: string;
  brand: string;
  model: string;
  'repair-type': string;
}

interface AliMobileEnhancedGooglePixelSeoPocketParams {
  category: string;
  brand: string;
  model: string;
  repairType: string;
  pocket: RepairTypeSeoPocket | null;
}

function buildEnhancedGooglePixelRepairTypesByModel(): Record<
  AliMobileEnhancedGooglePixelModelSlug,
  ReadonlySet<AliMobileEnhancedGooglePixelRepairType>
> {
  const repairTypesByModel = {} as Record<
    AliMobileEnhancedGooglePixelModelSlug,
    ReadonlySet<AliMobileEnhancedGooglePixelRepairType>
  >;

  for (const config of Object.values(GOOGLE_PIXEL_HARDWARE_CONFIG)) {
    repairTypesByModel[config.modelSlug] = new Set<AliMobileEnhancedGooglePixelRepairType>(
      config.supportedRepairTypes
    );
  }

  return repairTypesByModel;
}

export const ENHANCED_GOOGLE_PIXEL_REPAIR_TYPES_BY_MODEL: Record<
  AliMobileEnhancedGooglePixelModelSlug,
  ReadonlySet<AliMobileEnhancedGooglePixelRepairType>
> = buildEnhancedGooglePixelRepairTypesByModel();

function getAliMobileEnhancedGooglePixelModelSlug(
  params: AliMobileEnhancedGooglePixelRouteParams
): AliMobileEnhancedGooglePixelModelSlug | null {
  const category = slugify(params.category);
  const brand = slugify(params.brand);
  const model = slugify(params.model);

  if (category !== 'phone' || brand !== 'google-pixel') {
    return null;
  }

  const hardwareConfig = getGooglePixelHardwareConfig(model);
  return hardwareConfig?.modelSlug ?? null;
}

export function getAliMobileEnhancedGooglePixelRepairType(
  params: AliMobileEnhancedGooglePixelRouteParams
): AliMobileEnhancedGooglePixelRepairType | null {
  const modelSlug = getAliMobileEnhancedGooglePixelModelSlug(params);
  const repairType = slugify(params['repair-type']) as AliMobileEnhancedGooglePixelRepairType;

  if (!modelSlug) {
    return null;
  }

  return ENHANCED_GOOGLE_PIXEL_REPAIR_TYPES_BY_MODEL[modelSlug].has(repairType) ? repairType : null;
}

export function isAliMobileEnhancedGooglePixelRepairPage(
  params: AliMobileEnhancedGooglePixelRouteParams
): boolean {
  return getAliMobileEnhancedGooglePixelRepairType(params) !== null;
}

export function getAliMobileEnhancedGooglePixelSeoPocket({
  category,
  brand,
  model,
  repairType,
  pocket,
}: AliMobileEnhancedGooglePixelSeoPocketParams): RepairTypeSeoPocket | null {
  const enhancedRepairType = getAliMobileEnhancedGooglePixelRepairType({
    category,
    brand,
    model,
    'repair-type': repairType,
  });

  if (!enhancedRepairType) {
    return pocket;
  }

  const hardwareConfig = getGooglePixelHardwareConfig(model);
  if (!hardwareConfig) {
    return pocket;
  }

  switch (enhancedRepairType) {
    case 'screen-replacement':
      return buildGooglePixelScreenReplacementPocket(hardwareConfig);
    case 'battery-replacement':
      return buildGooglePixelBatteryReplacementPocket(hardwareConfig);
    case 'charging-port-replacement':
      return buildGooglePixelChargingPortReplacementPocket(hardwareConfig);
    case 'back-glass-replacement':
      return buildGooglePixelBackGlassReplacementPocket(hardwareConfig);
    case 'front-camera-replacement':
      return buildGooglePixelFrontCameraReplacementPocket(hardwareConfig);
    case 'back-camera-replacement':
      return buildGooglePixelBackCameraReplacementPocket(hardwareConfig);
    case 'logic-board-repair':
      return buildGooglePixelLogicBoardRepairPocket(hardwareConfig);
    default:
      return pocket;
  }
}

export function getAliMobileEnhancedGooglePixelHubLinks(modelSlug: string): GooglePixelHubLink[] {
  const hardwareConfig = getGooglePixelHardwareConfig(modelSlug);
  return hardwareConfig ? getGooglePixelEnhancedHubLinks(hardwareConfig) : [];
}
