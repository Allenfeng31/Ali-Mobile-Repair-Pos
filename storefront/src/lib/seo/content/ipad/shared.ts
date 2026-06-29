import type { ExploreRepairLink } from '@/components/services/ExploreRepairNetworkSection';
import { preserveRouteSegment, slugify } from '@/lib/inventoryUtils';
import { getIpadHardwareConfig, IPAD_MODEL_CONFIG_LIST } from './config';
import type {
  AliMobileEnhancedIpadModelSlug,
  AliMobileEnhancedIpadRepairType,
  IpadHardwareConfig,
} from './types';

export interface IpadRepairDetailLink {
  href: string;
  label: string;
  slug: string;
}

export const ALI_MOBILE_IPAD_BUSINESS = {
  businessName: 'Ali Mobile & Repair',
  locationName: 'Ringwood Square Shopping Centre',
  locationShort: 'Ringwood Square',
  locality: 'Ringwood, Victoria',
  phone: '0481 058 514',
} as const;

export const IPAD_REPAIR_LABELS: Record<AliMobileEnhancedIpadRepairType, string> = {
  'screen-replacement': 'Screen Replacement',
  'battery-replacement': 'Battery Replacement',
  'charging-port-replacement': 'Charging Port Replacement',
  'front-camera-replacement': 'Front Camera Replacement',
  'back-camera-replacement': 'Back Camera Replacement',
};

const IPAD_REPAIR_ORDER: ReadonlyArray<AliMobileEnhancedIpadRepairType> = [
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
  'front-camera-replacement',
  'back-camera-replacement',
];

export function isIpadEnhancedBrand(brandSlug: string): boolean {
  const normalizedBrand = slugify(brandSlug);
  return normalizedBrand === 'ipad' || normalizedBrand === 'apple';
}

export function isIpadEnhancedRoute(params: {
  category: string;
  brand: string;
  model: string;
  'repair-type': string;
}): boolean {
  return slugify(params.category) === 'tablet' && isIpadEnhancedBrand(params.brand) && Boolean(getIpadHardwareConfig(params.model));
}

export function getIpadRepairLabel(repairType: AliMobileEnhancedIpadRepairType): string {
  return IPAD_REPAIR_LABELS[repairType];
}

export function buildIpadRepairDetailHref(
  modelSlug: AliMobileEnhancedIpadModelSlug,
  repairSlug: AliMobileEnhancedIpadRepairType
): string {
  return `/repairs/tablet/ipad/${preserveRouteSegment(modelSlug)}/${preserveRouteSegment(repairSlug)}`;
}

export function buildIpadModelHubHref(modelSlug: AliMobileEnhancedIpadModelSlug): string {
  return `/repairs/tablet/ipad/${preserveRouteSegment(modelSlug)}`;
}

export function getIpadSupportLabel(config: IpadHardwareConfig): string | null {
  if (!config.customerFacingReferenceName) {
    return null;
  }

  return `${config.modelName} may also be identified as ${config.customerFacingReferenceName}.`;
}

export function getIpadConnectorLabel(config: IpadHardwareConfig): string {
  switch (config.connectorType) {
    case 'lightning':
      return 'Lightning';
    case 'usb-c-thunderbolt':
      return 'USB-C / Thunderbolt family connection';
    default:
      return 'USB-C';
  }
}

export function getIpadBiometricLabel(config: IpadHardwareConfig): string {
  switch (config.biometricType) {
    case 'home-button-touch-id':
      return 'Home Button with Touch ID';
    case 'top-button-touch-id':
      return 'top button with Touch ID';
    default:
      return 'Face ID and TrueDepth';
  }
}

export function getIpadBiometricTestLabel(config: IpadHardwareConfig): string {
  switch (config.biometricType) {
    case 'home-button-touch-id':
      return 'Home Button and current Touch ID state';
    case 'top-button-touch-id':
      return 'top button and current Touch ID state';
    default:
      return 'Face ID separately';
  }
}

export function getIpadFrontCameraPositionLabel(config: IpadHardwareConfig): string {
  return config.frontCameraPosition === 'landscape'
    ? 'landscape front camera'
    : 'traditional front-camera position';
}

export function getIpadCenterStageSentence(config: IpadHardwareConfig): string {
  return config.supportsCenterStage
    ? 'This model supports Center Stage, although the exact behavior can still depend on app support, settings, and software state.'
    : 'This model does not support Center Stage, so diagnosis stays focused on the camera path, app permissions, and related hardware checks.';
}

