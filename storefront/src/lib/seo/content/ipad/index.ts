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

const APPROVED_IPAD_ENHANCED_REPAIR_TYPES = new Set<string>([
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
  'front-camera-replacement',
  'back-camera-replacement'
]);

const IPAD_STANDARD_TURNAROUND_MINUTES = 60;
const IPAD_CHARGING_PORT_ASSESSMENT_FAQ = 'Repair timing depends on the charging-port fault and the work required. We will confirm the expected turnaround after assessment.';

export type IpadDetailTiming =
  | {
      kind: 'standard';
      turnaroundMinutes: typeof IPAD_STANDARD_TURNAROUND_MINUTES;
      badgeLabel: '1 Hour';
      faqDurationLabel: '1 hour';
    }
  | {
      kind: 'assessment';
      badgeLabel: 'Fast Turnaround';
      faqAnswer: typeof IPAD_CHARGING_PORT_ASSESSMENT_FAQ;
    };

export function getIpadDetailTiming(modelSlug: string, repairSlug: string): IpadDetailTiming | null {
  const config = getIpadHardwareConfig(modelSlug);
  const normalizedRepairSlug = slugify(repairSlug);

  if (!config || !APPROVED_IPAD_ENHANCED_REPAIR_TYPES.has(normalizedRepairSlug)) {
    return null;
  }

  if (
    normalizedRepairSlug === 'charging-port-replacement' &&
    (config.family === 'ipad' || config.family === 'ipad-air')
  ) {
    return {
      kind: 'assessment',
      badgeLabel: 'Fast Turnaround',
      faqAnswer: IPAD_CHARGING_PORT_ASSESSMENT_FAQ,
    };
  }

  return {
    kind: 'standard',
    turnaroundMinutes: IPAD_STANDARD_TURNAROUND_MINUTES,
    badgeLabel: '1 Hour',
    faqDurationLabel: '1 hour',
  };
}

function getAliMobileEnhancedIpadModelSlug(
  params: AliMobileEnhancedIpadRouteParams
): AliMobileEnhancedIpadModelSlug | null {
  if (slugify(params.category) !== 'tablet' || !isIpadEnhancedBrand(params.brand)) {
    return null;
  }

  return getIpadHardwareConfig(params.model)?.modelSlug ?? null;
}

export function getAliMobileEnhancedIpadRepairType(
  params: AliMobileEnhancedIpadRouteParams,
  isGenuinePos: boolean = false
): AliMobileEnhancedIpadRepairType | null {
  const modelSlug = getAliMobileEnhancedIpadModelSlug(params);
  const repairType = slugify(params['repair-type']);

  if (!modelSlug || !isGenuinePos) {
    return null;
  }

  return APPROVED_IPAD_ENHANCED_REPAIR_TYPES.has(repairType) ? (repairType as AliMobileEnhancedIpadRepairType) : null;
}

export function isAliMobileEnhancedIpadRepairPage(
  params: AliMobileEnhancedIpadRouteParams,
  isGenuinePos: boolean = false
): boolean {
  return getAliMobileEnhancedIpadRepairType(params, isGenuinePos) !== null;
}

export function getAliMobileEnhancedIpadModelName(modelSlug: string): string | null {
  return getIpadHardwareConfig(modelSlug)?.modelName ?? null;
}

export function getAliMobileEnhancedIpadSeoPocket({
  modelSlug,
  repairSlug,
}: AliMobileEnhancedIpadSeoPocketParams): IpadEnhancedSeoPocket | null {
  const config = getIpadHardwareConfig(modelSlug);
  const normalizedRepairSlug = slugify(repairSlug);

  if (!config || !APPROVED_IPAD_ENHANCED_REPAIR_TYPES.has(normalizedRepairSlug)) {
    return null;
  }

  const pocket = (() => {
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
  })();
  const timing = getIpadDetailTiming(modelSlug, normalizedRepairSlug);

  return pocket && timing?.kind === 'standard'
    ? { ...pocket, turnaroundMinutes: timing.turnaroundMinutes }
    : pocket;
}