export function getIpadRearCameraSystemSummary(config: IpadHardwareConfig): string {
  switch (config.rearCameraSystem) {
    case 'single-8mp':
      return 'single 8MP rear camera';
    case 'single-12mp':
      return 'single 12MP Wide rear camera';
    case 'dual-wide-ultra-wide-lidar':
      return '12MP Wide rear camera, 10MP Ultra Wide rear camera, and LiDAR Scanner';
    case 'single-12mp-lidar':
      return 'single 12MP Wide rear camera with LiDAR Scanner tested separately';
    default:
      return config.rearCameraDescription;
  }
}

export function getIpadScreenTechnologySummary(config: IpadHardwareConfig): string {
  if (config.modelSlug === 'ipad-11th-generation') {
    return '11-inch class display';
  }

  if (config.modelSlug === 'ipad-pro-11-inch-4th-generation') {
    return 'fully laminated Liquid Retina display with ProMotion';
  }

  if (config.displayFamily === 'ultra-retina-xdr-tandem-oled') {
    return 'fully laminated Ultra Retina XDR Tandem OLED display';
  }

  return config.displayMarketingName;
}

export function getIpadBatteryHandlingSentence(config: IpadHardwareConfig): string {
  return config.hasLargerFrameInspectionNote
    ? 'The larger frame and display edges are checked carefully because swelling or previous impact can widen the repair scope.'
    : 'Swelling condition, display fit, and any existing frame damage are checked before the iPad is opened.';
}

export function getIpadAccessoryLabel(config: IpadHardwareConfig): string {
  return config.connectorType === 'lightning' ? 'Lightning cable and charger' : 'USB-C cable, charger, and compatible accessories';
}

export function getIpadSchoolUseSentence(config: IpadHardwareConfig): string {
  if (config.family === 'ipad') {
    return 'Daily school, family, and case-on/case-off use can hide impact around the frame or connector, so we inspect those areas before quoting.';
  }

  return 'Daily transport, desk use, and previous impact can overlap with frame or connector condition, so we inspect those areas before quoting.';
}

export function getIpadLocalSuburbReference(repairType: AliMobileEnhancedIpadRepairType): string {
  switch (repairType) {
    case 'screen-replacement':
      return 'Customers often visit from Croydon and Ringwood East when they need a cracked iPad screen inspected in person.';
    case 'battery-replacement':
      return 'Customers from Mitcham and Heathmont often bring in iPads with poor standby time, swelling concerns, or short battery life.';
    case 'charging-port-replacement':
      return 'Customers from Wantirna and Blackburn often bring the cable that shows the fault so we can test the full charging setup.';
    case 'front-camera-replacement':
      return 'Customers around Ringwood often bring the iPad in with the video-call app or school-use symptom ready to show on the bench.';
    case 'back-camera-replacement':
      return 'Customers from Croydon and Heathmont often bring in the iPad after impact or lens-area damage so we can separate camera faults from external damage.';
    default:
      return 'Customers across Ringwood and nearby suburbs use the store for model-aware iPad inspection before approving repair work.';
  }
}

export function getIpadSameModelRepairLinks(
  modelSlug: AliMobileEnhancedIpadModelSlug,
  currentRepairType: AliMobileEnhancedIpadRepairType,
  genuineRepairSlugs: string[]
): IpadRepairDetailLink[] {
  const config = getIpadHardwareConfig(modelSlug);
  if (!config) {
    return [];
  }

  return IPAD_REPAIR_ORDER
    .filter((repairType) => repairType !== currentRepairType && genuineRepairSlugs.includes(repairType))
    .map((repairType) => ({
      href: buildIpadRepairDetailHref(config.modelSlug, repairType),
      label: `${config.modelName} ${getIpadRepairLabel(repairType).toLowerCase()}`,
      slug: repairType,
    }));
}

function getSameRepairSimilarityScore(
  currentConfig: IpadHardwareConfig,
  candidateConfig: IpadHardwareConfig,
  repairType: AliMobileEnhancedIpadRepairType
): number {
  let score = 0;

  if (candidateConfig.family === currentConfig.family) {
    score -= 450;
  }

  if (candidateConfig.releasePairKey && candidateConfig.releasePairKey === currentConfig.releasePairKey) {
    score -= 260;
  }

  score += Math.abs(candidateConfig.screenSizeInches - currentConfig.screenSizeInches) * 16;

  if (repairType === 'screen-replacement') {
    if (candidateConfig.displayFamily === currentConfig.displayFamily) {
      score -= 180;
    }
    if (candidateConfig.biometricType === currentConfig.biometricType) {
      score -= 70;
    }
    if (candidateConfig.frontCameraPosition === currentConfig.frontCameraPosition) {
      score -= 55;
    }
  }

  if (repairType === 'battery-replacement' || repairType === 'charging-port-replacement') {
    if (candidateConfig.connectorType === currentConfig.connectorType) {
      score -= 190;
    }
    if (candidateConfig.biometricType === currentConfig.biometricType) {
      score -= 65;
    }
  }

  if (repairType === 'front-camera-replacement') {
    if (candidateConfig.frontCameraPosition === currentConfig.frontCameraPosition) {
      score -= 165;
    }
    if (candidateConfig.supportsCenterStage === currentConfig.supportsCenterStage) {
      score -= 145;
    }
    if (candidateConfig.biometricType === currentConfig.biometricType) {
      score -= 80;
    }
    if (candidateConfig.hasTrueDepthFrontCamera === currentConfig.hasTrueDepthFrontCamera) {
      score -= 50;
    }
  }

  if (repairType === 'back-camera-replacement') {
    if (candidateConfig.rearCameraSystem === currentConfig.rearCameraSystem) {
      score -= 220;
    }
    if (candidateConfig.hasLidar === currentConfig.hasLidar) {
      score -= 70;
    }
    if (candidateConfig.hasRearUltraWide === currentConfig.hasRearUltraWide) {
      score -= 55;
    }
  }

  if (candidateConfig.family === currentConfig.family) {
    score += Math.abs(candidateConfig.generationOrder - currentConfig.generationOrder) * 35;
  } else {
    score += Math.abs(candidateConfig.generationOrder - currentConfig.generationOrder) * 70;
  }

  return score;
}

export function getIpadSameRepairLinks(
  modelSlug: AliMobileEnhancedIpadModelSlug,
  repairType: AliMobileEnhancedIpadRepairType,
  genuineModelsWithRepair: string[],
  limit = 6
): IpadRepairDetailLink[] {
  const currentConfig = getIpadHardwareConfig(modelSlug);
  if (!currentConfig) {
    return [];
  }

  return IPAD_MODEL_CONFIG_LIST
    .filter((candidate) => candidate.modelSlug !== currentConfig.modelSlug)
    .filter((candidate) => genuineModelsWithRepair.includes(candidate.modelSlug))
    .map((candidate) => ({
      href: buildIpadRepairDetailHref(candidate.modelSlug, repairType),
      label: `${candidate.modelName} ${getIpadRepairLabel(repairType).toLowerCase()}`,
      slug: repairType,
      score: getSameRepairSimilarityScore(currentConfig, candidate, repairType),
    }))
    .sort((left, right) => {
      if (left.score !== right.score) {
        return left.score - right.score;
      }

      return left.label.localeCompare(right.label);
    })
    .slice(0, limit)
    .map(({ href, label, slug }) => ({ href, label, slug }));
}

function getModelHubSimilarityScore(currentConfig: IpadHardwareConfig, candidateConfig: IpadHardwareConfig): number {
  let score = 0;

  if (candidateConfig.family === currentConfig.family) {
    score -= 420;
  }

  if (candidateConfig.releasePairKey && candidateConfig.releasePairKey === currentConfig.releasePairKey) {
    score -= 240;
  }

  if (candidateConfig.screenSizeInches === currentConfig.screenSizeInches) {
    score -= 110;
  }

  if (candidateConfig.displayFamily === currentConfig.displayFamily) {
    score -= 85;
  }

  if (candidateConfig.connectorType === currentConfig.connectorType) {
    score -= 35;
  }

  score += Math.abs(candidateConfig.screenSizeInches - currentConfig.screenSizeInches) * 18;

  if (candidateConfig.family === currentConfig.family) {
    score += Math.abs(candidateConfig.generationOrder - currentConfig.generationOrder) * 28;
  } else {
    score += Math.abs(candidateConfig.generationOrder - currentConfig.generationOrder) * 55;
  }

  return score;
}

export function getIpadModelHubLinks(
  modelSlug: AliMobileEnhancedIpadModelSlug,
  limit = 6
): ExploreRepairLink[] {
  const currentConfig = getIpadHardwareConfig(modelSlug);
  if (!currentConfig) {
    return [];
  }

  return IPAD_MODEL_CONFIG_LIST
    .filter((candidate) => candidate.modelSlug !== currentConfig.modelSlug)
    .map((candidate) => ({
      href: buildIpadModelHubHref(candidate.modelSlug),
      label: `Explore ${candidate.modelName} repairs`,
      score: getModelHubSimilarityScore(currentConfig, candidate),
    }))
    .sort((left, right) => {
      if (left.score !== right.score) {
        return left.score - right.score;
      }

      return left.label.localeCompare(right.label);
    })
    .slice(0, limit);
}
